import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FormulaEngine, WorkbookConfig } from '@/lib/formula-engine';

/**
 * GET /api/admin/diagnose?workbookId=xxx
 * Diagnose formula errors in a workbook
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workbookId = searchParams.get('workbookId');

    if (!workbookId) {
      return NextResponse.json(
        { error: 'Workbook ID required' },
        { status: 400 }
      );
    }

    // Load workbook from database
    const workbook = await prisma.workbook.findUnique({
      where: { id: workbookId },
    });

    if (!workbook) {
      return NextResponse.json(
        { error: 'Workbook not found' },
        { status: 404 }
      );
    }

    const config = workbook.formulaConfig as unknown as WorkbookConfig;
    const engine = new FormulaEngine(config);

    // Get all values and check for errors
    const allValues = engine.getAllValues();
    const spreadsheetData = engine.getSpreadsheetData();

    // Analyze errors
    const errors: any[] = [];
    const warnings: any[] = [];
    const cellInfo: any[] = [];

    config.cells.forEach(cell => {
      const value = allValues[cell.address];
      const info: any = {
        address: cell.address,
        isInput: cell.isInput,
        hasFormula: !!cell.formula,
        formula: cell.formula,
        value: value,
      };

      // Check for error values
      if (typeof value === 'string' && value.startsWith('#')) {
        errors.push({
          address: cell.address,
          error: value,
          formula: cell.formula,
          reason: getErrorReason(value, cell.formula, config),
        });
        info.hasError = true;
        info.errorType = value;
      }

      // Check for missing dependencies
      if (cell.formula) {
        const dependencies = extractCellReferences(cell.formula);
        const missingDeps = dependencies.filter(dep => {
          const depCell = config.cells.find(c => c.address === dep);
          return !depCell;
        });

        if (missingDeps.length > 0) {
          warnings.push({
            address: cell.address,
            formula: cell.formula,
            missingCells: missingDeps,
            message: `Formula references cells that don't exist: ${missingDeps.join(', ')}`,
          });
          info.missingDependencies = missingDeps;
        }
      }

      cellInfo.push(info);
    });

    // Summary statistics
    const summary = {
      totalCells: config.cells.length,
      inputCells: config.cells.filter(c => c.isInput).length,
      formulaCells: config.cells.filter(c => c.formula).length,
      errorCells: errors.length,
      warningCells: warnings.length,
      dimensions: `${config.rows} rows × ${config.cols} cols`,
    };

    return NextResponse.json({
      success: true,
      workbookName: config.name,
      summary,
      errors,
      warnings,
      cellInfo,
      recommendations: generateRecommendations(errors, warnings),
    });
  } catch (error) {
    console.error('Diagnosis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to diagnose workbook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Extract cell references from a formula
 */
function extractCellReferences(formula: string): string[] {
  // Match cell references like A1, $A$1, $A1, A$1
  const regex = /\$?[A-Z]+\$?\d+/g;
  const matches = formula.match(regex) || [];
  // Remove duplicates and $ signs
  return [...new Set(matches.map(m => m.replace(/\$/g, '')))];
}

/**
 * Get human-readable error reason
 */
function getErrorReason(errorValue: string, formula: string | undefined, config: WorkbookConfig): string {
  if (!formula) return 'No formula defined';

  switch (errorValue) {
    case '#REF!':
      const refs = extractCellReferences(formula);
      const missingRefs = refs.filter(ref => !config.cells.find(c => c.address === ref));
      return `Invalid cell reference. Formula references: ${refs.join(', ')}. Missing cells: ${missingRefs.join(', ') || 'none'}`;

    case '#VALUE!':
      return 'Wrong type of argument or operand. Check if you\'re trying to do math with text values.';

    case '#DIV/0!':
      return 'Division by zero. One of the cells in the formula has a value of 0.';

    case '#NAME?':
      return 'Unrecognized function name. The formula uses a function that HyperFormula doesn\'t support.';

    case '#N/A':
      return 'Value not available. Common in VLOOKUP when the value isn\'t found.';

    case '#NUM!':
      return 'Invalid numeric value. The formula produces a number that\'s too large or too small.';

    case '#ERROR!':
      return 'General error. The formula has a syntax error or references cells that don\'t exist yet.';

    default:
      return `Unknown error: ${errorValue}`;
  }
}

/**
 * Generate recommendations based on errors and warnings
 */
function generateRecommendations(errors: any[], warnings: any[]): string[] {
  const recommendations: string[] = [];

  if (errors.length > 0) {
    recommendations.push(`Found ${errors.length} formula error(s). Check the errors list for details.`);

    const refErrors = errors.filter(e => e.error === '#REF!');
    if (refErrors.length > 0) {
      recommendations.push(
        `${refErrors.length} #REF! error(s) found. These formulas reference cells that don't exist in your Excel file. Make sure all referenced cells are included.`
      );
    }

    const errorErrors = errors.filter(e => e.error === '#ERROR!');
    if (errorErrors.length > 0) {
      recommendations.push(
        `${errorErrors.length} #ERROR! found. These formulas have syntax errors or reference cells that haven't been initialized yet.`
      );
    }
  }

  if (warnings.length > 0) {
    recommendations.push(`Found ${warnings.length} warning(s) about missing cell dependencies.`);
  }

  if (errors.length === 0 && warnings.length === 0) {
    recommendations.push('No errors or warnings found! Your workbook looks good.');
  } else {
    recommendations.push('To fix: Open your Excel file, fix the errors, and re-upload.');
  }

  return recommendations;
}
