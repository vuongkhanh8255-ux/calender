import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.updateLocale('vi', { week: { dow: 1, doy: 4 } });
const localizer = momentLocalizer(moment);

const CalendarPro = ({ tasks }) => {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  const events = tasks.map(task => ({
      id: task.id,
      title: task.title,
      start: new Date(task.start_time),
      end: new Date(task.start_time),
      status: task.status,
      category: task.category,
      allDay: true 
  }));

  const eventStyleGetter = (event) => {
    const isDone = event.status === 'done';
    const isSchedule = event.category === 'Schedule';
    let bgColor = isDone ? '#475569' : '#ea580c'; 
    if (isSchedule) bgColor = '#16a34a'; 

    return {
      style: {
        backgroundColor: bgColor,
        borderRadius: '4px',
        opacity: 1,
        color: 'white',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'block',
        fontSize: '0.85em',
        fontWeight: '600',
        marginBottom: '2px',
        padding: '2px 6px'
      }
    };
  };

  return (
    // Bỏ h-full, để nó tự do giãn chiều cao
    <div className="w-full bg-slate-900 rounded-xl shadow-inner">
      <style>{`
        .rbc-calendar { font-family: inherit; color: #e2e8f0; }
        .rbc-month-view, .rbc-month-row, .rbc-date-cell, .rbc-day-bg, .rbc-header { border-color: #334155 !important; }
        .rbc-month-row + .rbc-month-row { border-top-color: #334155 !important; }
        .rbc-time-content, .rbc-time-header-gutter, .rbc-label { display: none !important; }
        .rbc-time-view, .rbc-time-header, .rbc-time-header-content, .rbc-row.rbc-row-resource, .rbc-allday-cell { height: 100%; flex: 1; border-left: none; }
        
        /* QUAN TRỌNG: Ép mỗi dòng trong lịch tháng cao tối thiểu 150px */
        .rbc-month-row { min-height: 150px; overflow: visible; }
        .rbc-row-content { z-index: 4; } /* Để popup hiện lên trên */

        .rbc-day-bg + .rbc-day-bg, .rbc-header + .rbc-header { border-left: 1px solid #334155; }
        .rbc-toolbar button { color: #cbd5e1; border: 1px solid #475569; font-size: 0.8rem; padding: 4px 10px;}
        .rbc-toolbar button:hover { background-color: #334155; color: white; }
        .rbc-toolbar button.rbc-active { background-color: #ea580c; color: white; border-color: #ea580c; }
        .rbc-today { background-color: rgba(234, 88, 12, 0.1); }
        .rbc-off-range-bg { background-color: #0f172a; }
        .rbc-header { padding: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; font-size: 0.8rem; border-bottom: 2px solid #334155; }
      `}</style>
      
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        
        // --- QUAN TRỌNG NHẤT Ở ĐÂY ---
        // Tôi set cứng chiều cao 1200px để nó dài ngoằng ra
        style={{ height: 1200 }} 
        
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        views={['month', 'week', 'day']}
        popup={false} // Tắt popup "show more", cho nó hiện hết luôn vì ô đã cao rồi
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
};

export default CalendarPro;