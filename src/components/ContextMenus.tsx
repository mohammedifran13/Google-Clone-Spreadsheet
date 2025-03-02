import React from 'react';
import { useSpreadsheetStore } from '../store/spreadsheetStore';

const ContextMenus: React.FC = () => {
  const addRow = useSpreadsheetStore(state => state.addRow);
  const deleteRow = useSpreadsheetStore(state => state.deleteRow);
  const addColumn = useSpreadsheetStore(state => state.addColumn);
  const deleteColumn = useSpreadsheetStore(state => state.deleteColumn);
  
  const handleRowInsert = () => {
    const menu = document.getElementById('row-context-menu');
    if (menu) {
      const rowIndex = (menu as any).rowIndex;
      addRow(rowIndex);
      menu.style.display = 'none';
    }
  };
  
  const handleRowDelete = () => {
    const menu = document.getElementById('row-context-menu');
    if (menu) {
      const rowIndex = (menu as any).rowIndex;
      deleteRow(rowIndex);
      menu.style.display = 'none';
    }
  };
  
  const handleColumnInsert = () => {
    const menu = document.getElementById('column-context-menu');
    if (menu) {
      const colIndex = (menu as any).colIndex;
      addColumn(colIndex);
      menu.style.display = 'none';
    }
  };
  
  const handleColumnDelete = () => {
    const menu = document.getElementById('column-context-menu');
    if (menu) {
      const colIndex = (menu as any).colIndex;
      deleteColumn(colIndex);
      menu.style.display = 'none';
    }
  };
  
  
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const rowMenu = document.getElementById('row-context-menu');
      const colMenu = document.getElementById('column-context-menu');
      
      if (rowMenu && !rowMenu.contains(e.target as Node)) {
        rowMenu.style.display = 'none';
      }
      
      if (colMenu && !colMenu.contains(e.target as Node)) {
        colMenu.style.display = 'none';
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <>
      {/* Row Context Menu */}
      <div
        id="row-context-menu"
        className="fixed z-50 bg-white shadow-md rounded-md border border-gray-300 hidden"
        style={{ minWidth: '150px' }}
      >
        <div className="p-2 hover:bg-gray-100 cursor-pointer" onClick={handleRowInsert}>
          Insert row
        </div>
        <div className="p-2 hover:bg-gray-100 cursor-pointer" onClick={handleRowDelete}>
          Delete row
        </div>
      </div>
      
      {/* Column Context Menu */}
      <div
        id="column-context-menu"
        className="fixed z-50 bg-white shadow-md rounded-md border border-gray-300 hidden"
        style={{ minWidth: '150px' }}
      >
        <div className="p-2 hover:bg-gray-100 cursor-pointer" onClick={handleColumnInsert}>
          Insert column
        </div>
        <div className="p-2 hover:bg-gray-100 cursor-pointer" onClick={handleColumnDelete}>
          Delete column
        </div>
      </div>
    </>
  );
};

export default ContextMenus;