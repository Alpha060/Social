import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// Update user role or suspension status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const { role, isSuspended } = body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const updateData: any = {};
    if (role !== undefined) {
      if (!['ADMIN', 'CUSTOMER'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
      }
      updateData.role = role;
    }
    if (isSuspended !== undefined) {
      if (typeof isSuspended !== 'boolean') {
        return NextResponse.json({ error: 'isSuspended must be a boolean.' }, { status: 400 });
      }
      if (id === adminUser.id && isSuspended === true) {
        return NextResponse.json({ error: 'Cannot suspend yourself.' }, { status: 400 });
      }
      updateData.isSuspended = isSuspended;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isSuspended: true },
    });

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
}

// Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    const { id } = await params;

    if (admin.id === id) {
      return NextResponse.json({ error: 'Cannot delete yourself.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'User deleted successfully.' });
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
}
