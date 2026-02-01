export function PauseOverlay({ onResume, onQuit }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div 
        className="flex flex-col items-center gap-8 bg-[#0a0a0a] border-8 border-[#ffff00] p-10 rounded-2xl max-w-lg shadow-2xl"
        style={{
          boxShadow: '0 0 40px rgba(255, 255, 0, 0.5), 0 0 80px rgba(255, 255, 0, 0.3), inset 0 0 20px rgba(255, 255, 0, 0.1)'
        }}
      >
        <h2 className="text-6xl md:text-7xl font-black text-[#ffff00] tracking-widest drop-shadow-lg">
          PAUSED
        </h2>
        
        <p className="text-white text-xl text-center font-bold tracking-wide">
          Press <span className="text-[#ffff00] font-black text-2xl">ESC</span> to resume
        </p>

        <div className="flex flex-col gap-4 w-full mt-6">
          <button
            onClick={onResume}
            className="w-full px-8 py-5 border-3 border-[#ffff00] text-white bg-[#ffff00]/10 hover:bg-[#ffff00] hover:text-black transition-all font-black tracking-wider text-xl shadow-lg hover:shadow-[0_0_20px_rgba(255,255,0,0.6)]"
          >
            RESUME
          </button>

          <button
            onClick={onQuit}
            className="w-full px-8 py-5 border-3 border-white text-white hover:border-[#ffff00] hover:text-[#ffff00] transition-all font-black tracking-wider text-xl hover:shadow-[0_0_15px_rgba(255,255,0,0.4)]"
          >
            QUIT TO HOME
          </button>
        </div>

        <p className="text-[#ffff00] text-sm mt-4 font-semibold">
          ✓ Your progress is safe
        </p>
      </div>
    </div>
  );
}
