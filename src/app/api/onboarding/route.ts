import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const formData = await req.formData()
    const workspaceName = formData.get('workspaceName') as string

    if (!workspaceName || workspaceName.trim().length === 0) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create workspace and add user as owner
    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName.trim(),
        members: {
          create: {
            userId: user.id,
            role: 'owner',
          },
        },
      },
    })

    // Redirect to app
    return NextResponse.redirect(new URL('/app', req.url))
  } catch (error) {
    console.error('Error creating workspace:', error)
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
  }
}
