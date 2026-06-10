import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// Get all pending content
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const contents = await prisma.content.findMany({
      where: { isVerified: false },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ contents });
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
}
