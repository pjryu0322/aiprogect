import type { ScriptSegment } from '../../../data/types';
import './resultScreen.css';

function formatSegmentTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function ScriptView({ script }: { script: ScriptSegment[] }) {
  return (
    <div className="result-screen-script" role="list" aria-label="화자별 스크립트">
      {script.map((segment) => (
        <article
          key={segment.id}
          className="result-screen-script__segment"
          role="listitem"
          aria-label={`${segment.speakerName} 발화`}
        >
          <header className="result-screen-script__header">
            <span className="result-screen-script__speaker">{segment.speakerName}</span>
            <time className="result-screen-script__time" dateTime={`PT${segment.startSeconds}S`}>
              {formatSegmentTime(segment.startSeconds)}
            </time>
          </header>
          <p className="result-screen-script__text">{segment.text}</p>
        </article>
      ))}
    </div>
  );
}
