import React, { useState, useEffect } from 'react';
import { useSpreadsheetStore } from '../store/spreadsheetStore';

const FormulaBar: React.FC = () => {
  const [formula, setFormula] = useState('');
  
  const selectedCell = useSpreadsheetStore(state => state.selectedCell);
  const cells = useSpreadsheetStore(state => state.cells);
  const setCellValue = useSpreadsheetStore(state => state.setCellValue);
  
 
  useEffect(() => {
    if (selectedCell && cells[selectedCell]) {
      setFormula(cells[selectedCell].value !== null ? String(cells[selectedCell].value) : '');
    } else {
      setFormula('');
    }
  }, [selectedCell, cells]);
  
  const handleFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormula(e.target.value);
  };
  
  const handleFormulaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCell) {
      setCellValue(selectedCell, formula);
    }
  };
  
  return (
    <div className="bg-white border-b border-gray-300 p-2 flex items-center">
      <div className="w-16 text-gray-600 font-medium">
        {selectedCell || ''}
      </div>
      <form onSubmit={handleFormulaSubmit} className="flex-1">
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-2 py-1"
          value={formula}
          onChange={handleFormulaChange}
          placeholder="Enter a value or formula (e.g., =SUM(A1:A5))"
          disabled={!selectedCell}
        />
      </form>
    </div>
  );
};

export default FormulaBar;