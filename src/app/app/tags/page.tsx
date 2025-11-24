import { Tags } from 'lucide-react'
import { getCurrentUserAndWorkspace } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function TagsPage() {
  const context = await getCurrentUserAndWorkspace()
  
  const demoContext = context || {
    workspace: { id: '1', name: 'Demo Workspace' },
  }

  let tags: any[] = []
  
  try {
    tags = await prisma.tag.findMany({
      where: { workspaceId: demoContext.workspace.id },
      include: {
        playbooks: {
          include: { playbook: true },
        },
      },
    })
  } catch (error) {
    console.log('Database not connected')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Tags</h1>
        <p className="text-slate-400">Organize your playbooks with tags</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tags.map((tag) => (
          <div key={tag.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-blue-600 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <Tags className="w-4 h-4 text-blue-400" />
              <h3 className="font-medium text-white">{tag.name}</h3>
            </div>
            <p className="text-sm text-slate-400">{tag.playbooks.length} playbooks</p>
          </div>
        ))}
        {tags.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Tags className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No tags yet. Tags are created when you add them to playbooks.</p>
          </div>
        )}
      </div>
    </div>
  )
}