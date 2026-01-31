export function PauseOverlay({ onResume, onQuit }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div className="flex flex-col items-center gap-6 bg-[#111] border-4 border-[var(--color-bone)] p-12 rounded-lg max-w-sm">
        <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-bone)] tracking-widest">
          PAUSED
        </h2>
        
        <p className="text-[var(--color-bone)] text-lg text-center font-semibold">
          Press ESC to resume
        </p>

        <div className="flex flex-col gap-3 w-full mt-4">
          <button
            onClick={onResume}
            className="w-full px-8 py-4 border-2 border-[var(--color-bone)] text-[var(--color-bone)] hover:bg-[var(--color-bone)] hover:text-[var(--color-void)] transition-all font-bold tracking-wider text-lg"
          >
            RESUME
          </button>

          <button
            onClick={onQuit}
            className="w-full px-8 py-4 border-2 border-[var(--color-bone)]/30 text-[var(--color-bone)]/60 hover:border-[var(--color-bone)] hover:text-[var(--color-bone)] transition-all font-bold tracking-wider text-lg"
          >
            QUIT TO HOME
          </button>
        </div>

        <p className="text-[var(--color-bone)]/30 text-xs mt-2">
          Your progress is safe
        </p>
      </div>
    </div>
  );
}
