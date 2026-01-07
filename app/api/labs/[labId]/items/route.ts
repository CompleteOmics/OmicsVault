import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as crypto from 'crypto'

// Helper to verify mobile token
function verifyMobileToken(token: string): string | null {
  try {
    const [payloadStr, signature] = token.split('.');
    if (!payloadStr || !signature) return null;

    const secret = process.env.NEXTAUTH_SECRET || 'mobile-secret-key';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadStr)
      .digest('base64');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64').toString());

    if (payload.exp < Date.now()) return null;

    return payload.userId;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { labId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id;

    // Also check for mobile auth token
    if (!userId) {
      const authHeader = request.headers.get('authorization');
      console.log('[Items] Auth header:', authHeader ? 'Present' : 'Missing');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        console.log('[Items] Token:', token.substring(0, 20) + '...');
        const verifiedUserId = verifyMobileToken(token);
        console.log('[Items] Verified userId:', verifiedUserId);
        userId = verifiedUserId || undefined;
      }
    }

    if (!userId) {
      console.log('[Items] UNAUTHORIZED - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const locationId = searchParams.get('locationId')
    const lowStock = searchParams.get('lowStock') === 'true'

    const where: any = { labId: params.labId }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { vendor: { contains: search, mode: 'insensitive' } },
        { catalogNumber: { contains: search, mode: 'insensitive' } },
        { lotNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (locationId) {
      where.locationId = locationId
    }

    if (lowStock) {
      where.AND = [
        { minQuantity: { not: null } },
        { quantity: { lte: prisma.item.fields.minQuantity } },
      ]
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        location: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lastUpdatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        photos: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            photos: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { labId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id;
    let userName = session?.user?.name;

    // Also check for mobile auth token
    if (!userId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        userId = verifyMobileToken(token) || undefined;
        if (userId) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true }
          });
          userName = user?.name || 'Unknown User';
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const membership = await prisma.labMember.findUnique({
      where: {
        userId_labId: {
          userId: userId,
          labId: params.labId,
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this lab' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      category,
      vendor,
      catalogNumber,
      lotNumber,
      quantity,
      unit,
      minQuantity,
      locationId,
      remarks,
    } = body

    const item = await prisma.item.create({
      data: {
        name,
        category,
        vendor,
        catalogNumber,
        lotNumber,
        quantity: parseFloat(quantity) || 0,
        unit,
        minQuantity: minQuantity ? parseFloat(minQuantity) : null,
        remarks,
        labId: params.labId,
        locationId,
        createdById: userId,
        lastUpdatedById: userId,
      },
      include: {
        location: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lastUpdatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    await prisma.activity.create({
      data: {
        type: 'ITEM_CREATED',
        description: `${userName} added ${item.name}`,
        metadata: { itemId: item.id },
        labId: params.labId,
        userId: userId,
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}
