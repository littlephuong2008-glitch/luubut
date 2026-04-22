import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eraser, Check, X, Brush } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: string) => void;
}

export default function SignaturePad({ isOpen, onClose, onSave }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [inkColor, setInkColor] = useState('#5d4037');
  const [brushSize, setBrushSize] = useState(2);

  const colors = ['#5d4037', '#2c3e50', '#8e44ad', '#c0392b', '#27ae60', '#2980b9', '#d35400', '#7f8c8d'];

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = brushSize;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL());
    clear();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
               <h3 className="text-xl font-serif text-vintage-brown italic">Sign your note</h3>
               <button onClick={onClose} className="text-neutral-400 hover:text-red-500 transition-colors"><X size={24} /></button>
            </div>

            <div className="p-8 bg-neutral-50 flex-1 relative">
               <div className="bg-white rounded-xl shadow-inner border border-neutral-200 relative overflow-hidden h-[300px]">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={300}
                    className="w-full h-full cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  <div className="absolute bottom-10 left-0 w-full h-[1px] bg-blue-100 pointer-events-none" />
               </div>

               <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-2">
                    {colors.map(c => (
                      <button 
                        key={c}
                        onClick={() => setInkColor(c)}
                        className={`w-6 h-6 rounded-full border-2 ${inkColor === c ? 'border-vintage-pink scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 mr-4">
                        <Brush size={16} className="text-neutral-400" />
                        <input 
                          type="range" min="1" max="10" 
                          value={brushSize} 
                          onChange={(e) => setBrushSize(parseInt(e.target.value))}
                          className="w-20 accent-vintage-brown"
                        />
                     </div>
                     <button onClick={clear} className="p-2 text-neutral-400 hover:text-red-500 transition-colors">
                        <Eraser size={20} />
                     </button>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-white border-t border-neutral-100 flex gap-4">
               <button 
                 onClick={onClose}
                 className="flex-1 py-3 text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-600"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSave}
                 className="flex-1 py-3 bg-vintage-brown text-cream text-sm font-bold uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-2"
               >
                 <Check size={18} /> Add to Note
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
