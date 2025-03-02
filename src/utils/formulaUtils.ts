import { Cell, CellValue } from '../types';
import { isNumeric } from './cellUtils';


export const evaluateFormula = (
  formula: string,
  cells: Record<string, Cell>,
  currentCellId: string
): CellValue => {
  
  const expression = formula.substring(1).trim();
  
  
  if (expression.includes('(') && expression.includes(')')) {
    const functionMatch = expression.match(/^([A-Z_]+)\((.*)\)$/);
    
    if (functionMatch) {
      const functionName = functionMatch[1];
      const args = parseArguments(functionMatch[2]);
      
      switch (functionName.toUpperCase()) {
        case 'SUM':
          return calculateSum(args, cells);
        case 'AVERAGE':
          return calculateAverage(args, cells);
        case 'MAX':
          return calculateMax(args, cells);
        case 'MIN':
          return calculateMin(args, cells);
        case 'COUNT':
          return calculateCount(args, cells);
        case 'TRIM':
          return applyTrim(args, cells);
        case 'UPPER':
          return applyUpper(args, cells);
        case 'LOWER':
          return applyLower(args, cells);
        default:
          return `#ERROR: Unknown function ${functionName}`;
      }
    }
  }
  
  
  try {
    
    const cellReferenceRegex = /[A-Z]+\d+/g;
    const cellReferences = expression.match(cellReferenceRegex) || [];
    
    
    if (cellReferences.includes(currentCellId)) {
      return '#ERROR: Circular reference';
    }
    
    let evaluatedExpression = expression;
    
    for (const cellRef of cellReferences) {
      const cell = cells[cellRef];
      if (!cell) {
        evaluatedExpression = evaluatedExpression.replace(cellRef, '0');
      } else if (cell.type === 'formula') {
       
        const value = evaluateFormula(cell.formula || '', cells, currentCellId);
        evaluatedExpression = evaluatedExpression.replace(cellRef, String(value || 0));
      } else {
        evaluatedExpression = evaluatedExpression.replace(
          cellRef,
          isNumeric(cell.value) ? String(cell.value) : '0'
        );
      }
    }
    
    
    const result = eval(evaluatedExpression);
    return isNaN(result) ? '#ERROR: Invalid calculation' : result;
  } catch (error) {
    return `#ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};


const parseArguments = (argsString: string): string[] => {
  const args: string[] = [];
  let currentArg = '';
  let inQuotes = false;
  let parenCount = 0;
  
  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i];
    
    if (char === '"' && argsString[i - 1] !== '\\') {
      inQuotes = !inQuotes;
      currentArg += char;
    } else if (char === '(' && !inQuotes) {
      parenCount++;
      currentArg += char;
    } else if (char === ')' && !inQuotes) {
      parenCount--;
      currentArg += char;
    } else if (char === ',' && !inQuotes && parenCount === 0) {
      args.push(currentArg.trim());
      currentArg = '';
    } else {
      currentArg += char;
    }
  }
  
  if (currentArg.trim()) {
    args.push(currentArg.trim());
  }
  
  return args;
};


const parseRange = (range: string): string[] => {
  const parts = range.split(':');
  if (parts.length !== 2) {
    return [range]; 
  }
  
  const startCell = parts[0].trim();
  const endCell = parts[1].trim();
  
  
  const startMatch = startCell.match(/([A-Z]+)(\d+)/);
  if (!startMatch) return [range];
  
  const startCol = startMatch[1];
  const startRow = parseInt(startMatch[2], 10);
  
  
  const endMatch = endCell.match(/([A-Z]+)(\d+)/);
  if (!endMatch) return [range];
  
  const endCol = endMatch[1];
  const endRow = parseInt(endMatch[2], 10);
  
  
  const startColIndex = columnToIndex(startCol);
  const endColIndex = columnToIndex(endCol);
  
  
  const cells: string[] = [];
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startColIndex; col <= endColIndex; col++) {
      cells.push(`${indexToColumn(col)}${row}`);
    }
  }
  
  return cells;
};


const columnToIndex = (column: string): number => {
  let result = 0;
  for (let i = 0; i < column.length; i++) {
    result = result * 26 + (column.charCodeAt(i) - 64);
  }
  return result - 1;
};


const indexToColumn = (index: number): string => {
  let column = '';
  let temp = index;
  
  while (temp >= 0) {
    column = String.fromCharCode(65 + (temp % 26)) + column;
    temp = Math.floor(temp / 26) - 1;
  }
  
  return column;
};


const calculateSum = (args: string[], cells: Record<string, Cell>): number => {
  let sum = 0;
  
  for (const arg of args) {
    if (arg.includes(':')) {
      
      const rangeCells = parseRange(arg);
      for (const cellId of rangeCells) {
        const cell = cells[cellId];
        if (cell && isNumeric(cell.value)) {
          sum += Number(cell.value);
        }
      }
    } else {
      
      const cell = cells[arg];
      if (cell && isNumeric(cell.value)) {
        sum += Number(cell.value);
      }
    }
  }
  
  return sum;
};

const calculateAverage = (args: string[], cells: Record<string, Cell>): number => {
  let sum = 0;
  let count = 0;
  
  for (const arg of args) {
    if (arg.includes(':')) {
      
      const rangeCells = parseRange(arg);
      for (const cellId of rangeCells) {
        const cell = cells[cellId];
        if (cell && isNumeric(cell.value)) {
          sum += Number(cell.value);
          count++;
        }
      }
    } else {
     
      const cell = cells[arg];
      if (cell && isNumeric(cell.value)) {
        sum += Number(cell.value);
        count++;
      }
    }
  }
  
  return count > 0 ? sum / count : 0;
};

const calculateMax = (args: string[], cells: Record<string, Cell>): number => {
  let max = Number.NEGATIVE_INFINITY;
  let hasValue = false;
  
  for (const arg of args) {
    if (arg.includes(':')) {
     
      const rangeCells = parseRange(arg);
      for (const cellId of rangeCells) {
        const cell = cells[cellId];
        if (cell && isNumeric(cell.value)) {
          max = Math.max(max, Number(cell.value));
          hasValue = true;
        }
      }
    } else {
      
      const cell = cells[arg];
      if (cell && isNumeric(cell.value)) {
        max = Math.max(max, Number(cell.value));
        hasValue = true;
      }
    }
  }
  
  return hasValue ? max : 0;
};

const calculateMin = (args: string[], cells: Record<string, Cell>): number => {
  let min = Number.POSITIVE_INFINITY;
  let hasValue = false;
  
  for (const arg of args) {
    if (arg.includes(':')) {
      
      const rangeCells = parseRange(arg);
      for (const cellId of rangeCells) {
        const cell = cells[cellId];
        if (cell && isNumeric(cell.value)) {
          min = Math.min(min, Number(cell.value));
          hasValue = true;
        }
      }
    } else {
      
      const cell = cells[arg];
      if (cell && isNumeric(cell.value)) {
        min = Math.min(min, Number(cell.value));
        hasValue = true;
      }
    }
  }
  
  return hasValue ? min : 0;
};

const calculateCount = (args: string[], cells: Record<string, Cell>): number => {
  let count = 0;
  
  for (const arg of args) {
    if (arg.includes(':')) {
      
      const rangeCells = parseRange(arg);
      for (const cellId of rangeCells) {
        const cell = cells[cellId];
        if (cell && isNumeric(cell.value)) {
          count++;
        }
      }
    } else {
     
      const cell = cells[arg];
      if (cell && isNumeric(cell.value)) {
        count++;
      }
    }
  }
  
  return count;
};

const applyTrim = (args: string[], cells: Record<string, Cell>): string => {
  if (args.length === 0) return '';
  
  const cellId = args[0];
  const cell = cells[cellId];
  
  if (!cell || cell.value === null) return '';
  
  return String(cell.value).trim();
};

const applyUpper = (args: string[], cells: Record<string, Cell>): string => {
  if (args.length === 0) return '';
  
  const cellId = args[0];
  const cell = cells[cellId];
  
  if (!cell || cell.value === null) return '';
  
  return String(cell.value).toUpperCase();
};

const applyLower = (args: string[], cells: Record<string, Cell>): string => {
  if (args.length === 0) return '';
  
  const cellId = args[0];
  const cell = cells[cellId];
  
  if (!cell || cell.value === null) return '';
  
  return String(cell.value).toLowerCase();
};


export const findAndReplace = (
  range: string[],
  findText: string,
  replaceText: string,
  cells: Record<string, Cell>
): Record<string, Cell> => {
  const updatedCells = { ...cells };
  
  for (const cellId of range) {
    const cell = cells[cellId];
    if (cell && typeof cell.value === 'string') {
      const newValue = cell.value.replace(new RegExp(findText, 'g'), replaceText);
      updatedCells[cellId] = {
        ...cell,
        value: newValue
      };
    }
  }
  
  return updatedCells;
};


export const removeDuplicates = (
  range: string[],
  cells: Record<string, Cell>
): Record<string, Cell> => {
  
  const rowMap = new Map<number, string[]>();
  
  for (const cellId of range) {
    const match = cellId.match(/[A-Z]+(\d+)/);
    if (match) {
      const rowNum = parseInt(match[1], 10);
      if (!rowMap.has(rowNum)) {
        rowMap.set(rowNum, []);
      }
      rowMap.get(rowNum)?.push(cellId);
    }
  }
  
  
  const rowValues = new Map<string, number>();
  const duplicateRows = new Set<number>();
  
  for (const [rowNum, cellIds] of rowMap.entries()) {
    const rowValueArray = cellIds.map(cellId => {
      const cell = cells[cellId];
      return cell ? String(cell.value) : '';
    });
    
    const rowValueString = rowValueArray.join('|');
    
    if (rowValues.has(rowValueString)) {
      duplicateRows.add(rowNum);
    } else {
      rowValues.set(rowValueString, rowNum);
    }
  }
  
  
  const updatedCells = { ...cells };
  
  for (const rowNum of duplicateRows) {
    const cellIds = rowMap.get(rowNum) || [];
    for (const cellId of cellIds) {
      updatedCells[cellId] = {
        ...cells[cellId],
        value: null
      };
    }
  }
  
  return updatedCells;
};