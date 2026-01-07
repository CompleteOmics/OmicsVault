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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id;
    let userName = session?.user?.name;

    // Check mobile auth if no session
    if (!userId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        userId = verifyMobileToken(token) || undefined;

        if (userId) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true },
          });
          userName = user?.name;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { token } = body

    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { lab: true },
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite' }, { status: 404 })
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invite expired' }, { status: 400 })
    }

    if (invite.maxUses && invite.usedCount >= invite.maxUses) {
      return NextResponse.json({ error: 'Invite link has been fully used' }, { status: 400 })
    }

    const existingMember = await prisma.labMember.findUnique({
      where: {
        userId_labId: {
          userId: userId,
          labId: invite.labId,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 })
    }

    const member = await prisma.labMember.create({
      data: {
        userId: userId,
        labId: invite.labId,
        role: 'MEMBER',
      },
      include: {
        lab: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    await prisma.invite.update({
      where: { id: invite.id },
      data: { usedCount: { increment: 1 } },
    })

    await prisma.activity.create({
      data: {
        type: 'MEMBER_JOINED',
        description: `${userName} joined the lab`,
        labId: invite.labId,
        userId: userId,
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error joining lab:', error)
    return NextResponse.json({ error: 'Failed to join lab' }, { status: 500 })
  }
}
