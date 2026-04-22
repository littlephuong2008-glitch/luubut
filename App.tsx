import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home as HomeIcon, Heart, Volume2, VolumeX, X, Image, BookOpen, MessageSquare
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { rtdb } from './lib/firebase';
import { ref, push } from 'firebase/database';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import Guestbook, { NoteEntry, SignatureItem, PhotoItem, StickerItem } from './pages/Guestbook';
import NoteCanvas from './pages/guestbook/NoteCanvas';
import SignaturePad from './pages/guestbook/SignaturePad';
import DecorToolbar from './pages/guestbook/DecorToolbar';

const PLAYLIST = [
  {
    title: "Dive",
    artist: "Olivia Dean",
    id: "tXG9hE6L7lQ",
    thumbnail: "https://i.ytimg.com/vi/tXG9hE6L7lQ/mqdefault.jpg"
  },
  {
    title: "The Hardest Part",
    artist: "Olivia Dean",
    id: "j_P98_6D78Y",
    thumbnail: "https://i.ytimg.com/vi/j_P98_6D78Y/mqdefault.jpg"
  },
  {
    title: "Be My Own Boyfriend",
    artist: "Olivia Dean",
    id: "aI8Q9N5-80k",
    thumbnail: "https://i.ytimg.com/vi/aI8Q9N5-80k/mqdefault.jpg"
  },
  {
    title: "Reason to Stay",
    artist: "Olivia Dean",
    id: "8r2Y4J1035o",
    thumbnail: "https://i.ytimg.com/vi/8r2Y4J1035o/mqdefault.jpg"
  },
  {
    title: "Baby Come Home",
    artist: "Olivia Dean",
    id: "Z7H8H-D6yYQ",
    thumbnail: "https://i.ytimg.com/vi/Z7H8H-D6yYQ/mqdefault.jpg"
  },
  {
    title: "Danger",
    artist: "Olivia Dean",
    id: "Y9kYxO7PzSg",
    thumbnail: "https://i.ytimg.com/vi/Y9kYxO7PzSg/mqdefault.jpg"
  },
  {
    title: "Ladies Room",
    artist: "Olivia Dean",
    id: "vFhY-U5_69I",
    thumbnail: "https://i.ytimg.com/vi/vFhY-U5_69I/mqdefault.jpg"
  },
  {
    title: "Messy",
    artist: "Olivia Dean",
    id: "Xm3f_x1-rAQ",
    thumbnail: "https://i.ytimg.com/vi/Xm3f_x1-rAQ/mqdefault.jpg"
  },
  {
    title: "UFO",
    artist: "Olivia Dean",
    id: "fV-v6mG9c54",
    thumbnail: "https://i.ytimg.com/vi/fV-v6mG9c54/mqdefault.jpg"
  },
  {
    title: "Carmen",
    artist: "Olivia Dean",
    id: "8U6-mJ_Q_S8",
    thumbnail: "https://i.ytimg.com/vi/8U6-mJ_Q_S8/mqdefault.jpg"
  },
  {
    title: "I Could Be Florist",
    artist: "Olivia Dean",
    id: "YmD9qS6v6Fk",
    thumbnail: "https://i.ytimg.com/vi/YmD9qS6v6Fk/mqdefault.jpg"
  },
  {
    title: "No Room For Doubt",
    artist: "Olivia Dean",
    id: "_O7_v4Z0k-U",
    thumbnail: "https://i.ytimg.com/vi/_O7_v4Z0k-U/mqdefault.jpg"
  },
  {
    title: " Slowly",
    artist: "Olivia Dean",
    id: "8r2Y4J1035o",
    thumbnail: "https://i.ytimg.com/vi/8r2Y4J1035o/mqdefault.jpg"
  },
  {
    title: "What Am I Gonna Do On Sundays?",
    artist: "Olivia Dean",
    id: "f-5m_6f7g8h",
    thumbnail: "https://i.ytimg.com/vi/tXG9hE6L7lQ/mqdefault.jpg"
  },
  {
    title: "Echo",
    artist: "Olivia Dean",
    id: "Z7H8H-D6yYQ",
    thumbnail: "https://i.ytimg.com/vi/Z7H8H-D6yYQ/mqdefault.jpg"
  }
];

function GlobalMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  
  const location = useLocation();
  const playerRef = useRef<HTMLIFrameElement>(null);

  const playlistId = "PLetggYgR2eZc_SZFnfhv1S1gwaIxoz3Qa";
  const currentTrack = PLAYLIST[currentTrackIndex];

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  const embedUrl = isPlaying 
    ? `https://www.youtube.com/embed/${currentTrack.id}?autoplay=1&enablejsapi=1&list=${playlistId}&loop=${isRepeat ? 1 : 0}`
    : `https://www.youtube.com/embed/${currentTrack.id}?enablejsapi=1&list=${playlistId}`;

  return (
    <>
      <div className="fixed opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
        <iframe
          ref={playerRef}
          width="1"
          height="1"
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        ></iframe>
      </div>
      
      {/* Floating Music Toggle - Matches Heart Style */}
      <div className="fixed bottom-8 left-8 z-[70]">
        <motion.button
          whileHover={{ scale: 1.2, rotate: -10 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMusic}
          className="p-0 bg-transparent text-sang-pink drop-shadow-lg transition-all border-none focus:outline-none"
        >
          {isPlaying ? (
            <Volume2 size={48} fill="currentColor" strokeWidth={1} className="drop-shadow-md" />
          ) : (
            <VolumeX size={48} fill="currentColor" strokeWidth={1} className="drop-shadow-md opacity-40 hover:opacity-100" />
          )}
        </motion.button>
      </div>
    </>
  );
}

