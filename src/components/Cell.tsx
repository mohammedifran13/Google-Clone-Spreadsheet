import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Cell as CellType } from '../types';
import { useSpreadsheetStore } from '../store/spreadsheetStore';

interface CellProps {
  cellId: string;
  rowIndex: number;
  colIndex: number;
  isSelected: boolean;
  isInRange: boolean;
}

const Cell: React.FC<CellProps> = ({ 
  cellId, 
  rowIndex, 
  colIndex, 
  isSelected, 
  isInRange 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const cell = useSpreadsheetStore(state => state.cells[cellId]) as CellType | undefined;
  const setCellValue = useSpreadsheetStore(state => state.setCellValue);
  const selectCell = useSpreadsheetStore(state => state.selectCell);
  const selectRange = useSpreadsheetStore(state => state.selectRange);
  const selectedCell = useSpreadsheetStore(state => state.selectedCell);
  
  const columnWidths = useSpreadsheetStore(state => state.columnWidths);
  const rowHeights = useSpreadsheetStore(state => state.rowHeights);
  
  const colLetter = String.fromCharCode(65 + colIndex);
  const width = columnWidths[colLetter] || 100;
  const height = rowHeights[rowIndex.toString()] || 25;
  
  
  const [isDragging, setIsDragging] = useState(false);
  
  useEffect(() => {
    if (isSelected && !isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSelected, isEditing]);
  
  useEffect(() => {
    if (cell && isSelected) {
      setInputValue(cell.value !== null ? String(cell.value) : '');
    }
  }, [cell, isSelected]);
  
  const handleDoubleClick = () => {
    setIsEditing(true);
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (!isEditing) {
      selectCell(cellId);
      
      
      setIsDragging(true);
      
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && selectedCell) {
      
      const element = document.elementFromPoint(e.clientX, e.clientY);
      const cellElement = element?.closest('[data-cell-id]');
      
      if (cellElement) {
        const targetCellId = cellElement.getAttribute('data-cell-id');
        if (targetCellId && targetCellId !== selectedCell) {
          selectRange(selectedCell, targetCellId);
        }
      }
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  const handleBlur = () => {
    if (isEditing) {
      setIsEditing(false);
      setCellValue(cellId, inputValue);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      setCellValue(cellId, inputValue);
      
      
      const nextRowIndex = rowIndex + 1;
      const nextCellId = `${colLetter}${nextRowIndex + 1}`;
      selectCell(nextCellId);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(cell?.value !== null ? String(cell.value) : '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setIsEditing(false);
      setCellValue(cellId, inputValue);
      
      
      const nextColIndex = colIndex + (e.shiftKey ? -1 : 1);
      if (nextColIndex >= 0) {
        const nextColLetter = String.fromCharCode(65 + nextColIndex);
        const nextCellId = `${nextColLetter}${rowIndex + 1}`;
        selectCell(nextCellId);
      }
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  
  const cellStyle = {
    width: `${width}px`,
    height: `${height}px`,
    fontWeight: cell?.format?.bold ? 'bold' : 'normal',
    fontStyle: cell?.format?.italic ? 'italic' : 'normal',
    fontSize: cell?.format?.fontSize ? `${cell.format.fontSize}px` : 'inherit',
    color: cell?.format?.color || 'inherit',
    backgroundColor: cell?.format?.backgroundColor || 'inherit',
    textAlign: cell?.format?.textAlign || 'left',
  };
  
  return (
    <div
      className={classNames(
        'border border-gray-300 overflow-hidden relative',
        {
          'bg-blue-100': isSelected,
          'bg-blue-50': isInRange && !isSelected,
          'z-10': isSelected || isEditing,
        }
      )}
      style={cellStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      data-cell-id={cellId}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="w-full h-full px-1 outline-none"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <div className="w-full h-full px-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {cell?.displayValue !== undefined ? cell.displayValue : cell?.value}
        </div>
      )}
    </div>
  );
};

export default Cell;