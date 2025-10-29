import { NextRequest, NextResponse } from 'next/server';
import { DXFGenerator } from '@/lib/dxf-generator';

/**
 * POST /api/export-dxf
 * Generate and download DXF file for AutoCAD
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { values } = body;

    if (!values) {
      return NextResponse.json(
        { error: 'Missing calculation values' },
        { status: 400 }
      );
    }

    // Generate DXF content
    const dxfContent = DXFGenerator.generate({ values });
    const filename = DXFGenerator.generateFilename('autocad-design');

    // Return DXF file as downloadable response
    return new NextResponse(dxfContent, {
      headers: {
        'Content-Type': 'application/dxf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('DXF generation error:', error);
    return NextResponse.json(
      { error: 'DXF generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
