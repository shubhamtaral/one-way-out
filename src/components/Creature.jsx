import { useState, useEffect } from 'react';
import './Creature.css';

export function Creature({ mistakes, maxMistakes, isGameOver }) {
  const [isCapturing, setIsCapturing] = useState(false);

  // Calculate ghost position based on mistakes
  // At 0 mistakes: -100% (far away, off screen bottom)
  // At maxMistakes: 50% (right in front of player)
  const ghostProgress = Math.min(mistakes / maxMistakes, 1);
  const ghostBottom = -100 + (ghostProgress * 150); // -100 to 50

  useEffect(() => {
    if (isGameOver && ghostProgress > 0.8) {
      setIsCapturing(true);
    }
  }, [isGameOver, ghostProgress]);

  return (
    <div className="creature-container">
      {/* Ghost that approaches */}
      <div
        className={`ghost ${isCapturing ? 'capturing' : ''}`}
        style={{
          bottom: `${ghostBottom}%`,
          opacity: ghostProgress < 0.1 ? 0.1 : Math.min(0.3 + ghostProgress * 0.7, 1),
        }}
      >
        {/* Ghost head */}
        <div className="ghost-body">
          {/* Eyes */}
          <div className="ghost-eyes">
            <div className="ghost-eye"></div>
            <div className="ghost-eye"></div>
          </div>
          {/* Mouth */}
          <div className="ghost-mouth"></div>
        </div>

        {/* Ghost tail waves */}
        <div className="ghost-tail">
          <div className="tail-wave"></div>
          <div className="tail-wave"></div>
          <div className="tail-wave"></div>
        </div>
      </div>

      {/* Capture effect */}
      {isCapturing && (
        <>
          <div className="capture-glow"></div>
          <div className="capture-text">CAPTURED...</div>
        </>
      )}

      {/* Mistake indicator - how close the ghost is */}
      <div className="mistake-indicator">
        <div className="mistake-label">GHOST DISTANCE</div>
        <div className="ghost-progress-bar">
          <div
            className="ghost-progress-fill"
            style={{ width: `${ghostProgress * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
