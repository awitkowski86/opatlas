import { History as HistoryIcon, FileText, MessageSquare, UserPlus, Settings } from 'lucide-react'
import { getCurrentUserAndWorkspace } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function ActivityPage() {
  const context = await getCurrentUserAndWorkspace()
  
  const demoContext = context || {
    workspace: { id: '1', name: 'Demo Workspace' },
  }

  let recentQuestions: any[] = []
  let recentPlaybooks: any[] = []
  
  try {
    recentQuestions = await prisma.questionLog.findMany({
      where: { workspaceId: demoContext.workspace.id },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    })

    recentPlaybooks = await prisma.playbook.findMany({
      where: { workspaceId: demoContext.workspace.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    })
  } catch (error) {
    console.log('Database not connected')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Activity</h1>
        <p className="text-slate-400">Recent activity in your workspace</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-semibold text-white">Recent Activity</h2>
        </div>
        <div className="divide-y divide-slate-700">
          {recentPlaybooks.map((playbook) => (
            <div key={`playbook-${playbook.id}`} className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-600/10">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white">
                  <span className="font-medium">{playbook.createdBy.name || playbook.createdBy.email}</span>
                  {' '}created playbook{' '}
                  <span className="font-medium">{playbook.title}</span>
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {new Date(playbook.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}

          {recentQuestions.map((question) => (
            <div key={`question-${question.id}`} className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-600/10">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-white">
                  <span className="font-medium">{question.user.name || question.user.email}</span>
                  {' '}asked: "{question.question}"
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {new Date(question.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}

          {recentPlaybooks.length === 0 && recentQuestions.length === 0 && (
            <div className="p-12 text-center">
              <HistoryIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No activity yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
