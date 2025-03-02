import React, { useState } from 'react';
import { useSpreadsheetStore } from '../store/spreadsheetStore';

interface ColumnHeaderProps {
  colIndex: number;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({ colIndex }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  
  const columnWidths = useSpreadsheetStore(state => state.columnWidths);
  const resizeColumn = useSpreadsheetStore(state => state.resizeColumn);
  const addColumn = useSpreadsheetStore(state => state.addColumn);
  const deleteColumn = useSpreadsheetStore(state => state.deleteColumn);
  
  const colLetter = String.fromCharCode(65 + colIndex);
  const width = columnWidths[colLetter] || 100;
  
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(width);
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  
  const handleResizeMove = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = Math.max(50, startWidth + (e.clientX - startX));
      resizeColumn(colIndex, newWidth);
    }
  };
  
  const handleResizeEnd = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
   
    const menu = document.getElementById('column-context-menu');
    if (menu) {
      menu.style.display = 'block';
      menu.style.left = `${e.clientX}px`;
      menu.style.top = `${e.clientY}px`;
      
      
      (menu as any).colIndex = colIndex;
    }
  };
  
  return (
    <div 
      className="bg-gray-200 border border-gray-300 flex items-center justify-center relative select-none"
      style={{ width: `${width}px`, height: '25px' }}
      onContextMenu={handleContextMenu}
    >
      {colLetter}
      <div
        className="absolute right-0 top-0 w-1 h-full cursor-col-resize"
        onMouseDown={handleResizeStart}
      />
    </div>
  );
};

export default ColumnHeader;