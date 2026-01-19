import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { X, Trash2, Save, Check } from 'lucide-react';
import SortableDayView from './SortableDayView';

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
        borderRadius: '3px',
        opacity: isDone ? 0.7 : 1,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.75em', // Chữ nhỏ lại xíu trên mobile
        fontWeight: '500',
        marginBottom: '1px',
        padding: '1px 4px',
        textDecoration: isDone ? 'line-through' : 'none'
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
    <div className="w-full h-full">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start" endAccessor="end"
        style={{ height: '700px' }}
        view={view} onView={setView}
        date={date} onNavigate={setDate}
        views={{ month: true, week: true, day: CustomDayViewWrapper }}
        popup={true}
        eventPropGetter={eventStyleGetter}
        selectable={true}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        className="glass-panel p-6"
      />

      {/* --- MODAL RESPONSIVE --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity"></div>
              <h3 className="text-white font-bold text-xl flex items-center gap-2 relative z-10">
                {editData.id ? '✏️ Edit Task' : '✨ New Task'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-white/70 hover:text-white transition-colors relative z-10 p-1 hover:bg-white/10 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6 bg-white/50">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">What needs to be done?</label>
                <input
                  type="text" autoFocus
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  className="w-full text-lg font-semibold border-b-2 border-slate-200 focus:border-blue-500 outline-none py-2 text-slate-800 bg-transparent transition-colors placeholder:text-slate-300"
                  placeholder="e.g. Design meeting..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Color Tag</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setEditData({ ...editData, color: c.code })}
                      className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center transition-all duration-200 ${editData.color === c.code ? 'ring-2 ring-offset-2 ring-blue-400 scale-110 shadow-md' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c.code }}
                    >
                      {editData.color === c.code && <Check size={20} className="text-white drop-shadow-md" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50/50 border-t border-white/50 flex justify-between items-center">
              {editData.id ? (
                <button onClick={handleDeleteInModal} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-xl transition-all flex items-center gap-2 font-medium text-sm">
                  <Trash2 size={18} /> Delete
                </button>
              ) : <div></div>}
              <button onClick={handleSave} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPro;