import { useGameStore } from '../store/useGameStore';
import logoImage from '../assets/optimized/logo/logo_image.png';

export default function LoginScreen() {
  const login = useGameStore((state) => state.login);
  const setLoginField = useGameStore((state) => state.setLoginField);
  const submitLogin = useGameStore((state) => state.login);
  const enterGuestMode = useGameStore((state) => state.enterGuestMode);

  return (
    <main className="cr2-login-screen">
      <img className="cr2-login-logo" src={logoImage} alt="CapiRogue" />
      <section className="cr2-login-panel">
        <p className="cr2-kicker">LOGIN</p>
        <h1>접속</h1>
        <p className="cr2-title-copy">계정으로 시작하거나 게스트 모드로 바로 플레이하세요.</p>
        <label className="cr2-field">
          <span>계정명</span>
          <input
            className="cr2-input"
            type="text"
            value={login.userId}
            onChange={(event) => setLoginField('userId', event.target.value)}
          />
        </label>
        <label className="cr2-field">
          <span>비밀번호</span>
          <input
            className="cr2-input"
            type="password"
            value={login.password}
            onChange={(event) => setLoginField('password', event.target.value)}
          />
        </label>
        {login.error ? <p className="cr2-error-text">{login.error}</p> : null}
        <div className="cr2-button-row">
          <button className="cr2-primary-button" type="button" onClick={submitLogin}>
            시작
          </button>
          <button className="cr2-secondary-button" type="button" onClick={enterGuestMode}>
            게스트
          </button>
        </div>
      </section>
    </main>
  );
}
