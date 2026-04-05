import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <p className="footer-tagline">
        Built by{' '}
        <a href="https://hamedyaghoobian.com/" target="_blank" rel="noopener noreferrer">Hamed Yaghoobian</a>
        {' '}· Muhlenberg CS (Math, CS &amp; Stats)
      </p>
      <div className="footer-links">
        <span>© 2026</span>
        <span>·</span>
        <span>Runs entirely in your browser</span>
        <span>·</span>
        <a href="https://github.com/teachthemachine/teachthemachine.github.io" target="_blank" rel="noopener noreferrer">
          Source on GitHub
        </a>
      </div>
    </footer>
  );
}
