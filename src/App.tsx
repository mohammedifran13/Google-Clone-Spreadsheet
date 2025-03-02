import React from 'react';
import Toolbar from './components/Toolbar';
import FormulaBar from './components/FormulaBar';
import Spreadsheet from './components/Spreadsheet';
import ContextMenus from './components/ContextMenus';

function App() {
  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="bg-blue-600 text-white p-2 flex items-center">
        <h1 className="text-xl font-semibold">Google Sheets Clone</h1>
      </header>
      
      <Toolbar />
      <FormulaBar />
      
      <Spreadsheet />
      
      <ContextMenus />
    </div>
  );
}

export default App;