'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Calculator, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CellData {
  value: string | number | null;
  readOnly?: boolean;
  className?: string;
}

interface SpreadsheetEditorProps {
  workbookId?: string;
}

export function SpreadsheetEditor({ workbookId }: SpreadsheetEditorProps) {
  const [data, setData] = useState<CellData[][]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [currentValues, setCurrentValues] = useState<Record<string, any>>({});

  // Load initial workbook data
  useEffect(() => {
    loadWorkbook();
  }, [workbookId]);

  const loadWorkbook = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/calculate?workbookId=${workbookId || 'default'}`);
      const result = await response.json();

      if (result.success) {
        setMetadata(result.metadata);
        setCurrentValues(result.initialValues);
        updateSpreadsheetData(result.spreadsheetData, result.metadata);
      } else {
        toast.error('Failed to load workbook');
      }
    } catch (error) {
      console.error('Error loading workbook:', error);
      toast.error('Failed to load workbook');
    } finally {
      setLoading(false);
    }
  };

  const updateSpreadsheetData = (spreadsheetData: any[][], meta: any) => {
    const formattedData: CellData[][] = spreadsheetData.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        const address = columnToLetter(colIndex) + (rowIndex + 1);
        const cellMeta = meta.cells.find((c: any) => c.address === address);
        
        // Sanitize cell value - handle objects, errors, etc.
        let cellValue: string | number = '';
        if (cell && typeof cell === 'object') {
          // If cell is an object, extract the value property or convert to string
          if (cell.value !== undefined && cell.value !== null) {
            if (typeof cell.value === 'object') {
              // Handle error objects like {value, type, message}
              cellValue = cell.value.message || cell.value.type || '';
            } else {
              cellValue = cell.value;
            }
          }
        } else if (cell !== null && cell !== undefined) {
          cellValue = cell;
        }
        
        return {
          value: cellValue,
          readOnly: !cellMeta?.isInput,
          className: cellMeta?.isInput ? 'bg-blue-50' : 'bg-gray-50',
        };
      })
    );
    setData(formattedData);
  };

  const handleCellChange = async (rowIndex: number, colIndex: number, value: string) => {
    // Update local data immediately for responsiveness
    const newData = [...data];
    newData[rowIndex][colIndex] = { ...newData[rowIndex][colIndex], value };
    setData(newData);

    // Build input object
    const address = columnToLetter(colIndex) + (rowIndex + 1);
    const newInputs = { ...currentValues, [address]: value };

    // Debounce calculation
    setCalculating(true);
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: newInputs, workbookId }),
      });

      const result = await response.json();
      if (result.success) {
        setCurrentValues(result.results);
        updateSpreadsheetData(result.spreadsheetData, result.metadata);
      }
    } catch (error) {
      console.error('Calculation error:', error);
      toast.error('Calculation failed');
    } finally {
      setCalculating(false);
    }
  };

  const handleExportDXF = async () => {
    try {
      setExporting(true);
      const response = await fetch('/api/export-dxf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: currentValues }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `design_${Date.now()}.dxf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('DXF file downloaded successfully');
      } else {
        toast.error('Failed to export DXF');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export DXF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{metadata?.name || 'Spreadsheet Editor'}</CardTitle>
            <CardDescription>{metadata?.description || 'Edit values to calculate results'}</CardDescription>
          </div>
          <div className="flex gap-2">
            {calculating && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
            <Button onClick={handleExportDXF} disabled={exporting}>
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export to AutoCAD
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-100 p-2 w-12"></th>
                {data[0]?.map((_, colIndex) => (
                  <th key={colIndex} className="border border-gray-300 bg-gray-100 p-2 min-w-32">
                    {columnToLetter(colIndex)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="border border-gray-300 bg-gray-100 p-2 text-center font-medium">
                    {rowIndex + 1}
                  </td>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className={`border border-gray-300 p-0`}>
                      {cell.readOnly ? (
                        <div className={`p-2 ${cell.className}`}>
                          {cell.value}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={cell.value ?? ''}
                          onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                          className={`w-full p-2 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${cell.className}`}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>💡 <strong>Blue cells</strong> are editable. <strong>Gray cells</strong> are calculated automatically.</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to convert column index to letter (0 -> A, 1 -> B, etc.)
function columnToLetter(column: number): string {
  let letter = '';
  while (column >= 0) {
    letter = String.fromCharCode((column % 26) + 65) + letter;
    column = Math.floor(column / 26) - 1;
  }
  return letter;
}
