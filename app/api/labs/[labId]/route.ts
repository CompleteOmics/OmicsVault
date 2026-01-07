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

    // Check mobile auth if no session
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

    const lab = await prisma.lab.findUnique({
      where: { id: params.labId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
            locations: true,
          },
        },
      },
    })

    if (!lab) {
      return NextResponse.json({ error: 'Lab not found' }, { status: 404 })
    }

    return NextResponse.json(lab)
  } catch (error) {
    console.error('Error fetching lab:', error)
    return NextResponse.json({ error: 'Failed to fetch lab' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { labId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id;

    // Check mobile auth if no session
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

    if (!membership || membership.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Delete all related data (Prisma will handle cascade delete based on schema)
    await prisma.lab.delete({
      where: { id: params.labId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lab:', error)
    return NextResponse.json({ error: 'Failed to delete lab' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { labId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id;

    // Check mobile auth if no session
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

    if (!membership || membership.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description } = body

    const lab = await prisma.lab.update({
      where: { id: params.labId },
      data: {
        name,
        description,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
            locations: true,
          },
        },
      },
    })

    return NextResponse.json(lab)
  } catch (error) {
    console.error('Error updating lab:', error)
    return NextResponse.json({ error: 'Failed to update lab' }, { status: 500 })
  }
}
