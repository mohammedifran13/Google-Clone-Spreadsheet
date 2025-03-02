import React from 'react';
import Cell from './Cell';
import ColumnHeader from './ColumnHeader';
import RowHeader from './RowHeader';
import { useSpreadsheetStore } from '../store/spreadsheetStore';
import { getCellId } from '../utils/cellUtils';

const Spreadsheet: React.FC = () => {
  const columnCount = useSpreadsheetStore(state => state.columnCount);
  const rowCount = useSpreadsheetStore(state => state.rowCount);
  const selectedCell = useSpreadsheetStore(state => state.selectedCell);
  const selectedRange = useSpreadsheetStore(state => state.selectedRange);
  
  
  const columnHeaders = Array.from({ length: columnCount }, (_, i) => (
    <ColumnHeader key={`col-${i}`} colIndex={i} />
  ));
  
  
  const rows = Array.from({ length: rowCount }, (_, rowIndex) => {
    const cells = Array.from({ length: columnCount }, (_, colIndex) => {
      const cellId = getCellId(rowIndex, colIndex);
      const isSelected = cellId === selectedCell;
      const isInRange = selectedRange ? selectedRange.includes(cellId) : false;
      
      return (
        <Cell
          key={cellId}
          cellId={cellId}
          rowIndex={rowIndex}
          colIndex={colIndex}
          isSelected={isSelected}
          isInRange={isInRange}
        />
      );
    });
    
    return (
      <div key={`row-${rowIndex}`} className="flex">
        <RowHeader rowIndex={rowIndex} />
        {cells}
      </div>
    );
  });
  
  return (
    <div className="overflow-auto flex-1">
      <div className="inline-block">
        {/* Corner cell */}
        <div className="flex">
          <div className="bg-gray-200 border border-gray-300" style={{ width: '50px', height: '25px' }} />
          {columnHeaders}
        </div>
        {rows}
      </div>
    </div>
  );
};

export default Spreadsheet;