export function formatWon(value) {
  const amount = Math.round(Number(value) || 0);
  const sign = amount < 0 ? '-' : '';
  const absoluteAmount = Math.abs(amount);

  if (absoluteAmount >= 10000) {
    return `${sign}${Math.round(absoluteAmount / 10000).toLocaleString()}만원`;
  }

  return `${sign}${absoluteAmount.toLocaleString()}원`;
}
