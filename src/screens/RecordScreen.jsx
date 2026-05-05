import PlayRecord from '../components/menus/PlayRecord';
import { SCREEN_IDS, useGameStore } from '../store/useGameStore';
import '../styles/record.css';

export default function RecordScreen() {
  return (
    <main className="cr2-record-screen">
      <section className="cr2-record-panel">
        <PlayRecord onBack={() => useGameStore.setState({ screen: SCREEN_IDS.TITLE })} />
      </section>
    </main>
  );
}
