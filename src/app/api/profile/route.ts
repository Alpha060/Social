import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// Get profile
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true, email: true, name: true, bio: true, avatar: true,
        role: true, website: true, youtube: true, instagram: true,
        twitter: true, linkedin: true, github: true, createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
}

// Update profile
export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { name, bio, avatar, website, youtube, instagram, twitter, linkedin, github } = await request.json();

    const user = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
        ...(website !== undefined && { website }),
        ...(youtube !== undefined && { youtube }),
        ...(instagram !== undefined && { instagram }),
        ...(twitter !== undefined && { twitter }),
        ...(linkedin !== undefined && { linkedin }),
        ...(github !== undefined && { github }),
      },
      select: {
        id: true, email: true, name: true, bio: true, avatar: true,
        role: true, website: true, youtube: true, instagram: true,
        twitter: true, linkedin: true, github: true, createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
}
