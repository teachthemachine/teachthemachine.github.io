import { useState, useCallback } from 'react';
import type { NaiveBayesAdapter } from '../../../ml/NaiveBayesAdapter';
import type { TextActivityConfig } from '../config';
import './TestStep.css';

interface PreviewPanelProps {
  config: TextActivityConfig;
  model: NaiveBayesAdapter;
  isTrained: boolean;
}

interface TestResult {
  text: string;
  label: string;
  confidence: number;
  probabilities: { label: string; probability: number }[];
}

export function PreviewPanel({ config, model, isTrained }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<'test' | 'inspect' | 'trick'>('test');

  return (
    <div className="preview-panel">
      <div className="preview-tabs">
        <button
          className={`preview-tab ${activeTab === 'test' ? 'active' : ''}`}
          onClick={() => setActiveTab('test')}
        >
          Preview
        </button>
        <button
          className={`preview-tab ${activeTab === 'inspect' ? 'active' : ''}`}
          onClick={() => setActiveTab('inspect')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: '1.2em' }}>troubleshoot</span> Inspect
        </button>
        <button
          className={`preview-tab ${activeTab === 'trick' ? 'active' : ''}`}
          onClick={() => setActiveTab('trick')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: '1.2em' }}>sports_esports</span> Trick
        </button>
      </div>

      {!isTrained ? (
        <div className="preview-disabled">
          <div className="preview-disabled-icon">
            <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--color-text-muted)' }}>lock</span>
          </div>
          <div className="preview-disabled-text">
            You must train a model on the left before you can preview it here.
          </div>
        </div>
      ) : activeTab === 'test' ? (
        <TestTab config={config} model={model} />
      ) : activeTab === 'inspect' ? (
        <InspectTab config={config} model={model} />
      ) : (
        <TrickTab config={config} model={model} />
      )}
    </div>
  );
}

