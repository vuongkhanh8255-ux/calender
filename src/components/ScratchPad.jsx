import React, { useState, useEffect } from 'react';
import { PenTool } from 'lucide-react';

const ScratchPad = () => {
  const [note, setNote] = useState('');

  useEffect(() => {
    const savedNote = localStorage.getItem('my_scratchpad');
    if (savedNote) setNote(savedNote);
  }, []);

  const handleChange = (e) => {
    setNote(e.target.value);
    localStorage.setItem('my_scratchpad', e.target.value);
  };

  return (
    <div className="glass-panel p-5 h-full flex flex-col relative overflow-hidden group hover:shadow-yellow-500/10 transition-all">
      <div className="flex items-center gap-3 mb-3 relative z-10">
        <div className="bg-amber-100 p-2 rounded-xl text-amber-600 shadow-sm"><PenTool size={20} /></div>
        <h3 className="text-slate-800 font-bold text-lg">Quick Notes</h3>
      </div>

      <div className="flex-1 relative">
        <textarea
          className="w-full h-full bg-transparent resize-none outline-none text-slate-600 text-sm leading-7 placeholder:text-slate-300 font-medium custom-scrollbar"
          style={{
            backgroundImage: 'linear-gradient(transparent 96%, #f1f5f9 96%)',
            backgroundSize: '100% 1.75rem',
            lineHeight: '1.75rem'
          }}
          placeholder="Type your ideas, reminders..."
          value={note}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default ScratchPad;