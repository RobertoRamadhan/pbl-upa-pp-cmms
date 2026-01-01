import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import sharp from 'sharp'

// Utility function untuk memproses gambar
async function processImage(buffer: Buffer) {
  // Resize dan compress
  const processedImage = await sharp(buffer)
    .resize(1024, 1024, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer()

  // Deteksi blur
  const stats = await sharp(processedImage)
    .stats()
  
  const stdDev = stats.channels[0].stdev // Using first channel (typically luminance)
  const isBlurry = stdDev < 15 // Threshold untuk blur detection

  return {
    buffer: processedImage,
    isBlurry,
    metadata: await sharp(processedImage).metadata()
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const context = formData.get('context') as string // 'ticket' atau 'repair'
    const entityId = formData.get('entityId') as string // ticketId atau repairId

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Proses gambar
    const { buffer: processedBuffer, isBlurry, metadata } = await processImage(buffer)

    if (isBlurry) {
      return NextResponse.json(
        { error: 'Image is too blurry. Please upload a clearer image.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${context}_${entityId}_${timestamp}.jpg`
    
    // Save file path to database based on context
    if (context === 'ticket') {
      await prisma.ticket.update({
        where: { id: entityId },
        data: { attachments: filename }
      })
    } else if (context === 'repair') {
      await prisma.repairLog.update({
        where: { id: entityId },
        data: { attachments: filename }
      })
    }

    // TODO: Upload file to storage (local/S3/etc)
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      filename,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: processedBuffer.length
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    )
  }
}