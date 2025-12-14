// app/api/test-db/route.ts
import { prisma } from '@/lib/prisma'

export async function GET() {
  const count = await prisma.user.count()
  return Response.json({ ok: true, count })
}
