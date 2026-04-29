import { useGameStore } from '../store/useGameStore';

export default function LoginScreen() {
  const login = useGameStore((state) => state.login);
  const setLoginField = useGameStore((state) => state.setLoginField);
  const submitLogin = useGameStore((state) => state.login);
  const enterGuestMode = useGameStore((state) => state.enterGuestMode);

  return (
    <main className="cr2-login-screen">
      <section className="cr2-login-panel">
        <p className="cr2-kicker">CAPIROGUE2</p>
        <h1>자본의 로그라이크</h1>
        <p className="cr2-title-copy">
          로컬 프로필로 시작하면 이 브라우저에 레거시와 해금 기록이 저장됩니다.
        </p>
        <label className="cr2-field">
          <span>프로필 이름</span>
          <input
            className="cr2-input"
            type="text"
            value={login.userId}
            onChange={(event) => setLoginField('userId', event.target.value)}
          />
        </label>
        <label className="cr2-field">
          <span>확인 코드</span>
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
            프로필 시작
          </button>
          <button className="cr2-secondary-button" type="button" onClick={enterGuestMode}>
            게스트 시작
          </button>
        </div>
      </section>
    </main>
  );
}
