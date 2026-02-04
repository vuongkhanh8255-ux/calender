import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Calendar, GripVertical, CheckCircle2, Circle } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay, pointerWithin, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const COLORS = [
    { code: '#ea580c', name: 'Cam' },
    { code: '#16a34a', name: 'Xanh lá' },
    { code: '#dc2626', name: 'Đỏ' },
    { code: '#2563eb', name: 'Xanh dương' },
    { code: '#9333ea', name: 'Tím' },
    { code: '#db2777', name: 'Hồng' },
    { code: '#f59e0b', name: 'Vàng' },
    { code: '#10b981', name: 'Emerald' },
];

// Sortable Task Card Component
const SortableTaskCard = ({ task, onTaskClick, onToggleComplete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: { task }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
    };

    const isDone = task.status === 'done';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`group relative px-2 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-transform cursor-grab active:cursor-grabbing max-w-full inline-block ${isDone ? 'line-through opacity-70' : ''}`}
        >
            <div
                className="absolute inset-0 rounded-lg pointer-events-none"
                style={{ backgroundColor: isDone ? '#64748b' : task.color }}
            />

            {/* Quick Complete Checkbox */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onToggleComplete(task);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-0.5 shadow-md hover:scale-110 z-20 pointer-events-auto"
                title={isDone ? "Đánh dấu chưa xong" : "Đánh dấu hoàn thành"}
            >
                {isDone ? (
                    <CheckCircle2 size={14} className="text-green-600" />
                ) : (
                    <Circle size={14} className="text-slate-400" />
                )}
            </button>

            {/* Task Content - Double click to edit */}
            <div
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task, e);
                }}
                className="relative z-10 pointer-events-none select-none whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]"
            >
                {isDone && <span className="mr-1">✓</span>}
                {task.title}
            </div>
        </div>
    );
};

// Droppable Cell Component
const DroppableCell = ({ categoryId, date, children, isToday }) => {
    const cellId = `cell-${categoryId}-${date}`;
    const { setNodeRef, isOver } = useDroppable({
        id: cellId,
        data: { categoryId, date }
    });

    return (
        <div
            ref={setNodeRef}
            className={`p-2 rounded-xl min-h-[150px] hover:shadow-lg transition-all border-2 ${isOver
                ? 'border-blue-500 bg-blue-50/50'
                : isToday
                    ? 'bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-400 shadow-md'
                    : 'bg-white/60 border-amber-200/40 hover:bg-gradient-to-br hover:from-white hover:to-amber-50'
                }`}
        >
            {children}
        </div>
    );
};


