import { ECONOMIC_PHASES } from '../constants/economy';
import {
  RIVAL_FOCUSES,
  RIVAL_PROFILES,
  RIVAL_TIER_LABELS,
  RIVAL_TIERS,
} from '../constants/rivals';

const BASE_RIVAL_UNIT_COST = 18000;
const RIVAL_FIXED_COST = 500000;
const RIVAL_BANKRUPTCY_LINE = -30000000;
const RIVAL_RETREAT_HEALTH_RATIO = 0.2;
const WAR_DAMAGE_RATIO = 0.05;

export function createInitialRivals(randomValue = Math.random()) {
  return Object.freeze([
    createRival(RIVAL_TIERS.VALUE, 0, RIVAL_FOCUSES.VALUE, randomValue),
    createRival(
      RIVAL_TIERS.SPECIALIST,
      0,
      randomValue % 1 < 0.5 ? RIVAL_FOCUSES.BRAND : RIVAL_FOCUSES.QUALITY,
      randomValue + 0.31,
    ),
    createRival(RIVAL_TIERS.ELITE, 0, RIVAL_FOCUSES.DUAL, randomValue + 0.62),
    createRival(RIVAL_TIERS.CHAMPION, 0, RIVAL_FOCUSES.ALL, randomValue + 0.93),
  ]);
}

export function activateRivalsForFloor(rivals, floor, championUnlocked = false, playerShare = 0) {
  return Object.freeze(
    rivals.map((rival) => {
      const unlocked =
        rival.tier === RIVAL_TIERS.CHAMPION
          ? championUnlocked || checkChampionUnlock(floor, playerShare)
          : (rival.floorUnlock ?? rival.joinFloor) <= floor;

      return Object.freeze({
        ...rival,
        active: unlocked && !rival.bankrupt && !rival.respawning,
      });
    }),
  );
}

export function checkChampionUnlock(floor, playerShare) {
  return floor >= 80 && playerShare >= 0.4;
}

export function getActiveRivals(rivals, floor) {
  return rivals.filter(
    (rival) =>
      rival.active &&
      (rival.floorUnlock === null || (rival.floorUnlock ?? rival.joinFloor) <= floor) &&
      !rival.bankrupt &&
      !rival.respawning,
  );
}

export function buildRivalParticipants(rivals, floor, phase, marketModifiers = {}) {
  return getActiveRivals(rivals, floor).map((rival, index) =>
    buildRivalParticipant(rival, phase, marketModifiers, index),
  );
}

export function buildRivalParticipant(rival, phase, marketModifiers = {}, slotIndex = 0) {
  const strategy = calcRivalStrategy(rival, phase);
  const health = getRivalHealthRatio(rival);

  return Object.freeze({
    id: rival.id,
    type: 'rival',
    name: rival.name,
    company: rival.company,
    slotLabel: rival.company ?? RIVAL_TIER_LABELS[rival.tier] ?? `${rival.tier}단계`,
    tier: rival.tier,
    gender: rival.gender,
    profileId: rival.profileId,
    sprite: rival.sprite,
    imageFile: rival.imageFile,
    focus: rival.focus,
    color: getRivalHealthColor(health),
    price: strategy.sellPrice,
    quality: normalizeQualityScore(rival.qualityScore + strategy.qualityBonus) *
      (marketModifiers.qualityMultiplier ?? 1),
    brand: rival.brandValue + strategy.brandBonus,
    awareness: getRivalAwareness(rival) * (marketModifiers.awarenessMultiplier ?? 1),
    efficiency: getRivalEfficiency(rival) * (marketModifiers.rivalEfficiencyMultiplier ?? 1),
    resistance: 0.05,
    unitCost: strategy.unitCost,
    capital: rival.capital,
    initialCapital: rival.initialCapital,
    health,
    healthBadge: getRivalHealthBadge(health),
    currentStrategy: strategy.id,
    strategy,
    slotIndex,
  });
}

export function updateRivalCapitals(rivals, demand, shares, econPhase) {
  let activeIndex = 0;

  return Object.freeze(
    rivals.map((rival) => {
      if (rival.bankrupt || rival.respawning || !rival.active) {
        return rival;
      }

      const rivalShare = shares[activeIndex + 1] ?? rival.share ?? 0;
      activeIndex += 1;
      const rivalDemand = Math.round(demand * rivalShare);
      const strategy = calcRivalStrategy(rival, econPhase);
      const orderQty = Math.round(rivalDemand * (rival.strategyPreset?.orderMultiplier ?? 0.9));
      const actualSold = Math.min(rivalDemand, orderQty);
      const revenue = actualSold * strategy.sellPrice;
      const cost = strategy.unitCost * orderQty;
      const netProfit = revenue - cost - RIVAL_FIXED_COST;
      const newCapital = rival.capital + netProfit;
      const health = newCapital / rival.initialCapital;
      const bankrupt = newCapital < RIVAL_BANKRUPTCY_LINE || health <= RIVAL_RETREAT_HEALTH_RATIO;

      return Object.freeze({
        ...rival,
        capital: newCapital,
        health: Math.max(0, health),
        bankrupt,
        active: !bankrupt,
        sellPrice: strategy.sellPrice,
        currentStrategy: strategy.id,
        share: rivalShare,
        attraction: calcAttraction({
          quality: rival.qualityScore + strategy.qualityBonus,
          brand: rival.brandValue + strategy.brandBonus,
          sellPrice: strategy.sellPrice,
          resistance: 0.05,
          econPhase,
        }),
      });
    }),
  );
}

