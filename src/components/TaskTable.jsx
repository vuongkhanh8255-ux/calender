import React from 'react';

// Nhận prop là danh sách tasks từ cha truyền xuống
const TaskTable = ({ tasks }) => {
  return (
    <div className="border p-4 rounded shadow bg-white">
      <h2 className="font-bold mb-4 text-xl">📂 Quản lý tổng (Table View)</h2>
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Công việc</th>
            <th className="border p-2">Phân loại</th>
            <th className="border p-2">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{task.title}</td>
              <td className="p-2">{task.category}</td>
              <td className="p-2">
                <span className={task.status === 'done' ? 'text-green-600' : 'text-orange-600'}>
                  {task.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;