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

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    const expiringItems = await prisma.item.findMany({
      where: {
        labId: params.labId,
        expirationDate: {
          not: null,
          lte: futureDate,
          gte: new Date(),
        },
      },
      include: {
        location: true,
        reservations: {
          where: {
            estimatedUse: { gte: new Date() },
          },
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
      },
      orderBy: {
        expirationDate: 'asc',
      },
    })

    const expiredItems = await prisma.item.findMany({
      where: {
        labId: params.labId,
        expirationDate: {
          not: null,
          lt: new Date(),
        },
      },
      include: {
        location: true,
      },
      orderBy: {
        expirationDate: 'desc',
      },
      take: 10,
    })

    return NextResponse.json({
      expiring: expiringItems,
      expired: expiredItems,
    })
  } catch (error) {
    console.error('Error fetching expiring items:', error)
    return NextResponse.json({ error: 'Failed to fetch expiring items' }, { status: 500 })
  }
}
