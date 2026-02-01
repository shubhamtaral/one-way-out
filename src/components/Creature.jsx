import { useState, useEffect } from 'react';
import './Creature.css';

export function Creature({ mistakes, maxMistakes, isGameOver }) {
  const [popups, setPopups] = useState([]);
  const [prevMistakes, setPrevMistakes] = useState(0);

  // Trigger scary pop-ups on new mistakes
  useEffect(() => {
    if (mistakes > prevMistakes) {
      const newPopup = {
        id: Date.now(),
        side: Math.random() > 0.5 ? 'left' : 'right',
        delay: Math.random() * 200,
      };
      setPopups(prev => [...prev, newPopup]);
      
      // Remove popup after animation
      setTimeout(() => {
        setPopups(prev => prev.filter(p => p.id !== newPopup.id));
      }, 1200);
    }
    setPrevMistakes(mistakes);
  }, [mistakes, prevMistakes]);

  // Calculate ghost intensity based on mistakes
  const ghostIntensity = Math.min(mistakes / maxMistakes, 1);
  const scaleAmount = 1 + ghostIntensity * 0.3;

  return (
    <div className="creature-container">
      {/* Background scary ghost that grows */}
      <div
        className="scary-ghost-bg"
        style={{
          opacity: Math.min(ghostIntensity * 0.5, 0.4),
          filter: `blur(${15 + ghostIntensity * 20}px)`,
          transform: `scale(${scaleAmount})`,
        }}
      >
        {/* Left eye */}
        <div className="ghost-eye-left"></div>
        {/* Right eye */}
        <div className="ghost-eye-right"></div>
      </div>

      {/* Pop-up scary ghosts on mistakes */}
      {popups.map(popup => (
        <div
          key={popup.id}
          className={`popup-ghost ${popup.side}`}
          style={{ animationDelay: `${popup.delay}ms` }}
        >
          {/* Blurred ghostly form */}
          <div className="popup-ghost-shape">
            {/* Red glowing eyes */}
            <div className="popup-eye popup-eye-left"></div>
            <div className="popup-eye popup-eye-right"></div>
          </div>
        </div>
      ))}

      {/* Game over - full screen scary overlay */}
      {isGameOver && (
        <>
          <div className="final-ghost">
            <div className="final-ghost-body">
              <div className="final-eye final-eye-left"></div>
              <div className="final-eye final-eye-right"></div>
            </div>
          </div>
          <div className="death-overlay"></div>
          <div className="death-message">CAPTURED</div>
        </>
      )}
    </div>
  );
}
