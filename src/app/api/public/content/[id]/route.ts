import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        category: true,
      },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found.' }, { status: 404 });
    }

    if (!content.isVerified) {
      return NextResponse.json({ error: 'Content is not verified yet.' }, { status: 403 });
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Get public content by id error:', error);
    return NextResponse.json({ error: 'Failed to fetch content.' }, { status: 500 });
  }
}
