import React, { useState } from 'react';
import { useSpreadsheetStore } from '../store/spreadsheetStore';

interface RowHeaderProps {
  rowIndex: number;
}

const RowHeader: React.FC<RowHeaderProps> = ({ rowIndex }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  
  const rowHeights = useSpreadsheetStore(state => state.rowHeights);
  const resizeRow = useSpreadsheetStore(state => state.resizeRow);
  const addRow = useSpreadsheetStore(state => state.addRow);
  const deleteRow = useSpreadsheetStore(state => state.deleteRow);
  
  const height = rowHeights[rowIndex.toString()] || 25;
  
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setStartY(e.clientY);
    setStartHeight(height);
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  
  const handleResizeMove = (e: MouseEvent) => {
    if (isResizing) {
      const newHeight = Math.max(20, startHeight + (e.clientY - startY));
      resizeRow(rowIndex, newHeight);
    }
  };
  
  const handleResizeEnd = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    
    const menu = document.getElementById('row-context-menu');
    if (menu) {
      menu.style.display = 'block';
      menu.style.left = `${e.clientX}px`;
      menu.style.top = `${e.clientY}px`;
      
      
      (menu as any).rowIndex = rowIndex;
    }
  };
  
  return (
    <div 
      className="bg-gray-200 border border-gray-300 flex items-center justify-center relative select-none"
      style={{ width: '50px', height: `${height}px` }}
      onContextMenu={handleContextMenu}
    >
      {rowIndex + 1}
      <div
        className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize"
        onMouseDown={handleResizeStart}
      />
    </div>
  );
};

export default RowHeader;