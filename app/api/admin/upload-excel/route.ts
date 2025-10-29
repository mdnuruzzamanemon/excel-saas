import { NextRequest, NextResponse } from 'next/server';
import { ExcelParser } from '@/lib/excel-parser';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/upload-excel
 * Upload and parse Excel file
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const workbookName = formData.get('name') as string || 'Uploaded Workbook';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse the Excel file
    const { workbookConfig, preview } = ExcelParser.parseFile(buffer, workbookName);

    // Save to database
    const workbook = await prisma.workbook.create({
      data: {
        name: workbookConfig.name,
        description: workbookConfig.description || '',
        // userId is optional, no authentication required for now
        formulaConfig: workbookConfig as any,
        metadata: {
          rows: workbookConfig.rows,
          cols: workbookConfig.cols,
          uploadedAt: new Date().toISOString(),
          fileName: file.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      workbookId: workbook.id,
      config: workbookConfig,
      preview,
      message: 'Excel file uploaded and parsed successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload Excel file', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
