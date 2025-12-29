import React, { useState } from 'react';

const AddTask = ({ onAdd }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    // Mặc định thêm vào là 'todo' và loại là 'General'
    onAdd(title); 
    setTitle(''); // Xóa ô nhập sau khi thêm
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6 p-4 bg-white rounded shadow">
      <input 
        type="text" 
        placeholder="Nhập việc cần làm rồi Enter..." 
        className="flex-1 p-2 border border-gray-300 rounded outline-none focus:border-orange-500"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button 
        type="submit"
        className="bg-orange-600 text-white px-4 py-2 rounded font-bold hover:bg-orange-700"
      >
        + Thêm
      </button>
    </form>
  );
};

export default AddTask;