import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { labId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const membership = await prisma.labMember.findUnique({
      where: {
        userId_labId: {
          userId: session.user.id,
          labId: params.labId,
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this lab' }, { status: 403 })
    }

    const members = await prisma.labMember.findMany({
      where: { labId: params.labId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { labId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const membership = await prisma.labMember.findUnique({
      where: {
        userId_labId: {
          userId: session.user.id,
          labId: params.labId,
        },
      },
    })

    if (!membership || membership.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await prisma.labMember.delete({
      where: {
        userId_labId: {
          userId,
          labId: params.labId,
        },
      },
    })

    const user = await prisma.user.findUnique({ where: { id: userId } })

    await prisma.activity.create({
      data: {
        type: 'MEMBER_REMOVED',
        description: `${user?.name} was removed from the lab`,
        labId: params.labId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }
}
