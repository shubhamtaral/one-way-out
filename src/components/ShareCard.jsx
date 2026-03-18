import { useState } from 'react';

export function ShareCard({ level, wpm, maxCombo, difficulty = 'normal', onClose }) {
  const [copied, setCopied] = useState(false);

  // Dynamically determine the base URL based on the current domain
  const siteUrl = window.location.hostname.includes('tusharkonde')
    ? 'https://one-way-out.tusharkonde.cloud/'
    : 'https://onewayout.shubhamtaral.in/';

  const shareText = `☠️ ONE WAY OUT ☠️\n\nI reached Level ${level}\n⌨️ ${wpm} WPM\n🔥 ${maxCombo}x Combo\n💀 ${difficulty.toUpperCase()} Mode\n\nCan you survive longer?\n🎮 Play: ${siteUrl}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        // Simple fallback
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const [linkedInCopied, setLinkedInCopied] = useState(false);

  const handleLinkedIn = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setLinkedInCopied(true);
        setTimeout(() => setLinkedInCopied(false), 2000);
      }).catch(() => {});
    }
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`, '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'One Way Out',
        text: shareText,
        url: siteUrl
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[#111] border border-bone/20 p-6 max-w-sm w-full rounded-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-void border border-blood/30 p-4 rounded mb-4">
          <div className="text-center">
            <div className="text-2xl mb-2">☠️ ONE WAY OUT ☠️</div>
            <div className="text-4xl font-bold text-bone mb-3">Level {level}</div>
            <div className="flex justify-center gap-6 text-sm text-bone/70">
              <span>⌨️ {wpm} WPM</span>
              <span>🔥 {maxCombo}x</span>
            </div>
            <div className="text-xs text-blood-bright mt-2 uppercase tracking-wider">
              {difficulty} mode
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full py-3 bg-bone hover:bg-bone/90 text-void transition-colors rounded font-bold shadow-lg transform hover:scale-[1.02]"
            >
              📤 Share with friends
            </button>
          )}

          <button
            onClick={handleCopy}
            className="w-full py-3 bg-bone/10 hover:bg-bone/20 transition-colors rounded text-bone"
          >
            {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
          </button>
          
          <button
            onClick={handleTwitter}
            className="w-full py-3 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 transition-colors rounded text-[#1DA1F2]"
          >
            𝕏 Share on Twitter
          </button>
          
          <button
            onClick={handleWhatsApp}
            className="w-full py-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 transition-colors rounded text-[#25D366]"
          >
            💬 Share on WhatsApp
          </button>

          <button
            onClick={handleLinkedIn}
            className="w-full py-3 bg-[#0077b5]/20 hover:bg-[#0077b5]/30 transition-colors rounded text-[#0077b5]"
          >
            {linkedInCopied ? '✓ Copied! (Paste on LinkedIn)' : '💼 Share on LinkedIn'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-bone/40 hover:text-bone/60 text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}
