import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Cell, CellFormat, CellType, CellValue, SpreadsheetData } from '../types';
import { createEmptyCell, getCellId, getCellRange, isNumeric } from '../utils/cellUtils';
import { evaluateFormula, findAndReplace, removeDuplicates } from '../utils/formulaUtils';

const DEFAULT_COLUMN_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 25;
const DEFAULT_COLUMN_COUNT = 26; // A to Z
const DEFAULT_ROW_COUNT = 100;


const initializeSpreadsheet = (): SpreadsheetData => {
  const cells: Record<string, Cell> = {};
  const columnWidths: Record<string, number> = {};
  const rowHeights: Record<string, number> = {};
  
  
  for (let col = 0; col < DEFAULT_COLUMN_COUNT; col++) {
    const colLetter = String.fromCharCode(65 + col);
    columnWidths[colLetter] = DEFAULT_COLUMN_WIDTH;
  }
  
  
  for (let row = 0; row < DEFAULT_ROW_COUNT; row++) {
    rowHeights[row.toString()] = DEFAULT_ROW_HEIGHT;
  }
  
  return {
    cells,
    columnWidths,
    rowHeights,
    selectedCell: null,
    selectedRange: null,
    columnCount: DEFAULT_COLUMN_COUNT,
    rowCount: DEFAULT_ROW_COUNT,
  };
};

