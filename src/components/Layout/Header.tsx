import { ThemeToggle } from '../ThemeToggle';
import './Header.css';

interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  return (
    <header className="header">
      <a className="header-logo" onClick={onLogoClick} href="#">
        <div className="header-icon">TM</div>
        <span className="header-title">
          <span className="header-title-accent">Teach</span>TheMachine
        </span>
      </a>
      <div className="header-right">
        <span className="header-badge">v1.0 beta</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