export function processRivalRespawn(rivals) {
  return Object.freeze(
    rivals.map((rival) => {
      if (rival.bankrupt && !rival.respawning) {
        return Object.freeze({
          ...rival,
          active: false,
          respawning: true,
          respawnIn: 3 + Math.floor(Math.random() * 2),
        });
      }

      if (rival.respawning && rival.respawnIn > 1) {
        return Object.freeze({
          ...rival,
          active: false,
          respawnIn: rival.respawnIn - 1,
        });
      }

      if (rival.respawning && rival.respawnIn <= 1) {
        const profilePool = RIVAL_PROFILES[rival.tier];
        const nextIndex = (rival.nameIndex + 1) % profilePool.length;
        const nextProfile = profilePool[nextIndex];
        const stats = nextProfile.stats ?? {};
        const initialCapital = stats.capital ?? rival.initialCapital;

        return Object.freeze({
          ...rival,
          name: nextProfile.name,
          company: nextProfile.company,
          gender: nextProfile.gender,
          profileId: nextProfile.id,
          sprite: nextProfile.sprite,
          imageFile: nextProfile.imageFile,
          stats,
          strategyPreset: nextProfile.strategy,
          floorUnlock: nextProfile.floorUnlock,
          joinFloor: nextProfile.floorUnlock,
          nameIndex: nextIndex,
          capital: initialCapital,
          initialCapital,
          maxHealth: stats.maxHealth ?? rival.maxHealth,
          awareness: stats.awareness ?? rival.awareness,
          health: 1,
          bankrupt: false,
          respawning: false,
          respawnIn: 0,
          active: true,
          qualityScore: stats.quality ?? getInitialQuality(rival.tier),
          brandValue: stats.brand ?? getInitialBrand(rival.tier),
          sellPrice: getInitialSellPrice(rival.tier),
          attraction: 0,
          share: 0,
        });
      }

      return rival;
    }),
  );
}

export function resolveRivalWar({ rivals, floor, phase, playerProfit, demandSplit }) {
  const shares = demandSplit.map((participant) => participant.marketShare);
  const player = demandSplit.find((participant) => participant.id === 'player');
  const capitalUpdatedRivals = updateRivalCapitals(rivals, getTotalDemand(demandSplit), shares, phase);
  let playerWarHealthDelta = 0;
  const rivalResults = [];

  const nextRivals = Object.freeze(
    capitalUpdatedRivals.map((rival) => {
      if (rival.joinFloor > floor || rival.bankrupt || rival.respawning || !rival.active) {
        return rival;
      }

      const participant = demandSplit.find((item) => item.id === rival.id);

      if (!participant) {
        return rival;
      }

      const war = calculateWarPressure({
        playerProfit,
        playerShare: player?.marketShare ?? 0,
        rivalProfit: rival.capital - (rivals.find((item) => item.id === rival.id)?.capital ?? rival.capital),
        rivalShare: participant.marketShare,
      });
      const capitalAfterWar = rival.capital - rival.initialCapital * WAR_DAMAGE_RATIO * war.rivalDamage;
      const health = capitalAfterWar / rival.initialCapital;
      const bankrupt = capitalAfterWar < RIVAL_BANKRUPTCY_LINE || health <= RIVAL_RETREAT_HEALTH_RATIO;

      rivalResults.push(
        Object.freeze({
          id: rival.id,
          name: rival.name,
          healthBefore: getRivalHealthRatio(rivals.find((item) => item.id === rival.id) ?? rival),
          healthAfter: Math.max(0, health),
          damage: war.rivalDamage,
          playerDamage: war.playerDamage,
        }),
      );

      playerWarHealthDelta -= war.playerDamage;

      return Object.freeze({
        ...rival,
        capital: capitalAfterWar,
        health: Math.max(0, health),
        bankrupt,
        active: !bankrupt,
      });
    }),
  );

  return Object.freeze({
    rivals: nextRivals,
    playerWarHealthDelta,
    rivalResults: Object.freeze(rivalResults),
  });
}

