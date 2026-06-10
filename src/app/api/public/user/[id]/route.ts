import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, bio: true, avatar: true,
        website: true, youtube: true, instagram: true,
        twitter: true, linkedin: true, github: true, createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const contents = await prisma.content.findMany({
      where: { userId: id, isVerified: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ user, contents });
  } catch (error) {
    console.error('Get public user error:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile.' }, { status: 500 });
  }
}
