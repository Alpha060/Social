import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// Verify/unverify/feature/unfeature content
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const { action } = body; // "verify" | "unverify" | "feature" | "unfeature"

    const content = await prisma.content.findUnique({ where: { id } });
    if (!content) {
      return NextResponse.json({ error: 'Content not found.' }, { status: 404 });
    }

    let data: Record<string, boolean> = {};
    switch (action) {
      case 'verify':
        data = { isVerified: true };
        break;
      case 'unverify':
        data = { isVerified: false, isFeatured: false };
        break;
      case 'feature':
        if (['IMAGE', 'VIDEO'].includes(content.type)) {
          await prisma.content.updateMany({
            where: {
              type: content.type as any,
              isFeatured: true,
              id: { not: id },
            },
            data: { isFeatured: false },
          });
        }
        data = { isFeatured: true, isVerified: true };
        break;
      case 'unfeature':
        data = { isFeatured: false };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

    const updated = await prisma.content.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        category: true,
      },
    });

    return NextResponse.json({ content: updated });
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
}

// Reject (delete) content
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const content = await prisma.content.findUnique({ where: { id } });
    if (!content) {
      return NextResponse.json({ error: 'Content not found.' }, { status: 404 });
    }

    await prisma.content.delete({ where: { id } });
    return NextResponse.json({ message: 'Content rejected and deleted.' });
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
}
