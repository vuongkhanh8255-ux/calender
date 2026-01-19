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
    <div className="glass-panel p-5 w-full h-full max-h-full flex flex-col relative overflow-hidden group">

      {/* HEADER */}
      <div className="flex flex-col gap-2 mb-4 shrink-0">
        <h3 className="text-slate-700 font-bold text-lg flex items-center gap-2">
          <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600"><MapPin size={18} /></div>
          SCHEDULE
        </h3>

        {/* DATE PICKER */}
        <div className="relative w-full">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-400/50 hover:bg-white transition-all"
          />
          <Calendar className="absolute left-2.5 top-1.5 text-slate-400 pointer-events-none" size={14} />
        </div>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 custom-scrollbar pr-1">
        {filteredTasks.map(task => (
          <div key={task.id} className="group/item flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-emerald-100 hover:bg-emerald-50/30 transition-all">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-sm shadow-emerald-200"></div>
            <span className="font-semibold flex-1 text-sm text-slate-700 break-words leading-tight">
              {task.title}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover/item:opacity-100 p-1 hover:bg-red-50 rounded-md"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400/60 text-xs text-center">
            <p>No schedule for this day</p>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="mt-3 relative shrink-0 pt-3 border-t border-slate-100">
        <input
          type="text"
          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-400 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-700 font-medium placeholder:text-slate-400 outline-none transition-all shadow-sm"
          placeholder="New event..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Plus className="absolute left-3 top-[1.15rem] text-slate-400" size={16} />
      </div>
    </div>
  );
};

export default ScheduleList;