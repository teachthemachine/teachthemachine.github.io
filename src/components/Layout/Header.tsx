import './Header.css';

interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  return (
    <header className="header">
      <button className="header-logo" onClick={onLogoClick} aria-label="Go to home">
        <div className="header-logo-icon">TM</div>
        <div className="header-logo-text">
          Teach<span>The</span>Machine
        </div>
      </button>
      <div className="header-badge">v1.0 beta</div>
    </header>
  );
}
