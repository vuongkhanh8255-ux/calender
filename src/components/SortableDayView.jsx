import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import moment from 'moment';

// Component con: Từng dòng công việc
const SortableItem = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const isDone = task.status === 'done';
  // Nếu đã xong thì màu xám, chưa thì lấy màu của task (hoặc mặc định cam)
  const bgColor = isDone ? '#475569' : (task.color || '#ea580c');

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: bgColor }}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)} // Click để sửa
      className="mb-2 p-3 rounded-lg text-white font-bold text-sm shadow-sm border border-white/10 cursor-grab active:cursor-grabbing flex items-center justify-between group hover:brightness-110 select-none"
    >
      <span className={isDone ? 'line-through opacity-70' : ''}>
        {task.title}
      </span>
      <span className="opacity-0 group-hover:opacity-100 text-[10px] bg-black/20 px-2 py-1 rounded uppercase tracking-wider">
        Kéo thả
      </span>
    </div>
  );
};

// Component chính: Danh sách ngày
const SortableDayView = ({ date, events, onOrderChange, onSelectEvent }) => {
  // 1. Lọc việc của ngày hiện tại
  const dayEvents = events.filter(evt =>
    moment(evt.start).isSame(date, 'day')
  ).sort((a, b) => (a.position || 0) - (b.position || 0)); // 2. Sắp xếp theo vị trí đã lưu

  // Cấu hình cảm biến kéo thả (Kéo 5px mới tính là kéo, để ko nhầm với click)
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 }
  }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      onOrderChange(active.id, over.id, dayEvents);
    }
  };

  return (
    <div className="h-full bg-slate-900 p-4 overflow-y-auto custom-scrollbar">
      <h3 className="text-orange-500 font-bold uppercase mb-4 text-center border-b border-slate-700 pb-2 text-sm">
        Danh sách việc ngày {moment(date).format('DD/MM/YYYY')}
      </h3>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={dayEvents.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 pb-20">
            {dayEvents.length > 0 ? (
              dayEvents.map(task => (
                <SortableItem key={task.id} task={task} onClick={onSelectEvent} />
              ))
            ) : (
              <div className="text-slate-500 text-center italic mt-10 text-sm">
                Trống trơn! Nghỉ ngơi hoặc thêm việc mới đi.
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

// Cấu hình bắt buộc cho React Big Calendar nhận diện đây là 1 View
SortableDayView.title = (date) => { return `Chi tiết ngày ${moment(date).format('DD/MM')}`; };
SortableDayView.navigate = (date, action) => {
  switch (action) {
    case 'PREV': return moment(date).subtract(1, 'day').toDate();
    case 'NEXT': return moment(date).add(1, 'day').toDate();
    default: return date;
  }
};

export default SortableDayView;