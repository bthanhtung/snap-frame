import { NextRequest, NextResponse } from 'next/server';
import { extractExif } from '@/lib/frame-logic/exif.util';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ message: 'No file' }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const exif = await extractExif(buffer);
    return NextResponse.json(exif);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
