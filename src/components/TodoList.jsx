import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, Calendar } from 'lucide-react';

const TodoList = ({ tasks, onToggle, onAdd, onDelete }) => {
  const [newItem, setNewItem] = useState('');
  // Mặc định chọn ngày hôm nay (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (newItem.trim() !== '') {
        // TRUYỀN THÊM selectedDate KHI THÊM
        onAdd(newItem, selectedDate);
        setNewItem('');
      }
    }
  };

  // --- LỌC CÔNG VIỆC THEO NGÀY ĐANG CHỌN ---
  const filteredTasks = tasks ? tasks.filter(task => {
    if (!task.start_time) return false;
    // Cắt chuỗi ngày trong DB (2025-12-27T...) lấy phần ngày (2025-12-27)
    const taskDate = task.start_time.split('T')[0];
    return taskDate === selectedDate;
  }) : [];

  // Sắp xếp
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === 'todo' ? -1 : 1;
  });

  const todosCount = filteredTasks.filter(t => t.status === 'todo').length;

  return (
    <div className="bg-white border-2 border-orange-100 rounded-3xl p-5 w-full h-full max-h-full flex flex-col shadow-xl shadow-orange-500/5 overflow-hidden">
      
      {/* HEADER + DATE PICKER */}
      <div className="flex justify-between items-center mb-4 shrink-0 gap-2">
        <h3 className="text-orange-600 font-black text-xl flex items-center gap-2 whitespace-nowrap">
          <span className="bg-orange-100 p-2 rounded-lg"><CheckSquare size={24} /></span>
          TO DO
        </h3>
        
        {/* --- CỤM CHỌN NGÀY --- */}
        <div className="flex items-center gap-2 flex-1 justify-end">
            <div className="relative">
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-9 pr-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-sm font-bold text-orange-700 outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer shadow-sm"
                />
                <Calendar className="absolute left-2.5 top-2 text-orange-400 pointer-events-none" size={16}/>
            </div>
            <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
            {todosCount} việc
            </span>
        </div>
      </div>

      {/* DANH SÁCH (Đã lọc theo ngày) */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-3 custom-scrollbar">
        {sortedTasks.map(task => (
          <div 
            key={task.id} 
            onClick={() => onToggle(task.id, task.status)}
            className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                task.status === 'done' 
                ? 'bg-gray-100 border-gray-100 opacity-60' 
                : 'bg-gray-50 hover:bg-orange-50 border-gray-100 hover:border-orange-200'
            }`}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${task.status === 'done' ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
               {task.status === 'done' && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
            
            <span className={`font-semibold flex-1 break-words text-sm ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700 group-hover:text-orange-700'}`}>
                {task.title}
            </span>

            {/* Nút xóa */}
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                }}
                className="p-2 text-red-400 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-all shrink-0"
                title="Xóa ngay"
            >
                <Trash2 size={18} />
            </button>
          </div>
        ))}
        
        {/* Thông báo nếu ngày này trống */}
        {filteredTasks.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-60 text-center px-4">
                <p>Ngày {new Date(selectedDate).toLocaleDateString('vi-VN')} chưa có việc gì.</p>
                <p className="text-sm mt-1">Nhập ở dưới để thêm vào lịch luôn!</p>
            </div>
        )}
      </div>

      {/* INPUT */}
      <div className="mt-4 relative group shrink-0 pt-2 bg-white z-10 border-t border-gray-100">
        <input 
          type="text" 
          className="w-full bg-gray-100 border-2 border-transparent focus:bg-white focus:border-orange-400 rounded-xl py-3 pl-11 pr-4 text-gray-700 font-medium placeholder-gray-400 outline-none transition-all shadow-inner"
          placeholder={`Thêm việc cho ngày ${selectedDate.split('-').reverse().join('/')}...`}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Plus className="absolute left-3 top-6 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20}/>
      </div>
    </div>
  );
};

export default TodoList;