import { useState, useRef, useEffect } from 'react';
import { AudioFeatureExtractor } from '../../../ml/AudioFeatureExtractor';
import type { AudioSample } from '../../../ml/AudioFeatureExtractor';
import './SoundGatherStep.css';

interface Props {
  samples: AudioSample[];
  onAddSample: (sample: AudioSample) => void;
  onClearSamples: (label: string) => void;
  extractor: AudioFeatureExtractor;
}

const CATEGORIES = [
  { id: 'clap', label: 'Clap', icon: 'waving_hand', color: 'var(--color-primary)' },
  { id: 'whistle', label: 'Whistle', icon: 'music_note', color: 'var(--color-accent)' },
  { id: 'voice', label: 'Voice', icon: 'record_voice_over', color: 'var(--color-safe)' }
];

export function SoundGatherStep({ samples, onAddSample, onClearSamples, extractor }: Props) {
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [micLive, setMicLive] = useState(false);
  const [liveVolume, setLiveVolume] = useState(0);

  useEffect(() => {
    let active = true;
    const checkMic = async () => {
      // Prompt for mic on load if not already permitted
      if (!extractor.isReady()) {
        const ok = await extractor.requestPermission();
        if (active && ok) setMicLive(true);
      } else {
        setMicLive(true);
      }
    };
    checkMic();

    return () => { active = false; };
  }, [extractor]);

  // Live volume meter loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      if (micLive) {
        // scale up the RMS for visualization
        setLiveVolume(Math.min(100, extractor.getLiveRMS() * 500));
      }
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [micLive, extractor]);

  const handleRecord = async (catId: string, label: string) => {
    if (!micLive) {
      alert("Please allow microphone access to record sounds.");
      return;
    }
    setRecordingId(catId);
    try {
      const features = await extractor.recordSample(1200); // Record for 1.2s
      if (features) {
        onAddSample({ label, features, waveform: features.waveform });
      }
    } finally {
      setRecordingId(null);
    }
  };

  return (
    <div className="sound-gather">
      <div className="mic-meter-bar">
        <span className="material-symbols-rounded">mic</span>
        <div className="mic-meter-fill-bg">
          <div className="mic-meter-fill" style={{ width: `${liveVolume}%` }} />
        </div>
        <span className="mic-status">{micLive ? 'Mic active' : 'Waiting for mic...'}</span>
      </div>

      <div className="sound-buckets">
        {CATEGORIES.map(cat => {
          const catSamples = samples.filter(s => s.label === cat.label);
          const isRecording = recordingId === cat.id;
          
          return (
            <div key={cat.id} className="sound-bucket" style={{ borderTopColor: cat.color }}>
              <div className="bucket-header">
                <span className="material-symbols-rounded bucket-icon" style={{ color: cat.color }}>
                  {cat.icon}
                </span>
                <span className="bucket-title">{cat.label}</span>
                <span className="bucket-count">{catSamples.length}</span>
              </div>
              
              <button 
                className={`btn btn-record ${isRecording ? 'recording' : ''}`}
                onClick={() => handleRecord(cat.id, cat.label)}
                disabled={recordingId !== null && !isRecording}
                style={{ '--record-color': cat.color } as any}
              >
                {isRecording ? (
                  <>
                    <span className="material-symbols-rounded pulse">mic</span> Recording...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-rounded">fiber_manual_record</span> Record
                  </>
                )}
              </button>

              <div className="waveform-list">
                {catSamples.map((s, idx) => (
                  <div key={idx} className="mini-waveform">
                    <WaveformVisualizer buffer={s.waveform} color={cat.color} />
                  </div>
                ))}
              </div>

              {catSamples.length > 0 && (
                <button className="btn btn-sm btn-clear" onClick={() => onClearSamples(cat.label)}>
                  <span className="material-symbols-rounded">delete_outline</span> Clear
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to draw the mini waveform for each recorded sample
function WaveformVisualizer({ buffer, color }: { buffer: Float32Array; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !buffer) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Decimate buffer for drawing
    const step = Math.max(1, Math.floor(buffer.length / w));
    
    for (let i = 0; i < w; i++) {
        const bufIdx = i * step;
        if(bufIdx >= buffer.length) break;
        // buffer values are roughly -1 to 1.
        const v = buffer[bufIdx] * 0.5 + 0.5; // scale to 0 to 1 mapping to roughly height
        const y = h - (v * h);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
    }
    
    ctx.stroke();
  }, [buffer, color]);

  return <canvas ref={canvasRef} className="waveform-canvas" width={120} height={30} />;
}
