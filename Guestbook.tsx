import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { rtdb } from '../lib/firebase';
import { ref, push, onValue } from 'firebase/database';
import { 
  Plus, 
  Trash2, 
  RotateCcw, 
  Image as ImageIcon, 
  Type, 
  Music,
  Check,
  X,
  Sparkles,
  Heart
} from 'lucide-react';
import NoteCanvas from './guestbook/NoteCanvas';
import SignaturePad from './guestbook/SignaturePad';
import DecorToolbar from './guestbook/DecorToolbar';

export type FilterType = 'none' | 'sepia' | 'grayscale' | 'warm' | 'grain' | 'polaroid-grain' | 'kodak' | 'fuji' | 'cinematic';
export type FrameType = 'none' | 'polaroid' | 'film' | 'tape' | 'ornate' | 'washi' | 'stamp' | 'canvas' | 'glitch' | 'gold-leaf';

export interface StickerItem {
  id: string;
  src: string;
  x: number;
  y: number;
  size: number;
}

export interface PhotoItem {
  id: string;
  src: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  filter: FilterType;
  frame: FrameType;
}

export interface SignatureItem {
  id: string;
  data: string;
  x: number;
  y: number;
  size: number;
}

export interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
  fontFamily: string;
  color: string;
  align?: 'left' | 'center' | 'right';
  isBold?: boolean;
  isItalic?: boolean;
}

export interface NoteEntry {
  id: string;
  name: string;
  message: string;
  envelopeMessage: string;
  bgColor: string;
  textColor: string;
  texts: TextItem[];
  stickers: StickerItem[];
  photos: PhotoItem[];
  signatures: SignatureItem[];
  textPos: { x: number; y: number };
  textSize: number;
  fontFamily: string;
  isBold?: boolean;
  isItalic?: boolean;
  timestamp: string;
  musicUrl?: string;
  envelopeColor: string;
  envelopeEffect: string;
  effectColor: string;
  stampUrl?: string;
}

type GuestbookStep = 'writing' | 'enveloping' | 'submitting' | 'done';

interface Props {
  currentDraft: Omit<NoteEntry, 'id' | 'timestamp'>;
  setDraft: (d: any) => void;
  onResetDraft: () => void;
  showSignaturePad: () => void;
}

const EFFECTS = [
  { id: 'heart', icon: '❤️' },
  { id: 'star', icon: '⭐' },
  { id: 'sparkles', icon: '✨' },
  { id: 'bubble', icon: '🫧' },
  { id: 'flower', icon: '🌸' },
  { id: 'butterfly', icon: '🦋' }
];

const ENVELOPE_COLORS = [
  { name: 'Trắng', color: '#FFFFFF' },
  { name: 'Be', color: '#FAF9F6' },
  { name: 'Hồng Nhạt', color: '#FCE4EC' },
  { name: 'Xanh Baby', color: '#E3F2FD' },
  { name: 'Tím Lavender', color: '#F3E5F5' },
  { name: 'Xanh Mint', color: '#E8F5E9' }
];

