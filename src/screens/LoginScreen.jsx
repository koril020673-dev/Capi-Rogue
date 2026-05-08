import { useEffect, useState } from 'react';
import { signIn, signUp, tryAutoLogin } from '../logic/authEngine';
import { SCREEN_IDS, useGameStore } from '../store/useGameStore';
import logoImage from '../assets/optimized/logo/logo_image.png';

const TEXT = Object.freeze({
  title: '\uC811\uC18D',
  copy: '\uACC4\uC815\uC73C\uB85C \uC2DC\uC791\uD558\uAC70\uB098 \uAC8C\uC2A4\uD2B8 \uBAA8\uB4DC\uB85C \uBC14\uB85C \uD50C\uB808\uC774\uD558\uC138\uC694.',
  id: '\uC544\uC774\uB514',
  password: '\uBE44\uBC00\uBC88\uD638',
  passwordConfirm: '\uBE44\uBC00\uBC88\uD638 \uD655\uC778',
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
  rememberLogin: '\uC790\uB3D9 \uB85C\uADF8\uC778',
  checkingLogin: '\uB85C\uADF8\uC778 \uC815\uBCF4 \uD655\uC778 \uC911...',
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
  passwordMismatch: '\uBE44\uBC00\uBC88\uD638 \uD655\uC778\uC774 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.',
  accountType: '\uACC4\uC815 \uC720\uD615 \uC120\uD0DD',
  student: '\uD559\uC0DD',
  teacher: '\uAD50\uC0AC',
  general: '\uC77C\uBC18',
  studentGuide: '\uD559\uC0DD \uACC4\uC815\uC740 \uC131\uCDE8\uAE30\uC900 \uB2EC\uC131 \uD604\uD669\uC774 \uC800\uC7A5\uB429\uB2C8\uB2E4.',
  teacherGuide: '\uAD50\uC0AC \uACC4\uC815\uC740 \uD5A5\uD6C4 \uD559\uC0DD \uAD00\uB9AC \uAE30\uB2A5\uC774 \uC81C\uACF5\uB420 \uC608\uC815\uC785\uB2C8\uB2E4.',
  generalGuide: '\uC77C\uBC18 \uACC4\uC815\uC740 \uAE30\uBCF8 \uC800\uC7A5 \uAE30\uB2A5\uC744 \uC0AC\uC6A9\uD569\uB2C8\uB2E4.',
});

const USER_TYPE_OPTIONS = Object.freeze([
  Object.freeze({ id: 'student', label: TEXT.student, guide: TEXT.studentGuide }),
  Object.freeze({ id: 'teacher', label: TEXT.teacher, guide: TEXT.teacherGuide }),
  Object.freeze({ id: 'general', label: TEXT.general, guide: TEXT.generalGuide }),
]);

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
  const loginForm = useGameStore((state) => state.loginForm);
  const setLoginField = useGameStore((state) => state.setLoginField);
  const submitLogin = useGameStore((state) => state.submitLogin);
  const enterGuestMode = useGameStore((state) => state.enterGuestMode);
  const setCurrentScreen = useGameStore((state) => state.setCurrentScreen);
  const [message, setMessage] = useState('');
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupId, setSignupId] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
  const [signupUserType, setSignupUserType] = useState('general');
  const [signupError, setSignupError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(true);
  const [isCheckingAutoLogin, setIsCheckingAutoLogin] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAutoLogin() {
      const success = await tryAutoLogin();

      if (!mounted) {
        return;
      }

      if (success) {
        setCurrentScreen(SCREEN_IDS.TITLE);
        return;
      }

      setIsCheckingAutoLogin(false);
    }

    checkAutoLogin();

    return () => {
      mounted = false;
    };
  }, [setCurrentScreen]);

  async function handleLogin() {
    setMessage('');

    if (!loginForm.userId.trim() || !loginForm.password.trim()) {
      setMessage(TEXT.missingInput);
      return;
    }

    setIsBusy(true);
    const { user, error } = await signIn(loginForm.userId, loginForm.password, { remember: rememberLogin });
    setIsBusy(false);

    if (error || !user) {
      setMessage(getLoginErrorMessage(error));
      return;
    }

    submitLogin();
  }

  async function handleSignup() {
    setSignupError('');

    if (!signupId.trim() || !signupPassword.trim() || !signupPasswordConfirm.trim()) {
      setSignupError(TEXT.missingInput);
      return;
    }

    if (signupPassword !== signupPasswordConfirm) {
      setSignupError(TEXT.passwordMismatch);
      return;
    }

    setIsBusy(true);
    const { user, error } = await signUp(signupId, signupPassword, signupUserType);
    setIsBusy(false);

    if (error || !user) {
      setSignupError(getSignupErrorMessage(error));
      return;
    }

    setLoginField('userId', signupId.trim());
    setLoginField('password', '');
    setSignupId('');
    setSignupPassword('');
    setSignupPasswordConfirm('');
    setSignupUserType('general');
    setSignupOpen(false);
    setMessage(TEXT.signupSuccess);
  }

  function openSignup() {
    setSignupError('');
    setSignupId(loginForm.userId);
    setSignupPassword('');
    setSignupPasswordConfirm('');
    setSignupUserType('general');
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
            value={loginForm.userId}
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
            value={loginForm.password}
            onChange={(event) => {
              setMessage('');
              setLoginField('password', event.target.value);
            }}
          />
          <small className="cr2-field-help">{TEXT.passwordHelp}</small>
        </label>
        {isCheckingAutoLogin ? <p className="cr2-login-message">{TEXT.checkingLogin}</p> : null}
        <label className="cr2-login-remember">
          <input
            checked={rememberLogin}
            type="checkbox"
            onChange={(event) => setRememberLogin(event.target.checked)}
          />
          <span>{TEXT.rememberLogin}</span>
        </label>
        {message ? <p className="cr2-login-message">{message}</p> : null}
        <div className="cr2-button-row cr2-login-actions">
          <button className="cr2-primary-button" type="button" onClick={handleLogin} disabled={isBusy || isCheckingAutoLogin}>
            {TEXT.login}
          </button>
          <button className="cr2-secondary-button" type="button" onClick={enterGuestMode} disabled={isBusy || isCheckingAutoLogin}>
            {TEXT.guest}
          </button>
          <button className="cr2-secondary-button" type="button" onClick={openSignup} disabled={isBusy || isCheckingAutoLogin}>
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
          <label className="cr2-field">
            <span>{TEXT.passwordConfirm}</span>
            <input
              className="cr2-input"
              type="password"
              value={signupPasswordConfirm}
              onChange={(event) => {
                setSignupError('');
                setSignupPasswordConfirm(event.target.value);
              }}
            />
          </label>
          <div className="cr2-field">
            <span>{TEXT.accountType}</span>
            <div className="cr2-signup-type-grid">
              {USER_TYPE_OPTIONS.map((option) => (
                <button
                  className={signupUserType === option.id ? 'cr2-signup-type-button cr2-signup-type-button--active' : 'cr2-signup-type-button'}
                  key={option.id}
                  type="button"
                  onClick={() => setSignupUserType(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <small className="cr2-field-help">
              {USER_TYPE_OPTIONS.find((option) => option.id === signupUserType)?.guide}
            </small>
          </div>
          {signupError ? <p className="cr2-error-text">{signupError}</p> : null}
          <button className="cr2-primary-button" type="button" onClick={handleSignup} disabled={isBusy}>
            {TEXT.register}
          </button>
        </section>
      ) : null}
    </main>
  );
}
