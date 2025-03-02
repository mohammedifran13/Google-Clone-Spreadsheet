import { Cell, CellValue } from '../types';


export const indexToColumn = (index: number): string => {
  let column = '';
  let temp = index;
  
  while (temp >= 0) {
    column = String.fromCharCode(65 + (temp % 26)) + column;
    temp = Math.floor(temp / 26) - 1;
  }
  
  return column;
};


export const columnToIndex = (column: string): number => {
  let result = 0;
  
  for (let i = 0; i < column.length; i++) {
    result = result * 26 + (column.charCodeAt(i) - 64);
  }
  
  return result - 1;
};


export const getCellId = (rowIndex: number, colIndex: number): string => {
  return `${indexToColumn(colIndex)}${rowIndex + 1}`;
};


export const parseCellId = (cellId: string): { rowIndex: number; colIndex: number } => {
  const match = cellId.match(/([A-Z]+)(\d+)/);
  if (!match) {
    throw new Error(`Invalid cell ID: ${cellId}`);
  }
  
  const column = match[1];
  const row = parseInt(match[2], 10);
  
  return {
    rowIndex: row - 1,
    colIndex: columnToIndex(column)
  };
};


export const isNumeric = (value: CellValue): boolean => {
  if (value === null) return false;
  if (typeof value === 'number') return true;
  return !isNaN(Number(value)) && value.trim() !== '';
};


export const createEmptyCell = (cellId: string): Cell => {
  return {
    id: cellId,
    value: null,
    type: 'text',
    format: {},
  };
};


export const getCellRange = (startCellId: string, endCellId: string): string[] => {
  const start = parseCellId(startCellId);
  const end = parseCellId(endCellId);
  
  const startRow = Math.min(start.rowIndex, end.rowIndex);
  const endRow = Math.max(start.rowIndex, end.rowIndex);
  const startCol = Math.min(start.colIndex, end.colIndex);
  const endCol = Math.max(start.colIndex, end.colIndex);
  
  const range: string[] = [];
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      range.push(getCellId(row, col));
    }
  }
  
  return range;
};