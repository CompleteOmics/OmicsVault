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
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        userId = verifyMobileToken(token) || undefined;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const locations = await prisma.location.findMany({
      where: { labId: params.labId },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(locations)
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { labId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id;

    // Also check for mobile auth token
    if (!userId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        userId = verifyMobileToken(token) || undefined;
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

    // Get user info for activity log
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const body = await request.json()
    const { name, type, description, parentId } = body

    const location = await prisma.location.create({
      data: {
        name,
        type,
        description,
        parentId: parentId || null,
        labId: params.labId,
      },
      include: {
        parent: true,
        children: true,
      },
    })

    await prisma.activity.create({
      data: {
        type: 'LOCATION_CREATED',
        description: `${user?.name || 'User'} created location ${location.name}`,
        metadata: { locationId: location.id },
        labId: params.labId,
        userId: userId,
      },
    })

    return NextResponse.json(location)
  } catch (error) {
    console.error('Error creating location:', error)
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 })
  }
}
