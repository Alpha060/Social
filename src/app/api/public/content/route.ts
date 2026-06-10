import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all verified content (public landing page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { isVerified: true };
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const contents = await prisma.content.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ contents });
  } catch (error) {
    console.error('Get public content error:', error);
    return NextResponse.json({ error: 'Failed to fetch content.' }, { status: 500 });
  }
}
