import React, { useState, useEffect } from 'react';
import { SquareCheckBig, Plus, Trash2, Check, RefreshCw } from 'lucide-react';
import moment from 'moment';

const TodoList = ({ tasks, categories, onToggle, onAdd, onDelete }) => {
  const [newTask, setNewTask] = useState('');
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // Lọc task theo ngày đang chọn và sắp xếp theo trạng thái (chưa làm lên đầu)
  // Sử dụng task_date cho timeline_tasks
  const tasksForDay = tasks
    .filter(t => moment(t.task_date).isSame(selectedDate, 'day'))
    .sort((a, b) => {
      // Đưa task đã xong xuống dưới
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      return 0;
    });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    if (!selectedCategoryId) {
      alert("Vui lòng chọn đầu mục trước!");
      return;
    }

    // Tìm category để lấy màu mặc định (nếu cần)
    const category = categories.find(c => c.id === selectedCategoryId);

    // Gọi hàm thêm task từ App.jsx
    onAdd({
      title: newTask,
      category_id: selectedCategoryId,
      task_date: selectedDate,
      color: category?.color || '#ea580c',
      status: 'todo'
    });
    setNewTask('');
  };

  const isToday = moment(selectedDate).isSame(moment(), 'day');

  return (
    <div className="glass-panel rounded-3xl p-6 h-full flex flex-col relative overflow-hidden group border border-white/60 shadow-xl">
      {/* Decorative */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-200/50 rounded-full blur-3xl group-hover:bg-orange-300/50 transition-all duration-700"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-xl shadow-sm">
            <SquareCheckBig size={24} className="stroke-[2.5px]" />
          </div>
          <h3 className="text-slate-800 font-extrabold text-xl tracking-tight uppercase">TO DO LIST</h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/80 rounded-xl border border-white/60 px-4 py-2 shadow-sm backdrop-blur-sm">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-base font-bold text-slate-700 outline-none cursor-pointer"
            />
            <div className="h-5 w-[1.5px] bg-slate-300 mx-3"></div>
            <span className="text-orange-600 text-sm font-black bg-orange-100/50 px-2.5 py-1 rounded-lg">
              {tasksForDay.length}
            </span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar mb-4">
        {tasksForDay.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3 opacity-60">
            <div className="p-5 bg-slate-100 rounded-full"><SquareCheckBig size={40} /></div>
            <p className="text-base font-semibold">Chưa có nhiệm vụ nào...</p>
          </div>
        ) : (
          tasksForDay.map((task) => (
            <div
              key={task.id}
              className={`group/item flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300
                ${task.status === 'done'
                  ? 'bg-slate-50/60 border-slate-100 opacity-70'
                  : 'bg-white/70 border-white/60 hover:border-orange-300 hover:bg-white hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5'
                }`}
            >
              <button
                onClick={() => onToggle(task.id, task.status)}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0
                  ${task.status === 'done'
                    ? 'bg-green-500 border-green-500 text-white scale-110'
                    : 'border-orange-300 text-transparent hover:border-orange-500'
                  }`}
              >
                <Check size={14} strokeWidth={4} />
              </button>

              <div className="flex-1 min-w-0">
                <span className={`block font-semibold text-lg truncate transition-all ${task.status === 'done' ? 'text-slate-500 line-through decoration-2 decoration-slate-300' : 'text-slate-800'}`}>
                  {task.title}
                </span>
                {/* Hiển thị tên category nhỏ bên dưới */}
                {task.category_id && categories.find(c => c.id === task.category_id) && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
                    style={{
                      backgroundColor: `${categories.find(c => c.id === task.category_id)?.color}20`,
                      color: categories.find(c => c.id === task.category_id)?.color
                    }}>
                    {categories.find(c => c.id === task.category_id)?.title}
                  </span>
                )}
              </div>

              <button
                onClick={() => onDelete(task.id)}
                className="opacity-0 group-hover/item:opacity-100 p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Task Input Area */}
      <form onSubmit={handleAdd} className="mt-auto pt-2 relative z-10">
        <div className="flex flex-col gap-2">
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-white/80 border border-white/60 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="" disabled>Chọn đầu mục...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.title}</option>
            ))}
          </select>
          <div className="relative">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Thêm nhiệm vụ mới..."
              className="w-full pl-5 pr-14 py-4 rounded-2xl bg-white/80 border-2 border-white/60 focus:border-orange-300 focus:bg-white outline-none shadow-sm placeholder-slate-400 font-semibold text-slate-700 transition-all backdrop-blur-sm"
            />
            <button
              type="submit"
              disabled={!newTask.trim() || !selectedCategoryId}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TodoList;