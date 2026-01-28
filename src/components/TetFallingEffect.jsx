import React, { useEffect, useState } from 'react';

// Danh sách các món sẽ rơi: Bao lì xì, Tiền vàng, Hoa mai, Hoa đào, Đô la
const TET_ITEMS = ['🧧', '💰', '🌼', '🌸', '💵'];

const TetFallingEffect = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Tạo ra 50 món đồ ngẫu nhiên
    const newItems = Array.from({ length: 50 }).map((_, i) => {
      const content = TET_ITEMS[Math.floor(Math.random() * TET_ITEMS.length)];

      const style = {
        left: `${Math.random() * 100}vw`,
        animationDuration: `${Math.random() * 10 + 10}s`,
        animationDelay: `-${Math.random() * 10}s`,
        fontSize: `${Math.random() * 20 + 20}px`,
        opacity: Math.random() * 0.5 + 0.3,
      };
      return { id: i, content, style };
    });
    setItems(newItems);
  }, []);

  return (
    // z-50 để nổi lên trên cùng, pointer-events-none để bấm xuyên qua được
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <style>{`
        @keyframes tetFall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
            opacity: 0;
          }
        }
        .falling-item {
          position: absolute;
          top: -50px;
          user-select: none;
          animation-name: tetFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
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