import { NextRequest, NextResponse } from 'next/server';
import { FormulaEngine, exampleWorkbookConfig, WorkbookConfig } from '@/lib/formula-engine';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/calculate
 * Calculate values based on user inputs
 * The formulas remain on the server and are never exposed to the client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inputs, workbookId } = body;

    if (!inputs) {
      return NextResponse.json(
        { error: 'Missing inputs' },
        { status: 400 }
      );
    }

    // Load workbook configuration from database or use example
    let config: WorkbookConfig;
    
    if (workbookId && workbookId !== 'default') {
      const workbook = await prisma.workbook.findUnique({
        where: { id: workbookId },
      });
      
      if (!workbook) {
        return NextResponse.json(
          { error: 'Workbook not found' },
          { status: 404 }
        );
      }
      
      config = workbook.formulaConfig as WorkbookConfig;
    } else {
      config = exampleWorkbookConfig;
    }

    // Create formula engine instance
    const engine = new FormulaEngine(config);

    // Update inputs and get calculated results
    const results = engine.updateInputs(inputs);

    // Get spreadsheet data for display
    const spreadsheetData = engine.getSpreadsheetData();

    // Get cell metadata
    const metadata = engine.exportClientConfig();

    return NextResponse.json({
      success: true,
      results,
      spreadsheetData,
      metadata,
    });
  } catch (error) {
    console.error('Calculation error:', error);
    return NextResponse.json(
      { error: 'Calculation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/calculate
 * Get initial workbook configuration (without formulas)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workbookId = searchParams.get('workbookId');

    // Load workbook configuration from database or use example
    let config: WorkbookConfig;
    
    if (workbookId && workbookId !== 'default') {
      const workbook = await prisma.workbook.findUnique({
        where: { id: workbookId },
      });
      
      if (!workbook) {
        return NextResponse.json(
          { error: 'Workbook not found' },
          { status: 404 }
        );
      }
      
      config = workbook.formulaConfig as WorkbookConfig;
    } else {
      config = exampleWorkbookConfig;
    }

    const engine = new FormulaEngine(config);
    const metadata = engine.exportClientConfig();
    const initialValues = engine.getAllValues();
    const spreadsheetData = engine.getSpreadsheetData();

    return NextResponse.json({
      success: true,
      metadata,
      initialValues,
      spreadsheetData,
    });
  } catch (error) {
    console.error('Error loading workbook:', error);
    return NextResponse.json(
      { error: 'Failed to load workbook', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
