import { NextRequest, NextResponse } from 'next/server'

// Get AI-powered playbook recommendations
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workspaceId = searchParams.get('workspaceId')
  const context = searchParams.get('context') // Optional: user's current situation

  if (!workspaceId) {
    return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
  }

  try {
    // Get all playbooks
    const playbooks = global.playbooksStore?.filter(p => String(p.workspaceId) === String(workspaceId)) || []
    
    // Get recent runs to understand usage patterns
    const recentRuns = global.playbookRunsStore?.filter(r => 
      String(r.workspaceId) === String(workspaceId)
    ).slice(0, 20) || []

    // Calculate recommendation scores
    const recommendations = playbooks.map((playbook: any) => {
      let score = 0
      const reasons: string[] = []

      // Factor 1: Recent runs (frequently used playbooks)
      const runCount = recentRuns.filter((r: any) => r.playbookId === playbook.id).length
      if (runCount > 0) {
        score += runCount * 10
        reasons.push(`Used ${runCount} time${runCount > 1 ? 's' : ''} recently`)
      }

      // Factor 2: Completion rate (successful playbooks)
      const playbookRuns = recentRuns.filter((r: any) => r.playbookId === playbook.id)
      const completedRuns = playbookRuns.filter((r: any) => r.status === 'completed').length
      if (playbookRuns.length > 0) {
        const completionRate = completedRuns / playbookRuns.length
        score += completionRate * 20
        if (completionRate > 0.8) {
          reasons.push(`${Math.round(completionRate * 100)}% completion rate`)
        }
      }

      // Factor 3: Recency (recently created playbooks)
      const daysSinceCreated = (Date.now() - new Date(playbook.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceCreated < 7) {
        score += 15
        reasons.push('Recently created')
      }

      // Factor 4: Has triggers (well-documented when to use)
      if (playbook.triggers && playbook.triggers.length > 0) {
        score += 10
        reasons.push('Clear use-case defined')
      }

      // Factor 5: Context matching (if provided)
      if (context && playbook.triggers) {
        const contextMatch = playbook.triggers.some((trigger: string) =>
          context.toLowerCase().includes(trigger.toLowerCase()) ||
          trigger.toLowerCase().includes(context.toLowerCase())
        )
        if (contextMatch) {
          score += 50
          reasons.push(`Matches "${context}"`)
        }
      }

      // Factor 6: Tag matching (popular categories)
      if (playbook.tags && playbook.tags.length > 0) {
        score += playbook.tags.length * 2
      }

      // Factor 7: Has related playbooks (part of a workflow)
      if (playbook.relatedPlaybooks && playbook.relatedPlaybooks.length > 0) {
        score += 5
        reasons.push('Part of workflow')
      }

      return {
        ...playbook,
        recommendationScore: score,
        recommendationReasons: reasons
      }
    })

    // Sort by score and return top recommendations
    const sorted = recommendations
      .filter(r => r.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 5) // Top 5 recommendations

    console.log('Recommendations:', sorted.map(r => ({ 
      title: r.title, 
      score: r.recommendationScore, 
      reasons: r.recommendationReasons 
    })))

    return NextResponse.json(sorted)
  } catch (error) {
    console.error('Recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}
