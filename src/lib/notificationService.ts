import { WebSocket, WebSocketServer } from 'ws'

class NotificationService {
  private wss: WebSocketServer
  private clients: Map<string, WebSocket> = new Map()

  constructor(server: any) {
    this.wss = new WebSocketServer({ server })
    this.setupWebSocket()
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('Client connected')

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message)
          if (data.type === 'register') {
            this.clients.set(data.userId, ws)
            console.log(`User ${data.userId} registered`)
          }
        } catch (error) {
          console.error('Invalid message format:', error)
        }
      })

      ws.on('close', () => {
        // Remove client on disconnect
        for (const [userId, client] of this.clients.entries()) {
          if (client === ws) {
            this.clients.delete(userId)
            console.log(`User ${userId} disconnected`)
            break
          }
        }
      })
    })
  }

  public sendNotification(userId: string, notification: any) {
    const client = this.clients.get(userId)
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification))
    }
  }

  public broadcast(notification: any) {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification))
      }
    })
  }
}

export default NotificationService