export const useSpreadsheetStore = create(
  immer<SpreadsheetData & {
    
    setCellValue: (cellId: string, value: CellValue) => void;
    setCellFormat: (cellId: string, format: Partial<CellFormat>) => void;
    setCellType: (cellId: string, type: CellType) => void;
    setCellFormula: (cellId: string, formula: string) => void;
    
    
    selectCell: (cellId: string) => void;
    selectRange: (startCellId: string, endCellId: string) => void;
    clearSelection: () => void;
    
    
    addRow: (afterRow: number) => void;
    deleteRow: (rowIndex: number) => void;
    addColumn: (afterColumn: number) => void;
    deleteColumn: (columnIndex: number) => void;
    resizeColumn: (columnIndex: number, width: number) => void;
    resizeRow: (rowIndex: number, height: number) => void;
    
    
    applySum: (range: string) => void;
    applyAverage: (range: string) => void;
    applyMax: (range: string) => void;
    applyMin: (range: string) => void;
    applyCount: (range: string) => void;
    applyTrim: (cellId: string) => void;
    applyUpper: (cellId: string) => void;
    applyLower: (cellId: string) => void;
    applyFindAndReplace: (findText: string, replaceText: string) => void;
    applyRemoveDuplicates: () => void;
    
    
    clearSpreadsheet: () => void;
    saveSpreadsheet: () => void;
    loadSpreadsheet: (data: SpreadsheetData) => void;
  }>((set, get) => ({
    ...initializeSpreadsheet(),
    
    
    setCellValue: (cellId, value) => {
      set(state => {
        
        if (!state.cells[cellId]) {
          state.cells[cellId] = createEmptyCell(cellId);
        }
        
        
        state.cells[cellId].value = value;
        
        
        if (typeof value === 'string' && value.startsWith('=')) {
          state.cells[cellId].type = 'formula';
          state.cells[cellId].formula = value;
          
         
          const result = evaluateFormula(value, state.cells, cellId);
          state.cells[cellId].displayValue = result;
        } else if (isNumeric(value)) {
          state.cells[cellId].type = 'number';
          state.cells[cellId].displayValue = value;
        } else {
          state.cells[cellId].type = 'text';
          state.cells[cellId].displayValue = value;
        }
        
        
        updateDependentCells(state.cells, cellId);
      });
    },
    
    setCellFormat: (cellId, format) => {
      set(state => {
        
        if (!state.cells[cellId]) {
          state.cells[cellId] = createEmptyCell(cellId);
        }
        
       
        state.cells[cellId].format = {
          ...state.cells[cellId].format,
          ...format
        };
      });
    },
    
    setCellType: (cellId, type) => {
      set(state => {
       
        if (!state.cells[cellId]) {
          state.cells[cellId] = createEmptyCell(cellId);
        }
        
        
        state.cells[cellId].type = type;
      });
    },
    
    setCellFormula: (cellId, formula) => {
      set(state => {
        
        if (!state.cells[cellId]) {
          state.cells[cellId] = createEmptyCell(cellId);
        }
        
        
        state.cells[cellId].formula = formula;
        state.cells[cellId].type = 'formula';
        
        
        const result = evaluateFormula(formula, state.cells, cellId);
        state.cells[cellId].value = formula;
        state.cells[cellId].displayValue = result;
        
        
        updateDependentCells(state.cells, cellId);
      });
    },
    
    
    selectCell: (cellId) => {
      set(state => {
        state.selectedCell = cellId;
        state.selectedRange = null;
      });
    },
    
    selectRange: (startCellId, endCellId) => {
      set(state => {
        state.selectedCell = startCellId;
        state.selectedRange = getCellRange(startCellId, endCellId);
      });
    },
    
    clearSelection: () => {
      set(state => {
        state.selectedCell = null;
        state.selectedRange = null;
      });
    },
    
    
    addRow: (afterRow) => {
      set(state => {
        
        const newCells: Record<string, Cell> = {};
        
        
        for (const cellId in state.cells) {
          const match = cellId.match(/([A-Z]+)(\d+)/);
          if (!match) continue;
          
          const column = match[1];
          const row = parseInt(match[2], 10);
          
          if (row > afterRow) {
            
            const newCellId = `${column}${row + 1}`;
            newCells[newCellId] = {
              ...state.cells[cellId],
              id: newCellId
            };
          } else {
           
            newCells[cellId] = state.cells[cellId];
          }
        }
        
       
        for (let row = state.rowCount; row > afterRow; row--) {
          state.rowHeights[row.toString()] = state.rowHeights[(row - 1).toString()];
        }
        
        
        state.rowHeights[afterRow + 1] = DEFAULT_ROW_HEIGHT;
        
       
        state.cells = newCells;
        state.rowCount += 1;
      });
    },
    
    deleteRow: (rowIndex) => {
      set(state => {
        
        const newCells: Record<string, Cell> = {};
        
        
        for (const cellId in state.cells) {
          const match = cellId.match(/([A-Z]+)(\d+)/);
          if (!match) continue;
          
          const column = match[1];
          const row = parseInt(match[2], 10);
          
          if (row === rowIndex + 1) {
            
            continue;
          } else if (row > rowIndex + 1) {
           
            const newCellId = `${column}${row - 1}`;
            newCells[newCellId] = {
              ...state.cells[cellId],
              id: newCellId
            };
          } else {
            
            newCells[cellId] = state.cells[cellId];
          }
        }
        
        
        for (let row = rowIndex + 1; row < state.rowCount; row++) {
          state.rowHeights[row.toString()] = state.rowHeights[(row + 1).toString()];
        }
        
        
        delete state.rowHeights[(state.rowCount - 1).toString()];
        
        
        state.cells = newCells;
        state.rowCount -= 1;
      });
    },
    
    addColumn: (afterColumn) => {
      set(state => {
        
        const newCells: Record<string, Cell> = {};
        
        
        for (const cellId in state.cells) {
          const match = cellId.match(/([A-Z]+)(\d+)/);
          if (!match) continue;
          
          const column = match[1];
          const row = match[2];
          const colIndex = column.charCodeAt(0) - 65;
          
          if (colIndex > afterColumn) {
            
            const newColumn = String.fromCharCode(colIndex + 1 + 65);
            const newCellId = `${newColumn}${row}`;
            newCells[newCellId] = {
              ...state.cells[cellId],
              id: newCellId
            };
          } else {
            
            newCells[cellId] = state.cells[cellId];
          }
        }
        
       
        for (let col = state.columnCount - 1; col > afterColumn; col--) {
          const colLetter = String.fromCharCode(65 + col);
          const prevColLetter = String.fromCharCode(65 + col - 1);
          state.columnWidths[colLetter] = state.columnWidths[prevColLetter];
        }
        
        
        const newColLetter = String.fromCharCode(65 + afterColumn + 1);
        state.columnWidths[newColLetter] = DEFAULT_COLUMN_WIDTH;
        
        
        state.cells = newCells;
        state.columnCount += 1;
      });
    },
    
    deleteColumn: (columnIndex) => {
      set(state => {
        
        const newCells: Record<string, Cell> = {};
        
        
        for (const cellId in state.cells) {
          const match = cellId.match(/([A-Z]+)(\d+)/);
          if (!match) continue;
          
          const column = match[1];
          const row = match[2];
          const colIndex = column.charCodeAt(0) - 65;
          
          if (colIndex === columnIndex) {
            
            continue;
          } else if (colIndex > columnIndex) {
            
            const newColumn = String.fromCharCode(colIndex - 1 + 65);
            const newCellId = `${newColumn}${row}`;
            newCells[newCellId] = {
              ...state.cells[cellId],
              id: newCellId
            };
          } else {
            
            newCells[cellId] = state.cells[cellId];
          }
        }
        
        
        for (let col = columnIndex; col < state.columnCount - 1; col++) {
          const colLetter = String.fromCharCode(65 + col);
          const nextColLetter = String.fromCharCode(65 + col + 1);
          state.columnWidths[colLetter] = state.columnWidths[nextColLetter];
        }
        
        
        const lastColLetter = String.fromCharCode(65 + state.columnCount - 1);
        delete state.columnWidths[lastColLetter];
        
        
        state.cells = newCells;
        state.columnCount -= 1;
      });
    },
    
    resizeColumn: (columnIndex, width) => {
      set(state => {
        const colLetter = String.fromCharCode(65 + columnIndex);
        state.columnWidths[colLetter] = width;
      });
    },
    
    resizeRow: (rowIndex, height) => {
      set(state => {
        state.rowHeights[rowIndex.toString()] = height;
      });
    },
    
    
    applySum: (range) => {
      const { selectedCell } = get();
      if (!selectedCell) return;
      
      const formula = `=SUM(${range})`;
      get().setCellFormula(selectedCell, formula);
    },
    
    applyAverage: (range) => {
      const { selectedCell } = get();
      if (!selectedCell) return;
      
      const formula = `=AVERAGE(${range})`;
      get().setCellFormula(selectedCell, formula);
    },
    
    applyMax: (range) => {
      const { selectedCell } = get();
      if (!selectedCell) return;
      
      const formula = `=MAX(${range})`;
      get().setCellFormula(selectedCell, formula);
    },
    
    applyMin: (range) => {
      const { selectedCell } = get();
      if (!selectedCell) return;
      
      const formula = `=MIN(${range})`;
      get().setCellFormula(selectedCell, formula);
    },
    
    applyCount: (range) => {
      const { selectedCell } = get();
      if (!selectedCell) return;
      
      const formula = `=COUNT(${range})`;
      get().setCellFormula(selectedCell, formula);
    },
    
    applyTrim: (cellId) => {
      const { selectedCell } = get();
      if (!selectedCell) return;
      
      const formula = `=TRIM(${cellId})`;
      get().setCellFormula(selectedCell, formula);
    },
    
    applyUpper: (cellId) => {
      const { selectedCell } = get();
      if (!selectedCell) return;
      
      const formula = `=UPPER(${cellId})`;
      get().setCellFormula(selectedCell, formula);
    },
    
    applyLower: (cellId) => {
      const { selectedCell } = get();
      if (!selectedCell) return;
      
      const formula = `=LOWER(${cellId})`;
      get().setCellFormula(selectedCell, formula);
    },
    
    applyFindAndReplace: (findText, replaceText) => {
      set(state => {
        if (!state.selectedRange) return;
        
        state.cells = findAndReplace(
          state.selectedRange,
          findText,
          replaceText,
          state.cells
        );
      });
    },
    
    applyRemoveDuplicates: () => {
      set(state => {
        if (!state.selectedRange) return;
        
        state.cells = removeDuplicates(
          state.selectedRange,
          state.cells
        );
      });
    },
    
    
    clearSpreadsheet: () => {
      set(() => initializeSpreadsheet());
    },
    
    saveSpreadsheet: () => {
      const data = get();
      const { setCellValue, setCellFormat, ...spreadsheetData } = data;
      
      try {
        localStorage.setItem('spreadsheet', JSON.stringify(spreadsheetData));
      } catch (error) {
        console.error('Failed to save spreadsheet:', error);
      }
    },
    
    loadSpreadsheet: (data) => {
      set(() => ({
        ...data
      }));
    }
  }))
);


const updateDependentCells = (cells: Record<string, Cell>, changedCellId: string) => {
  
  for (const cellId in cells) {
    const cell = cells[cellId];
    
    if (cell.type === 'formula' && cell.formula) {
      
      if (cell.formula.includes(changedCellId)) {
       
        const result = evaluateFormula(cell.formula, cells, cellId);
        cells[cellId].displayValue = result;
        
        
        updateDependentCells(cells, cellId);
      }
    }
  }
};