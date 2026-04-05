import { ActivityCard } from './ActivityCard';
import './Dashboard.css';

interface DashboardProps {
  onSelectActivity: (activityId: string) => void;
}

export function Dashboard({ onSelectActivity }: DashboardProps) {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome to TeachTheMachine</h1>
        <p className="dashboard-subtitle">
          Jump into short, fun activities to discover how A.I. learns to recognize patterns. 
          No coding required.
        </p>
      </header>

      <section className="activities-grid">
        <ActivityCard
          id="real-vs-suspicious"
          title="Real vs Suspicious"
          subtitle="Mission 1"
          description="Can you train an AI to spot sketchy messages? Build a simple spam filter and see the math behind it."
          icon="policy"
          color="var(--color-primary)"
          onClick={() => onSelectActivity('real-vs-suspicious')}
        />
        
        <ActivityCard
          id="human-vs-robot"
          title="Human vs Robot"
          subtitle="Mission 2"
          description="Teach the computer to tell the difference between human chit-chat and beep-boop robot speak."
          icon="smart_toy"
          color="var(--color-accent)"
          onClick={() => onSelectActivity('human-vs-robot')}
        />

        <ActivityCard
          id="doodle-sort"
          title="Doodle Sort"
          subtitle="Mission 3"
          description="Draw quick doodles and train a neural network to tell them apart using computer vision."
          icon="draw"
          color="var(--color-warning)"
          isNew={true}
          onClick={() => onSelectActivity('doodle-sort')}
        />

        <ActivityCard
          id="fix-the-model"
          title="Fix the Model"
          subtitle="Mission 4"
          description="This AI is deeply confused about weekends vs schooldays. Can you fix its broken dataset?"
          icon="build"
          color="var(--color-safe)"
          onClick={() => onSelectActivity('fix-the-model')}
        />
      </section>
    </div>
  );
}
