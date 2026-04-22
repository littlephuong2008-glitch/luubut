import { 
  Palette, 
  Sparkles, 
  PenTool, 
  Camera,
  Layers,
  Plus
} from 'lucide-react';
import { FilterType, FrameType, NoteEntry, PhotoItem, StickerItem } from '../Guestbook';
import { motion, AnimatePresence } from 'motion/react';
import { useRef, ChangeEvent } from 'react';

const BG_COLORS = ['#fdfaf7', '#fdf2f2', '#f9f5f6', '#f3f0f1', '#fdf8f4', '#f1f4f9', '#ffffff'];
const TEXT_COLORS = ['#4a3735', '#7d5a5a', '#5a6d5a', '#5a5a7d', '#7d6d5a', '#333333'];

const STICKER_CATEGORIES = [
  { name: 'love', icons: ['🩵', '🩷', '❤️', '💖', '💌', '🎀', '💋', '🧸', '💗', '💓', '💝', '💕', '💟', '❣', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '🏩', '💒', '😻', '💍', '🌹', '🍫'] },
  { name: 'nature', icons: ['🌸', '🌼', '🌹', '🦋', '🍄', '🌈', '🌱', '🍃', '🌵', '🌻', '🌷', '🌿', '🍀'] },
  { name: 'sky', icons: ['⭐', '🌙', '☀️', '☁️', '❄️', '✨', '☄️', '🌚', '🌞', '🌈'] },
  { name: 'mood', icons: ['🥹', '✨', '🔥', '💫', '🪄', '🧿', '🥳', '🥰', '🤩', '🧸', '🎈', '🎉'] },
];

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'None', value: 'none' },
  { label: 'Sepia', value: 'sepia' },
  { label: 'B&W', value: 'grayscale' },
  { label: 'Warm', value: 'warm' },
  { label: 'Grain', value: 'grain' },
  { label: 'Retro', value: 'polaroid-grain' },
  { label: 'Kodak', value: 'kodak' },
  { label: 'Fuji', value: 'fuji' },
  { label: 'Cinema', value: 'cinematic' }
];

const FRAMES: { label: string; value: FrameType }[] = [
  { label: 'None', value: 'none' },
  { label: 'Polaroid', value: 'polaroid' },
  { label: 'Film', value: 'film' },
  { label: 'Tape', value: 'tape' },
  { label: 'Ornate', value: 'ornate' },
  { label: 'Washi', value: 'washi' },
  { label: 'Stamp', value: 'stamp' },
  { label: 'Canvas', value: 'canvas' },
  { label: 'Glitch', value: 'glitch' },
  { label: 'Gold', value: 'gold-leaf' }
];

interface Props {
  draft: Omit<NoteEntry, 'id' | 'timestamp'>;
  setDraft: (d: any) => void;
  onOpenSignature: () => void;
}

