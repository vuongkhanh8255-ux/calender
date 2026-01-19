import React from 'react';

// Nhận prop là danh sách tasks từ cha truyền xuống
const TaskTable = ({ tasks }) => {
  return (
    <div className="glass-panel p-6 w-full overflow-hidden">
      <h2 className="font-bold mb-6 text-xl text-slate-800 flex items-center gap-2">
        <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shadow-sm">📂</span>
        Task Management
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="p-4 rounded-tl-xl">Task Name</th>
              <th className="p-4">Category</th>
              <th className="p-4 rounded-tr-xl">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700">
            {tasks.map((task) => (
              <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-medium">{task.title}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${task.category === 'Schedule' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                    {task.category}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${task.status === 'done' ? 'bg-slate-100 text-slate-500 line-through' : 'bg-blue-100 text-blue-700'
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'done' ? 'bg-slate-400' : 'bg-blue-500'}`}></div>
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTable;