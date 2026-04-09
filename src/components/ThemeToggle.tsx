import { useState, useEffect } from 'react';
import './ThemeToggle.css';

type Theme = 'sunny' | 'midnight';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('ttm-theme') as Theme | null;
  if (stored === 'sunny' || stored === 'midnight') return stored;
  return 'midnight';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ttm-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'sunny' ? 'midnight' : 'sunny'));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <button
        className="theme-toggle"
        onClick={toggle}
        aria-label={`Switch to ${theme === 'sunny' ? 'midnight' : 'sunny'} theme`}
        title={theme === 'sunny' ? 'Switch to Midnight' : 'Switch to Sunny'}
      >
        <span className="theme-toggle-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '18px', color: theme === 'sunny' ? '#fbbc04' : '#a78bfa' }}>
            {theme === 'sunny' ? 'light_mode' : 'dark_mode'}
          </span>
        </span>
      </button>
    </div>
  );
}