function Navbar() {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Guestbook', icon: MessageSquare },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-white/60 backdrop-blur-md rounded-full shadow-lg border border-vintage-pink/30 flex items-center gap-6">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || location.pathname === '/guestbook';
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`relative flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-vintage-brown' : 'text-vintage-brown/40 hover:text-vintage-pink'
            }`}
          >
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium uppercase tracking-widest">{item.label}</span>
            {isActive && (
              <motion.div layoutId="nav-active" className="absolute -bottom-1 w-1 h-1 bg-vintage-pink rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function AppContent() {
  const location = useLocation();
  const [showGlobalWriter, setShowGlobalWriter] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  
  const [draft, setDraft] = useState<Omit<NoteEntry, 'id' | 'timestamp'>>({
    name: '',
    message: '',
    envelopeMessage: '',
    bgColor: '#fdfaf7',
    textColor: '#4a3735',
    texts: [],
    stickers: [],
    photos: [],
    signatures: [],
    textPos: { x: 50, y: 50 },
    textSize: 42,
    fontFamily: 'font-handwriting',
    isBold: false,
    isItalic: false,
    musicUrl: '',
    envelopeColor: '#FFFFFF',
    envelopeEffect: 'sparkles',
    effectColor: '#E2B2B2',
    stampUrl: '',
  });

  const resetDraft = () => {
    setDraft({
      name: '',
      message: '',
      envelopeMessage: '',
      bgColor: '#fdfaf7',
      textColor: '#4a3735',
      texts: [],
      stickers: [],
      photos: [],
      signatures: [],
      textPos: { x: 50, y: 50 },
      textSize: 42,
      fontFamily: 'font-handwriting',
      musicUrl: '',
      envelopeColor: '#FFFFFF',
      envelopeEffect: 'sparkles',
      effectColor: '#E2B2B2',
      stampUrl: '',
    });
  };

  const handleSubmit = async () => {
    if (!draft.name) return;
    const newEntry: NoteEntry = {
      ...draft,
      timestamp: new Date().toLocaleString(),
    } as NoteEntry;

    try {
      const notesRef = ref(rtdb, 'notes');
      await push(notesRef, newEntry);
      
      setShowGlobalWriter(false);
      resetDraft();
    } catch (error) {
      console.error("Firebase save error:", error);
      alert("Lỗi khi lưu dữ liệu. Có thể do dữ liệu quá lớn hoặc vấn đề kết nối.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500 bg-luxury-rose">
      <header className="py-6 px-12 flex justify-between items-center z-10 sticky top-0 transition-colors bg-luxury-rose text-cream">
        <Link to="/" className="text-2xl font-serif italic scribble-hover text-cream">
          Lưu bút của Khánh Phương.
        </Link>
        <div className="flex items-center gap-2 text-sm font-medium tracking-tighter uppercase">
          <span>2023</span>
          <span className="text-sang-pink">—</span>
          <span>2026</span>
        </div>
      </header>

      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Guestbook currentDraft={draft} setDraft={setDraft} onResetDraft={resetDraft} showSignaturePad={() => setShowSignaturePad(true)} />} />
            <Route path="/guestbook" element={<Guestbook currentDraft={draft} setDraft={setDraft} onResetDraft={resetDraft} showSignaturePad={() => setShowSignaturePad(true)} />} />
          </Routes>
        </AnimatePresence>
      </main>

      <GlobalMusic />
      
      <AnimatePresence>
        {showGlobalWriter && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGlobalWriter(false)}
              className="absolute inset-0 bg-luxury-rose/90 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="relative bg-cream w-full max-w-[96vw] h-[96vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-8 py-6 flex justify-between items-center border-b border-vintage-pink/10">
                <div className="flex items-center gap-4">
                  <Heart size={24} className="text-sang-pink" fill="currentColor" />
                  <h3 className="text-2xl font-serif italic text-luxury-rose">Viết Lưu Bút</h3>
                </div>
                <button onClick={() => setShowGlobalWriter(false)} className="text-vintage-brown hover:rotate-90 transition-all p-2">
                  <X size={28} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-10 no-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                   <div className="lg:col-span-4 space-y-6">
                      <input 
                        type="text" 
                        placeholder="Tên của bạn"
                        value={draft.name}
                        onChange={(e) => setDraft({...draft, name: e.target.value})}
                        className="w-full bg-white p-4 rounded-xl border border-vintage-pink/10 font-sans text-lg focus:ring-2 ring-chic-pink/50 outline-none"
                      />
                      <div className="pt-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-vintage-brown/40 mb-2 block">NHẠC NỀN (LINK YOUTUBE/SPOTIFY)</label>
                        <input 
                          type="text" 
                          placeholder="Link bài hát..."
                          value={draft.musicUrl}
                          onChange={(e) => setDraft({...draft, musicUrl: e.target.value})}
                          className="w-full bg-white p-4 rounded-xl border border-vintage-pink/10 text-sm outline-none"
                        />
                      </div>
                      <DecorToolbar draft={draft} setDraft={setDraft} onOpenSignature={() => setShowSignaturePad(true)} />
                      <button onClick={handleSubmit} disabled={!draft.name} className="w-full py-5 bg-sang-pink text-white font-bold uppercase tracking-widest rounded-xl shadow-lg disabled:opacity-50">
                        Gửi Lời Thương
                      </button>
                   </div>
                   <div className="lg:col-span-8 flex flex-col">
                      <div className="flex-1 min-h-[500px] bg-white/40 p-4 rounded-[2rem] border border-white/60 shadow-inner flex items-center justify-center">
                         <div className="w-full max-w-[700px] aspect-[4/5] bg-white rounded-lg shadow-2xl relative border-8 border-white/5 overflow-hidden">
                            <NoteCanvas draft={draft} setDraft={setDraft} isPreview={true} />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SignaturePad 
        isOpen={showSignaturePad} 
        onClose={() => setShowSignaturePad(false)}
        onSave={(data) => {
          const newSig: SignatureItem = { id: Date.now().toString(), data, x: 82, y: 84, size: 180 };
          setDraft({...draft, signatures: [...draft.signatures, newSig]});
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
