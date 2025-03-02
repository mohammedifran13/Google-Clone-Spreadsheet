# Google Sheets Clone

A web application that closely mimics the user interface and core functionalities of Google Sheets, with a focus on mathematical and data quality functions, data entry, and key UI interactions.

## Features

### Spreadsheet Interface
- Google Sheets-like UI with toolbar, formula bar, and cell structure
- Drag functionality for cell selection
- Cell dependencies with formula evaluation
- Support for basic cell formatting (bold, italics, alignment)
- Add, delete, and resize rows and columns

### Mathematical Functions
- SUM: Calculates the sum of a range of cells
- AVERAGE: Calculates the average of a range of cells
- MAX: Returns the maximum value from a range of cells
- MIN: Returns the minimum value from a range of cells
- COUNT: Counts the number of cells containing numerical values in a range

### Data Quality Functions
- TRIM: Removes leading and trailing whitespace from a cell
- UPPER: Converts the text in a cell to uppercase
- LOWER: Converts the text in a cell to lowercase
- REMOVE_DUPLICATES: Removes duplicate rows from a selected range
- FIND_AND_REPLACE: Allows users to find and replace specific text within a range of cells

### Data Entry and Validation
- Support for various data types (numbers, text, formulas)
- Basic data validation for numeric cells

### Additional Features
- Save and load spreadsheets to/from local storage

## Tech Stack and Data Structures

### Tech Stack
- **React**: For building the user interface components
- **TypeScript**: For type safety and better developer experience
- **Zustand**: For state management
- **Immer**: For immutable state updates
- **Tailwind CSS**: For styling
- **Lucide React**: For icons

### Data Structures

#### Cell Model
The application uses a cell-based data model where each cell is represented as an object with the following properties:
```typescript
interface Cell {
  id: string;         // Unique identifier (e.g., "A1")
  value: CellValue;   // Raw value entered by the user
  displayValue?: CellValue; // Calculated value for display
  type: CellType;     // 'text', 'number', or 'formula'
  format: CellFormat; // Formatting options
  formula?: string;   // Formula string if type is 'formula'
  dependencies?: string[]; // Cells this cell depends on
}
```

#### Spreadsheet State
The spreadsheet state is managed using Zustand and includes:
```typescript
interface SpreadsheetData {
  cells: Record<string, Cell>; // Map of cell IDs to cell objects
  columnWidths: Record<string, number>; // Map of column IDs to widths
  rowHeights: Record<string, number>; // Map of row IDs to heights
  selectedCell: string | null; // Currently selected cell
  selectedRange: string[] | null; // Currently selected range of cells
  columnCount: number; // Number of columns
  rowCount: number; // Number of rows
}
```

### Formula Evaluation
Formulas are evaluated using a recursive approach:
1. Parse the formula to identify function calls and cell references
2. For cell references, retrieve their values
3. For nested formulas, recursively evaluate them
4. Apply the appropriate function to the values
5. Return the result

### Cell Dependencies
When a cell's value changes, all dependent cells (cells that reference it in their formulas) are automatically recalculated to ensure data consistency.

### Performance Considerations
- Only visible cells are rendered to improve performance
- Cell evaluation is optimized to avoid unnecessary recalculations
- Memoization is used to cache calculated values where appropriate

## Security Considerations

- Formula evaluation uses a controlled environment to prevent code injection
- Input validation is applied to all user inputs
- Local storage is used for data persistence, with appropriate error handling

## Future Enhancements

- Support for more complex formulas and cell referencing
- Enhanced data visualization capabilities (charts, graphs)
- Collaborative editing features
- Cloud storage integration
- More advanced formatting options