export function calcRivalStrategy(rival, econPhase) {
  if (rival.strategyPreset) {
    const priceMul = rival.strategyPreset.priceMultiplier ?? 1;
    const orderMultiplier = rival.strategyPreset.orderMultiplier ?? 1;
    const marketingBudget = rival.strategyPreset.marketingBudget ?? 0;

    return buildStrategy({
      id: `profile-${rival.profileId ?? rival.tier}`,
      priceMul: isWeakEconomy(econPhase) ? Math.min(priceMul, 0.95) : priceMul,
      qualityBonus: rival.focus === RIVAL_FOCUSES.QUALITY || rival.focus === RIVAL_FOCUSES.ALL ? 2 : 0,
      brandBonus: Math.min(8, Math.round(marketingBudget / 400000)),
      scopePower: orderMultiplier,
    });
  }

  if (rival.tier === RIVAL_TIERS.VALUE) {
    return buildStrategy({
      id: 'dumping',
      priceMul: isWeakEconomy(econPhase) ? 0.7 : 0.85,
      qualityBonus: 0,
      brandBonus: 0,
      scopePower: isWeakEconomy(econPhase) ? 0.95 : 0.55,
    });
  }

  if (rival.tier === RIVAL_TIERS.SPECIALIST) {
    if (rival.focus === RIVAL_FOCUSES.BRAND) {
      return buildStrategy({
        id: 'branding',
        priceMul: isStrongEconomy(econPhase) ? 1.6 : 1.3,
        qualityBonus: 0,
        brandBonus: isStrongEconomy(econPhase) ? 8 : 4,
        scopePower: 1,
      });
    }

    return buildStrategy({
      id: 'quality',
      priceMul: isStrongEconomy(econPhase) ? 1.8 : 1.4,
      qualityBonus: isStrongEconomy(econPhase) ? 5 : 3,
      brandBonus: 0,
      scopePower: 1,
    });
  }

  if (rival.tier === RIVAL_TIERS.ELITE) {
    return buildStrategy({
      id: isWeakEconomy(econPhase) ? 'value-brand' : 'brand-quality',
      priceMul: isWeakEconomy(econPhase) ? 0.9 : 1.7,
      qualityBonus: isWeakEconomy(econPhase) ? 0 : 4,
      brandBonus: isWeakEconomy(econPhase) ? 3 : 6,
      scopePower: 1.12,
    });
  }

  if (isStrongEconomy(econPhase)) {
    return buildStrategy({
      id: 'champion-quality',
      priceMul: 2,
      qualityBonus: 6,
      brandBonus: 5,
      scopePower: 1.25,
    });
  }

  if (isWeakEconomy(econPhase)) {
    return buildStrategy({
      id: 'champion-dumping',
      priceMul: 0.85,
      qualityBonus: 0,
      brandBonus: 0,
      scopePower: 1.25,
    });
  }

  return buildStrategy({
    id: 'champion-branding',
    priceMul: 1.5,
    qualityBonus: 4,
    brandBonus: 6,
    scopePower: 1.25,
  });
}

export function getInitialQuality(tier) {
  return {
    [RIVAL_TIERS.VALUE]: 25,
    [RIVAL_TIERS.SPECIALIST]: 55,
    [RIVAL_TIERS.ELITE]: 70,
    [RIVAL_TIERS.CHAMPION]: 90,
  }[tier] ?? 40;
}

export function getInitialBrand(tier) {
  return {
    [RIVAL_TIERS.VALUE]: 2,
    [RIVAL_TIERS.SPECIALIST]: 25,
    [RIVAL_TIERS.ELITE]: 45,
    [RIVAL_TIERS.CHAMPION]: 70,
  }[tier] ?? 10;
}

function createRival(tier, nameIndex, focus, randomValue = Math.random()) {
  const profile = RIVAL_PROFILES[tier][nameIndex] ?? RIVAL_PROFILES[tier][0];
  const stats = profile.stats ?? {};
  const initialCapital = stats.capital ?? 25000000;
  const floorUnlock = profile.floorUnlock;
  const finalFocus =
    tier === RIVAL_TIERS.SPECIALIST && !focus
      ? randomValue % 1 < 0.5 ? RIVAL_FOCUSES.BRAND : RIVAL_FOCUSES.QUALITY
      : focus;

  return Object.freeze({
    id: `rival_${tier}`,
    name: profile.name,
    company: profile.company,
    gender: profile.gender,
    profileId: profile.id,
    sprite: profile.sprite,
    imageFile: profile.imageFile,
    stats,
    strategyPreset: profile.strategy,
    nameIndex,
    tier,
    focus: finalFocus,
    capital: initialCapital,
    initialCapital,
    maxHealth: stats.maxHealth ?? 6,
    awareness: stats.awareness ?? 0.02,
    health: 1,
    bankrupt: false,
    respawning: false,
    respawnIn: 0,
    qualityScore: stats.quality ?? getInitialQuality(tier),
    brandValue: stats.brand ?? getInitialBrand(tier),
    currentStrategy: tier === RIVAL_TIERS.VALUE ? 'dumping' : 'branding',
    sellPrice: getInitialSellPrice(tier),
    attraction: 0,
    share: 0,
    floorUnlock,
    joinFloor: floorUnlock,
    active: tier !== RIVAL_TIERS.CHAMPION && floorUnlock !== null && floorUnlock <= 1,
  });
}

