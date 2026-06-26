import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prismaRoleToAppRole } from '@/lib/roles';
import {
  validateUpload,
  CLOUDINARY_FOLDERS,
  type CloudinaryFolder,
} from '@/lib/cloudinary/upload-service';
import { rateLimiters } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  const limit = rateLimiters.upload(ip);
  if (!limit.success) {
    return NextResponse.json({ error: 'Upload rate limit exceeded.' }, { status: 429 });
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const role = prismaRoleToAppRole(
    typeof token.role === 'string' ? token.role.toUpperCase() : 'CUSTOMER',
  );

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const folderKey = (formData.get('folder') as string | null) ?? 'GALLERY';

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const validation = validateUpload(
    { size: file.size, type: file.type, name: file.name },
    role,
  );

  if (!validation.valid) {
    return NextResponse.json({ error: 'Validation failed.', details: validation.errors }, { status: 422 });
  }

  const folder: CloudinaryFolder =
    CLOUDINARY_FOLDERS[folderKey as keyof typeof CLOUDINARY_FOLDERS] ??
    CLOUDINARY_FOLDERS.GALLERY;

  const buffer = Buffer.from(await file.arrayBuffer());

  // Dynamic import — prevents webpack from statically bundling cloudinary
  const { uploadImage } = await import('@/lib/cloudinary/cloudinary-client');
  const result = await uploadImage({ file: buffer, folder });

  return NextResponse.json(result, { status: 201 });
}
