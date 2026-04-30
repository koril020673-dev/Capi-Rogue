import { useState } from 'react';
import { signIn, signUp } from '../logic/authEngine';
import { useGameStore } from '../store/useGameStore';
import logoImage from '../assets/optimized/logo/logo_image.png';

const TEXT = Object.freeze({
  title: '\uC811\uC18D',
  copy: '\uACC4\uC815\uC73C\uB85C \uC2DC\uC791\uD558\uAC70\uB098 \uAC8C\uC2A4\uD2B8 \uBAA8\uB4DC\uB85C \uBC14\uB85C \uD50C\uB808\uC774\uD558\uC138\uC694.',
  id: '\uC544\uC774\uB514',
  password: '\uBE44\uBC00\uBC88\uD638',
  login: '\uB85C\uADF8\uC778',
  guest: '\uAC8C\uC2A4\uD2B8',
  signup: '\uD68C\uC6D0\uAC00\uC785',
  register: '\uB4F1\uB85D',
  close: '\uB2EB\uAE30',
  missingInput: '\uC544\uC774\uB514\uC640 \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.',
  missingAccount: '\uC5C6\uB294 \uC544\uC774\uB514\uC785\uB2C8\uB2E4.',
  wrongPassword: '\uBE44\uBC00\uBC88\uD638\uAC00 \uD2C0\uB838\uC2B5\uB2C8\uB2E4.',
  tooManyRequests: '\uB85C\uADF8\uC778 \uC2DC\uB3C4\uAC00 \uB108\uBB34 \uB9CE\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.',
  existingAccount: '\uC774\uBBF8\uC788\uB294 \uC544\uC774\uB514\uC785\uB2C8\uB2E4',
  signupSuccess: '\uC131\uACF5\uC801\uC73C\uB85C \uC544\uC774\uB514 \uC0DD\uC131\uC5D0 \uC131\uACF5\uD588\uC2B5\uB2C8\uB2E4',
  weakPassword: '\uBE44\uBC00\uBC88\uD638\uB294 6\uC790 \uC774\uC0C1 \uC785\uB825\uD574\uC8FC\uC138\uC694.',
  authNotReady: 'Supabase \uC124\uC815\uC774 \uC5C6\uC5B4 \uACC4\uC815 \uAE30\uB2A5\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
  invalidSupabaseUrl: 'Supabase URL\uC740 https://\uD504\uB85C\uC81D\uD2B8.supabase.co \uD615\uC2DD\uC73C\uB85C \uC785\uB825\uD574\uC57C \uD569\uB2C8\uB2E4.',
  invalidSupabaseKey: 'Supabase anon key\uAC00 \uB204\uB77D\uB418\uC5C8\uAC70\uB098 \uD615\uC2DD\uC774 \uC798\uBABB\uB410\uC2B5\uB2C8\uB2E4.',
  networkError: '\uB124\uD2B8\uC6CC\uD06C \uC5F0\uACB0 \uB610\uB294 \uC778\uC99D \uC11C\uBC84\uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694.',
  tableMissing: 'Supabase\uC5D0 player_accounts \uD14C\uC774\uBE14\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.',
  policyBlocked: 'Supabase RLS \uC815\uCC45\uC774 \uACC4\uC815 \uC800\uC7A5/\uC870\uD68C\uB97C \uB9C9\uACE0 \uC788\uC2B5\uB2C8\uB2E4.',
  signupFailed: '\uD68C\uC6D0\uAC00\uC785\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.',
  idHelp: '\uC544\uC774\uB514 3\uC790 \uC774\uC0C1',
  passwordHelp: '\uBE44\uBC00\uBC88\uD638 6\uC790 \uC774\uC0C1',
});

function getSignupErrorMessage(error) {
  if (error?.code === 'INVALID_SUPABASE_URL') {
    return TEXT.invalidSupabaseUrl;
  }

  if (error?.code === 'INVALID_SUPABASE_ANON_KEY') {
    return TEXT.invalidSupabaseKey;
  }

  if (error?.code === 'MISSING_SUPABASE_ENV') {
    return TEXT.authNotReady;
  }

  if (error?.code === 'USER_ALREADY_EXISTS') {
    return TEXT.existingAccount;
  }

  if (error?.code === 'ACCOUNTS_TABLE_MISSING') {
    return TEXT.tableMissing;
  }

  if (error?.code === 'ACCOUNTS_POLICY_BLOCKED') {
    return TEXT.policyBlocked;
  }

  const message = String(error?.message ?? '').toLowerCase();

  if (message.includes('already') || message.includes('registered')) {
    return TEXT.existingAccount;
  }

  if (message.includes('environment')) {
    return TEXT.authNotReady;
  }

  if (message.includes('password') || message.includes('weak')) {
    return TEXT.weakPassword;
  }

  if (message.includes('fetch') || message.includes('network') || message.includes('failed to')) {
    return TEXT.networkError;
  }

  return TEXT.signupFailed;
}

