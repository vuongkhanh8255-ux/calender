import React, { useState, useEffect } from 'react';
import { PenTool } from 'lucide-react';

const ScratchPad = ({ currentUser }) => { // <--- Nhận thêm biến currentUser từ App
  const [note, setNote] = useState('');

  // Mỗi khi đổi người (currentUser thay đổi), tải lại ghi chú của người đó
  useEffect(() => {
    // Tạo key riêng biệt: scratchpad_Phúc Lợi hoặc scratchpad_Kim Ngọc
    const storageKey = `scratchpad_${currentUser}`;
    const savedNote = localStorage.getItem(storageKey);
    setNote(savedNote || ''); // Nếu chưa có thì để trống
  }, [currentUser]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setNote(newValue);
    // Lưu ngay vào key của người hiện tại
    localStorage.setItem(`scratchpad_${currentUser}`, newValue);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 h-full flex flex-col relative overflow-hidden group border border-white/60 shadow-xl">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-200/40 rounded-full blur-3xl group-hover:bg-yellow-300/40 transition-all duration-700"></div>

      <div className="flex items-center gap-3 mb-4 relative z-10 transition-all">
        <div className="bg-yellow-100/80 text-yellow-700 p-2.5 rounded-xl shadow-sm">
          <PenTool size={22} />
        </div>
        <h3 className="text-slate-800 font-extrabold text-xs tracking-wide uppercase">
          GHI CHÚ: {currentUser.toUpperCase()}
        </h3>
      </div>

      <textarea
        className="flex-1 w-full bg-transparent resize-none outline-none text-slate-800 text-base leading-8 placeholder-slate-400 font-medium relative z-10 custom-scrollbar"
        style={{
          backgroundImage: 'linear-gradient(transparent 95%, rgba(0,0,0,0.05) 95%)',
          backgroundSize: '100% 2rem',
          lineHeight: '2rem'
        }}
        placeholder={`Nháp nhanh cho ${currentUser}...`}
        value={note}
        onChange={handleChange}
      />
    </div>
  );
};

export default ScratchPad;