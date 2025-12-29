import React, { useEffect, useState } from 'react';

// Danh sách các món sẽ rơi: Bao lì xì, Tiền vàng, Hoa mai, Hoa đào
const TET_ITEMS = ['🧧', '💰', '🌼', '🌸', '💵'];

const TetFallingEffect = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Tạo ra 50 món đồ ngẫu nhiên
    const newItems = Array.from({ length: 50 }).map((_, i) => {
        // Chọn random 1 món
        const content = TET_ITEMS[Math.floor(Math.random() * TET_ITEMS.length)];
        
        // Random vị trí và tốc độ
        const style = {
            left: `${Math.random() * 100}vw`, // Vị trí ngang ngẫu nhiên
            animationDuration: `${Math.random() * 10 + 10}s`, // Rơi chậm từ 10-20s
            animationDelay: `-${Math.random() * 10}s`, // Bắt đầu rơi ở các thời điểm khác nhau
            fontSize: `${Math.random() * 20 + 20}px`, // Kích thước to nhỏ khác nhau (20px - 40px)
            opacity: Math.random() * 0.5 + 0.3, // Độ mờ ảo
        };
        return { id: i, content, style };
    });
    setItems(newItems);
  }, []);

  return (
    // Lớp phủ toàn màn hình, không chặn chuột (pointer-events-none)
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      <style>{`
        @keyframes tetFall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(360deg); /* Rơi xuống và xoay */
            opacity: 0;
          }
        }
        .falling-item {
          position: absolute;
          top: -50px;
          user-select: none;
          animation-name: tetFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite; /* Lặp lại mãi mãi */
          will-change: transform, opacity; /* Tối ưu hiệu suất */
        }
      `}</style>
      {items.map((item) => (
        <div key={item.id} className="falling-item" style={item.style}>
          {item.content}
        </div>
      ))}
    </div>
  );
};

export default TetFallingEffect;