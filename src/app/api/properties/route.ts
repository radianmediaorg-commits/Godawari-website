import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const property = await prisma.property.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price ? parseFloat(data.price) : null,
        category: data.category,
        status: data.status || 'AVAILABLE',
        address: data.address || null,
        brochure: data.brochure || null,
        contactPhone: data.contactPhone || null,
        images: JSON.stringify(data.images || []),
        units: {
          create: data.units?.map((u: any) => ({
            title: u.title,
            description: u.description || null,
            price: u.price ? parseFloat(u.price) : null,
            size: u.size || null,
            images: JSON.stringify(u.images || []),
            status: u.status || 'AVAILABLE'
          })) || []
        }
      }
    });
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
