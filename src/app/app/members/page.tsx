import { Users as UsersIcon, UserPlus, Crown, Edit, Eye } from 'lucide-react'
import { getCurrentUserAndWorkspace } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function MembersPage() {
  const context = await getCurrentUserAndWorkspace()
  
  const demoContext = context || {
    workspace: { id: '1', name: 'Demo Workspace' },
    membership: { role: 'owner' as const },
  }

  let members: any[] = []
  
  try {
    members = await prisma.workspaceMember.findMany({
      where: { workspaceId: demoContext.workspace.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { role: 'asc' },
    })
  } catch (error) {
    // Demo data
    members = [
      {
        userId: '1',
        role: 'owner' as const,
        user: {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          image: null,
        },
      },
    ]
  }

  const roleIcons = {
    owner: Crown,
    editor: Edit,
    viewer: Eye,
  }

  const roleColors = {
    owner: 'blue',
    editor: 'cyan',
    viewer: 'slate',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Team Members</h1>
          <p className="text-slate-400">{members.length} members in your workspace</p>
        </div>
        {demoContext.membership.role === 'owner' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors">
            <UserPlus className="w-5 h-5" />
            Invite Member
          </button>
        )}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg divide-y divide-slate-700">
        {members.map((member) => {
          const RoleIcon = roleIcons[member.role as keyof typeof roleIcons]
          const color = roleColors[member.role as keyof typeof roleColors]
          
          return (
            <div key={member.userId} className="p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center gap-4">
                {member.user.image ? (
                  <img
                    src={member.user.image}
                    alt={member.user.name || 'User'}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                    {(member.user.name || member.user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">{member.user.name || member.user.email}</p>
                  <p className="text-sm text-slate-400">{member.user.email}</p>
                </div>
              </div>

              <div className={`flex items-center gap-2 px-3 py-1.5 rounded bg-${color}-600/10 text-${color}-400`}>
                <RoleIcon className="w-4 h-4" />
                <span className="text-sm font-medium capitalize">{member.role}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
