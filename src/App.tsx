import { useState } from 'react';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { Dashboard } from './components/Dashboard/Dashboard';
import { TextClassifierActivity } from './activities/text-classifier/TextClassifierActivity';
import { REAL_VS_SUSPICIOUS_CONFIG, HUMAN_VS_ROBOT_CONFIG, FIX_THE_MODEL_CONFIG } from './activities/text-classifier/config';
import { DoodleSortActivity } from './activities/doodle-sort/DoodleSortActivity';
import './App.css';

function App() {
  const [activeActivity, setActiveActivity] = useState<string | null>(null);

  const MISSIONS = ['real-vs-suspicious', 'human-vs-robot', 'doodle-sort', 'fix-the-model'];

  const handleNextMission = () => {
    if (!activeActivity) return;
    const currentIndex = MISSIONS.indexOf(activeActivity);
    if (currentIndex >= 0 && currentIndex < MISSIONS.length - 1) {
      setActiveActivity(MISSIONS[currentIndex + 1]);
    } else {
      setActiveActivity(null); // Back to dashboard when all done
    }
  };

  const renderActivity = () => {
    switch (activeActivity) {
      case 'real-vs-suspicious':
        return <TextClassifierActivity config={REAL_VS_SUSPICIOUS_CONFIG} onNextMission={handleNextMission} />;
      case 'human-vs-robot':
        return <TextClassifierActivity config={HUMAN_VS_ROBOT_CONFIG} onNextMission={handleNextMission} />;
      case 'fix-the-model':
        return <TextClassifierActivity config={FIX_THE_MODEL_CONFIG} onNextMission={handleNextMission} />;
      case 'doodle-sort':
        return <DoodleSortActivity onNextMission={handleNextMission} />;
      default:
        // We could lock dashboard missions here if we want, but letting them select is fine as long as they can next-mission
        return <Dashboard onSelectActivity={setActiveActivity} />;
    }
  };

  return (
    <div className="app">
      <Header onLogoClick={() => setActiveActivity(null)} />
      <main className="app-main">
        {renderActivity()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
