import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const formData = await request.formData();
    const linkUrl = formData.get('linkUrl') as string | null;
    const typeStr = formData.get('type') as string | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const categoryId = formData.get('categoryId') as string | null;

    if (!linkUrl) {
      return NextResponse.json({ error: 'No link URL provided. File must be uploaded to storage first.' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }

    const type: 'IMAGE' | 'VIDEO' | 'PDF' = (typeStr as 'IMAGE' | 'VIDEO' | 'PDF') || 'IMAGE';
    const fileUrl = linkUrl;
    
    // Automatic thumbnails are disabled because videos are now uploaded directly to storage 
    // and processed client-side or without ffmpeg backend.
    const thumbnail = null;

    const content = await prisma.content.create({
      data: {
        title,
        description: description || null,
        type,
        fileUrl,
        thumbnail,
        userId: user.id,
        categoryId: categoryId || null,
      },
      include: { category: true },
    });

    return NextResponse.json({ content }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to save content details.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const contents = await prisma.content.findMany({
      where: user.role === 'ADMIN' ? {} : { userId: user.id },
      include: {
        category: true,
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ contents });
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
}
