import * as XLSX from 'xlsx';
import { WorkbookConfig, CellDefinition } from './formula-engine';

export interface ParsedExcelData {
  workbookConfig: WorkbookConfig;
  preview: any[][];
}

/**
 * Parse Excel file and extract structure, formulas, and values
 */
export class ExcelParser {
  static parseFile(buffer: Buffer, workbookName: string = 'Uploaded Workbook'): ParsedExcelData {
    // Read the Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer', cellFormula: true });
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get the range of the sheet
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    const cells: CellDefinition[] = [];
    const preview: any[][] = [];
    
    // Determine dimensions
    const rows = range.e.r + 1;
    const cols = range.e.c + 1;
    
    // Parse each cell
    for (let R = range.s.r; R <= range.e.r; R++) {
      const previewRow: any[] = [];
      
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        
        if (cell) {
          const address = this.convertToExcelAddress(R, C);
          
          // Skip cells with errors or complex objects (like chart data)
          if (cell.t === 'e' || (typeof cell.v === 'object' && cell.v !== null)) {
            // Error cell or complex object - skip it
            previewRow.push({ value: '', type: 'empty' });
            continue;
          }
          
          // Check if cell has a formula
          if (cell.f) {
            // Formula cell - not editable by user
            const cellValue = this.sanitizeValue(cell.v);
            cells.push({
              address,
              formula: `=${cell.f}`,
              isInput: false,
              label: `${address} Formula`,
            });
            previewRow.push({ value: cellValue, formula: cell.f, type: 'formula' });
          } else if (typeof cell.v === 'number') {
            // Numeric value - could be input
            cells.push({
              address,
              value: cell.v,
              isInput: true, // Default to input, admin can change
              label: `${address} Value`,
            });
            previewRow.push({ value: cell.v, type: 'number' });
          } else if (typeof cell.v === 'string') {
            // Text value - usually a label
            cells.push({
              address,
              value: cell.v,
              isInput: false,
              label: `${address} Label`,
            });
            previewRow.push({ value: cell.v, type: 'text' });
          } else if (typeof cell.v === 'boolean') {
            // Boolean value
            cells.push({
              address,
              value: cell.v,
              isInput: false,
              label: `${address} Boolean`,
            });
            previewRow.push({ value: cell.v.toString(), type: 'boolean' });
          } else {
            // Skip unknown types
            previewRow.push({ value: '', type: 'empty' });
          }
        } else {
          // Empty cell
          previewRow.push({ value: '', type: 'empty' });
        }
      }
      preview.push(previewRow);
    }
    
    const workbookConfig: WorkbookConfig = {
      name: workbookName,
      description: `Imported from Excel file: ${sheetName}`,
      rows,
      cols,
      cells,
    };
    
    return {
      workbookConfig,
      preview,
    };
  }
  
  /**
   * Sanitize cell value to ensure it's a primitive type
   */
  private static sanitizeValue(value: any): string | number | boolean {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      // Convert objects to empty string (e.g., chart data, errors)
      return '';
    }
    if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
      return value;
    }
    return String(value);
  }

  /**
   * Convert row/col indices to Excel address (0,0 -> A1)
   */
  private static convertToExcelAddress(row: number, col: number): string {
    let colStr = '';
    let c = col;
    
    while (c >= 0) {
      colStr = String.fromCharCode((c % 26) + 65) + colStr;
      c = Math.floor(c / 26) - 1;
    }
    
    return `${colStr}${row + 1}`;
  }
  
  /**
   * Update cell configuration (mark as input/output)
   */
  static updateCellConfig(
    config: WorkbookConfig,
    cellAddress: string,
    isInput: boolean
  ): WorkbookConfig {
    const updatedCells = config.cells.map(cell => {
      if (cell.address === cellAddress) {
        return { ...cell, isInput };
      }
      return cell;
    });
    
    return {
      ...config,
      cells: updatedCells,
    };
  }
}
