import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const [totalUsers, totalContent, pendingContent, verifiedContent, viewsAgg] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.content.count(),
      prisma.content.count({ where: { isVerified: false } }),
      prisma.content.count({ where: { isVerified: true } }),
      prisma.content.aggregate({ _sum: { views: true } }),
    ]);

    const totalViews = viewsAgg._sum.views || 0;

    return NextResponse.json({ totalUsers, totalContent, pendingContent, verifiedContent, totalViews });
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
}
