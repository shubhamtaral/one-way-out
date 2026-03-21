import { useState } from 'react';

export function CreditsDialog({ onClose }) {
  const credits = [
    { role: 'Lead Development', names: ['Tusharx1143', 'shubhamtaral'] },
    { role: 'Lead Design', names: ['Tusharx1143', 'shubhamtaral'] },
    { role: 'Sound & SFX', names: ['Tusharx1143', 'shubhamtaral'] },
    { role: 'UI & Art', names: ['Tusharx1143', 'shubhamtaral'] },
    { role: 'Content', names: ['Tusharx1143', 'shubhamtaral'] },
  ];

  const [reviewed, setReviewed] = useState(false);
  
  // Dynamically determine the base URL based on the current domain
  const siteUrl = window.location.hostname.includes('tusharkonde')
    ? 'https://one-way-out.tusharkonde.cloud/'
    : 'https://onewayout.shubhamtaral.in/';

  const shareText = `⌨️ ONE WAY OUT - TYPE OR DIE ☠️\n\nCheckout this intense typing survival game! 🔥\n\nPlay: ${siteUrl}`;

  const handleReview = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setReviewed(true);
        setTimeout(() => setReviewed(false), 2000);
      }).catch(() => {});
    }
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`, '_blank');
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleShare = () => {
    const data = {
      title: 'One Way Out',
      text: shareText,
      url: siteUrl
    };

    if (navigator.share) {
      navigator.share(data).catch(() => {});
    } else {
      handleTwitter();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-bone/20 rounded-lg max-w-md w-full p-8 max-h-[85vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-bone/40 hover:text-bone text-2xl transition-colors"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-bone mb-8 text-center tracking-widest">CREDITS</h2>

        <div className="space-y-6 mb-10">
          {credits.map((item, idx) => (
            <div key={idx} className="text-center group">
              <h3 className="text-bone/40 text-xs uppercase tracking-[0.2em] mb-2 group-hover:text-bone/60 transition-colors">
                {item.role}
              </h3>
              <div className="text-bone text-lg font-medium space-x-2">
                {item.names.map((name, nIdx) => (
                  <span key={nIdx}>
                    {name}{nIdx < item.names.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-6 border-t border-bone/10">
          <a
            href="https://www.chai4.me/shubhamtaral"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black py-3 rounded-md font-bold transition-all transform hover:scale-[1.02]"
          >
            <span>☕</span> Chai 4 Us?
          </a>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            <button
              onClick={handleReview}
              className="flex items-center justify-center gap-2 bg-[#0077b5]/20 hover:bg-[#0077b5]/30 text-[#0077b5] py-2 px-4 border border-[#0077b5]/20 rounded-md text-sm font-semibold transition-all"
            >
              {reviewed ? '✓ Copied! (Paste it)' : '💼 LinkedIn Review'}
            </button>
            <button
              onClick={handleTwitter}
              className="flex items-center justify-center gap-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] py-2 px-4 border border-[#1DA1F2]/20 rounded-md text-sm font-semibold transition-all"
            >
              𝕏 Twitter
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] py-2 px-4 border border-[#25D366]/20 rounded-md text-sm font-semibold transition-all"
            >
              💬 WhatsApp
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-bone/10 hover:bg-bone/20 text-bone py-2 px-4 border border-bone/20 rounded-md text-sm font-semibold transition-all"
            >
              📤 More Options
            </button>
          </div>
        </div>

        <p className="text-bone/20 text-[10px] text-center mt-8 uppercase tracking-widest">
          Built with React • Vite • Firebase
        </p>
      </div>
    </div>
  );
}
