import { useState } from 'react';
import { signIn, signUp } from '../logic/authEngine';
import { useGameStore } from '../store/useGameStore';
import logoImage from '../assets/optimized/logo/logo_image.png';

function toAuthEmail(userId) {
  const trimmedId = userId.trim();

  return trimmedId.includes('@') ? trimmedId : `${trimmedId}@capirogue.local`;
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
      setMessage('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setIsBusy(true);
    const { user, error } = await signIn(toAuthEmail(login.userId), login.password);
    setIsBusy(false);

    if (error || !user) {
      setMessage('없는 아이디입니다');
      return;
    }

    submitLogin();
  }

  async function handleSignup() {
    setSignupError('');

    if (!signupId.trim() || !signupPassword.trim()) {
      setSignupError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setIsBusy(true);
    const { user, error } = await signUp(toAuthEmail(signupId), signupPassword);
    setIsBusy(false);

    if (error || !user) {
      setSignupError('이미있는 아이디입니다');
      return;
    }

    setLoginField('userId', signupId.trim());
    setLoginField('password', '');
    setSignupId('');
    setSignupPassword('');
    setSignupOpen(false);
    setMessage('성공적으로 아이디 생성에 성공했습니다');
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
        <h1>접속</h1>
        <p className="cr2-title-copy">계정으로 시작하거나 게스트 모드로 바로 플레이하세요.</p>
        <label className="cr2-field">
          <span>아이디</span>
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
          <span>비밀번호</span>
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
            로그인
          </button>
          <button className="cr2-secondary-button" type="button" onClick={enterGuestMode} disabled={isBusy}>
            게스트
          </button>
          <button className="cr2-secondary-button" type="button" onClick={openSignup} disabled={isBusy}>
            회원가입
          </button>
        </div>
      </section>

      {signupOpen ? (
        <section className="cr2-signup-modal" role="dialog" aria-modal="true" aria-label="회원가입">
          <button
            className="cr2-signup-close"
            type="button"
            aria-label="닫기"
            onClick={() => setSignupOpen(false)}
          >
            X
          </button>
          <p className="cr2-kicker">SIGN UP</p>
          <h2>회원가입</h2>
          <label className="cr2-field">
            <span>아이디</span>
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
            <span>비밀번호</span>
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
            등록
          </button>
        </section>
      ) : null}
    </main>
  );
}
