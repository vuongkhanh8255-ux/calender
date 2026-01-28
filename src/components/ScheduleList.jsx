import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Calendar } from 'lucide-react';

const ScheduleList = ({ tasks, onAdd, onDelete }) => {
  const [newItem, setNewItem] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newItem.trim() !== '') {
      // Mặc định category là 'Schedule'
      onAdd(newItem, selectedDate, 'Schedule');
      setNewItem('');
    }
  };

  // Lọc lấy đúng ngày đang chọn
  const filteredTasks = tasks ? tasks.filter(task => {
    if (!task.start_time) return false;
    return task.start_time.split('T')[0] === selectedDate;
  }) : [];

  return (
    <div className="glass-panel rounded-3xl p-6 w-full h-full max-h-full flex flex-col relative overflow-hidden group border border-white/60 shadow-xl">
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-200/50 rounded-full blur-3xl group-hover:bg-green-300/50 transition-all duration-700"></div>

      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-4 shrink-0 relative z-10">
        <h3 className="text-slate-800 font-extrabold text-sm tracking-wide uppercase flex items-center gap-2">
          <span className="bg-green-100/80 text-green-600 p-2 rounded-xl shadow-sm"><MapPin size={18} /></span>
          LỊCH TRÌNH
        </h3>

        {/* DATE PICKER (Compact) */}
        <div className="relative w-full group/date">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full pl-9 pr-3 py-3 bg-white/60 border border-white/80 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-green-200 focus:ring-4 focus:ring-green-100 transition-all shadow-sm"
          />
          <Calendar className="absolute left-3 top-3 text-green-500 pointer-events-none group-focus-within/date:text-green-600" size={16} />
        </div>
      </div>

      {/* DANH SÁCH */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2.5 custom-scrollbar pr-1 relative z-10">
        {filteredTasks.map(task => (
          <div key={task.id} className="group/item flex items-center gap-3 p-3 rounded-xl border bg-white/60 border-white/60 hover:bg-white hover:border-green-200 hover:shadow-lg transition-all">
            <div className="w-3 h-3 rounded-full bg-green-500 shrink-0 ring-2 ring-green-100"></div>
            <span className="font-semibold flex-1 text-sm text-slate-800 break-words leading-relaxed">
              {task.title}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover/item:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 text-sm font-medium text-center gap-3">
            <MapPin size={28} className="opacity-50" />
            <p>Chưa có lịch trình.</p>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="mt-2 relative group/input shrink-0 pt-3 border-t border-white/40 z-10">
        <input
          type="text"
          className="w-full bg-white/60 border border-white/80 focus:bg-white focus:border-green-300 focus:ring-4 focus:ring-green-100 rounded-xl py-3 pl-10 pr-3 text-sm text-slate-800 font-medium placeholder-slate-400 outline-none transition-all shadow-sm"
          placeholder="Đi đâu..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Plus className="absolute left-3.5 top-5 text-slate-400 group-focus-within/input:text-green-500 transition-colors" size={18} />
      </div>
    </div>
  );
};

export default ScheduleList;