const SortableCategoryRow = ({ category, weekDays, getTasksForCell, handleCellClick, handleTaskClick, handleEditCategory, onDeleteCategory, onToggleComplete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 100 : 1,
        position: 'relative'
    };

    return (
        <div ref={setNodeRef} style={style} className="grid grid-cols-8 gap-2 mb-2">
            {/* Category Name Cell (Drag Handle) */}
            <div
                className="p-2 rounded-xl flex flex-col items-center justify-center group hover:shadow-xl transition-all shadow-md relative overflow-hidden text-center cursor-move"
                style={{ backgroundColor: category.color }}
                {...attributes}
                {...listeners}
            >
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>

                {/* Drag Handle Indicator */}
                <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 text-white">
                    <GripVertical size={16} />
                </div>

                <div className="relative z-10 w-full flex items-center justify-center h-full">
                    <span
                        className="font-black text-lg md:text-xl text-white break-words leading-tight uppercase tracking-wide drop-shadow-md px-1 select-none"
                        title={category.title}
                    >
                        {category.title}
                    </span>
                </div>

                {/* Edit/Delete Buttons */}
                <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20" onPointerDown={(e) => e.stopPropagation()}>
                    <button
                        onClick={(e) => handleEditCategory(category, e)}
                        className="p-1 hover:bg-white/20 text-white/80 hover:text-white rounded-md transition-all"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Xóa đầu mục "${category.title}"? Tất cả task bên dưới sẽ bị xóa theo.`)) {
                                onDeleteCategory(category.id);
                            }
                        }}
                        className="p-1 hover:bg-white/20 text-white/80 hover:text-white rounded-md transition-all"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Task Cells (Now draggable across cells) */}
            {weekDays.map((day, i) => {
                const cellTasks = getTasksForCell(category.id, day);
                const isToday = day.isSame(moment(), 'day');
                const dateStr = day.format('YYYY-MM-DD');

                return (
                    <DroppableCell
                        key={i}
                        categoryId={category.id}
                        date={dateStr}
                        isToday={isToday}
                    >
                        <div
                            onClick={() => handleCellClick(category.id, day)}
                            className="flex flex-wrap gap-1 cursor-pointer min-h-[120px]"
                        >
                            {cellTasks.map((task) => (
                                <SortableTaskCard
                                    key={task.id}
                                    task={task}
                                    onTaskClick={handleTaskClick}
                                    onToggleComplete={onToggleComplete}
                                />
                            ))}
                            {cellTasks.length === 0 && (
                                <div className="text-xs text-slate-300 italic w-full text-center py-2 select-none">
                                    + Thêm
                                </div>
                            )}
                        </div>
                    </DroppableCell>
                );
            })}
        </div>
    );
};

const TimelineBoard = ({
    categories,
    tasks,
    currentUser,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
    onAddTask,
    onUpdateTask,
    onDeleteTask,
    onReorderCategory
}) => {
    const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf('week'));
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingTask, setEditingTask] = useState(null);

    // Draggable sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, // Smaller distance for more responsive drag
            },
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        // Check if we're dragging a task
        const isDraggingTask = tasks.some(t => t.id === active.id);

        if (!isDraggingTask) {
            // Handle category reordering
            if (active.id !== over.id) {
                onReorderCategory(active.id, over.id);
            }
        } else {
            // Handle task drop
            const activeTask = tasks.find(t => t.id === active.id);
            if (!activeTask) return;

            // Check if dropped over a droppable cell
            const overData = over.data?.current;
            let newCategoryId, newDate;

            if (over.id.toString().startsWith('cell-')) {
                // Dropped into a droppable cell zone
                newCategoryId = overData.categoryId;
                newDate = overData.date;

                // Move to new cell
                if (String(activeTask.category_id) !== String(newCategoryId) || activeTask.task_date !== newDate) {
                    onUpdateTask(active.id, {
                        category_id: newCategoryId,
                        task_date: newDate,
                        position: 0
                    });
                }
            } else {
                // Dropped over another task
                const overTask = tasks.find(t => t.id === over.id);

                if (overTask) {
                    newCategoryId = overTask.category_id;
                    newDate = overTask.task_date;

                    // Check if category or date changed
                    if (String(activeTask.category_id) !== String(newCategoryId) || activeTask.task_date !== newDate) {
                        // Cross-cell drop
                        onUpdateTask(active.id, {
                            category_id: newCategoryId,
                            task_date: newDate,
                            position: 0
                        });
                    } else {
                        // Same cell - reorder
                        const cellTasks = tasks.filter(t =>
                            String(t.category_id) === String(activeTask.category_id) &&
                            t.task_date === activeTask.task_date
                        ).sort((a, b) => (a.position || 0) - (b.position || 0));

                        const oldIndex = cellTasks.findIndex(t => t.id === active.id);
                        const newIndex = cellTasks.findIndex(t => t.id === over.id);

                        if (oldIndex !== -1 && newIndex !== -1) {
                            const reorderedTasks = [...cellTasks];
                            const [movedTask] = reorderedTasks.splice(oldIndex, 1);
                            reorderedTasks.splice(newIndex, 0, movedTask);

                            // Update positions
                            reorderedTasks.forEach((task, index) => {
                                if (task.position !== index) {
                                    onUpdateTask(task.id, { position: index });
                                }
                            });
                        }
                    }
                }
            }
        }
    };

    // Generate 7 days starting from currentWeekStart
    const weekDays = Array.from({ length: 7 }, (_, i) =>
        moment(currentWeekStart).add(i, 'days')
    );

    const handlePrevWeek = () => {
        setCurrentWeekStart(moment(currentWeekStart).subtract(1, 'week'));
    };

    const handleNextWeek = () => {
        setCurrentWeekStart(moment(currentWeekStart).add(1, 'week'));
    };

    const handleToday = () => {
        setCurrentWeekStart(moment().startOf('week'));
    };

    const handleCellClick = (categoryId, date) => {
        setEditingTask({
            id: null,
            category_id: categoryId,
            task_date: date.format('YYYY-MM-DD'),
            title: '',
            color: '#ea580c'
        });
        setTaskModalOpen(true);
    };

    const handleTaskClick = (task, e) => {
        e.stopPropagation();
        setEditingTask(task);
        setTaskModalOpen(true);
    };

    const handleAddCategory = () => {
        setEditingCategory({ id: null, title: '', color: '#ea580c' });
        setCategoryModalOpen(true);
    };

    const handleEditCategory = (category, e) => {
        e.stopPropagation();
        setEditingCategory(category);
        setCategoryModalOpen(true);
    };

    const getTasksForCell = (categoryId, date) => {
        return tasks.filter(t =>
            t.category_id === categoryId &&
            moment(t.task_date).isSame(date, 'day')
        ).sort((a, b) => (a.position || 0) - (b.position || 0));
    };


    // Handle quick complete toggle
    const handleToggleComplete = (task) => {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        onUpdateTask(task.id, { status: newStatus });
    };

    return (
        <div className="glass-panel rounded-3xl p-3 md:p-6 mb-8 border-2 border-amber-200/60 shadow-2xl bg-gradient-to-br from-amber-50/80 to-yellow-50/80">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-xl shadow-lg">
                        <Calendar size={24} className="stroke-[2.5px]" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-amber-800 to-yellow-700 bg-clip-text text-transparent tracking-tight">TIMELINE BOARD</h2>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 w-full md:w-auto">
                    <button
                        onClick={handleToday}
                        className="px-3 md:px-4 py-2 bg-white/80 hover:bg-white text-amber-800 rounded-xl font-bold text-xs md:text-sm transition-all shadow-md border-2 border-amber-200/60 hover:border-amber-300"
                    >
                        Hôm nay
                    </button>
                    <div className="flex items-center bg-white/80 rounded-xl border-2 border-amber-200/60 shadow-md">
                        <button
                            onClick={handlePrevWeek}
                            className="p-2 hover:bg-amber-50 rounded-l-xl transition-all"
                        >
                            <ChevronLeft size={20} className="text-amber-800" />
                        </button>
                        <div className="px-2 md:px-4 py-2 text-xs md:text-sm font-bold text-amber-800 border-x-2 border-amber-100 whitespace-nowrap">
                            {currentWeekStart.format('DD/MM')} - {moment(currentWeekStart).add(6, 'days').format('DD/MM/YYYY')}
                        </div>
                        <button
                            onClick={handleNextWeek}
                            className="p-2 hover:bg-amber-50 rounded-r-xl transition-all"
                        >
                            <ChevronRight size={20} className="text-amber-800" />
                        </button>
                    </div>
                    <button
                        onClick={handleAddCategory}
                        className="px-3 md:px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-xl font-bold text-xs md:text-sm transition-all shadow-lg flex items-center gap-2 border border-amber-700/30"
                    >
                        <Plus size={18} /> <span className="hidden sm:inline">Thêm đầu mục</span><span className="inline sm:hidden">Thêm</span>
                    </button>
                </div>
            </div>

            {/* Timeline Grid */}
            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Header Row - Days */}
                    <div className="grid grid-cols-8 gap-2 mb-2">
                        <div className="p-3 text-center font-bold text-white text-sm bg-slate-700 rounded-xl border-2 border-slate-600 shadow-md">Đầu mục</div>
                        {weekDays.map((day, i) => {
                            const isToday = day.isSame(moment(), 'day');
                            return (
                                <div
                                    key={i}
                                    className={`p-3 rounded-xl text-center font-bold text-sm shadow-md border-2 ${isToday
                                        ? 'bg-orange-500 text-white ring-2 ring-orange-600 shadow-lg'
                                        : 'bg-slate-700 text-white border-slate-600'
                                        }`}
                                >
                                    <div className="text-xs uppercase">{day.format('ddd')}</div>
                                    <div className="text-lg font-black">{day.format('DD')}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Category Rows with Drag & Drop */}
                    {categories.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Calendar size={48} className="mx-auto mb-3 opacity-30" />
                            <p className="font-semibold">Chưa có đầu mục nào. Click "Thêm đầu mục" để bắt đầu!</p>
                        </div>
                    ) : (
                        <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
                            <SortableContext id="categories" items={[...categories.map(c => c.id), ...tasks.map(t => t.id)]} strategy={verticalListSortingStrategy}>
                                {categories.map((category) => (
                                    <SortableCategoryRow
                                        key={category.id}
                                        category={category}
                                        weekDays={weekDays}
                                        getTasksForCell={getTasksForCell}
                                        handleCellClick={handleCellClick}
                                        handleTaskClick={handleTaskClick}
                                        handleEditCategory={handleEditCategory}
                                        onDeleteCategory={onDeleteCategory}
                                        onToggleComplete={handleToggleComplete}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>

            {/* Category Modal */}
            {categoryModalOpen && (
                <CategoryModal
                    category={editingCategory}
                    onSave={(data) => {
                        if (editingCategory?.id) {
                            onUpdateCategory(editingCategory.id, data);
                        } else {
                            onAddCategory(data);
                        }
                        setCategoryModalOpen(false);
                    }}
                    onClose={() => setCategoryModalOpen(false)}
                />
            )}

            {/* Task Modal */}
            {taskModalOpen && (
                <TaskModal
                    task={editingTask}
                    categories={categories}
                    onSave={(data) => {
                        if (editingTask?.id) {
                            onUpdateTask(editingTask.id, data);
                        } else {
                            onAddTask(data);
                        }
                        setTaskModalOpen(false);
                    }}
                    onDelete={editingTask?.id ? () => {
                        if (confirm('Xóa task này?')) {
                            onDeleteTask(editingTask.id);
                            setTaskModalOpen(false);
                        }
                    } : null}
                    onClose={() => setTaskModalOpen(false)}
                />
            )}
        </div>
    );
};

// Category Modal Component
const CategoryModal = ({ category, onSave, onClose }) => {
    const [formData, setFormData] = useState(category || { title: '', color: '#ea580c' });

    const modalContent = (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50">
                <div className="bg-gradient-to-r from-orange-400 to-rose-400 p-4">
                    <h3 className="text-white font-bold text-lg">
                        {category?.id ? '✏️ Sửa đầu mục' : '✨ Thêm đầu mục'}
                    </h3>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Tên đầu mục</label>
                        <input
                            type="text"
                            autoFocus
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full text-lg font-semibold bg-slate-50 border-2 border-slate-100 focus:border-orange-400 focus:bg-white rounded-xl px-3 py-2 outline-none text-slate-800 transition-all"
                            placeholder="Vd: Làm clip shopee"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Chọn màu</label>
                        <div className="flex flex-wrap gap-3">
                            {COLORS.map((c) => (
                                <button
                                    key={c.code}
                                    onClick={() => setFormData({ ...formData, color: c.code })}
                                    className={`w-9 h-9 rounded-xl shadow-sm flex items-center justify-center transition-all ${formData.color === c.code ? 'ring-2 ring-offset-2 ring-slate-300 scale-110' : 'hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: c.code }}
                                >
                                    {formData.color === c.code && <span className="text-white text-lg">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => {
                            if (formData.title.trim()) {
                                onSave(formData);
                            }
                        }}
                        className="px-6 py-2.5 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-lg"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

// Task Modal Component
const TaskModal = ({ task, categories, onSave, onDelete, onClose }) => {
    const [formData, setFormData] = useState(task || {
        title: '',
        color: '#ea580c',
        category_id: categories[0]?.id || null,
        task_date: moment().format('YYYY-MM-DD')
    });

    const modalContent = (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-4">
                    <h3 className="text-white font-bold text-lg">
                        {task?.id ? '✏️ Sửa task' : '✨ Thêm task'}
                    </h3>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Tên task</label>
                        <input
                            type="text"
                            autoFocus
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full text-lg font-semibold bg-slate-50 border-2 border-slate-100 focus:border-amber-500 focus:bg-white rounded-xl px-3 py-2 outline-none text-slate-800 transition-all"
                            placeholder="Vd: Quay video 1"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Đầu mục</label>
                        <select
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            className="w-full text-base font-semibold bg-slate-50 border-2 border-slate-100 focus:border-amber-500 focus:bg-white rounded-xl px-3 py-2 outline-none text-slate-800 transition-all"
                        >
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Ngày</label>
                        <input
                            type="date"
                            value={formData.task_date}
                            onChange={(e) => setFormData({ ...formData, task_date: e.target.value })}
                            className="w-full text-base font-semibold bg-slate-50 border-2 border-slate-100 focus:border-amber-500 focus:bg-white rounded-xl px-3 py-2 outline-none text-slate-800 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Chọn màu</label>
                        <div className="flex flex-wrap gap-3">
                            {COLORS.map((c) => (
                                <button
                                    key={c.code}
                                    onClick={() => setFormData({ ...formData, color: c.code })}
                                    className={`w-9 h-9 rounded-xl shadow-sm flex items-center justify-center transition-all ${formData.color === c.code ? 'ring-2 ring-offset-2 ring-slate-300 scale-110' : 'hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: c.code }}
                                >
                                    {formData.color === c.code && <span className="text-white text-lg">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                    {onDelete ? (
                        <button
                            onClick={onDelete}
                            className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl transition-all"
                        >
                            <Trash2 size={20} />
                        </button>
                    ) : <div></div>}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={() => {
                                if (formData.title.trim() && formData.category_id) {
                                    onSave(formData);
                                }
                            }}
                            className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white transition-all shadow-lg"
                        >
                            Lưu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default TimelineBoard;
