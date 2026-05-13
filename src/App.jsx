import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import TaskTable from './components/TaskTable'
import TodoList from './components/TodoList'
import ScheduleList from './components/ScheduleList'
import ScratchPad from './components/ScratchPad'
import CalendarPro from './components/CalendarPro'
import TetFallingEffect from './components/TetFallingEffect'
import TimelineBoard from './components/TimelineBoard'
import { LayoutGrid, Flower, Zap, ZapOff, Heart, User, Lock } from 'lucide-react';
import { arrayMove } from '@dnd-kit/sortable';

function App() {
  const [tasks, setTasks] = useState([])
  const [viewMode, setViewMode] = useState('calendar')
  const [showEffect, setShowEffect] = useState(true)
  const [currentUser, setCurrentUser] = useState('Quốc Khánh') // Mặc định Quốc Khánh

  // Timeline Board state
  const [categories, setCategories] = useState([])
  const [timelineTasks, setTimelineTasks] = useState([])

  // --- LẤY DỮ LIỆU ---
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('staff_tasks')
      .select('*')
      .eq('owner', currentUser)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) console.log('Lỗi tải data:', error)
    else setTasks(data || [])
  }

  useEffect(() => { fetchTasks() }, [currentUser])

  // --- LẤY DỮ LIỆU TIMELINE BOARD ---
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('project_categories')
      .select('*')
      .eq('owner', currentUser)
      .order('position', { ascending: true })

    if (error) console.log('Lỗi tải categories:', error)
    else setCategories(data || [])
  }

  const fetchTimelineTasks = async () => {
    const { data, error } = await supabase
      .from('timeline_tasks')
      .select('*')
      .eq('owner', currentUser)
      .order('created_at', { ascending: false })

    if (error) console.log('Lỗi tải timeline tasks:', error)
    else setTimelineTasks(data || [])
  }

  useEffect(() => {
    fetchCategories()
    fetchTimelineTasks()
  }, [currentUser])

  // --- TÍNH NĂNG MỚI: DỜI VIỆC CŨ SANG HÔM NAY ---
  const moveOverdueTasks = async () => {
    // 1. Xác định mốc thời gian "Đầu ngày hôm nay" (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Lọc ra những việc: Của mình + Chưa xong + Ngày < Hôm nay + Không phải Lịch trình
    const overdueTasks = tasks.filter(t => {
      const taskDate = new Date(t.start_time);
      return t.owner === currentUser &&
        t.status === 'todo' &&
        t.category !== 'Schedule' &&
        taskDate < today;
    });

    if (overdueTasks.length === 0) {
      alert("🎉 Xuất sắc! Không có việc tồn đọng nào.");
      return;
    }

    if (!confirm(`Phát hiện ${overdueTasks.length} việc chưa xong từ quá khứ. Dời sang hôm nay nha?`)) return;

    // 3. Chuẩn bị thời gian mới (9h sáng hôm nay)
    const newTime = new Date();
    newTime.setHours(9, 0, 0, 0);
    const newTimeStr = newTime.toISOString();

    // 4. Update lên Database
    // Vì Supabase v1/v2 update nhiều dòng hơi cực, ta dùng vòng lặp cho chắc ăn (với số lượng ít)
    let errorCount = 0;
    for (const task of overdueTasks) {
      const { error } = await supabase
        .from('staff_tasks')
        .update({ start_time: newTimeStr })
        .eq('id', task.id);
      if (error) errorCount++;
    }

    if (errorCount === 0) {
      alert("✅ Đã dời toàn bộ việc sang hôm nay!");
      fetchTasks(); // Tải lại dữ liệu mới
    } else {
      alert("⚠️ Có lỗi khi dời việc, vui lòng thử lại.");
    }
  }
  // ------------------------------------------------

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'todo' ? 'done' : 'todo';
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    await supabase.from('staff_tasks').update({ status: newStatus }).eq('id', id)
    fetchTasks();
  }

  const addTask = async (title, customDate, category = 'Personal', color = null) => {
    if (!title.trim()) return;
    try {
      let finalDate = new Date().toISOString();
      if (customDate) {
        const dateObj = new Date(customDate);
        dateObj.setHours(9, 0, 0, 0);
        finalDate = dateObj.toISOString();
      }
      let finalColor = color ? color : (category === 'Schedule' ? '#16a34a' : '#ea580c');

      const newTask = {
        title: title, status: 'todo', category: category,
        owner: currentUser,
        color: finalColor, start_time: finalDate,
        created_at: new Date().toISOString(), position: 0
      };

      const { error } = await supabase.from('staff_tasks').insert([newTask]);
      if (error) alert("❌ Lỗi: " + error.message);
      else fetchTasks();
    } catch (err) { alert("❌ Lỗi Code: " + err.message); }
  }

  const updateTask = async (id, title, color) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, title, color } : t));
    const { error } = await supabase.from('staff_tasks').update({ title, color }).eq('id', id);
    if (error) alert("Lỗi: " + error.message); else fetchTasks();
  }

  const deleteTask = async (id) => {
    if (window.confirm('🗑️ Xóa nhé?')) {
      const { error } = await supabase.from('staff_tasks').delete().eq('id', id);
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
      await supabase.from('staff_tasks').update({ position: item.position }).eq('id', item.id);
    }
  };

  // --- TIMELINE BOARD CRUD ---
  const addCategory = async (data) => {
    const { id, ...categoryData } = data; // Loại bỏ id
    const newCategory = {
      ...categoryData,
      owner: currentUser,
      position: categories.length,
      created_at: new Date().toISOString()
    };
    const { error } = await supabase.from('project_categories').insert([newCategory]);
    if (error) alert("❌ Lỗi: " + error.message);
    else fetchCategories();
  }

  const updateCategory = async (id, data) => {
    const { error } = await supabase.from('project_categories').update(data).eq('id', id);
    if (error) alert("❌ Lỗi: " + error.message);
    else fetchCategories();
  }

  const deleteCategory = async (id) => {
    const { error } = await supabase.from('project_categories').delete().eq('id', id);
    if (!error) {
      fetchCategories();
      fetchTimelineTasks(); // Refresh tasks vì có cascade delete
    }
  }

  const handleCategoryReorder = async (activeId, overId) => {
    const oldIndex = categories.findIndex(c => c.id === activeId);
    const newIndex = categories.findIndex(c => c.id === overId);

    if (oldIndex !== newIndex) {
      const newCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCategories);

      // Update positions in DB
      const updates = newCategories.map((cat, index) => ({ id: cat.id, position: index }));
      for (const update of updates) {
        await supabase.from('project_categories').update({ position: update.position }).eq('id', update.id);
      }
    }
  };

  const addTimelineTask = async (data) => {
    const { id, ...taskData } = data; // Loại bỏ id
    const newTask = {
      ...taskData,
      owner: currentUser,
      status: taskData.status || 'todo',
      position: taskData.position || 0,
      created_at: new Date().toISOString()
    };
    const { error } = await supabase.from('timeline_tasks').insert([newTask]);
    if (error) {
      console.error(error);
      if (error.message.includes('status') || error.message.includes('schema')) {
        alert("⚠️ Lỗi: Database chưa có cột 'status'. Anh vui lòng chạy lệnh SQL em gửi để cập nhật nhé!");
      } else {
        alert("❌ Lỗi: " + error.message);
      }
    }
    else fetchTimelineTasks();
  }

  const updateTimelineTask = async (id, data) => {
    const { error } = await supabase.from('timeline_tasks').update(data).eq('id', id);
    if (error) {
      console.error(error);
      if (error.message.includes('status') || error.message.includes('position') || error.message.includes('schema')) {
        alert("⚠️ Lỗi: Database chưa có cột 'status' hoặc 'position'. Anh vui lòng chạy lệnh SQL em gửi để cập nhật nhé!");
      } else {
        alert("❌ Lỗi: " + error.message);
      }
    }
    else fetchTimelineTasks();
  }

  const deleteTimelineTask = async (id) => {
    const { error } = await supabase.from('timeline_tasks').delete().eq('id', id);
    if (!error) fetchTimelineTasks();
  }

  const todoTasks = tasks.filter(t => t.category !== 'Schedule');
  const scheduleTasks = tasks.filter(t => t.category === 'Schedule');

  return (
    <div className="min-h-screen bg-[#f5f1ea] transition-colors font-sans text-slate-800 pb-20 relative overflow-x-hidden selection:bg-orange-200 selection:text-orange-900 text-base md:text-lg">
      {/* Decorative Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        {/* Orange/Yellow/Red Blobs */}
        <div className="absolute top-[-15%] left-[-10%] w-[44%] h-[44%] bg-white rounded-full blur-[140px]"></div>
        <div className="absolute top-[20%] right-[-12%] w-[42%] h-[42%] bg-orange-100 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-18%] left-[18%] w-[48%] h-[48%] bg-stone-200 rounded-full blur-[150px]"></div>
      </div>

      {/* {showEffect && <TetFallingEffect />} */}

      <div className="max-w-[1880px] mx-auto p-3 md:p-5 relative">
        {/* HEADER */}
        <header className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/85 backdrop-blur-xl rounded-2xl shadow-sm border border-orange-100">
              <Flower className="text-orange-600 animate-spin-slow" size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-orange-600 tracking-tight flex items-center gap-2">
                QUỐC KHÁNH <Heart className="text-red-500 fill-red-500 animate-pulse" size={24} />
              </h1>
              <p className="text-slate-500 text-sm font-bold">Chúc mừng năm mới - Vạn sự như ý!</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/75 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/70 shadow-sm">

            <div className="text-sm font-bold text-orange-700 bg-orange-50 px-4 py-2 rounded-xl shadow-sm whitespace-nowrap">
              🧧 {new Date().toLocaleDateString('vi-VN')}
            </div>

            <button onClick={() => setShowEffect(!showEffect)} className="p-2.5 bg-white/80 hover:bg-white text-orange-600 rounded-xl transition-all shadow-sm">
              {showEffect ? <Zap size={18} className="text-amber-500 fill-amber-500" /> : <ZapOff size={18} />}
            </button>
          </div>
        </header>

        {/* TIMELINE BOARD */}
        <TimelineBoard
          categories={categories}
          tasks={timelineTasks}
          currentUser={currentUser}
          onAddCategory={addCategory}
          onUpdateCategory={updateCategory}
          onDeleteCategory={deleteCategory}
          onAddTask={addTimelineTask}
          onUpdateTask={updateTimelineTask}
          onDeleteTask={deleteTimelineTask}
          onReorderCategory={handleCategoryReorder}
        />

        {/* GIAO DIỆN CHÍNH - Tăng chiều cao lên 700px */}
        <div className="flex flex-col md:grid md:grid-cols-5 gap-6 mb-8 h-auto md:h-[700px]">
          {/* Truyền hàm moveOverdueTasks vào TodoList */}
          <div className="w-full md:col-span-3 min-h-[500px] md:min-h-0 h-auto md:h-full">
            <TodoList
              tasks={timelineTasks}
              categories={categories}
              onToggle={async (id, currentStatus) => {
                const newStatus = currentStatus === 'done' ? 'todo' : 'done';
                await updateTimelineTask(id, { status: newStatus });
              }}
              onAdd={addTimelineTask}
              onDelete={deleteTimelineTask}
            />
          </div>

          <div className="w-full md:col-span-2 min-h-[400px] md:min-h-0 h-auto md:h-full">
            <ScratchPad
              currentUser={currentUser}
            />
          </div>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden flex flex-col min-h-[700px]">
          <div className="px-6 py-4 border-b border-white/50 flex flex-col md:flex-row justify-between items-center bg-white/30 gap-4 md:gap-0">
            <h2 className="font-bold text-orange-600 text-lg flex items-center gap-2"><LayoutGrid size={20} className="text-orange-500" /> Lịch trình của <span className='text-orange-600'>{currentUser}</span></h2>
            <div className="flex bg-slate-100/50 p-1 rounded-xl">
              <button onClick={() => setViewMode('calendar')} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>Lịch</button>
              <button onClick={() => setViewMode('table')} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>Bảng</button>
            </div>
          </div>
          <div className="p-4 bg-white/20 flex-1">
            <div className="p-4 bg-white/20 flex-1">
              {viewMode === 'calendar' ? (
                <CalendarPro
                  tasks={[
                    ...tasks,
                    ...timelineTasks.map(t => ({
                      ...t,
                      id: `timeline-${t.id}`,
                      start_time: t.task_date, // Timeline tasks only have date
                      category: categories.find(c => c.id === t.category_id)?.title || 'Timeline',
                      isTimeline: true
                    }))
                  ]}
                  onAdd={addTask}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                  onReorder={handleTaskReorder}
                />
              ) : (
                <TaskTable tasks={tasks} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}
export default App
