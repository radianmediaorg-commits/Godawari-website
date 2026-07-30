import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine resource type based on file extension
    // Cloudinary needs 'raw' or 'auto' for PDFs, otherwise it might try to process it as an image
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const resourceType = isPdf ? 'raw' : 'auto';

    return new Promise<NextResponse>((resolve, reject) => {
      const uploadOptions: any = {
        folder: 'godawari',
        resource_type: resourceType,
      };

      // Only force filename for PDFs so they download with the correct .pdf extension.
      // For images, let Cloudinary generate a random ID to guarantee a new URL and prevent browser caching.
      if (isPdf) {
        uploadOptions.use_filename = true;
        uploadOptions.unique_filename = true;
        uploadOptions.filename_override = file.name;
      }

      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            resolve(NextResponse.json({ error: 'Failed to upload to Cloudinary' }, { status: 500 }));
          } else {
            resolve(NextResponse.json({ url: result?.secure_url }, { status: 201 }));
          }
        }
      );
      stream.end(buffer);
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
