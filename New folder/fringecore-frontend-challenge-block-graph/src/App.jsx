import React, { useState } from "react";
import "./index.css";

const App = () => {
  const [blocks, setBlocks] = useState([
    {
      id: 0,
      x: Math.floor(Math.random() * (window.innerWidth - 100)),
      y: Math.floor(Math.random() * (window.innerHeight - 100)),
      parentId: null,
    },
  ]);
  const [lines, setLines] = useState([]);
  const [draggingBlock, setDraggingBlock] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (id, e) => {
    setDraggingBlock(id);
    const block = blocks.find((b) => b.id === id);
    setDragOffset({ x: e.clientX - block.x, y: e.clientY - block.y });
  };

  const handleMouseMove = (e) => {
    if (draggingBlock !== null) {
      const updatedBlocks = blocks.map((block) =>
        block.id === draggingBlock
          ? {
              ...block,
              x: e.clientX - dragOffset.x,
              y: e.clientY - dragOffset.y,
            }
          : block
      );
      setBlocks(updatedBlocks);
    }
  };

  const handleMouseUp = () => {
    setDraggingBlock(null);
  };

  const addChildBlock = (parentId) => {
    const parent = blocks.find((b) => b.id === parentId);
    const newBlock = {
      id: blocks.length,
      x: parent.x + (Math.random() > 0.5 ? 200 : -200),
      y: parent.y + (Math.random() > 0.5 ? 200 : -200),
      parentId,
    };
    setBlocks([...blocks, newBlock]);
    setLines([
      ...lines,
      {
        parentId,
        childId: newBlock.id,
      },
    ]);
  };

  const renderConnectingLine = (parent, child) => {
    const dx = child.x - parent.x;
    const dy = child.y - parent.y;

    return (
      <svg
        key={`${parent.id}-${child.id}`}
        className='absolute'
        style={{
          left: `${parent.x + 50}px`,
          top: `${parent.y + 50}px`,
          overflow: "visible",
        }}
      >
        <path
          d={`
            M0,0 
            H${dx / 2} 
            V${dy} 
            H${dx}
          `}
          fill='none'
          stroke='black'
          strokeDasharray='5,5'
          strokeWidth='2'
        />
      </svg>
    );
  };

  return (
    <div
      className='w-screen h-screen bg-pink-200 relative overflow-hidden text-lg font-semibold'
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {lines.map((line) => {
        const parent = blocks.find((b) => b.id === line.parentId);
        const child = blocks.find((b) => b.id === line.childId);
        if (!parent || !child) return null;

        return renderConnectingLine(parent, child);
      })}

      {blocks.map((block) => (
        <div
          key={block.id}
          onMouseDown={(e) => handleMouseDown(block.id, e)}
          className='absolute w-28 h-28 bg-pink-500 text-white  shadow-lg flex flex-col justify-between items-center cursor-move'
          style={{ top: `${block.y}px`, left: `${block.x}px` }}
        >
          <div className='text-white mt-3'>{block.id}</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addChildBlock(block.id);
            }}
            className='bg-white text-pink-500 px-6 flex justify-center items-center text-center py-1 mb-3 hover:bg-gray-200'
          >
            +
          </button>
        </div>
      ))}
    </div>
  );
};

export default App;
