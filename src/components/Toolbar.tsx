import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Plus,
  Minus,
  Save,
  Upload,
  Search,
  Trash2,
  Calculator
} from 'lucide-react';
import { useSpreadsheetStore } from '../store/spreadsheetStore';

const Toolbar: React.FC = () => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showFunctionDialog, setShowFunctionDialog] = useState(false);
  const [functionType, setFunctionType] = useState<string>('');
  const [functionRange, setFunctionRange] = useState<string>('');
  
  const selectedCell = useSpreadsheetStore(state => state.selectedCell);
  const selectedRange = useSpreadsheetStore(state => state.selectedRange);
  const setCellFormat = useSpreadsheetStore(state => state.setCellFormat);
  const saveSpreadsheet = useSpreadsheetStore(state => state.saveSpreadsheet);
  const clearSpreadsheet = useSpreadsheetStore(state => state.clearSpreadsheet);
  const loadSpreadsheet = useSpreadsheetStore(state => state.loadSpreadsheet);
  const applyFindAndReplace = useSpreadsheetStore(state => state.applyFindAndReplace);
  const applyRemoveDuplicates = useSpreadsheetStore(state => state.applyRemoveDuplicates);
  
 
  const applySum = useSpreadsheetStore(state => state.applySum);
  const applyAverage = useSpreadsheetStore(state => state.applyAverage);
  const applyMax = useSpreadsheetStore(state => state.applyMax);
  const applyMin = useSpreadsheetStore(state => state.applyMin);
  const applyCount = useSpreadsheetStore(state => state.applyCount);
  const applyTrim = useSpreadsheetStore(state => state.applyTrim);
  const applyUpper = useSpreadsheetStore(state => state.applyUpper);
  const applyLower = useSpreadsheetStore(state => state.applyLower);
  
  const handleBold = () => {
    if (selectedCell) {
      setCellFormat(selectedCell, { bold: true });
    }
  };
  
  const handleItalic = () => {
    if (selectedCell) {
      setCellFormat(selectedCell, { italic: true });
    }
  };
  
  const handleAlign = (align: 'left' | 'center' | 'right') => {
    if (selectedCell) {
      setCellFormat(selectedCell, { textAlign: align });
    }
  };
  
  const handleSave = () => {
    saveSpreadsheet();
    alert('Spreadsheet saved to local storage');
  };
  
  const handleLoad = () => {
    try {
      const savedData = localStorage.getItem('spreadsheet');
      if (savedData) {
        const data = JSON.parse(savedData);
        loadSpreadsheet(data);
        alert('Spreadsheet loaded from local storage');
      } else {
        alert('No saved spreadsheet found');
      }
    } catch (error) {
      console.error('Failed to load spreadsheet:', error);
      alert('Failed to load spreadsheet');
    }
  };
  
  const handleClear = () => {
    if (confirm('Are you sure you want to clear the spreadsheet?')) {
      clearSpreadsheet();
    }
  };
  
  const handleFindReplace = () => {
    if (selectedRange && findText) {
      applyFindAndReplace(findText, replaceText);
      setShowFindReplace(false);
      setFindText('');
      setReplaceText('');
    } else {
      alert('Please select a range and enter text to find');
    }
  };
  
  const handleRemoveDuplicates = () => {
    if (selectedRange) {
      applyRemoveDuplicates();
    } else {
      alert('Please select a range to remove duplicates from');
    }
  };
  
  const handleApplyFunction = () => {
    if (!selectedCell) {
      alert('Please select a cell to apply the function to');
      return;
    }
    
    if (!functionRange) {
      alert('Please enter a cell range (e.g., A1:B5)');
      return;
    }
    
    switch (functionType) {
      case 'SUM':
        applySum(functionRange);
        break;
      case 'AVERAGE':
        applyAverage(functionRange);
        break;
      case 'MAX':
        applyMax(functionRange);
        break;
      case 'MIN':
        applyMin(functionRange);
        break;
      case 'COUNT':
        applyCount(functionRange);
        break;
      case 'TRIM':
        applyTrim(functionRange);
        break;
      case 'UPPER':
        applyUpper(functionRange);
        break;
      case 'LOWER':
        applyLower(functionRange);
        break;
      default:
        alert('Please select a function type');
        return;
    }
    
    setShowFunctionDialog(false);
    setFunctionType('');
    setFunctionRange('');
  };
  
  return (
    <div className="bg-gray-100 border-b border-gray-300 p-2 flex items-center space-x-2">
      {/* Formatting Tools */}
      <div className="flex space-x-1 border-r border-gray-300 pr-2">
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={handleBold}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={handleItalic}
          title="Italic"
        >
          <Italic size={16} />
        </button>
      </div>
      
      {/* Alignment Tools */}
      <div className="flex space-x-1 border-r border-gray-300 pr-2">
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={() => handleAlign('left')}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={() => handleAlign('center')}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={() => handleAlign('right')}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>
      
      {/* Functions */}
      <div className="flex space-x-1 border-r border-gray-300 pr-2">
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={() => setShowFunctionDialog(true)}
          title="Insert Function"
        >
          <Calculator size={16} />
          <span className="ml-1">Functions</span>
        </button>
      </div>
      
      {/* Data Tools */}
      <div className="flex space-x-1 border-r border-gray-300 pr-2">
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={() => setShowFindReplace(true)}
          title="Find and Replace"
        >
          <Search size={16} />
          <span className="ml-1">Find & Replace</span>
        </button>
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={handleRemoveDuplicates}
          title="Remove Duplicates"
        >
          <Minus size={16} />
          <span className="ml-1">Remove Duplicates</span>
        </button>
      </div>
      
      {/* Spreadsheet Actions */}
      <div className="flex space-x-1">
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={handleSave}
          title="Save Spreadsheet"
        >
          <Save size={16} />
          <span className="ml-1">Save</span>
        </button>
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={handleLoad}
          title="Load Spreadsheet"
        >
          <Upload size={16} />
          <span className="ml-1">Load</span>
        </button>
        <button 
          className="p-1 hover:bg-gray-200 rounded"
          onClick={handleClear}
          title="Clear Spreadsheet"
        >
          <Trash2 size={16} />
          <span className="ml-1">Clear</span>
        </button>
      </div>
      
      {/* Find and Replace Dialog */}
      {showFindReplace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Find and Replace</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Find:</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Replace with:</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setShowFindReplace(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleFindReplace}
              >
                Replace
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Function Dialog */}
      {showFunctionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Function</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Function:</label>
              <select
                className="w-full border border-gray-300 rounded p-2"
                value={functionType}
                onChange={(e) => setFunctionType(e.target.value)}
              >
                <option value="">Select a function</option>
                <optgroup label="Mathematical Functions">
                  <option value="SUM">SUM</option>
                  <option value="AVERAGE">AVERAGE</option>
                  <option value="MAX">MAX</option>
                  <option value="MIN">MIN</option>
                  <option value="COUNT">COUNT</option>
                </optgroup>
                <optgroup label="Data Quality Functions">
                  <option value="TRIM">TRIM</option>
                  <option value="UPPER">UPPER</option>
                  <option value="LOWER">LOWER</option>
                </optgroup>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Range or Cell:</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                value={functionRange}
                onChange={(e) => setFunctionRange(e.target.value)}
                placeholder="e.g., A1:B5 or A1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setShowFunctionDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleApplyFunction}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;