function getLoginErrorMessage(error) {
  const status = Number(error?.status ?? 0);
  if (error?.code === 'INVALID_SUPABASE_URL') {
    return TEXT.invalidSupabaseUrl;
  }

  if (error?.code === 'INVALID_SUPABASE_ANON_KEY') {
    return TEXT.invalidSupabaseKey;
  }

  if (error?.code === 'MISSING_SUPABASE_ENV') {
    return TEXT.authNotReady;
  }

  if (error?.code === 'USER_NOT_FOUND') {
    return TEXT.missingAccount;
  }

  if (error?.code === 'WRONG_PASSWORD') {
    return TEXT.wrongPassword;
  }

  if (error?.code === 'ACCOUNTS_TABLE_MISSING') {
    return TEXT.tableMissing;
  }

  if (error?.code === 'ACCOUNTS_POLICY_BLOCKED') {
    return TEXT.policyBlocked;
  }

  const message = String(error?.message ?? '').toLowerCase();

  if (status === 429 || message.includes('too many') || message.includes('rate limit')) {
    return TEXT.tooManyRequests;
  }

  if (message.includes('environment')) {
    return TEXT.authNotReady;
  }

  if (message.includes('fetch') || message.includes('network') || message.includes('failed to')) {
    return TEXT.networkError;
  }

  return TEXT.missingAccount;
}

export default function LoginScreen() {
  const login = useGameStore((state) => state.login);
  const setLoginField = useGameStore((state) => state.setLoginField);
  const submitLogin = useGameStore((state) => state.login);
  const enterGuestMode = useGameStore((state) => state.enterGuestMode);
  const [message, setMessage] = useState('');
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupId, setSignupId] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  async function handleLogin() {
    setMessage('');

    if (!login.userId.trim() || !login.password.trim()) {
      setMessage(TEXT.missingInput);
      return;
    }

    setIsBusy(true);
    const { user, error } = await signIn(login.userId, login.password);
    setIsBusy(false);

    if (error || !user) {
      setMessage(getLoginErrorMessage(error));
      return;
    }

    submitLogin();
  }

  async function handleSignup() {
    setSignupError('');

    if (!signupId.trim() || !signupPassword.trim()) {
      setSignupError(TEXT.missingInput);
      return;
    }

    setIsBusy(true);
    const { user, error } = await signUp(signupId, signupPassword);
    setIsBusy(false);

    if (error || !user) {
      setSignupError(getSignupErrorMessage(error));
      return;
    }

    setLoginField('userId', signupId.trim());
    setLoginField('password', '');
    setSignupId('');
    setSignupPassword('');
    setSignupOpen(false);
    setMessage(TEXT.signupSuccess);
  }

  function openSignup() {
    setSignupError('');
    setSignupId(login.userId);
    setSignupPassword('');
    setSignupOpen(true);
  }

  return (
    <main className="cr2-login-screen">
      <img className="cr2-login-logo" src={logoImage} alt="CapiRogue" />
      <section className="cr2-login-panel">
        <p className="cr2-kicker">LOGIN</p>
        <h1>{TEXT.title}</h1>
        <p className="cr2-title-copy">{TEXT.copy}</p>
        <label className="cr2-field">
          <span>{TEXT.id}</span>
          <input
            className="cr2-input"
            type="text"
            value={login.userId}
            onChange={(event) => {
              setMessage('');
              setLoginField('userId', event.target.value);
            }}
          />
          <small className="cr2-field-help">{TEXT.idHelp}</small>
        </label>
        <label className="cr2-field">
          <span>{TEXT.password}</span>
          <input
            className="cr2-input"
            type="password"
            value={login.password}
            onChange={(event) => {
              setMessage('');
              setLoginField('password', event.target.value);
            }}
          />
          <small className="cr2-field-help">{TEXT.passwordHelp}</small>
        </label>
        {message ? <p className="cr2-login-message">{message}</p> : null}
        <div className="cr2-button-row cr2-login-actions">
          <button className="cr2-primary-button" type="button" onClick={handleLogin} disabled={isBusy}>
            {TEXT.login}
          </button>
          <button className="cr2-secondary-button" type="button" onClick={enterGuestMode} disabled={isBusy}>
            {TEXT.guest}
          </button>
          <button className="cr2-secondary-button" type="button" onClick={openSignup} disabled={isBusy}>
            {TEXT.signup}
          </button>
        </div>
      </section>

      {signupOpen ? (
        <section className="cr2-signup-modal" role="dialog" aria-modal="true" aria-label={TEXT.signup}>
          <button
            className="cr2-signup-close"
            type="button"
            aria-label={TEXT.close}
            onClick={() => setSignupOpen(false)}
          >
            X
          </button>
          <p className="cr2-kicker">SIGN UP</p>
          <h2>{TEXT.signup}</h2>
          <label className="cr2-field">
            <span>{TEXT.id}</span>
            <input
              className="cr2-input"
              type="text"
              value={signupId}
              onChange={(event) => {
                setSignupError('');
                setSignupId(event.target.value);
              }}
            />
            <small className="cr2-field-help">{TEXT.idHelp}</small>
          </label>
          <label className="cr2-field">
            <span>{TEXT.password}</span>
            <input
              className="cr2-input"
              type="password"
              value={signupPassword}
              onChange={(event) => {
                setSignupError('');
                setSignupPassword(event.target.value);
              }}
            />
            <small className="cr2-field-help">{TEXT.passwordHelp}</small>
          </label>
          {signupError ? <p className="cr2-error-text">{signupError}</p> : null}
          <button className="cr2-primary-button" type="button" onClick={handleSignup} disabled={isBusy}>
            {TEXT.register}
          </button>
        </section>
      ) : null}
    </main>
  );
}
