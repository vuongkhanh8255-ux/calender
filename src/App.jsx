import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import TaskTable from './components/TaskTable'
import TodoList from './components/TodoList'
import ScheduleList from './components/ScheduleList' 
import ScratchPad from './components/ScratchPad'
import CalendarPro from './components/CalendarPro'
// Import hiệu ứng Tết mới tạo
import TetFallingEffect from './components/TetFallingEffect' 
import { LayoutGrid, Flower } from 'lucide-react'; 

function App() {
  const [tasks, setTasks] = useState([])
  const [viewMode, setViewMode] = useState('calendar')

  // --- 1. LẤY DỮ LIỆU ---
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.log('Lỗi tải data:', error)
    else setTasks(data || [])
  }

  // --- 2. UPDATE TRẠNG THÁI ---
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'todo' ? 'done' : 'todo';
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', id)
    if (error) fetchTasks();
  }

  // --- 3. THÊM TASK (Xử lý cả Todo và Schedule) ---
  const addTask = async (title, customDate, category = 'Personal') => {
    if (!title.trim()) return;
    try {
      let finalDate = new Date().toISOString();
      // Nếu có chọn ngày thì lấy ngày đó, set giờ mặc định là 9h sáng
      if (customDate) {
        const dateObj = new Date(customDate);
        dateObj.setHours(9, 0, 0, 0); 
        finalDate = dateObj.toISOString();
      }

      const newTask = { 
        title: title, 
        status: 'todo', 
        category: category, // 'Personal' hoặc 'Schedule'
        start_time: finalDate,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('tasks').insert([newTask]);
      if (error) alert("❌ Lỗi: " + error.message);
      else fetchTasks();
    } catch (err) {
      alert("❌ Lỗi Code: " + err.message);
    }
  }

  // --- 4. XÓA TASK ---
  const deleteTask = async (id) => {
    if (window.confirm('🗑️ Xóa nhé?')) {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (!error) fetchTasks(); 
    }
  }

  useEffect(() => { fetchTasks() }, [])

  // Tách data cho 2 bảng riêng biệt
  const todoTasks = tasks.filter(t => t.category !== 'Schedule');
  const scheduleTasks = tasks.filter(t => t.category === 'Schedule');

  return (
    // Thêm relative để làm điểm tựa cho hiệu ứng rơi
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-300 to-yellow-200 p-4 font-sans text-slate-800 pb-20 relative overflow-x-hidden">
      
      {/* HIỆU ỨNG TẾT (Nằm dưới cùng) */}
      <TetFallingEffect />

      {/* HEADER (Thêm z-10 để nổi lên trên hiệu ứng) */}
      <div className="mb-4 flex items-center justify-between relative z-10">
        <h1 className="text-2xl font-extrabold text-white drop-shadow-md flex items-center gap-2">
          <Flower className="text-yellow-300 animate-spin-slow" size={28} />
          MY WORKSPACE <span className="text-yellow-200">TẾT 2026</span>
        </h1>
        <div className="text-xs font-bold text-orange-600 bg-yellow-100 px-3 py-1.5 rounded-full shadow border border-orange-200">
          🧧 Today: {new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>

      {/* --- KHUNG TRÊN: CHIA 3 CỘT (TỶ LỆ 2 - 1 - 2) --- */}
      <div className="grid grid-cols-5 gap-4 mb-4 h-[450px] relative z-10">
        
        {/* CỘT 1: Todo List (2 phần) */}
        <div className="col-span-2 h-full min-h-0 drop-shadow-xl">
          <TodoList tasks={todoTasks} onToggle={toggleStatus} onAdd={addTask} onDelete={deleteTask} />
        </div>
        
        {/* CỘT 2: Lịch Trình (1 phần - Xanh lá) */}
        <div className="col-span-1 h-full min-h-0 drop-shadow-xl">
          <ScheduleList tasks={scheduleTasks} onAdd={addTask} onDelete={deleteTask} />
        </div>

        {/* CỘT 3: Ghi chú (2 phần) */}
        <div className="col-span-2 h-full min-h-0 drop-shadow-xl">
          <ScratchPad />
        </div>
      </div>

      {/* --- KHUNG DƯỚI: KHÔNG GIỚI HẠN CHIỀU CAO (Cho phép lịch dài ra) --- */}
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl border-2 border-white/50 flex flex-col min-h-[600px] relative z-10">
        
        {/* Toolbar Header (Cố định) */}
        <div className="px-4 py-3 border-b border-orange-100 flex justify-between items-center bg-orange-50 shrink-0">
          <h2 className="font-bold text-orange-800 flex items-center gap-2">
            <LayoutGrid size={18} className="text-orange-600"/>
            Khu vực làm việc
          </h2>
          <div className="flex bg-orange-200/50 p-1 rounded-lg">
            <button 
                onClick={() => setViewMode('calendar')} 
                className={`px-3 py-1 text-xs font-bold rounded transition-all ${viewMode === 'calendar' ? 'bg-white text-orange-600 shadow' : 'text-orange-700/60 hover:bg-orange-100'}`}
            >
                Lịch
            </button>
            <button 
                onClick={() => setViewMode('table')} 
                className={`px-3 py-1 text-xs font-bold rounded transition-all ${viewMode === 'table' ? 'bg-white text-orange-600 shadow' : 'text-orange-700/60 hover:bg-orange-100'}`}
            >
                Bảng
            </button>
          </div>
        </div>

        {/* Nội dung chính */}
        {/* Lưu ý: CalendarPro đã set height 1200px nên div này sẽ tự dài ra */}
        <div className="p-3 bg-slate-900">
            {viewMode === 'calendar' ? <CalendarPro tasks={tasks} /> : <TaskTable tasks={tasks} />}
        </div>
      </div>
    </div>
  )
}

export default App