import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// Rename category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { name: name.trim() } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: 'A category with this name already exists.' }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name: name.trim() },
      include: { _count: { select: { contents: true } } },
    });

    return NextResponse.json({ category: updated });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update category.' }, { status: 500 });
  }
}

// Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: 'Category deleted.' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete category.' }, { status: 500 });
  }
}
