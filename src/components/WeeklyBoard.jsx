import React from 'react';
import moment from 'moment';
import { Check, Clock } from 'lucide-react';

const WeeklyBoard = ({ date, events, onSelectEvent }) => {
    // Xác định ngày đầu tuần (Thứ 2)
    const startOfWeek = moment(date).startOf('week');
    const days = [];
    for (let i = 0; i < 7; i++) {
        days.push(moment(startOfWeek).add(i, 'days'));
    }

    return (
        <div className="flex h-full gap-3 overflow-x-auto pb-2">
            {days.map((day, index) => {
                const dayEvents = events.filter(e =>
                    moment(e.start).isSame(day, 'day')
                );
                const isToday = day.isSame(moment(), 'day');

                return (
                    <div
                        key={index}
                        className={`flex-1 min-w-[140px] flex flex-col rounded-2xl glass-panel border border-white/40 shadow-sm ${isToday ? 'bg-orange-50/60 ring-2 ring-orange-200' : 'bg-white/40'}`}
                    >
                        {/* Header Ngày */}
                        <div className={`p-3 text-center border-b border-white/30 ${isToday ? 'bg-orange-100/50' : ''}`}>
                            <div className={`text-xs font-bold uppercase ${isToday ? 'text-orange-600' : 'text-slate-500'}`}>
                                {day.format('dddd')}
                            </div>
                            <div className={`text-2xl font-black ${isToday ? 'text-orange-600' : 'text-slate-700'}`}>
                                {day.format('DD')}
                            </div>
                        </div>

                        {/* List Tasks */}
                        <div className="flex-1 p-2 overflow-y-auto custom-scrollbar space-y-2">
                            {dayEvents.map(event => (
                                <div
                                    key={event.id}
                                    onClick={() => onSelectEvent(event)}
                                    className="cursor-pointer p-2.5 rounded-xl bg-white shadow-sm border border-slate-100 hover:shadow-md hover:border-orange-300 transition-all group"
                                    style={{ borderLeft: `4px solid ${event.color}` }}
                                >
                                    <div className="text-sm font-bold text-slate-700 leading-tight mb-1 line-clamp-3">
                                        {event.title}
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        {event.status === 'done' && (
                                            <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">
                                                <Check size={10} strokeWidth={3} /> Xong
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {dayEvents.length === 0 && (
                                <div className="text-center text-slate-300 text-xs py-10 font-medium italic">
                                    Trống
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

WeeklyBoard.title = (date) => {
    return `Tháng ${moment(date).format('MM - YYYY')}`;
};

WeeklyBoard.navigate = (date, action) => {
    switch (action) {
        case 'PREV': return moment(date).subtract(1, 'week').toDate();
        case 'NEXT': return moment(date).add(1, 'week').toDate();
        default: return date;
    }
};

export default WeeklyBoard;