function buildStrategy({ id, priceMul, qualityBonus, brandBonus, scopePower }) {
  return Object.freeze({
    id,
    priceMul,
    priceMultiplier: priceMul,
    unitCost: Math.round(BASE_RIVAL_UNIT_COST * (priceMul < 1 ? 0.85 : 1)),
    sellPrice: Math.round(BASE_RIVAL_UNIT_COST * priceMul),
    qualityBonus,
    brandBonus,
    scopePower,
  });
}

function getInitialSellPrice(tier) {
  return {
    [RIVAL_TIERS.VALUE]: 10200,
    [RIVAL_TIERS.SPECIALIST]: 18000,
    [RIVAL_TIERS.ELITE]: 20400,
    [RIVAL_TIERS.CHAMPION]: 24000,
  }[tier] ?? 12000;
}

function calcAttraction({ quality, brand, sellPrice, resistance, econPhase }) {
  const phaseBonus = isWeakEconomy(econPhase) ? 1.08 : isStrongEconomy(econPhase) ? 0.96 : 1;

  return (((quality / 5) + brand) * phaseBonus) / (Math.max(1, sellPrice) * (1 - resistance));
}

function calculateWarPressure({ playerProfit, playerShare, rivalProfit, rivalShare }) {
  if (playerProfit >= 0 && rivalProfit < 0) {
    return Object.freeze({ playerDamage: 0, rivalDamage: 2 });
  }

  if (playerProfit < 0 && rivalProfit >= 0) {
    return Object.freeze({ playerDamage: 1, rivalDamage: 0 });
  }

  if (playerProfit < 0 && rivalProfit < 0) {
    return Object.freeze({ playerDamage: 0, rivalDamage: 1 });
  }

  if (playerShare > rivalShare) {
    return Object.freeze({ playerDamage: 0, rivalDamage: 1 });
  }

  if (playerShare < rivalShare) {
    return Object.freeze({ playerDamage: 0, rivalDamage: 0 });
  }

  return Object.freeze({ playerDamage: 0, rivalDamage: 0 });
}

function getTotalDemand(demandSplit) {
  return demandSplit.reduce((total, participant) => total + participant.demand, 0);
}

function getRivalHealthRatio(rival) {
  return Math.max(0, rival.capital / Math.max(1, rival.initialCapital));
}

function getRivalHealthBadge(health) {
  if (health <= 0) {
    return '퇴출';
  }

  if (health < 0.4) {
    return '위기';
  }

  if (health < 0.7) {
    return '관망중';
  }

  return '공세중';
}

function getRivalHealthColor(health) {
  if (health <= 0) {
    return '#777777';
  }

  if (health < 0.2) {
    return '#DC143C';
  }

  if (health < 0.4) {
    return '#FF8C42';
  }

  if (health < 0.7) {
    return '#FFCC33';
  }

  return '#8AFF80';
}

function normalizeQualityScore(qualityScore) {
  return qualityScore / 5;
}

function getRivalAwareness(rival) {
  if (typeof rival.awareness === 'number') {
    return rival.awareness;
  }

  return {
    [RIVAL_TIERS.VALUE]: 0.02,
    [RIVAL_TIERS.SPECIALIST]: 0.08,
    [RIVAL_TIERS.ELITE]: 0.12,
    [RIVAL_TIERS.CHAMPION]: 0.2,
  }[rival.tier] ?? 0.05;
}

function getRivalEfficiency(rival) {
  return {
    [RIVAL_TIERS.VALUE]: 0.82,
    [RIVAL_TIERS.SPECIALIST]: 1,
    [RIVAL_TIERS.ELITE]: 1.05,
    [RIVAL_TIERS.CHAMPION]: 1.12,
  }[rival.tier] ?? 1;
}

function isStrongEconomy(phase) {
  return phase === ECONOMIC_PHASES.BOOM || phase === ECONOMIC_PHASES.GROWTH;
}

function isWeakEconomy(phase) {
  return phase === ECONOMIC_PHASES.CONTRACTION || phase === ECONOMIC_PHASES.RECESSION;
}
