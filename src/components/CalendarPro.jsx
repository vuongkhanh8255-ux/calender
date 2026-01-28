import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { X, Trash2, Save, Check } from 'lucide-react';
import SortableDayView from './SortableDayView';
import WeeklyBoard from './WeeklyBoard';

moment.updateLocale('vi', { week: { dow: 1, doy: 4 } });
const localizer = momentLocalizer(moment);

const COLORS = [
  { code: '#ea580c', name: 'Cam' },
  { code: '#16a34a', name: 'Xanh lá' },
  { code: '#dc2626', name: 'Đỏ' },
  { code: '#2563eb', name: 'Xanh dương' },
  { code: '#9333ea', name: 'Tím' },
  { code: '#db2777', name: 'Hồng' },
];

const CalendarPro = ({ tasks, onAdd, onUpdate, onDelete, onReorder }) => {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState({ id: null, title: '', start: null, color: '#ea580c' });

  const events = tasks.map(task => ({
    id: task.id, title: task.title,
    start: new Date(task.start_time), end: new Date(task.start_time),
    status: task.status, color: task.color || (task.category === 'Schedule' ? '#16a34a' : '#ea580c'),
    position: task.position, allDay: true
  }));

  const eventStyleGetter = (event) => {
    const isDone = event.status === 'done';
    return {
      style: {
        backgroundColor: isDone ? '#475569' : event.color,
        borderRadius: '8px',
        opacity: isDone ? 0.7 : 1,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.85em',
        fontWeight: '600',
        marginBottom: '2px',
        padding: '2px 6px',
        textDecoration: isDone ? 'line-through' : 'none',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }
    };
  };

  const handleSelectSlot = ({ start }) => {
    setEditData({ id: null, title: '', start: start, color: '#ea580c' });
    setModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setEditData({ id: event.id, title: event.title, start: event.start, color: event.color });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!editData.title.trim()) return;
    if (editData.id) onUpdate(editData.id, editData.title, editData.color);
    else onAdd(editData.title, editData.start, 'Personal', editData.color);
    setModalOpen(false);
  };

  const handleDeleteInModal = () => {
    if (editData.id) { onDelete(editData.id); setModalOpen(false); }
  };

  const CustomDayViewWrapper = (props) => {
    return (
      <SortableDayView
        {...props}
        onOrderChange={onReorder}
        onSelectEvent={(evt) => {
          setEditData({ id: evt.id, title: evt.title, start: evt.start, color: evt.color });
          setModalOpen(true);
        }}
      />
    );
  };
  CustomDayViewWrapper.title = SortableDayView.title;
  CustomDayViewWrapper.navigate = SortableDayView.navigate;

  return (
    <div className="w-full h-full relative">
      <style>{`
        /* CSS RESPONSIVE CHO LỊCH - LIGHT THEME */
        .rbc-calendar { font-family: inherit; color: #334155; }
        .rbc-month-view, .rbc-header { border-color: rgba(0,0,0,0.05) !important; }
        .rbc-day-bg + .rbc-day-bg { border-left: 1px solid rgba(0,0,0,0.05); }
        .rbc-today { background-color: rgba(234, 88, 12, 0.05); }
        .rbc-off-range-bg { background-color: rgba(0,0,0,0.02); }
        
        /* Chỉnh thanh công cụ cho Mobile */
        .rbc-toolbar {
            flex-direction: column; 
            gap: 12px;
            margin-bottom: 24px;
        }
        @media (min-width: 768px) {
            .rbc-toolbar { flex-direction: row; gap: 0; }
        }
        
        .rbc-toolbar button { 
            color: #475569; border: 1px solid #e2e8f0; 
            font-size: 0.9rem; padding: 8px 16px;
            background: rgba(255,255,255,0.6);
            backdrop-filter: blur(4px);
            font-weight: 600;
        }
        .rbc-toolbar button:hover { background: white; }
        .rbc-toolbar button.rbc-active { 
            background-color: #f97316; /* Orange-500 */
            color: white; border-color: #f97316; 
            box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.3);
        }
        .rbc-header { 
            font-size: 0.85rem; 
            padding: 14px 0; 
            font-weight: 800; 
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .rbc-event {
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            font-size: 0.85rem;
            padding: 2px 6px;
        }
      `}</style>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start" endAccessor="end"
        style={{ height: '70vh' }}
        view={view} onView={setView}
        date={date} onNavigate={setDate}
        views={{ month: true, week: WeeklyBoard, day: CustomDayViewWrapper }}
        popup={true}
        eventPropGetter={eventStyleGetter}
        selectable={true}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
      />

      {/* --- MODAL RESPONSIVE --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/50 animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-orange-400 to-rose-400 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                {editData.id ? '✏️ Chỉnh sửa' : '✨ Tạo mới'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-1">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nội dung công việc</label>
                <input
                  type="text" autoFocus
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  className="w-full text-lg font-semibold bg-slate-50 border-2 border-slate-100 focus:border-orange-400 focus:bg-white rounded-xl px-3 py-2 outline-none text-slate-800 transition-all"
                  placeholder="Nhập tên việc..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Chọn màu</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setEditData({ ...editData, color: c.code })}
                      className={`w-9 h-9 rounded-xl shadow-sm flex items-center justify-center transition-all ${editData.color === c.code ? 'ring-2 ring-offset-2 ring-slate-300 scale-110 shadow-md' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c.code }}
                    >
                      {editData.color === c.code && <Check size={18} className="text-white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
              {editData.id ? (
                <button onClick={handleDeleteInModal} className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl transition-all"><Trash2 size={20} /></button>
              ) : <div></div>}
              <button onClick={handleSave} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all transform active:scale-95">
                <Save size={18} /> Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPro;