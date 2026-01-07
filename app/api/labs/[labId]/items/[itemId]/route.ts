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
  { params }: { params: { labId: string; itemId: string } }
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

    const item = await prisma.item.findUnique({
      where: { id: params.itemId, labId: params.labId },
      include: {
        location: {
          include: {
            parent: {
              include: {
                parent: {
                  include: {
                    parent: true,
                  },
                },
              },
            },
          },
        },
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
          orderBy: { createdAt: 'desc' },
        },
        movements: {
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
          orderBy: { movedAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 })
  }
}

export async function PUT(
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
    const {
      name,
      category,
      vendor,
      catalogNumber,
      lotNumber,
      quantity,
      unit,
      minQuantity,
      remarks,
    } = body

    const oldItem = await prisma.item.findUnique({
      where: { id: params.itemId },
    })

    const item = await prisma.item.update({
      where: { id: params.itemId, labId: params.labId },
      data: {
        name,
        category,
        vendor,
        catalogNumber,
        lotNumber,
        quantity: quantity !== undefined ? parseFloat(quantity) : undefined,
        unit,
        minQuantity: minQuantity !== undefined ? (minQuantity ? parseFloat(minQuantity) : null) : undefined,
        remarks,
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

    if (oldItem && oldItem.quantity !== item.quantity) {
      await prisma.activity.create({
        data: {
          type: 'QUANTITY_CHANGED',
          description: `${userName} changed quantity of ${item.name} from ${oldItem.quantity} to ${item.quantity}`,
          metadata: { itemId: item.id, oldQuantity: oldItem.quantity, newQuantity: item.quantity },
          labId: params.labId,
          userId: userId,
        },
      })
    } else {
      await prisma.activity.create({
        data: {
          type: 'ITEM_UPDATED',
          description: `${userName} updated ${item.name}`,
          metadata: { itemId: item.id },
          labId: params.labId,
          userId: userId,
        },
      })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(
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

    const item = await prisma.item.findUnique({
      where: { id: params.itemId },
    })

    await prisma.item.delete({
      where: { id: params.itemId, labId: params.labId },
    })

    if (item) {
      await prisma.activity.create({
        data: {
          type: 'ITEM_DELETED',
          description: `${userName} deleted ${item.name}`,
          metadata: { itemName: item.name },
          labId: params.labId,
          userId: userId,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
