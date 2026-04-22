import { useState, useRef, useEffect } from 'react';
import { NoteEntry, PhotoItem, StickerItem, FilterType, FrameType } from '../Guestbook';
import { Trash2, RotateCcw, AlignLeft, AlignCenter, AlignRight, Type, Music, ExternalLink } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import interact from 'interactjs';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FONTS = [
  { name: 'Phóng khoáng', class: 'font-handwriting' },
  { name: 'Trang trọng', class: 'font-serif' },
  { name: 'Hiện đại', class: 'font-sans' },
  { name: 'Tinh nghịch', class: 'font-kalam' },
  { name: 'Bút máy', class: 'font-patrick' },
  { name: 'Dễ thương', class: 'font-caveat' },
];

interface Props {
  draft: Omit<NoteEntry, 'id' | 'timestamp'> | NoteEntry;
  setDraft?: (d: any) => void;
  isPreview: boolean;
}

export default function NoteCanvas({ draft, setDraft, isPreview }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Initialize Interact.js
  useEffect(() => {
    if (!isPreview || !containerRef.current) return;

    const draggable = interact('.draggable-item').draggable({
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: false // Immediate restriction during drag
        })
      ],
      autoScroll: true,
      listeners: {
        move(event) {
          const target = event.target;
          // Keep the dragged position in data-x/data-y attributes
          const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
          const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

          // Translate the element
          target.style.transform = `translate(${x}px, ${y}px)`;

          // Update attributes
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
        },
        end(event) {
          const target = event.target;
          const id = target.getAttribute('data-id');
          const type = target.getAttribute('data-type');
          const rect = containerRef.current!.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();

          // Calculate final Center position in %
          const finalCenterX = ((targetRect.left + targetRect.width / 2) - rect.left) / rect.width * 100;
          const finalCenterY = ((targetRect.top + targetRect.height / 2) - rect.top) / rect.height * 100;

          // Push to state
          handleDragUpdate(id, finalCenterX, finalCenterY, type as any);

          // Reset transform so React can re-render it at the new % position
          target.style.transform = '';
          target.setAttribute('data-x', 0);
          target.setAttribute('data-y', 0);
        }
      }
    });

    return () => {
      draggable.unset();
    };
  }, [isPreview, draft]); // Re-init on draft change to ensure all new elements are caught

  const handleDragUpdate = (id: string, x: number, y: number, type: 'photo' | 'sticker' | 'signature' | 'text') => {
    if (!setDraft || !isPreview) return;
    
    // Clamp coordinates within 1-99%
    const clampedX = Math.max(1, Math.min(99, x));
    const clampedY = Math.max(1, Math.min(99, y));

    const updated = { ...draft };

    if (type === 'photo') {
      updated.photos = draft.photos.map(p => p.id === id ? { ...p, x: clampedX, y: clampedY } : p);
    } else if (type === 'sticker') {
      updated.stickers = draft.stickers.map(s => s.id === id ? { ...s, x: clampedX, y: clampedY } : s);
    } else if (type === 'text') {
      updated.texts = draft.texts.map(t => t.id === id ? { ...t, x: clampedX, y: clampedY } : t);
    }

    setDraft(updated);
  };

  const handleResize = (id: string, size: number, type: 'photo' | 'sticker' | 'signature' | 'text') => {
    if (!setDraft || !isPreview) return;
    if (type === 'photo') {
      setDraft({ ...draft, photos: draft.photos.map(p => p.id === id ? { ...p, size } : p) });
    } else if (type === 'sticker') {
      setDraft({ ...draft, stickers: draft.stickers.map(s => s.id === id ? { ...s, size } : s) });
    } else if (type === 'text') {
      setDraft({ ...draft, texts: draft.texts.map(t => t.id === id ? { ...t, size } : t) });
    }
  };

  const handleRotate = (id: string) => {
    if (!setDraft || !isPreview) return;
    setDraft({ ...draft, photos: draft.photos.map(p => p.id === id ? { ...p, rotation: (p.rotation + 15) % 360 } : p) });
  };

  const removeItem = (id: string, type: 'photo' | 'sticker' | 'signature' | 'text') => {
    if (!setDraft || !isPreview) return;
    if (type === 'photo') {
      setDraft({ ...draft, photos: draft.photos.filter(p => p.id !== id) });
    } else if (type === 'sticker') {
      setDraft({ ...draft, stickers: draft.stickers.filter(s => s.id !== id) });
    } else if (type === 'text') {
      setDraft({ ...draft, texts: draft.texts.filter(t => t.id !== id) });
    }
    setSelectedId(null);
  };

  const getFilterClass = (filter: FilterType) => {
    switch (filter) {
      case 'sepia': return 'vintage-sepia';
      case 'grayscale': return 'vintage-grayscale';
      case 'warm': return 'vintage-warm';
      case 'kodak': return 'vintage-kodak';
      case 'fuji': return 'vintage-fuji';
      case 'cinematic': return 'vintage-cinematic';
      case 'grain': return 'vintage-grain';
      case 'polaroid-grain': return 'vintage-sepia vintage-grain';
      default: return '';
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "w-full rounded-sm relative shadow-inner select-none transition-all aspect-[4/5] overflow-hidden bg-white",
        isPreview ? "h-full" : "w-full mx-auto"
      )}
      style={{ backgroundColor: draft.bgColor }}
      onClick={() => setSelectedId(null)}
    >
      {/* Background Grid Pattern - Always same */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none notebook-grid" />

      {/* Signature Target Area - BOTTOM RIGHT FIXED */}
      <div 
        className="absolute z-10 flex flex-col items-center pointer-events-none"
        style={{ bottom: '8%', right: '8%' }}
      >
         {draft.signatures.length === 0 && (
            <div className="w-80 h-32 border-2 border-dashed border-vintage-pink/20 rounded-[2rem] flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
               <span className="font-handwriting text-sm text-vintage-pink/30 uppercase tracking-widest">Ký tên tại đây</span>
            </div>
         )}
         <p className="font-handwriting text-xl mt-4 text-vintage-brown font-bold italic tracking-widest bg-white/40 px-4 py-1 rounded-full border border-vintage-pink/10 shadow-sm">— {draft.name || 'Người thương'}</p>
         
         {draft.signatures.length > 0 && (
            <div className="absolute top-0 w-full h-full flex items-center justify-center -translate-y-12 pointer-events-none">
               <img 
                 src={draft.signatures[draft.signatures.length - 1].data} 
                 className="w-80 h-auto opacity-90 mix-blend-multiply scale-[1.5]" 
                 alt="signature"
               />
            </div>
         )}
      </div>

      {/* Multiple Text Blocks */}
      {draft.texts.map((textItem) => (
        <div
           key={textItem.id}
           data-id={textItem.id}
           data-type="text"
           className={cn(
              "absolute p-4 max-w-[85%] min-w-[50px] transition-shadow origin-center touch-none",
              isPreview && "draggable-item cursor-move",
              isPreview && selectedId === textItem.id && "ring-2 ring-vintage-pink/30 ring-offset-4 ring-offset-transparent rounded-lg bg-white/50 backdrop-blur-[4px] shadow-2xl z-50",
              !isPreview && "z-20 pointer-events-none"
           )}
           style={{ 
             left: `${textItem.x}%`, 
             top: `${textItem.y}%`, 
             translate: "-50% -50%",
             color: textItem.color,
             zIndex: isPreview && selectedId === textItem.id ? 50 : 20
           }}
           onClick={(e) => { e.stopPropagation(); isPreview && setSelectedId(textItem.id); }}
        >
           <div className={cn(
             "pointer-events-none leading-relaxed whitespace-pre-wrap outline-none",
             textItem.fontFamily,
             textItem.isBold && "font-bold",
             textItem.isItalic && "italic",
             textItem.align === 'left' ? 'text-left' : textItem.align === 'right' ? 'text-right' : 'text-center'
           )} style={{ fontSize: textItem.size }}>
             {textItem.text || (isPreview ? 'Bấm để soạn thảo...' : '')}
           </div>

           {isPreview && selectedId === textItem.id && (
             <div 
               className="absolute top-full left-1/2 -translate-x-1/2 mt-6 flex flex-col gap-3 bg-white/95 backdrop-blur-xl p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 z-[100] min-w-[400px]"
               onClick={(e) => e.stopPropagation()}
             >
               <textarea 
                  value={textItem.text}
                  onChange={(e) => {
                     const texts = draft.texts.map(t => t.id === textItem.id ? { ...t, text: e.target.value } : t);
                     setDraft?.({ ...draft, texts });
                  }}
                  autoFocus
                  placeholder="Nhập lời nhắn của bạn..."
                  className="w-full p-4 text-sm border-none bg-black/5 rounded-2xl focus:ring-2 ring-sang-pink outline-none resize-none h-28"
               />
               <div className="flex items-center gap-4 bg-black/5 p-3 rounded-2xl">
                  <Type size={16} className="text-vintage-brown/40" />
                  <input type="range" min="14" max="150" value={textItem.size} onChange={(e) => handleResize(textItem.id, parseInt(e.target.value), 'text')} className="flex-1 h-1.5 accent-sang-pink" />
                  <span className="text-xs font-bold text-vintage-brown/60 w-10">{textItem.size}px</span>
               </div>

               <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/5 p-2 rounded-xl flex items-center gap-2">
                    <span className="text-[10px] font-bold text-vintage-brown/40">Left (%)</span>
                    <input type="number" value={Math.round(textItem.x)} onChange={(e) => handleDragUpdate(textItem.id, parseFloat(e.target.value), textItem.y, 'text')} className="w-full bg-transparent text-xs outline-none font-mono" />
                  </div>
                  <div className="bg-black/5 p-2 rounded-xl flex items-center gap-2">
                    <span className="text-[10px] font-bold text-vintage-brown/40">Top (%)</span>
                    <input type="number" value={Math.round(textItem.y)} onChange={(e) => handleDragUpdate(textItem.id, textItem.x, parseFloat(e.target.value), 'text')} className="w-full bg-transparent text-xs outline-none font-mono" />
                  </div>
               </div>

               <div className="flex justify-between items-center gap-2">
                 <div className="flex gap-1 bg-black/5 p-1 rounded-xl">
                    <button onClick={() => setDraft?.({...draft, texts: draft.texts.map(t => t.id === textItem.id ? {...t, align: 'left'} : t)})} className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all", textItem.align === 'left' ? "bg-white text-sang-pink shadow-sm" : "text-vintage-brown/40")}><AlignLeft size={16} /></button>
                    <button onClick={() => setDraft?.({...draft, texts: draft.texts.map(t => t.id === textItem.id ? {...t, align: 'center'} : t)})} className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all", (!textItem.align || textItem.align === 'center') ? "bg-white text-sang-pink shadow-sm" : "text-vintage-brown/40")}><AlignCenter size={16} /></button>
                    <button onClick={() => setDraft?.({...draft, texts: draft.texts.map(t => t.id === textItem.id ? {...t, align: 'right'} : t)})} className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all", textItem.align === 'right' ? "bg-white text-sang-pink shadow-sm" : "text-vintage-brown/40")}><AlignRight size={16} /></button>
                 </div>
                 <div className="flex gap-1 bg-black/5 p-1 rounded-xl">
                    <button onClick={() => setDraft?.({...draft, texts: draft.texts.map(t => t.id === textItem.id ? {...t, isBold: !t.isBold} : t)})} className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all", textItem.isBold ? "bg-white text-sang-pink shadow-sm" : "text-vintage-brown/40")}>B</button>
                    <button onClick={() => setDraft?.({...draft, texts: draft.texts.map(t => t.id === textItem.id ? {...t, isItalic: !t.isItalic} : t)})} className={cn("w-8 h-8 rounded-lg flex items-center justify-center italic text-sm transition-all", textItem.isItalic ? "bg-white text-sang-pink shadow-sm" : "text-vintage-brown/40")}>I</button>
                 </div>
                 <button onClick={() => removeItem(textItem.id, 'text')} className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={18} /></button>
               </div>

               <div className="flex flex-wrap gap-1.5 pt-2 border-t border-black/5">
                  {FONTS.map(f => (
                    <button key={f.class} onClick={() => setDraft?.({...draft, texts: draft.texts.map(t => t.id === textItem.id ? {...t, fontFamily: f.class} : t)})} className={cn("px-3 py-1.5 rounded-xl text-[11px] border transition-all truncate flex-1 min-w-[100px]", textItem.fontFamily === f.class ? "bg-sang-pink text-white border-sang-pink shadow-md" : "bg-black/5 text-vintage-brown/60 border-transparent", f.class)}>
                      {f.name}
                    </button>
                  ))}
               </div>
             </div>
           )}
        </div>
      ))}

      {/* Photos */}
      {draft.photos.map((photo) => (
        <div
           key={photo.id}
           data-id={photo.id}
           data-type="photo"
           className={cn(
             "absolute select-none origin-center touch-none", 
             isPreview && "draggable-item cursor-move",
             isPreview && selectedId === photo.id ? "z-50" : "z-30",
             !isPreview && "z-30 pointer-events-none"
           )}
           style={{ 
             left: `${photo.x}%`, 
             top: `${photo.y}%`, 
             translate: "-50% -50%", 
             rotate: `${photo.rotation}deg`, 
             width: photo.size 
           }}
           onClick={(e) => { e.stopPropagation(); isPreview && setSelectedId(photo.id); }}
        >
           <div className={cn(
              "relative transition-all duration-300 transform-gpu",
              photo.frame === 'polaroid' && "bg-white p-3 pb-12 shadow-xl border border-neutral-200",
              photo.frame === 'film' && "bg-black p-4 border-l-4 border-r-4 border-dashed border-white/20 shadow-xl",
              photo.frame === 'tape' && "bg-white shadow-lg",
              photo.frame === 'ornate' && "border-8 border-vintage-pink p-1 bg-white shadow-xl ring-2 ring-vintage-pink/20",
              photo.frame === 'washi' && "bg-white border-t border-b border-dashed border-vintage-pink/40 p-2 shadow-sm",
              photo.frame === 'stamp' && "bg-white p-2 border-[6px] border-double border-vintage-brown shadow-lg",
              photo.frame === 'none' && "shadow-md"
           )}>
              {photo.frame === 'tape' && (
                 <div className="absolute -top-4 -left-4 w-12 h-6 bg-vintage-pink/40 rotate-[-45deg] z-10 backdrop-blur-sm border border-vintage-pink/20" />
              )}
              <img src={photo.src} className={cn("w-full h-auto object-cover block select-none pointer-events-none", getFilterClass(photo.filter))} referrerPolicy="no-referrer" />
              {isPreview && selectedId === photo.id && (
                 <div className="absolute -inset-4 border-2 border-dashed border-vintage-pink/50 rounded-xl pointer-events-none" />
              )}
              {isPreview && selectedId === photo.id && (
                 <div 
                   className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/95 backdrop-blur-lg px-4 py-2 rounded-full shadow-2xl border border-white/50 z-[100]"
                   onClick={(e) => e.stopPropagation()}
                 >
                    <button onClick={() => removeItem(photo.id, 'photo')} className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:scale-110"><Trash2 size={14} /></button>
                    <button onClick={() => handleRotate(photo.id)} className="p-2 bg-vintage-brown text-white rounded-full shadow-lg hover:scale-110"><RotateCcw size={14} /></button>
                    <div className="w-px h-6 bg-black/10 mx-1" />
                    <input type="range" min="100" max="600" value={photo.size} onChange={(e) => handleResize(photo.id, parseInt(e.target.value), 'photo')} className="w-24 accent-vintage-brown h-1.5" />
                    <div className="flex gap-2 text-[10px] font-mono">
                      <input type="number" value={Math.round(photo.x)} onChange={(e) => handleDragUpdate(photo.id, parseFloat(e.target.value), photo.y, 'photo')} className="w-8 bg-transparent text-center" />
                      <input type="number" value={Math.round(photo.y)} onChange={(e) => handleDragUpdate(photo.id, photo.x, parseFloat(e.target.value), 'photo')} className="w-8 bg-transparent text-center" />
                    </div>
                 </div>
              )}
           </div>
        </div>
      ))}

      {/* Stickers */}
      {draft.stickers.map((sticker) => (
        <div
           key={sticker.id}
           data-id={sticker.id}
           data-type="sticker"
           className={cn(
             "absolute select-none origin-center touch-none",
             isPreview && "draggable-item cursor-grab active:cursor-grabbing",
             isPreview && selectedId === sticker.id ? "z-50" : "z-40",
             !isPreview && "z-40 pointer-events-none"
           )}
           style={{ 
             left: `${sticker.x}%`, 
             top: `${sticker.y}%`, 
             translate: "-50% -50%", 
             fontSize: sticker.size 
           }}
           onClick={(e) => { e.stopPropagation(); isPreview && setSelectedId(sticker.id); }}
        >
           <div className="relative group">
              {sticker.src}
              {isPreview && selectedId === sticker.id && (
                 <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 backdrop-blur-lg p-2 px-3 rounded-full shadow-xl border border-white/50 z-50 text-[10px]">
                    <button onClick={() => removeItem(sticker.id, 'sticker')} className="p-1.5 bg-red-500 text-white rounded-full"><Trash2 size={12} /></button>
                    <input type="range" min="20" max="150" value={sticker.size} onChange={(e) => handleResize(sticker.id, parseInt(e.target.value), 'sticker')} className="w-16 h-1 accent-vintage-pink" />
                    <input type="number" value={Math.round(sticker.x)} onChange={(e) => handleDragUpdate(sticker.id, parseFloat(e.target.value), sticker.y, 'sticker')} className="w-6 bg-transparent" />
                    <input type="number" value={Math.round(sticker.y)} onChange={(e) => handleDragUpdate(sticker.id, sticker.x, parseFloat(e.target.value), 'sticker')} className="w-6 bg-transparent" />
                 </div>
              )}
           </div>
        </div>
      ))}

      {/* Music Badge */}
      {draft.musicUrl && (
        <div className="absolute top-6 right-6 z-50">
           <a href={draft.musicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-vintage-pink/30 shadow-sm hover:bg-white/60 transition-all group scale-90 hover:scale-100 origin-top-right">
              <div className="w-8 h-8 rounded-full bg-vintage-pink/20 flex items-center justify-center text-vintage-pink shadow-inner">
                 <Music size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-vintage-brown/60 group-hover:text-vintage-pink">Giai Điệu</span>
                <span className="text-[8px] text-vintage-brown/30 font-sans uppercase">Kỉ Niệm</span>
              </div>
              <ExternalLink size={10} className="text-vintage-brown/20 ml-1" />
           </a>
        </div>
      )}
    </div>
  );
}
