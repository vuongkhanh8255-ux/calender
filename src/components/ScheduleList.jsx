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
    <div className="bg-white border-2 border-green-100 rounded-3xl p-4 w-full h-full max-h-full flex flex-col shadow-xl shadow-green-500/5 overflow-hidden">
      
      {/* HEADER NHỎ GỌN */}
      <div className="flex flex-col gap-2 mb-3 shrink-0">
        <h3 className="text-green-600 font-black text-lg flex items-center gap-2">
          <span className="bg-green-100 p-1.5 rounded-lg"><MapPin size={20} /></span>
          LỊCH TRÌNH
        </h3>
        
        {/* DATE PICKER */}
        <div className="relative w-full">
            <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-8 pr-2 py-1 bg-green-50 border border-green-200 rounded-md text-xs font-bold text-green-700 outline-none focus:ring-1 focus:ring-green-400"
            />
            <Calendar className="absolute left-2 top-1.5 text-green-500 pointer-events-none" size={14}/>
        </div>
      </div>

      {/* DANH SÁCH */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 custom-scrollbar pr-1">
        {filteredTasks.map(task => (
          <div key={task.id} className="group flex items-center gap-2 p-2 rounded-lg border bg-green-50/50 border-green-100 hover:border-green-300 transition-all">
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
            <span className="font-semibold flex-1 text-xs text-green-800 break-words">
                {task.title}
            </span>
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                className="text-red-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
            >
                <Trash2 size={14} />
            </button>
          </div>
        ))}
        
        {filteredTasks.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-60 text-xs text-center">
                <p>Chưa có lịch đi đâu.</p>
            </div>
        )}
      </div>

      {/* INPUT */}
      <div className="mt-2 relative group shrink-0 pt-2 border-t border-green-50">
        <input 
          type="text" 
          className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-green-400 rounded-lg py-2 pl-8 pr-2 text-sm text-gray-700 font-medium placeholder-gray-400 outline-none transition-all"
          placeholder="Đi đâu..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Plus className="absolute left-2.5 top-4 text-gray-400 group-focus-within:text-green-500" size={16}/>
      </div>
    </div>
  );
};

export default ScheduleList;