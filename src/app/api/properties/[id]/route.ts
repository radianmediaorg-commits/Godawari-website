import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.property.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const property = await prisma.property.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price ? parseFloat(data.price) : null,
        category: data.category,
        status: data.status,
        address: data.address || null,
        brochure: data.brochure || null,
        contactPhone: data.contactPhone || null,
        images: JSON.stringify(data.images || []),
        units: {
          deleteMany: {},
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
    return NextResponse.json(property);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(data.status ? { status: data.status } : {})
      }
    });
    return NextResponse.json(property);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update property status' }, { status: 500 });
  }
}
