import { useState } from 'react';

export function CreditsDialog({ onClose }) {
  const credits = [
    { role: 'Lead Development', names: ['Tusharx1143', 'shubhamtaral'] },
    { role: 'Lead Design', names: ['Tusharx1143', 'shubhamtaral'] },
    { role: 'Sound & SFX', names: ['Tusharx1143', 'shubhamtaral'] },
    { role: 'UI & Art', names: ['Tusharx1143', 'shubhamtaral'] },
    { role: 'Content', names: ['Tusharx1143', 'shubhamtaral'] },
  ];

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-[var(--color-bone)]/20 rounded-lg max-w-md w-full p-8 max-h-[85vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-bone)]/40 hover:text-[var(--color-bone)] text-2xl transition-colors"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-[var(--color-bone)] mb-8 text-center tracking-widest">CREDITS</h2>

        <div className="space-y-6 mb-10">
          {credits.map((item, idx) => (
            <div key={idx} className="text-center group">
              <h3 className="text-[var(--color-bone)]/40 text-xs uppercase tracking-[0.2em] mb-2 group-hover:text-[var(--color-bone)]/60 transition-colors">
                {item.role}
              </h3>
              <div className="text-[var(--color-bone)] text-lg font-medium space-x-2">
                {item.names.map((name, nIdx) => (
                  <span key={nIdx}>
                    {name}{nIdx < item.names.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-6 border-t border-[var(--color-bone)]/10">
          <a
            href="https://www.chai4.me/shubhamtaral"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black py-3 rounded-md font-bold transition-all transform hover:scale-[1.02]"
          >
            <span>☕</span> Chai 4 Us?
          </a>

          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://www.linkedin.com/sharing/share-offsite/?url=https://one-way-out.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#0077b5] hover:bg-[#0077b5]/90 text-white py-2 px-4 rounded-md text-sm font-semibold transition-all"
            >
              Share on LinkedIn
            </a>
            <a
              href="https://www.linkedin.com/in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[var(--color-bone)]/10 hover:bg-[var(--color-bone)]/20 text-[var(--color-bone)] py-2 px-4 border border-[var(--color-bone)]/20 rounded-md text-sm font-semibold transition-all"
            >
              Review us
            </a>
          </div>
        </div>

        <p className="text-[var(--color-bone)]/20 text-[10px] text-center mt-8 uppercase tracking-widest">
          Built with React • Vite • Firebase
        </p>
      </div>
    </div>
  );
}
