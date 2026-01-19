import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, Calendar, RotateCcw } from 'lucide-react';

// Thêm prop onMoveOldTasks
const TodoList = ({ tasks, onToggle, onAdd, onDelete, onMoveOldTasks }) => {
  const [newItem, setNewItem] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // --- HÀM XỬ LÝ CHUNG CHO NÚT ENTER VÀ NÚT CLICK ---
  const handleAdd = () => {
    if (newItem.trim() !== '') {
      onAdd(newItem, selectedDate);
      setNewItem('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  // --- LỌC CÔNG VIỆC THEO NGÀY ĐANG CHỌN ---
  const filteredTasks = tasks ? tasks.filter(task => {
    if (!task.start_time) return false;
    const taskDate = task.start_time.split('T')[0];
    return taskDate === selectedDate;
  }) : [];

  // --- TÍNH NĂNG MỚI: ĐẾM VIỆC CŨ (QUÁ KHỨ) CHƯA LÀM ---
  // Tìm task có ngày < selectedDate VÀ status là 'todo'
  const overdueTasksCount = tasks ? tasks.filter(task => {
    if (!task.start_time || task.status === 'done' || task.category === 'Schedule') return false;
    const taskDate = task.start_time.split('T')[0];
    return taskDate < selectedDate; // Chỉ đếm việc cũ hơn ngày đang chọn
  }).length : 0;

  // Sắp xếp
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === 'todo' ? -1 : 1;
  });

  const todosCount = filteredTasks.filter(t => t.status === 'todo').length;

  return (
    <div className="glass-panel p-6 w-full h-full max-h-full flex flex-col relative overflow-hidden">

      {/* HEADER + DATE PICKER */}
      <div className="flex justify-between items-center mb-6 shrink-0 gap-4">
        <h3 className="text-slate-800 font-bold text-2xl flex items-center gap-3">
          <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600 shadow-sm"><CheckSquare size={24} /></div>
          Tasks
        </h3>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="relative group/date">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-400 hover:bg-white transition-all shadow-sm"
            />
            <Calendar className="absolute left-3 top-2.5 text-slate-400 group-hover/date:text-blue-500 transition-colors pointer-events-none" size={16} />
          </div>
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shrink-0 shadow-md shadow-blue-500/20">
            {todosCount} Left
          </span>
        </div>
      </div>

      {/* --- NÚT DỜI VIỆC CŨ --- */}
      {overdueTasksCount > 0 && (
        <div className="mb-4 shrink-0 relative z-20">
          <button
            onClick={() => onMoveOldTasks(selectedDate)}
            className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 px-4 py-3 rounded-xl text-sm font-bold transition-all border border-orange-200 group/alert cursor-pointer active:scale-95 shadow-sm"
          >
            <RotateCcw size={16} className="group-hover/alert:-rotate-180 transition-transform duration-500" />
            <span>{overdueTasksCount} unfinished tasks from previous days. <span className="underline">Move to this day?</span></span>
          </button>
        </div>
      )}

      {/* DANH SÁCH */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-3 custom-scrollbar">
        {sortedTasks.map(task => (
          <div
            key={task.id}
            onClick={() => onToggle(task.id, task.status)}
            className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer relative ${task.status === 'done'
              ? 'bg-gray-100 border-gray-100 opacity-60'
              : 'bg-white/80 hover:bg-orange-50 border-gray-100 hover:border-orange-200'
              }`}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${task.status === 'done' ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
              {task.status === 'done' && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>

            <span className={`font-semibold flex-1 break-words text-sm ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700 group-hover:text-orange-700'}`}>
              {task.title}
            </span>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="p-2 text-red-400 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-all shrink-0 relative z-20 hover:shadow-md cursor-pointer"
              title="Xóa ngay"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

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
          className="w-full bg-gray-100 border-2 border-transparent focus:bg-white focus:border-orange-400 rounded-xl py-3 pl-11 pr-12 text-gray-700 font-medium placeholder-gray-400 outline-none transition-all shadow-inner"
          placeholder={`Thêm việc ngày ${selectedDate.split('-').reverse().join('/')}...`}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {/* NÚT CỘNG (SỬA LỖI MOBILE): Thay vì chỉ để icon, bọc nó trong div hoặc button có onClick */}
        <button
          onClick={handleAdd}
          className="absolute left-2 top-5 p-1 text-gray-400 hover:text-orange-500 active:scale-90 transition-all cursor-pointer z-20"
        >
          <Plus size={24} className="group-focus-within:text-orange-500 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default TodoList;