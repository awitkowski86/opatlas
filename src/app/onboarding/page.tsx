import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  // Check if user already has a workspace
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      workspaces: true,
    },
  })

  if (user && user.workspaces.length > 0) {
    redirect('/app')
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to Ops Atlas</h1>
          <p className="text-slate-400">Create your workspace to get started</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <form action="/api/onboarding" method="POST" className="space-y-6">
            <div>
              <label htmlFor="workspaceName" className="block text-sm font-medium text-slate-300 mb-2">
                Workspace Name
              </label>
              <input
                type="text"
                id="workspaceName"
                name="workspaceName"
                required
                placeholder="e.g., Acme Inc"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
            >
              Create Workspace
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
