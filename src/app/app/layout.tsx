import { redirect } from 'next/navigation'
import { getCurrentUserAndWorkspace } from '@/lib/auth'
import AppSidebar from '@/components/AppSidebar'
import AppHeader from '@/components/AppHeader'
import AskOpsChat from '@/components/AskOpsChat'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const context = await getCurrentUserAndWorkspace()

  // TODO: Re-enable auth after testing
  // Redirect to login if not authenticated
  // if (!context) {
  //   redirect('/login')
  // }

  // Redirect to onboarding if no workspace
  // if (!context.workspace) {
  //   redirect('/onboarding')
  // }

  // Demo data for testing without auth
  const demoContext = context || {
    user: { id: '1', name: 'Demo User', email: 'demo@example.com', image: null },
    workspace: { id: '1', name: 'Demo Workspace', createdAt: new Date() },
    membership: { userId: '1', workspaceId: '1', role: 'owner' as const },
  }

  return (
    <div className="min-h-screen" style={{
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      <div className="flex h-screen">
        {/* Left Sidebar - Fixed */}
        <div className="fixed left-0 top-0 bottom-0 w-16">
          <AppSidebar workspace={demoContext.workspace} role={demoContext.membership.role} />
        </div>
        
        {/* Main Content Area - Offset by sidebar width */}
        <div className="flex-1 flex flex-col ml-16">
          {/* Fixed Top Header */}
          <div className="fixed top-0 right-0 left-16 z-40">
            <AppHeader 
              workspace={demoContext.workspace}
              user={demoContext.user}
              role={demoContext.membership.role}
            />
          </div>
          
          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto mt-12 px-8 py-6" style={{
            backgroundColor: 'var(--bg-primary)'
          }}>
            {children}
          </main>
        </div>
      </div>

      {/* Ask Ops Chat Bubble */}
      <AskOpsChat />
    </div>
  )
}