/* ---- Test Tab ---- */
function TestTab({ config, model }: { config: TextActivityConfig, model: NaiveBayesAdapter }) {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TestResult | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);

  const predict = useCallback((text: string) => {
    const prediction = model.predict(text);
    const res: TestResult = {
      text,
      label: prediction.label,
      confidence: prediction.confidence,
      probabilities: prediction.probabilities,
    };
    setResult(res);
    setHistory(prev => [res, ...prev].slice(0, 8));
    setInputText('');
  }, [model]);

  const handleSubmit = () => {
    if (inputText.trim()) predict(inputText.trim());
  };

  return (
    <div className="preview-body">
      <div className="test-input-group">
        <input
          className="test-input"
          type="text"
          placeholder="Type a message to test..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={!inputText.trim()}>
          Test
        </button>
      </div>

      <div className="test-suggestions">
        {config.testSuggestions.map((s, i) => (
          <button key={i} className="test-suggestion" onClick={() => predict(s)}>
            {s}
          </button>
        ))}
      </div>

      {result && (
        <div className="test-result">
          <div className={`test-result-label ${result.label === config.classA.label ? 'real' : 'suspicious'}`}>
            <span className="material-symbols-rounded" style={{ marginRight: '6px' }}>
              {result.label === config.classA.label ? config.classA.icon : config.classB.icon}
            </span>
            Looks like {result.label}
          </div>
          <div className="test-result-message">"{result.text}"</div>
          {result.probabilities.map(p => (
            <div key={p.label} className="confidence-row">
              <span className="confidence-category">{p.label}</span>
              <div className="confidence-track">
                <div
                  className={`confidence-fill ${p.label === config.classA.label ? 'real' : 'suspicious'}`}
                  style={{ width: `${Math.round(p.probability * 100)}%`, backgroundColor: p.label === config.classA.label ? config.classA.colorVar : config.classB.colorVar }}
                />
              </div>
              <span className="confidence-pct">{Math.round(p.probability * 100)}%</span>
            </div>
          ))}
        </div>
      )}

      {history.length > 1 && (
        <div className="test-history">
          <div className="test-history-title">History</div>
          {history.slice(1).map((h, i) => (
            <div key={i} className="test-history-item">
              <span 
                className="test-history-badge" 
                style={{ backgroundColor: h.label === config.classA.label ? config.classA.colorVar : config.classB.colorVar }}
              >
                {h.label}
              </span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {h.text}
              </span>
              <span className="confidence-pct">{Math.round(h.confidence * 100)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Trick Tab ---- */
function TrickTab({ config, model }: { config: TextActivityConfig, model: NaiveBayesAdapter }) {
  const [inputText, setInputText] = useState('');
  const [trueLabel, setTrueLabel] = useState<string>(config.classB.label);
  const [trickResult, setTrickResult] = useState<{ success: boolean; prediction: string } | null>(null);
  const [score, setScore] = useState({ tricked: 0, caught: 0 });

  const handleTrick = useCallback(() => {
    if (!inputText.trim()) return;
    const prediction = model.predict(inputText.trim());
    const predictedLabel = prediction.label;
    const isCorrect = predictedLabel === trueLabel;
    const success = !isCorrect; // Fooled the model

    setTrickResult({ success, prediction: prediction.label });

    if (success) {
      setScore(s => ({ ...s, tricked: s.tricked + 1 }));
    } else {
      setScore(s => ({ ...s, caught: s.caught + 1 }));
    }
    setInputText('');
  }, [inputText, trueLabel, model]);

  return (
    <div className="preview-body">
      <div className="trick-challenge" style={{ background: 'var(--color-primary-soft)', borderLeftColor: 'var(--color-primary)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <span className="material-symbols-rounded" style={{ color: 'var(--color-primary)' }}>psychology_alt</span>
        <div>
          <strong>Challenge:</strong> {config.trickChallengeDescription}
        </div>
      </div>

      <div className="trick-score">
        <div className="trick-stat">
          <div className="trick-stat-value tricked">{score.tricked}</div>
          <div className="trick-stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
            Tricked <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>celebration</span>
          </div>
        </div>
        <div className="trick-stat">
          <div className="trick-stat-value caught">{score.caught}</div>
          <div className="trick-stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
            Caught <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>lock</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>This message IS:</span>
        <select
          className="trick-select"
          value={trueLabel}
          onChange={e => setTrueLabel(e.target.value)}
        >
          <option value={config.classB.label}>{config.classB.label}</option>
          <option value={config.classA.label}>{config.classA.label}</option>
        </select>
      </div>

      <div className="test-input-group">
        <input
          className="test-input"
          type="text"
          placeholder="Write a sneaky message..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleTrick()}
        />
        <button className="btn btn-accent btn-sm" onClick={handleTrick} disabled={!inputText.trim()}>
          Try!
        </button>
      </div>

      {trickResult && (
        <div className={`trick-result ${trickResult.success ? 'success' : 'fail'}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          {trickResult.success ? (
            <>
              <span className="material-symbols-rounded">celebration</span>
              <span>Tricked! The model said "{trickResult.prediction}" — wrong!</span>
            </>
          ) : (
            <>
              <span className="material-symbols-rounded">lock</span>
              <span>Caught! The model correctly said "{trickResult.prediction}".</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---- Inspect Tab ---- */
function InspectTab({ config, model }: { config: TextActivityConfig, model: NaiveBayesAdapter }) {
  const [inputText, setInputText] = useState('');
  const [inspection, setInspection] = useState<any>(null);

  const handleInspect = () => {
    if (!inputText.trim()) return;
    setInspection(model.inspect(inputText.trim()));
  };

  return (
    <div className="preview-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div className="trick-challenge" style={{ background: 'var(--color-primary-soft)', borderLeftColor: 'var(--color-primary)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <span className="material-symbols-rounded" style={{ color: 'var(--color-primary)' }}>search</span>
        <div>
          <strong>Under the Hood:</strong> Type a message to see exactly how the AI breaks it down and calculates its prediction sentence by sentence.
        </div>
      </div>
      
      <div className="test-input-group">
        <input
          className="test-input"
          type="text"
          placeholder="Message to inspect..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleInspect()}
        />
        <button className="btn btn-primary btn-sm" onClick={handleInspect} disabled={!inputText.trim()}>
          Inspect
        </button>
      </div>

      {inspection && (
        <div className="inspect-results" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', marginTop: 'var(--space-2)' }}>
          <div>
            <div className="test-history-title" style={{ marginBottom: 'var(--space-2)' }}>1. Tokenization</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
              First, the AI cleans the text, removes common stop words (like "the", "a"), and extracts just the features:
            </div>
            <div className="test-suggestions" style={{ gap: 'var(--space-1)' }}>
              {inspection.tokens.length > 0 ? inspection.tokens.map((t: string, i: number) => (
                <span key={i} className="test-suggestion" style={{ cursor: 'default' }}>{t}</span>
              )) : (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No meaningful tokens found.</span>
              )}
            </div>
          </div>

          <div>
            <div className="test-history-title" style={{ marginBottom: 'var(--space-2)' }}>2. Mathematical Breakdown</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
              The AI calculates a score for each category by starting with a baseline (Prior Probability) and adding the weight of each word it recognizes.
            </div>
            
            {Object.entries(inspection.classBreakdowns).map(([label, data]: [string, any]) => (
              <div key={label} className="test-result" style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{label}</span>
                  <span className="confidence-pct" style={{ color: label === config.classA.label ? config.classA.colorVar : config.classB.colorVar }}>
                    {Math.round(data.finalConfidence * 100)}% Match
                  </span>
                </div>
                
                <table style={{ width: '100%', fontSize: 'var(--text-xs)', borderCollapse: 'collapse', marginTop: 'var(--space-2)' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '4px 0', color: 'var(--color-text-secondary)' }}>Baseline (Prior)</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{data.priorLogProb.toFixed(2)}</td>
                    </tr>
                    {data.tokenScores.map((t: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '4px 0' }}>
                          Word: <strong>{t.token}</strong> 
                          <span style={{ color: 'var(--color-text-muted)', marginLeft: '4px' }}>(seen {t.count}x)</span>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: t.prob > 0.05 ? 'var(--color-safe)' : 'inherit' }}>
                          {t.logProb.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ padding: '4px 0', fontWeight: 600, paddingTop: '8px' }}>Total Confidence Score</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, paddingTop: '8px' }}>
                        {data.totalLogProb.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
