export type CellValue = string | number | null;

export type CellType = 'text' | 'number' | 'formula';

export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface Cell {
  id: string;
  value: CellValue;
  displayValue?: CellValue;
  type: CellType;
  format: CellFormat;
  formula?: string;
  dependencies?: string[];
}

export interface SpreadsheetData {
  cells: Record<string, Cell>;
  columnWidths: Record<string, number>;
  rowHeights: Record<string, number>;
  selectedCell: string | null;
  selectedRange: string[] | null;
  columnCount: number;
  rowCount: number;
}