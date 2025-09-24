import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' })

  // Hapus cookies
  response.cookies.delete('auth_token')
  response.cookies.delete('user_role')

  return response
}