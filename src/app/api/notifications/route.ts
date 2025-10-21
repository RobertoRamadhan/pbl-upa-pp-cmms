import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET - Fetch notifications for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false })
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST - Create new notification
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, message, type } = body

    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
        type
      }
    })

    // TODO: Implement real-time notification using WebSocket/SSE
    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// PUT - Mark notifications as read
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const notificationId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (notificationId) {
      // Mark specific notification as read
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId
        },
        data: {
          isRead: true
        }
      })
      return NextResponse.json(notification)
    } else {
      // Mark all notifications as read
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      })
      return NextResponse.json({ 
        message: `Marked ${result.count} notifications as read` 
      })
    }
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}