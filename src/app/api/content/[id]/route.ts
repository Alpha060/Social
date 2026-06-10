import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, getAuthUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const recordView = searchParams.get('recordView') === 'true';
    
    // Check if user is logged in
    const user = await getAuthUser(request);

    // Fetch content first
    let content = await prisma.content.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        category: true,
      }
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found.' }, { status: 404 });
    }

    // Only increment view if recordView=true AND (not logged in OR not the uploader)
    if (recordView && (!user || user.id !== content.userId)) {
      content = await prisma.content.update({
        where: { id },
        data: { views: { increment: 1 } },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          category: true,
        }
      });
    }

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: 'Content not found or failed to fetch.' }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const { title, description, categoryId } = body;

    const content = await prisma.content.findUnique({ where: { id } });
    if (!content) {
      return NextResponse.json({ error: 'Content not found.' }, { status: 404 });
    }

    if (content.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
    }

    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        title: title || content.title,
        description: description !== undefined ? description : content.description,
        categoryId: categoryId || content.categoryId,
      }
    });

    return NextResponse.json({ content: updatedContent });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update content.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const content = await prisma.content.findUnique({ where: { id } });
    if (!content) {
      return NextResponse.json({ error: 'Content not found.' }, { status: 404 });
    }

    if (content.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
    }

    await prisma.content.delete({ where: { id } });
    return NextResponse.json({ message: 'Content deleted successfully.' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete.' }, { status: 500 });
  }
}
