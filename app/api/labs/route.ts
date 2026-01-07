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

export async function GET(request: NextRequest) {
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

    const labs = await prisma.lab.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
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

    return NextResponse.json(labs)
  } catch (error) {
    console.error('Error fetching labs:', error)
    return NextResponse.json({ error: 'Failed to fetch labs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, description } = body

    // Get user info for activity log
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const lab = await prisma.lab.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: userId,
            role: 'ADMIN',
          },
        },
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

    await prisma.activity.create({
      data: {
        type: 'MEMBER_JOINED',
        description: `${user?.name || 'User'} created lab ${lab.name}`,
        labId: lab.id,
        userId: userId,
      },
    })

    return NextResponse.json(lab)
  } catch (error) {
    console.error('Error creating lab:', error)
    return NextResponse.json({ error: 'Failed to create lab' }, { status: 500 })
  }
}
