import NotificationService from '@/lib/notificationService'
import { prisma } from './prisma'

let notificationService: NotificationService | null = null

export function initNotificationService(server: any) {
  if (!notificationService) {
    notificationService = new NotificationService(server)
  }
  return notificationService
}

export async function sendSystemNotification(
  userId: string,
  title: string,
  message: string,
  type: 'TICKET' | 'ASSIGNMENT' | 'REPAIR' | 'SYSTEM'
) {
  // Save to database
  const notification = await prisma.notification.create({
    data: {
      userId,
      message,
      type
    }
  })

  // Send real-time notification if service is initialized
  if (notificationService) {
    notificationService.sendNotification(userId, {
      type: 'notification',
      data: {
        id: notification.id,
        title,
        message,
        timestamp: new Date().toISOString()
      }
    })
  }

  return notification
}

// Broadcast notification to all connected clients
export async function broadcastNotification(
  message: string,
  type: 'SYSTEM' | 'MAINTENANCE'
) {
  if (notificationService) {
    notificationService.broadcast({
      type: 'broadcast',
      data: {
        message,
        type,
        timestamp: new Date().toISOString()
      }
    })
  }
}