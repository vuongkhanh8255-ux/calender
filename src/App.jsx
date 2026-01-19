import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import TaskTable from './components/TaskTable'
import TodoList from './components/TodoList'
import ScheduleList from './components/ScheduleList'
import ScratchPad from './components/ScratchPad'
import CalendarPro from './components/CalendarPro'
import TetFallingEffect from './components/TetFallingEffect'
import { LayoutGrid, Flower, Zap, ZapOff } from 'lucide-react';
import { arrayMove } from '@dnd-kit/sortable';

function App() {
  const [tasks, setTasks] = useState([])
  const [viewMode, setViewMode] = useState('calendar')
  const [showEffect, setShowEffect] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) console.log('Lỗi tải data:', error)
    else setTasks(data || [])
  }

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'todo' ? 'done' : 'todo';
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id)
    fetchTasks();
  }

  const addTask = async (title, customDate, category = 'Personal', color = null) => {
    if (!title.trim()) return;
    try {
      let finalDate = new Date().toISOString();
      if (customDate) {
        const dateObj = new Date(customDate);
        dateObj.setHours(9, 0, 0, 0); // Giữ giờ chuẩn 9h sáng để đồng bộ
        finalDate = dateObj.toISOString();
      }
      let finalColor = color ? color : (category === 'Schedule' ? '#16a34a' : '#ea580c');
      const newTask = {
        title: title, status: 'todo', category: category,
        color: finalColor, start_time: finalDate, created_at: new Date().toISOString(), position: 0
      };
      const { error } = await supabase.from('tasks').insert([newTask]);
      if (error) alert("❌ Lỗi: " + error.message);
      else fetchTasks();
    } catch (err) {
      alert("❌ Lỗi Code: " + err.message);
    }
  }

  // --- TÍNH NĂNG MỚI: Dời việc cũ sang ngày hiện tại ---
  // --- TÍNH NĂNG MỚI: Dời việc cũ sang ngày hiện tại ---
  const moveOverdueTasks = async (targetDateString) => {
    // targetDateString dạng '2025-01-05'
    try {
      const [y, m, d] = targetDateString.split('-').map(Number);
      // Tạo ngày mới vào lúc 9h sáng Local Time để tránh lệch múi giờ
      const targetDateObj = new Date(y, m - 1, d, 9, 0, 0);
      const newISODate = targetDateObj.toISOString();

      const tasksToUpdate = tasks.filter(t => {
        if (t.category === 'Schedule' || t.status === 'done') return false;
        // So sánh ngày (chỉ lấy phần YYYY-MM-DD)
        const tDate = t.start_time ? t.start_time.split('T')[0] : '';
        return tDate < targetDateString;
      });

      if (tasksToUpdate.length === 0) {
        alert("Không tìm thấy việc cũ nào cần dời!");
        return;
      }

      if (window.confirm(`Tìm thấy ${tasksToUpdate.length} việc cũ chưa làm. Dời hết sang ngày ${d}/${m}/${y} nhé?`)) {
        // Optimistic Update (Cập nhật giao diện ngay)
        const updatedIds = tasksToUpdate.map(t => t.id);
        const updatedTasks = tasks.map(t =>
          updatedIds.includes(t.id) ? { ...t, start_time: newISODate } : t
        );
        setTasks(updatedTasks);

        // Cập nhật Supabase
        // Dùng Promise.all để chạy song song cho nhanh
        await Promise.all(tasksToUpdate.map(task =>
          supabase.from('tasks').update({ start_time: newISODate }).eq('id', task.id)
        ));

        // Fetch lại để đồng bộ
        fetchTasks();
      }
    } catch (e) {
      console.error("Move Error:", e);
      alert("Có lỗi khi dời việc: " + e.message);
    }
  }
  // ----------------------------------------------------

  const updateTask = async (id, title, color) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, title, color } : t));
    const { error } = await supabase.from('tasks').update({ title, color }).eq('id', id);
    if (error) alert("Lỗi update: " + error.message);
    else fetchTasks();
  }

  const deleteTask = async (id) => {
    if (window.confirm('🗑️ Xóa nhé?')) {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (!error) fetchTasks();
    }
  }

  const handleTaskReorder = async (activeId, overId, dayEvents) => {
    const oldIndex = dayEvents.findIndex(t => t.id === activeId);
    const newIndex = dayEvents.findIndex(t => t.id === overId);
    const newOrder = arrayMove(dayEvents, oldIndex, newIndex);
    const updates = newOrder.map((task, index) => ({ id: task.id, position: index }));
    const newTasks = tasks.map(t => {
      const update = updates.find(u => u.id === t.id);
      return update ? { ...t, position: update.position } : t;
    });
    setTasks(newTasks);
    for (const item of updates) {
      await supabase.from('tasks').update({ position: item.position }).eq('id', item.id);
    }
  };

  useEffect(() => { fetchTasks() }, [])

  const todoTasks = tasks.filter(t => t.category !== 'Schedule');
  const scheduleTasks = tasks.filter(t => t.category === 'Schedule');

  // ... imports

  return (
    <div className="min-h-screen p-3 md:p-8 font-sans text-slate-700 relative pb-20">

      {/* HEADER */}
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row items-center justify-between relative z-10 gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 md:p-2.5 rounded-xl shadow-lg shadow-orange-500/20">
            <Flower className="text-white animate-spin-slow" size={20} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600 drop-shadow-sm">
              MY WORKSPACE
            </h1>
            <p className="text-xs md:text-sm font-bold text-orange-800/60 tracking-wider">TET EDITION 2026</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
          <div className="glass-panel px-5 py-2.5 flex items-center gap-4 border-2 border-white/50">
            <div className="text-right">
              <p className="text-xs text-orange-500/80 font-bold uppercase tracking-widest">Today</p>
              <p className="text-lg font-black text-slate-800">{new Date().toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="h-10 w-px bg-orange-200/50"></div>
            <button onClick={() => setShowEffect(!showEffect)} className={`p-2.5 rounded-xl transition-all shadow-sm ${showEffect ? 'bg-gradient-to-br from-yellow-100 to-orange-100 text-orange-600 ring-2 ring-orange-200' : 'bg-slate-100/50 text-slate-400 hover:bg-white'}`}>
              {showEffect ? <Zap size={20} fill="currentColor" /> : <ZapOff size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* COMPONENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 relative z-10 mb-8">

        {/* ROW 1: TODO (5) - SCHEDULE (3) - NOTES (4) */}

        {/* COLUMN 1: TODO */}
        <div className="lg:col-span-5 h-[450px] md:h-[500px] min-h-[450px]">
          <TodoList
            tasks={todoTasks}
            onToggle={toggleStatus}
            onAdd={addTask}
            onDelete={deleteTask}
            onMoveOldTasks={moveOverdueTasks}
          />
        </div>

        <div className="lg:col-span-3 h-[400px] md:h-[500px] min-h-[400px]">
          <ScheduleList tasks={scheduleTasks} onAdd={addTask} onDelete={deleteTask} />
        </div>

        <div className="lg:col-span-4 h-[300px] md:h-[500px] min-h-[300px]">
          <ScratchPad />
        </div>
      </div>

      {/* LOWER ROW: CALENDAR */}
      <div className="glass-panel p-1 z-10 relative">
        <div className="px-4 md:px-6 py-4 border-b border-slate-100/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <LayoutGrid size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Workspace Overview</h2>
          </div>

          <div className="flex bg-slate-100/50 p-1.5 rounded-xl">
            <button onClick={() => setViewMode('calendar')} className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Calendar</button>
            <button onClick={() => setViewMode('table')} className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Table View</button>
          </div>
        </div>

        <div className="p-4 bg-white/40 rounded-b-2xl min-h-[600px]">
          {viewMode === 'calendar'
            ? <CalendarPro
              tasks={tasks}
              onAdd={addTask}
              onUpdate={updateTask}
              onDelete={deleteTask}
              onReorder={handleTaskReorder}
            />
            : <TaskTable tasks={tasks} />
          }
        </div>
      </div>
    </div>
  )
}
export default App