import { HyperFormula } from 'hyperformula';

export interface CellDefinition {
  address: string; // e.g., "A1", "B2"
  formula?: string; // e.g., "=A1*2", "=SUM(A1:A10)"
  value?: any;
  isInput: boolean; // true if user can edit this cell
  label?: string; // Display label for the cell
}

export interface WorkbookConfig {
  name: string;
  description?: string;
  cells: CellDefinition[];
  rows: number;
  cols: number;
}

export class FormulaEngine {
  private hf: HyperFormula;
  private sheetId: number = 0;
  private config: WorkbookConfig;

  constructor(config: WorkbookConfig) {
    this.config = config;
    
    // Initialize HyperFormula with configuration
    this.hf = HyperFormula.buildEmpty({
      licenseKey: 'gpl-v3',
    });

    // Add a sheet
    const sheetName = this.hf.addSheet('Sheet1');
    this.sheetId = this.hf.getSheetId(sheetName) ?? 0;
    
    // Initialize the sheet with formulas and values
    this.initializeSheet();
  }

  private initializeSheet() {
    // Set up all cells with their formulas or initial values
    this.config.cells.forEach(cell => {
      const { row, col } = this.addressToRowCol(cell.address);
      
      if (cell.formula) {
        // Set formula
        this.hf.setCellContents(
          { sheet: this.sheetId, col, row },
          cell.formula
        );
      } else if (cell.value !== undefined) {
        // Set initial value
        this.hf.setCellContents(
          { sheet: this.sheetId, col, row },
          cell.value
        );
      }
    });
  }

  /**
   * Update user input values and recalculate
   */
  updateInputs(inputs: Record<string, any>): Record<string, any> {
    // Update only input cells
    Object.entries(inputs).forEach(([address, value]) => {
      const cell = this.config.cells.find(c => c.address === address);
      if (cell && cell.isInput) {
        const { row, col } = this.addressToRowCol(address);
        this.hf.setCellContents(
          { sheet: this.sheetId, col, row },
          value
        );
      }
    });

    // Return all calculated values
    return this.getAllValues();
  }

  /**
   * Get all cell values (both input and calculated)
   */
  getAllValues(): Record<string, any> {
    const values: Record<string, any> = {};
    
    this.config.cells.forEach(cell => {
      const { row, col } = this.addressToRowCol(cell.address);
      const cellValue = this.hf.getCellValue({ sheet: this.sheetId, col, row });
      
      // Sanitize value to prevent error objects
      if (cellValue === null || cellValue === undefined) {
        values[cell.address] = '';
      } else if (typeof cellValue === 'object') {
        // Convert error objects to string
        values[cell.address] = cellValue.value !== undefined ? String(cellValue.value) : '';
      } else {
        values[cell.address] = cellValue;
      }
    });

    return values;
  }

  /**
   * Get the spreadsheet data in a 2D array format for display
   */
  getSpreadsheetData(): any[][] {
    const data: any[][] = [];
    
    for (let row = 0; row < this.config.rows; row++) {
      const rowData: any[] = [];
      for (let col = 0; col < this.config.cols; col++) {
        const cellValue = this.hf.getCellValue({ sheet: this.sheetId, col, row });
        
        // Sanitize the value - convert error objects to strings
        let sanitizedValue: string | number | boolean = '';
        
        if (cellValue === null || cellValue === undefined) {
          sanitizedValue = '';
        } else if (typeof cellValue === 'object') {
          // HyperFormula returns error objects like {value: '#REF!', type: 'error', message: '...'}
          // Convert to string representation and log for debugging
          if (cellValue.value !== undefined) {
            sanitizedValue = String(cellValue.value);
            // Log error details for debugging
            if (cellValue.message) {
              const address = this.columnToLetter(col) + (row + 1);
              console.warn(`Cell error at ${address}:`, {
                error: cellValue.value,
                message: cellValue.message
              });
            }
          } else {
            sanitizedValue = '';
          }
        } else {
          sanitizedValue = cellValue;
        }
        
        rowData.push({ value: sanitizedValue });
      }
      data.push(rowData);
    }

    return data;
  }

  /**
   * Convert column index to letter (0 -> A, 1 -> B, 25 -> Z, 26 -> AA, etc.)
   */
  private columnToLetter(col: number): string {
    let result = '';
    let c = col;
    while (c >= 0) {
      result = String.fromCharCode((c % 26) + 65) + result;
      c = Math.floor(c / 26) - 1;
    }
    return result;
  }

  /**
   * Convert Excel address (e.g., "A1") to row/col indices
   */
  private addressToRowCol(address: string): { row: number; col: number } {
    const match = address.match(/^([A-Z]+)(\d+)$/);
    if (!match) throw new Error(`Invalid cell address: ${address}`);
    
    const colStr = match[1];
    const rowStr = match[2];
    
    // Convert column letters to number (A=0, B=1, ..., Z=25, AA=26, etc.)
    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
      col = col * 26 + (colStr.charCodeAt(i) - 65 + 1);
    }
    col -= 1; // Convert to 0-indexed
    
    const row = parseInt(rowStr) - 1; // Convert to 0-indexed
    
    return { row, col };
  }

  /**
   * Get cell metadata (whether it's editable, label, etc.)
   */
  getCellMetadata(): Map<string, CellDefinition> {
    const metadata = new Map<string, CellDefinition>();
    this.config.cells.forEach(cell => {
      metadata.set(cell.address, cell);
    });
    return metadata;
  }

  /**
   * Export configuration (without exposing formulas to client)
   */
  exportClientConfig() {
    return {
      name: this.config.name,
      description: this.config.description,
      rows: this.config.rows,
      cols: this.config.cols,
      cells: this.config.cells.map(cell => ({
        address: cell.address,
        isInput: cell.isInput,
        label: cell.label,
        value: cell.value,
        // Note: formula is NOT included for security
      })),
    };
  }
}

/**
 * Example workbook configuration
 * You would replace this with your actual Excel file's structure
 */
export const exampleWorkbookConfig: WorkbookConfig = {
  name: 'AutoCAD Design Calculator',
  description: 'Calculate design parameters for AutoCAD',
  rows: 20,
  cols: 10,
  cells: [
    // Input cells
    { address: 'A1', value: 'Length', isInput: false, label: 'Length Label' },
    { address: 'B1', value: 10, isInput: true, label: 'Length Value' },
    
    { address: 'A2', value: 'Width', isInput: false, label: 'Width Label' },
    { address: 'B2', value: 5, isInput: true, label: 'Width Value' },
    
    { address: 'A3', value: 'Height', isInput: false, label: 'Height Label' },
    { address: 'B3', value: 3, isInput: true, label: 'Height Value' },
    
    // Calculated cells (formulas are protected on server)
    { address: 'A5', value: 'Area', isInput: false, label: 'Area Label' },
    { address: 'B5', formula: '=B1*B2', isInput: false, label: 'Area Value' },
    
    { address: 'A6', value: 'Volume', isInput: false, label: 'Volume Label' },
    { address: 'B6', formula: '=B1*B2*B3', isInput: false, label: 'Volume Value' },
    
    { address: 'A7', value: 'Perimeter', isInput: false, label: 'Perimeter Label' },
    { address: 'B7', formula: '=2*(B1+B2)', isInput: false, label: 'Perimeter Value' },
    
    { address: 'A8', value: 'Surface Area', isInput: false, label: 'Surface Area Label' },
    { address: 'B8', formula: '=2*(B1*B2+B2*B3+B1*B3)', isInput: false, label: 'Surface Area Value' },
  ],
};
