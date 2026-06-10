import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const linkUrl = formData.get('linkUrl') as string | null;
    const typeStr = formData.get('type') as string | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const categoryId = formData.get('categoryId') as string | null;

    if (!file && !linkUrl) {
      return NextResponse.json({ error: 'No file or link provided.' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }

    let fileUrl = "";
    let thumbnail: string | null = null;
    let type: 'IMAGE' | 'VIDEO' | 'PDF' = 'IMAGE';

    if (file) {
      // Validate file type
      const allowedMimes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf',
      ];
      if (!allowedMimes.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid file type.' }, { status: 400 });
      }

      let subDir = 'images';
      if (file.type.startsWith('video/')) { type = 'VIDEO'; subDir = 'videos'; }
      else if (file.type === 'application/pdf') { type = 'PDF'; subDir = 'pdfs'; }

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', subDir);
      await mkdir(uploadDir, { recursive: true });

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (type === 'IMAGE') {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
        const filePath = path.join(uploadDir, uniqueName);
        
        await sharp(buffer)
          .webp({ lossless: true })
          .toFile(filePath);
          
        fileUrl = `/uploads/${subDir}/${uniqueName}`;
      } else if (type === 'VIDEO') {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const tempPath = path.join(process.cwd(), 'public', 'uploads', 'tmp', `${uniqueName}-temp${path.extname(file.name)}`);
        const finalPath = path.join(uploadDir, `${uniqueName}.mp4`);
        
        await mkdir(path.join(process.cwd(), 'public', 'uploads', 'tmp'), { recursive: true });
        await mkdir(path.join(process.cwd(), 'public', 'uploads', 'images'), { recursive: true });
        
        await writeFile(tempPath, buffer);

        // Compress video
        await new Promise((resolve, reject) => {
          ffmpeg(tempPath)
            .outputOptions([
              '-preset ultrafast', 
              '-crf 23',           
              '-vcodec libx264',
              '-movflags +faststart' 
            ])
            .toFormat('mp4')
            .on('end', resolve)
            .on('error', reject)
            .save(finalPath);
        });

        // Extract thumbnail
        await new Promise((resolve) => {
          ffmpeg(finalPath)
            .screenshots({
              timestamps: ['00:00:01.000'],
              filename: `${uniqueName}-thumb.jpg`,
              folder: path.join(process.cwd(), 'public', 'uploads', 'images'),
            })
            .on('end', resolve)
            .on('error', (err: Error) => {
              console.error("Thumbnail error", err);
              resolve(null);
            });
        });

        await unlink(tempPath).catch(console.error); // cleanup
        
        fileUrl = `/uploads/${subDir}/${uniqueName}.mp4`;
        thumbnail = `/uploads/images/${uniqueName}-thumb.jpg`;
      } else {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.name)}`;
        const filePath = path.join(uploadDir, uniqueName);
        await writeFile(filePath, buffer);
        fileUrl = `/uploads/${subDir}/${uniqueName}`;
      }
    } else if (linkUrl) {
      fileUrl = linkUrl;
      type = (typeStr as 'IMAGE' | 'VIDEO' | 'PDF') || 'IMAGE';
    }

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
    return NextResponse.json({ error: 'Failed to upload content.' }, { status: 500 });
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
