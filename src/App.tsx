import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { activities } from './registry/activityRegistry';
import type { Activity } from './types/activity';
import './App.css';

function App() {
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);

  return (
    <div className="app">
      <Header onLogoClick={() => setActiveActivity(null)} />

      <AnimatePresence mode="wait">
        {!activeActivity ? (
          <motion.main
            key="landing"
            className="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Hero */}
            <div className="landing-hero">
              <h1 className="landing-title">
                <span className="gradient-text">Teach</span>The<span className="gradient-text">Machine</span>
              </h1>
              <p className="landing-subtitle">
                Learn how AI works by doing — no code required.
                Sort data, train models, and discover that machine learning is
                pattern matching, not magic.
              </p>
              <div className="landing-badges">
                <span className="landing-badge">🧠 No coding needed</span>
                <span className="landing-badge">🔒 Runs in your browser</span>
                <span className="landing-badge">⚡ 30-minute activities</span>
              </div>
            </div>

            {/* Activity cards */}
            <div className="landing-activities">
              <div className="landing-activities-label">Choose an activity</div>
              {activities.map((activity, index) => (
                <motion.button
                  key={activity.id}
                  className="activity-card"
                  onClick={() => setActiveActivity(activity)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div
                    className="activity-card-icon"
                    style={{ background: activity.gradient }}
                  >
                    {activity.icon}
                  </div>
                  <div className="activity-card-content">
                    <div className="activity-card-subtitle">{activity.subtitle}</div>
                    <div className="activity-card-title">{activity.title}</div>
                    <div className="activity-card-description">{activity.description}</div>
                    <div className="activity-card-tags">
                      {activity.tags.map(tag => (
                        <span key={tag} className="activity-card-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <span className="activity-card-arrow">→</span>
                </motion.button>
              ))}
            </div>
          </motion.main>
        ) : (
          <motion.div
            key={activeActivity.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <activeActivity.component />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default App;
