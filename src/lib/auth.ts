import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export type UserRole = 'owner' | 'editor' | 'viewer'

export interface CurrentUserContext {
  user: {
    id: string
    email: string
    name: string | null
    image: string | null
  }
  workspace: {
    id: string
    name: string
  }
  membership: {
    id: string
    role: UserRole
  }
}

export async function getCurrentUserAndWorkspace(): Promise<CurrentUserContext | null> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return null
  }

  // Find user in database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  })

  if (!user) {
    return null
  }

  // Get user's workspace memberships
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc', // Use first workspace for now (MVP: one workspace per user)
    },
  })

  if (!membership) {
    return null
  }

  return {
    user,
    workspace: membership.workspace,
    membership: {
      id: membership.id,
      role: membership.role as UserRole,
    },
  }
}

export function canEditPlaybooks(role: UserRole): boolean {
  return role === 'owner' || role === 'editor'
}

export function canManageWorkspace(role: UserRole): boolean {
  return role === 'owner'
}
