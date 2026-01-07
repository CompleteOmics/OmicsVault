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

export async function POST(
  request: NextRequest,
  { params }: { params: { labId: string; itemId: string } }
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
    const { toLocationId, quantity, notes } = body

    const item = await prisma.item.findUnique({
      where: { id: params.itemId },
      include: {
        location: true,
      },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const fromLocationId = item.locationId

    // Create movement record
    const movement = await prisma.movement.create({
      data: {
        itemId: params.itemId,
        fromLocationId,
        toLocationId,
        quantity: quantity || null,
        notes,
        movedById: userId,
      },
      include: {
        fromLocation: true,
        toLocation: true,
        movedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Update item location
    const updatedItem = await prisma.item.update({
      where: { id: params.itemId },
      data: {
        locationId: toLocationId,
        lastUpdatedById: userId,
      },
      include: {
        location: true,
      },
    })

    await prisma.activity.create({
      data: {
        type: 'ITEM_MOVED',
        description: `${userName} moved ${item.name} from ${movement.fromLocation.name} to ${movement.toLocation.name}`,
        metadata: {
          itemId: item.id,
          fromLocationId,
          toLocationId,
        },
        labId: params.labId,
        userId: userId,
      },
    })

    return NextResponse.json({ movement, item: updatedItem })
  } catch (error) {
    console.error('Error moving item:', error)
    return NextResponse.json({ error: 'Failed to move item' }, { status: 500 })
  }
}
