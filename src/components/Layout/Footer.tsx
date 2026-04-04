import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <p className="footer-tagline">
        ML is pattern matching, not magic. ✨
      </p>
      <div className="footer-credit">
        <span>Built for curious minds</span>
        <span>·</span>
        <span>No data leaves your browser</span>
        <span>·</span>
        <a href="https://github.com/teachthemachine/teachthemachine.github.io" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </div>
    </footer>
  );
}