export default function DecorToolbar({ draft, setDraft, onOpenSignature }: Props) {
  const photoInputRef = useRef<HTMLInputElement>(null);

  const addSticker = (emoji: string) => {
    const newSticker: StickerItem = {
      id: Date.now().toString() + Math.random(),
      src: emoji,
      x: Math.random() * 60 + 20, // Percentage based
      y: Math.random() * 60 + 20, // Percentage based
      size: 40
    };
    setDraft({ ...draft, stickers: [...draft.stickers, newSticker] });
  };

  const addTextBox = () => {
    const newText = {
      id: Date.now().toString(),
      text: '',
      x: 50,
      y: 50,
      size: 24,
      fontFamily: 'font-handwriting',
      color: draft.textColor,
      align: 'center',
      isBold: false,
      isItalic: false
    };
    setDraft({ ...draft, texts: [...draft.texts, newText] });
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        const newPhoto: PhotoItem = {
          id: Date.now().toString(),
          src,
          x: 40,
          y: 40,
          size: 200,
          rotation: (Math.random() - 0.5) * 15,
          filter: 'none',
          frame: 'none'
        };
        setDraft({ ...draft, photos: [...draft.photos, newPhoto] });
      };
      reader.readAsDataURL(file);
    }
  };

  const addTimeSticker = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newSticker: StickerItem = {
      id: Date.now().toString(),
      src: `🕒 ${timeStr}`,
      x: 70,
      y: 10,
      size: 80
    };
    setDraft({ ...draft, stickers: [...draft.stickers, newSticker] });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden flex flex-col divide-y divide-neutral-100">
      {/* Colors Section */}
      <div className="p-5 space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
          <Palette size={14} /> Màu Giấy & Mực
        </label>
        <div className="flex gap-2">
          {BG_COLORS.map(c => (
            <button 
              key={c}
              onClick={() => setDraft({ ...draft, bgColor: c })}
              className={`w-7 h-7 rounded-full border-2 ${draft.bgColor === c ? 'border-vintage-pink' : 'border-neutral-100'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          {TEXT_COLORS.map(c => (
            <button 
              key={c}
              onClick={() => setDraft({ ...draft, textColor: c })}
              className={`w-7 h-7 rounded-sm border-2 ${draft.textColor === c ? 'border-vintage-pink' : 'border-neutral-100'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Stickers Section */}
      <div className="p-5 space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
          <Sparkles size={14} /> Hình Dán
        </label>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto no-scrollbar">
          {STICKER_CATEGORIES.flatMap(cat => cat.icons).map((emoji, i) => (
            <button 
              key={i}
              onClick={() => addSticker(emoji)}
              className="text-2xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
          <button 
            onClick={addTimeSticker}
            className="px-2 py-1 bg-neutral-100 rounded text-[10px] uppercase font-bold text-neutral-400 hover:bg-soft-pink transition-colors"
          >
            + Giờ
          </button>
        </div>
      </div>

      {/* Editing Toolbar */}
      <div className="p-5 grid grid-cols-3 gap-3">
        <button 
          onClick={addTextBox}
          className="p-3 bg-neutral-50 rounded-xl flex flex-col items-center gap-1 hover:bg-soft-pink transition-colors border border-transparent hover:border-vintage-pink/30"
        >
          <Plus size={20} className="text-vintage-brown/60" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Thêm Chữ</span>
        </button>
        <div>
          <input 
            type="file" 
            ref={photoInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handlePhotoUpload} 
          />
          <button 
            onClick={() => photoInputRef.current?.click()}
            className="w-full p-3 bg-neutral-50 rounded-xl flex flex-col items-center gap-1 hover:bg-soft-pink transition-colors border border-transparent hover:border-vintage-pink/30"
          >
            <Camera size={20} className="text-vintage-brown/60" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Tải Ảnh</span>
          </button>
        </div>
        <button 
          onClick={onOpenSignature}
          className="p-3 bg-neutral-50 rounded-xl flex flex-col items-center gap-1 hover:bg-soft-pink transition-colors border border-transparent hover:border-vintage-pink/30"
        >
          <PenTool size={20} className="text-vintage-brown/60" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Chữ Ký</span>
        </button>
      </div>

      {/* Photo Frame & Filter Section (Only shows if photos exist) */}
      <AnimatePresence>
        {draft.photos.length > 0 && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="p-5 space-y-4 overflow-hidden border-t border-vintage-pink/20 bg-soft-pink/10"
          >
            <label className="text-[10px] font-bold uppercase tracking-widest text-vintage-pink flex items-center gap-2">
              <Layers size={14} /> Chỉnh Sửa Ảnh
            </label>
            
            <div className="space-y-3">
              <span className="text-[9px] uppercase font-bold opacity-40">Bộ lọc</span>
              <div className="flex flex-wrap gap-1.5">
                 {FILTERS.map(f => (
                   <button 
                     key={f.value}
                     onClick={() => {
                        const updated = [...draft.photos];
                        updated[updated.length - 1].filter = f.value;
                        setDraft({...draft, photos: updated});
                     }}
                     className="px-2 py-1 bg-white border border-neutral-100 rounded-md text-[9px] uppercase font-bold text-neutral-500 hover:border-vintage-pink active:bg-vintage-pink active:text-white"
                   >
                     {f.label}
                   </button>
                 ))}
              </div>

              <span className="text-[9px] uppercase font-bold opacity-40">Khung ảnh</span>
              <div className="flex flex-wrap gap-1.5">
                 {FRAMES.map(fr => (
                   <button 
                     key={fr.value}
                     onClick={() => {
                        const updated = [...draft.photos];
                        updated[updated.length - 1].frame = fr.value;
                        setDraft({...draft, photos: updated});
                     }}
                     className="px-2 py-1 bg-white border border-neutral-100 rounded-md text-[9px] uppercase font-bold text-neutral-500 hover:border-vintage-pink active:bg-vintage-pink active:text-white"
                   >
                     {fr.label}
                   </button>
                 ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
