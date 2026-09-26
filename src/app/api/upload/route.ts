export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { v2 as cloudinary } from 'cloudinary';

function getCloudinaryCredentials() {
  let cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim().replace(/^["']|["']$/g, '');
  let api_key = process.env.CLOUDINARY_API_KEY?.trim().replace(/^["']|["']$/g, '');
  let api_secret = process.env.CLOUDINARY_API_SECRET?.trim().replace(/^["']|["']$/g, '');

  if ((!api_key || !api_secret || !cloud_name) && process.env.CLOUDINARY_URL) {
    try {
      const parsed = new URL(process.env.CLOUDINARY_URL.trim().replace(/^["']|["']$/g, ''));
      api_key = parsed.username || api_key;
      api_secret = parsed.password || api_secret;
      cloud_name = parsed.hostname || cloud_name;
    } catch (e) {
      console.error('Failed to parse CLOUDINARY_URL:', e);
    }
  }

  return { cloud_name, api_key, api_secret };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { cloud_name, api_key, api_secret } = getCloudinaryCredentials();

  if (!cloud_name || !api_key || !api_secret) {
    console.error('Missing Cloudinary configuration:', {
      hasCloudName: !!cloud_name,
      hasApiKey: !!api_key,
      hasApiSecret: !!api_secret,
    });
    return NextResponse.json(
      {
        error: `Cloudinary credentials missing on server (api_key: ${!!api_key}, cloud_name: ${!!cloud_name}, api_secret: ${!!api_secret}). Please verify CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, and CLOUDINARY_CLOUD_NAME in Railway variables and redeploy.`
      },
      { status: 500 }
    );
  }

  // Ensure Cloudinary instance is configured in request scope
  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });

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

    return new Promise<NextResponse>((resolve) => {
      const uploadOptions: Record<string, any> = {
        folder: 'godawari',
        resource_type: resourceType,
        cloud_name,
        api_key,
        api_secret,
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
            resolve(
              NextResponse.json(
                { error: error.message || 'Failed to upload to Cloudinary' },
                { status: 500 }
              )
            );
          } else {
            resolve(NextResponse.json({ url: result?.secure_url }, { status: 201 }));
          }
        }
      );
      stream.end(buffer);
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

