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
  missingAccount: '\uC5C6\uB294 \uC544\uC774\uB514\uC785\uB2C8\uB2E4',
  existingAccount: '\uC774\uBBF8\uC788\uB294 \uC544\uC774\uB514\uC785\uB2C8\uB2E4',
  signupSuccess: '\uC131\uACF5\uC801\uC73C\uB85C \uC544\uC774\uB514 \uC0DD\uC131\uC5D0 \uC131\uACF5\uD588\uC2B5\uB2C8\uB2E4',
  weakPassword: '\uBE44\uBC00\uBC88\uD638\uB294 6\uC790 \uC774\uC0C1 \uC785\uB825\uD574\uC8FC\uC138\uC694.',
  signupFailed: '\uD68C\uC6D0\uAC00\uC785\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.',
});

function toAuthEmail(userId) {
  const trimmedId = userId.trim();

  if (trimmedId.includes('@')) {
    return trimmedId;
  }

  return `user-${hashId(trimmedId)}@capirogue.app`;
}

function hashId(value) {
  let hash = 2166136261;

  for (const char of value) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16);
}

function getSignupErrorMessage(error) {
  if (error?.code === 'USER_ALREADY_EXISTS') {
    return TEXT.existingAccount;
  }

  const message = String(error?.message ?? '').toLowerCase();

  if (message.includes('already') || message.includes('registered')) {
    return TEXT.existingAccount;
  }

  if (message.includes('password') || message.includes('weak')) {
    return TEXT.weakPassword;
  }

  return TEXT.signupFailed;
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
    const { user, error } = await signIn(toAuthEmail(login.userId), login.password);
    setIsBusy(false);

    if (error || !user) {
      setMessage(TEXT.missingAccount);
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
    const { user, error } = await signUp(toAuthEmail(signupId), signupPassword);
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
