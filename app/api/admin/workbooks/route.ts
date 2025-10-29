import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/workbooks
 * Get all workbooks
 */
export async function GET() {
  try {
    const workbooks = await prisma.workbook.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        metadata: true,
      },
    });

    return NextResponse.json({
      success: true,
      workbooks,
    });
  } catch (error) {
    console.error('Error fetching workbooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workbooks' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/workbooks?id=xxx
 * Delete a workbook
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Workbook ID required' },
        { status: 400 }
      );
    }

    await prisma.workbook.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Workbook deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting workbook:', error);
    return NextResponse.json(
      { error: 'Failed to delete workbook' },
      { status: 500 }
    );
  }
}
