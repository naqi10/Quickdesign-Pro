import { PrismaClient } from '@prisma/client'

// Reuse Prisma client across hot reloads in dev to avoid exhausting Neon pool
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined
}

export const prisma = global.prismaGlobal ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma
}