export default function Guestbook({ currentDraft, setDraft, onResetDraft, showSignaturePad }: Props) {
  const [searchParams] = useSearchParams();
  const isAdminParam = searchParams.get('view') === 'admin';
  const [adminNotes, setAdminNotes] = useState<NoteEntry[]>([]);
  const [isFetching, setIsFetching] = useState(isAdminParam);

  const [submittedNote, setSubmittedNote] = useState<NoteEntry | null>(null);
  const [step, setStep] = useState<GuestbookStep>('writing');
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [glitterVisible, setGlitterVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all notes if admin param is present
  useEffect(() => {
    if (!isAdminParam) return;
    
    const notesRef = ref(rtdb, 'notes');
    const unsubscribe = onValue(notesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notesList: NoteEntry[] = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })).reverse(); 
        setAdminNotes(notesList);
      } else {
        setAdminNotes([]);
      }
      setIsFetching(false);
    });

    return () => unsubscribe();
  }, [isAdminParam]);

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const id = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
      return `https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}`;
    }
    if (url.includes('spotify.com')) {
      const parts = url.split('/');
      const id = parts.pop();
      const type = parts.pop();
      return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&autoplay=1`;
    }
    return '';
  };

  if (isAdminParam) {
    return (
      <div className="bg-luxury-rose min-h-screen pt-32 pb-40 px-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col items-center mb-20 text-center">
            <h1 className="text-5xl font-serif text-cream italic mb-4">Kho Tàng Lưu Bút</h1>
            <p className="text-cream/60 font-handwriting text-2xl">
              Tổng cộng đã nhận được {adminNotes.length} lưu bút từ bạn bè
            </p>
          </div>

          {isFetching ? (
            <div className="flex justify-center py-20">
               <div className="w-12 h-12 border-4 border-sang-pink border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
              {adminNotes.map((note) => (
                <motion.div 
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/10 shadow-2xl flex flex-col gap-6"
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-cream/30 uppercase tracking-widest px-2">
                    <span>{note.timestamp}</span>
                    <span className="text-sang-pink">LƯU BÚT TỪ {note.name}</span>
                  </div>
                  <div className="w-full aspect-[4/5] bg-white rounded-xl shadow-inner relative overflow-hidden">
                    <NoteCanvas draft={note} isPreview={false} />
                  </div>
                  {note.musicUrl && (
                    <div className="bg-white/5 p-3 rounded-2xl flex items-center gap-3">
                      <Music size={16} className="text-sang-pink" />
                      <span className="text-[10px] text-cream/60 truncate font-mono">{note.musicUrl}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (submittedNote && step === 'done') {
    const embedUrl = getEmbedUrl(submittedNote.musicUrl || '');

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-luxury-rose pt-12 pb-32 px-6 -mt-12 flex flex-col items-center justify-center text-center relative overflow-hidden"
      >
        {/* Hidden Backtrack Audio */}
        {embedUrl && (
          <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
            <iframe 
              width="1" 
              height="1" 
              src={embedUrl}
              allow="autoplay; encrypted-media" 
            />
          </div>
        )}

        {/* Outer Glows */}
        <div className="absolute inset-0 z-0 pointer-events-none">
           {[...Array(6)].map((_, i) => (
             <motion.div
               key={i}
               className="absolute rounded-full bg-sang-pink/10 blur-[100px]"
               animate={{
                 x: [Math.random() * 500, Math.random() * -500],
                 y: [Math.random() * 500, Math.random() * -500],
                 scale: [1, 1.5, 1],
               }}
               transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
               style={{
                 width: 400 + i * 100,
                 height: 400 + i * 100,
                 top: '30%',
                 left: '40%',
               }}
             />
           ))}
        </div>

        {/* Envelope Reveal Logic */}
        <AnimatePresence>
          {!envelopeOpened && (
             <motion.div 
               key="envelope"
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 1.2, opacity: 0, y: -200 }}
               className="relative z-50 transform rotate-1"
               onClick={() => {
                 setGlitterVisible(true);
                 setTimeout(() => setEnvelopeOpened(true), 1200);
               }}
             >
                <div 
                   className="w-[500px] h-[350px] rounded-xl shadow-2xl relative flex flex-col items-center justify-center cursor-pointer group"
                   style={{ backgroundColor: submittedNote.envelopeColor }}
                >
                   {/* Flap */}
                   <div className="absolute top-0 inset-x-0 h-1/2 bg-white/10 origin-top group-hover:rotate-x-20 rounded-t-xl transition-transform" />
                   
                   <div className="text-luxury-rose font-handwriting text-3xl space-y-4 text-center px-12">
                      <p className="opacity-40 text-sm uppercase tracking-widest font-sans font-bold">To: Khánh Phương</p>
                      <p className="border-b border-luxury-rose/20 pb-2 italic">{submittedNote.envelopeMessage || 'Gửi lời thương yêu nhất'}</p>
                      <p className="opacity-40 text-sm uppercase tracking-widest font-sans font-bold">From: {submittedNote.name}</p>
                   </div>

                   {/* Stamp */}
                   <div className="absolute top-8 right-8 w-16 h-20 bg-white p-1 shadow-lg transform rotate-6">
                      {submittedNote.stampUrl ? (
                         <img src={submittedNote.stampUrl} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full bg-luxury-rose/10 flex items-center justify-center text-luxury-rose">
                            <Heart size={20} />
                         </div>
                      )}
                      <div className="absolute -top-1 -left-1 w-full h-full border border-dashed border-luxury-rose/30 pointer-events-none" />
                   </div>

                   {/* Effect Effect */}
                   {glitterVisible && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                         {[...Array(30)].map((_, i) => (
                            <motion.div
                               key={i}
                               initial={{ opacity: 0, scale: 0, top: '50%', left: '50%' }}
                               animate={{ 
                                  opacity: [0, 1, 0], 
                                  scale: [1, 2, 1],
                                  top: `${Math.random() * 100}%`,
                                  left: `${Math.random() * 100}%`
                               }}
                               transition={{ duration: 2, delay: Math.random() * 0.5 }}
                               className="absolute text-2xl"
                            >
                               {EFFECTS.find(e => e.id === submittedNote.envelopeEffect)?.icon || '✨'}
                            </motion.div>
                         ))}
                      </div>
                   )}

                   <div className="absolute bottom-6 font-sans font-bold text-[10px] uppercase tracking-[0.4em] opacity-40 animate-bounce">Bấm để mở lưu bút</div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>

        {envelopeOpened && (
           <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 w-full max-w-5xl flex flex-col items-center pb-20"
           >
              <div className="mb-8 text-center">
                <h2 className="text-4xl font-serif text-cream mb-2 italic">Lưu bút từ {submittedNote.name}</h2>
                <p className="text-cream/60 font-handwriting text-xl">kphuong đã nhận được lưu bút ngọt ngào từ bạn và sẽ dành 24 giờ tiếp theo để đọc đi đọc lại nó.</p>
              </div>

              {/* Reveal Letter - EXACT MATCH OF PREVIEW CONTAINER */}
              <div className="w-full max-w-[800px] aspect-[4/5] bg-white rounded-lg shadow-2xl relative border-8 border-white/5 overflow-hidden mx-auto">
                <NoteCanvas draft={submittedNote} isPreview={false} />
              </div>

              <button 
                onClick={() => {
                   setSubmittedNote(null);
                   setStep('writing');
                   setEnvelopeOpened(false);
                   setGlitterVisible(false);
                }}
                className="mt-12 px-10 py-4 bg-cream text-luxury-rose font-bold uppercase tracking-widest rounded-full shadow-lg hover:scale-105 transition-transform border border-luxury-rose/20"
              >
                Viết thêm một bản lưu bút khác
              </button>
           </motion.div>
        )}
      </motion.div>
    );
  }

  const handleStepChange = async (nextStep: GuestbookStep) => {
     if (nextStep === 'submitting') {
        const newEntry: NoteEntry = {
          ...currentDraft,
          timestamp: new Date().toLocaleString(),
        } as NoteEntry;
        
        try {
          // Save to Firebase
          const notesRef = ref(rtdb, 'notes');
          await push(notesRef, newEntry);
          
          setSubmittedNote(newEntry);
          setStep('done');
          onResetDraft(); // Clear draft via App.tsx callback
        } catch (error) {
          console.error("Firebase error:", error);
          alert("Gặp lỗi khi gửi lưu bút. Vui lòng thử lại!");
        }
     } else {
        setStep(nextStep);
     }
  };

  const handleStampUpload = (e: ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
           setDraft({ ...currentDraft, stampUrl: ev.target?.result as string });
        };
        reader.readAsDataURL(file);
     }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-luxury-rose pb-32 px-4 sm:px-6 min-h-screen"
    >
        <div className="max-w-[1600px] mx-auto pt-16">
          <div className="flex flex-col md:flex-row justify-between items-start mb-16 px-4 gap-8">
          <div className="flex-1">
             <h2 className="text-6xl font-serif text-cream tracking-tight">
               Lưu Bút Của <span className="italic">Khánh Phương</span>
             </h2>
             <div className="font-serif italic text-2xl text-white mt-6 leading-relaxed space-y-4 w-full">
               <p>Hii, cảm ơn m đã visit đường link này của t hooray!</p>
               <p>Có những người t chỉ có thể gửi qua online vì khoảng cách địa lí, và cũng có những bạn t vừa đưa giấy vừa đưa link vì hi vọng mọi người sẽ có nhiều chỗ hơn để viết lol.</p>
               <p>Dù m có là ai thì t mong là m có thể decor lưu bút của mình thật đẹp theo sở thích của mình để t nhớ nhất nè, gửi những bức ảnh của m/của chúng ta (hihi) cho t xem, hay tặng t 1 bài hát đặc biệt nào đó nhá yay.</p>
               <p>Most importantly, huhu t háo hức được đọc lưu bút của m ở trên này lắm nên hãy viết tất cả những gì m muốn nhaaa saranghae!</p>
               <p>Again, thx for visiting and I really really appreciate your letter. <br /> From tkp with love</p>
             </div>
          </div>
          
          <div className="flex gap-4">
             {['writing', 'enveloping'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step === s ? 'bg-sang-pink text-white shadow-[0_0_15px_rgba(255,148,148,0.5)]' : i < (step === 'writing' ? 0 : 1) ? 'bg-green-500 text-white' : 'bg-white/10 text-white/30'}`}>
                      {i < (step === 'writing' ? 0 : 1) ? <Check size={14} /> : i + 1}
                   </div>
                   <span className={`text-[10px] uppercase font-bold tracking-widest ${step === s ? 'text-white' : 'text-white/30'}`}>
                      {s === 'writing' ? 'Viết Lưu Bút' : 'Gói Phong Lưu Bút'}
                   </span>
                </div>
             ))}
          </div>
        </div>

        {step === 'writing' && (
           <div className="flex flex-col items-center gap-12">
             {/* Header Section: Name & Music */}
             <div className="w-full max-w-[800px] bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 shadow-2xl flex flex-col md:flex-row gap-6">
               <div className="flex-1">
                 <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-cream/40 mb-3 block">
                   MỜI BẠN NHẬP TÊN
                 </label>
                 <input 
                   type="text" 
                   placeholder="Tên của bạn"
                   value={currentDraft.name}
                   onChange={(e) => setDraft({...currentDraft, name: e.target.value})}
                   className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-cream font-medium text-lg focus:ring-2 ring-sang-pink/50 outline-none placeholder:text-white/20"
                 />
               </div>
               <div className="flex-1">
                 <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-cream/40 mb-3 block">
                    LINK NHẠC (YOUTUBE/SPOTIFY)
                 </label>
                 <input 
                   type="text" 
                   placeholder="Dán link bài hát kỉ niệm..."
                   value={currentDraft.musicUrl}
                   onChange={(e) => setDraft({...currentDraft, musicUrl: e.target.value})}
                   className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-cream text-xs font-medium focus:ring-2 ring-sang-pink/50 outline-none placeholder:text-white/20 h-[58px]"
                 />
               </div>
             </div>

             {/* Main Canvas Area - CENTERED AND PRECISE */}
             <div className="w-full flex justify-center px-4">
                <div className="w-full max-w-[800px] aspect-[4/5] bg-white rounded-lg shadow-2xl relative border-8 border-white/5 overflow-hidden translate-z-0">
                   <NoteCanvas draft={currentDraft} setDraft={setDraft} isPreview={true} />
                </div>
             </div>

             {/* Tools Section: Decor & Action */}
             <div className="w-full max-w-[800px] space-y-8 pb-20">
                <div className="flex items-center gap-2 text-cream/40 mb-4 px-2 justify-center">
                   <Sparkles size={16} />
                   <span className="text-xs uppercase font-bold tracking-[0.2em]">Bộ công cụ thiết kế</span>
                </div>
                
                <DecorToolbar 
                  draft={currentDraft} 
                  setDraft={setDraft} 
                  onOpenSignature={showSignaturePad} 
                />

                <button 
                  onClick={() => handleStepChange('enveloping')}
                  disabled={!currentDraft.name}
                  className="w-full py-6 bg-sang-pink text-white font-bold uppercase tracking-[0.4em] text-sm rounded-[2rem] shadow-2xl hover:shadow-sang-pink/40 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-30 disabled:translate-y-0"
                >
                  TIẾP TỤC GÓI LƯU BÚT
                </button>
             </div>
           </div>
        )}

        {step === 'enveloping' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                 <div className="bg-white/10 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/20 shadow-2xl space-y-8">
                    <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-cream/40 mb-4 block text-center">Lời nhắn ngoài phong thư</label>
                       <input 
                         type="text"
                         placeholder="VD: Gửi lời thương yêu nhất..."
                         value={currentDraft.envelopeMessage}
                         onChange={(e) => setDraft({ ...currentDraft, envelopeMessage: e.target.value })}
                         className="w-full bg-white/5 p-5 rounded-2xl border border-white/10 text-cream font-medium focus:ring-2 ring-sang-pink/50 outline-none placeholder:text-white/20 text-center text-xl italic font-handwriting"
                       />
                    </div>

                    <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-cream/40 mb-4 block">Chọn Màu Phong Lưu Bút (Tone Pastel)</label>
                       <div className="flex flex-wrap gap-3">
                          {ENVELOPE_COLORS.map(c => (
                             <button
                                key={c.color}
                                onClick={() => setDraft({ ...currentDraft, envelopeColor: c.color })}
                                className={`w-12 h-12 rounded-lg border-4 transition-all hover:scale-110 flex items-center justify-center ${currentDraft.envelopeColor === c.color ? 'border-white shadow-lg' : 'border-white/10'}`}
                                style={{ backgroundColor: c.color }}
                             >
                               {currentDraft.envelopeColor === c.color && <Check size={16} className="text-luxury-rose" />}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-cream/40 mb-4 block">Chọn Hiệu Ứng Khi Mở Lưu Bút</label>
                       <div className="flex flex-wrap gap-3">
                          {EFFECTS.map(e => (
                             <button
                                key={e.id}
                                onClick={() => setDraft({ ...currentDraft, envelopeEffect: e.id })}
                                className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center text-xl bg-white/5 ${currentDraft.envelopeEffect === e.id ? 'border-sang-pink bg-white/20' : 'border-white/10 text-white/40'}`}
                             >
                                {e.icon}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-cream/40 mb-4 block">Chọn Ảnh Tem Thư</label>
                       <input 
                         type="file" 
                         className="hidden" 
                         ref={fileInputRef}
                         accept="image/*"
                         onChange={handleStampUpload}
                       />
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="w-full py-4 bg-white/5 border border-dashed border-white/20 rounded-2xl text-cream/60 flex items-center justify-center gap-3 hover:bg-white/10 transition-all font-sans font-bold text-xs uppercase tracking-widest"
                       >
                          {currentDraft.stampUrl ? (
                             <>
                                <ImageIcon size={18} /> Đổi Ảnh Tem
                             </>
                          ) : (
                             <>
                                <Plus size={18} /> Tải Ảnh Làm Tem
                             </>
                          )}
                       </button>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button 
                      onClick={() => setStep('writing')}
                      className="flex-1 py-6 bg-white/10 text-white font-bold uppercase tracking-[0.2em] text-xs rounded-full border border-white/10"
                    >
                      Quay Lại Sửa Lưu Bút
                    </button>
                    <button 
                      onClick={() => handleStepChange('submitting')}
                      className="flex-[2] py-6 bg-sang-pink text-white font-bold uppercase tracking-[0.4em] text-xs rounded-full shadow-[0_10px_20px_rgba(255,148,148,0.3)] animate-pulse"
                    >
                      GỬI LƯU BÚT TẶNG KHÁNH PHƯƠNG
                    </button>
                 </div>
              </div>

              <div className="flex flex-col items-center">
                 <div className="text-cream/40 mb-8 uppercase text-[10px] font-bold tracking-[0.4em]">Xem Trước Phong Bao</div>
                 <div 
                   className="w-full aspect-[1.4/1] rounded-2xl shadow-2xl relative flex flex-col items-center justify-center overflow-hidden"
                   style={{ backgroundColor: currentDraft.envelopeColor }}
                 >
                    <div className="text-luxury-rose font-handwriting text-2xl space-y-3 text-center px-8 z-10">
                       <p className="opacity-40 text-[9px] uppercase tracking-widest font-sans font-bold">To: Khánh Phương</p>
                       <p className="border-b border-luxury-rose/10 pb-2 italic">{currentDraft.envelopeMessage || 'Gửi lời thương yêu nhất'}</p>
                       <p className="opacity-40 text-[9px] uppercase tracking-widest font-sans font-bold">From: {currentDraft.name}</p>
                    </div>

                    <div className="absolute top-6 right-6 w-16 h-20 bg-white p-1 shadow-xl transform rotate-6 border border-neutral-200">
                       {currentDraft.stampUrl ? (
                          <img src={currentDraft.stampUrl} className="w-full h-full object-cover" />
                       ) : (
                          <div className="w-full h-full bg-luxury-rose/5 flex items-center justify-center text-luxury-rose/20">
                             <Heart size={20} />
                          </div>
                       )}
                       <div className="absolute -top-1 -left-1 w-full h-full border border-dashed border-luxury-rose/20 pointer-events-none" />
                    </div>

                    <div className="absolute bottom-6 left-6">
                       <div className="text-[20px]">
                          {EFFECTS.find(e => e.id === currentDraft.envelopeEffect)?.icon || '✨'}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    </motion.div>
  );
}
