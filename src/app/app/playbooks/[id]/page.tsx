'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, Edit, Trash2, Calendar, User, Tag as TagIcon, BookOpen, List, Clock, Search, Play, Link2 } from 'lucide-react'
import Link from 'next/link'
import PresenceIndicator from '@/components/PresenceIndicator'
import { LoadingPage } from '@/components/LoadingSpinner'

type Playbook = {
  id: string
  title: string
  description: string
  contentMd: string
  tags: string[]
  createdAt: string
  updatedAt: string
  author: {
    name: string
    email: string
  }
}

interface TocItem {
  id: string
  text: string
  level: number
}

export default function PlaybookPage() {
  const params = useParams()
  const router = useRouter()
  const [playbook, setPlaybook] = useState<Playbook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toc, setToc] = useState<TocItem[]>([])
  const [showToc, setShowToc] = useState(true)
  const [activeSection, setActiveSection] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [startingRun, setStartingRun] = useState(false)
  const [relatedPlaybooks, setRelatedPlaybooks] = useState<any[]>([])
  const contentRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchPlaybook = async () => {
      try {
        const response = await fetch(`/api/playbooks/${params.id}`)
        if (!response.ok) {
          throw new Error('Playbook not found')
        }
        const data = await response.json()
        setPlaybook(data)
        
        // Fetch related playbooks if this playbook has triggers
        if (data.triggers && data.triggers.length > 0) {
          const recsResponse = await fetch(`/api/recommendations?workspaceId=1&context=${encodeURIComponent(data.triggers[0])}`)
          if (recsResponse.ok) {
            const recsData = await recsResponse.json()
            // Filter out the current playbook
            setRelatedPlaybooks(recsData.filter((p: any) => p.id !== data.id).slice(0, 3))
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load playbook')
      } finally {
        setLoading(false)
      }
    }

    fetchPlaybook()
  }, [params.id])

  // Generate table of contents from markdown content
  useEffect(() => {
    if (playbook && playbook.contentMd) {
      const createSlug = (text: string): string => {
        return text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .trim()
      }

      // Parse markdown headings
      const lines = playbook.contentMd.split('\n')
      const tocItems: TocItem[] = []
      
      lines.forEach((line, index) => {
        const match = line.match(/^(#{1,6})\s+(.+)$/)
        if (match) {
          const level = match[1].length
          const text = match[2].trim()
          const id = createSlug(text) || `heading-${index}`
          tocItems.push({ id, text, level })
        }
      })
      
      setToc(tocItems)
    }
  }, [playbook?.contentMd])

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current || !scrollContainerRef.current) return
      
      const container = scrollContainerRef.current
      const containerRect = container.getBoundingClientRect()
      const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6')
      let current = ''
      
      headings.forEach(heading => {
        const rect = heading.getBoundingClientRect()
        const relativeTop = rect.top - containerRect.top
        if (relativeTop <= 100 && relativeTop >= -50) {
          current = heading.id
        }
      })
      
      if (!current) {
        headings.forEach(heading => {
          const rect = heading.getBoundingClientRect()
          const relativeTop = rect.top - containerRect.top
          if (relativeTop <= 100) {
            current = heading.id
          }
        })
      }
      
      setActiveSection(current)
    }

    const container = scrollContainerRef.current
    if (container) {
      handleScroll()
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [playbook])

  const scrollToSection = (id: string) => {
    setTimeout(() => {
      const element = document.getElementById(id)
      const container = scrollContainerRef.current
      
      if (element && container) {
        const containerRect = container.getBoundingClientRect()
        const elementRect = element.getBoundingClientRect()
        const offset = elementRect.top - containerRect.top + container.scrollTop - 20
        
        container.scrollTo({
          top: offset,
          behavior: 'smooth'
        })
      }
    }, 100)
  }

  // Filter TOC based on search query
  const filteredToc = toc.filter(item => 
    item.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStartRun = async () => {
    if (!playbook) return
    
    setStartingRun(true)
    try {
      const response = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: '1',
          playbookId: playbook.id,
          playbookTitle: playbook.title,
          userId: '1',
          userName: 'Demo User'
        })
      })

      if (!response.ok) throw new Error('Failed to start run')

      const run = await response.json()
      router.push(`/app/runs/${run.id}`)
    } catch (error) {
      console.error('Failed to start run:', error)
      alert('Failed to start playbook run')
    } finally {
      setStartingRun(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this playbook?')) return

    try {
      const response = await fetch(`/api/playbooks/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete playbook')
      }

      router.push('/app/playbooks')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete playbook')
    }
  }

  if (loading) {
    return <LoadingPage message="Loading playbook..." />
  }

  if (error || !playbook) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-6 rounded-lg border" style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'var(--error)',
          color: 'var(--error)'
        }}>
          {error || 'Playbook not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 96px)', overflow: 'hidden' }}>
      {/* Action Bar - Fixed at top */}
      <div className="flex-shrink-0" style={{ padding: '12px', paddingBottom: '0' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
          <div className="flex items-center" style={{ gap: '12px' }}>
            <button
              onClick={() => router.back()}
              className="flex items-center px-3 py-2 border rounded text-xs transition-all duration-200"
              style={{
                gap: '8px',
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-secondary)',
                color: 'var(--text-primary)'
              }}
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back</span>
            </button>

            {toc.length > 0 && (
              <button
                onClick={() => setShowToc(!showToc)}
                className="flex items-center px-3 py-2 border rounded text-xs transition-all duration-200"
                style={{
                  gap: '8px',
                  backgroundColor: showToc ? 'rgba(0, 120, 212, 0.7)' : 'var(--bg-secondary)',
                  borderColor: showToc ? 'rgba(16, 110, 190, 0.8)' : 'var(--border-secondary)',
                  color: 'var(--text-primary)'
                }}
              >
                <BookOpen className="h-3 w-3" />
                <span>{showToc ? 'Hide' : 'Show'} Contents</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <PresenceIndicator location={`playbook:${playbook.id}`} />
            
            <button
              onClick={handleStartRun}
              disabled={startingRun}
              className="flex items-center gap-2 px-4 py-2 rounded text-xs font-medium transition-all"
              style={{
                backgroundColor: startingRun ? 'rgba(0, 120, 212, 0.5)' : 'rgba(0, 120, 212, 0.9)',
                color: 'white',
                border: '1px solid rgba(16, 110, 190, 0.8)',
                cursor: startingRun ? 'not-allowed' : 'pointer'
              }}
            >
              <Play className="w-3 h-3" />
              {startingRun ? 'Starting...' : 'Start Run'}
            </button>

            <button
              onClick={() => router.push(`/app/playbooks/${playbook.id}/edit`)}
              className="flex items-center gap-2 px-3 py-2 rounded text-xs transition-all"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-secondary)'
              }}
            >
              <Edit className="w-3 h-3" />
              Edit
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-2 rounded text-xs transition-all"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--error)',
                border: '1px solid var(--error)'
              }}
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        </div>

        {/* Playbook Summary */}
        <div className="border rounded-lg px-4 py-3" style={{
          marginBottom: '12px',
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-secondary)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.2)'
        }}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {playbook.title}
              </h1>
              {playbook.description && (
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {playbook.description}
                </div>
              )}
            </div>
            <div className="ml-4 flex items-center space-x-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Clock className="h-3 w-3" />
              <span>{Math.max(1, Math.ceil((playbook.contentMd?.length || 0) / 1000))} min read</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-2">
              <User className="w-3 h-3" />
              {playbook.author.name}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              {new Date(playbook.createdAt).toLocaleDateString()}
            </div>
            {playbook.tags && playbook.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <TagIcon className="w-3 h-3" />
                {playbook.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                      fontSize: '11px'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Related Playbooks */}
          {relatedPlaybooks.length > 0 && (
            <div className="mt-4 pt-4 border-t" style={{ borderTopColor: 'var(--border-secondary)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Related Playbooks
                </span>
              </div>
              <div className="space-y-2">
                {relatedPlaybooks.map((related: any) => (
                  <Link
                    key={related.id}
                    href={`/app/playbooks/${related.id}`}
                    className="block p-2 rounded transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 120, 212, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                    }}
                  >
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {related.title}
                    </div>
                    {related.recommendationReasons && related.recommendationReasons.length > 0 && (
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {related.recommendationReasons[0]}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex flex-1 min-h-0" style={{ padding: '0 12px 12px 12px', gap: '12px' }}>
        {/* Table of Contents Sidebar */}
        {toc.length > 0 && showToc && (
          <div 
            className="border rounded-lg bg-opacity-95 backdrop-blur-sm flex-shrink-0"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-secondary)',
              width: '320px',
              height: '100%',
              overflow: 'hidden',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* TOC Header */}
            <div className="border-b" style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderBottomColor: 'var(--border-secondary)',
              padding: '12px'
            }}>
              <div className="flex items-center mb-3" style={{ gap: '8px' }}>
                <List className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                  Contents
                </span>
                {searchQuery && (
                  <span className="text-xs ml-auto" style={{ color: 'var(--text-secondary)' }}>
                    {filteredToc.length} of {toc.length}
                  </span>
                )}
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search sections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded text-xs border transition-all"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-secondary)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 120, 212, 0.5)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-secondary)'
                  }}
                />
              </div>
            </div>
            
            {/* TOC Navigation */}
            <div className="overflow-y-auto flex-1">
              {filteredToc.length === 0 ? (
                <div className="p-4 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
                  No sections match "{searchQuery}"
                </div>
              ) : (
                <div style={{ padding: '8px' }}>
                  {filteredToc.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left py-1 rounded transition-all duration-300 group w-full"
                    style={{
                      backgroundColor: activeSection === item.id ? 'rgba(88, 166, 255, 0.15)' : 'transparent',
                      fontSize: '13px',
                      paddingLeft: `${16 + (item.level - 1) * 16}px`,
                      paddingRight: '12px',
                      marginLeft: `${(item.level - 1) * 8}px`,
                      marginBottom: '2px',
                      width: `calc(100% - ${(item.level - 1) * 8}px)`,
                      display: 'block'
                    }}
                    title={`Jump to: ${item.text}`}
                  >
                    <div className="flex items-center" style={{ gap: '8px' }}>
                      <span 
                        className="flex-shrink-0 text-xs"
                        style={{ 
                          color: activeSection === item.id ? 'var(--text-accent)' : 'var(--text-secondary)',
                          minWidth: '12px'
                        }}
                      >
                        {item.level === 1 ? '●' : item.level === 2 ? '○' : '▪'}
                      </span>
                      <span 
                        className={`text-sm group-hover:text-white transition-colors ${
                          item.level === 1 ? 'font-medium' : 'font-normal'
                        }`}
                        style={{ 
                          color: activeSection === item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: '1'
                        }}
                      >
                        {item.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 min-w-0 overflow-y-auto" ref={scrollContainerRef}>
          <div className="border rounded-lg" style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-secondary)',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ padding: '24px' }} ref={contentRef}>
              <div className="prose prose-invert max-w-none markdown-content" style={{ color: 'var(--text-primary)' }}>
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 id={props.children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')} {...props} />,
                    h2: ({node, ...props}) => <h2 id={props.children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')} {...props} />,
                    h3: ({node, ...props}) => <h3 id={props.children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')} {...props} />,
                    h4: ({node, ...props}) => <h4 id={props.children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')} {...props} />,
                    h5: ({node, ...props}) => <h5 id={props.children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')} {...props} />,
                    h6: ({node, ...props}) => <h6 id={props.children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')} {...props} />,
                  }}
                >
                  {playbook.contentMd}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .markdown-content > *:first-child {
          margin-top: 0 !important;
        }
        .markdown-content h1 {
          margin-top: 1.5rem !important;
          margin-bottom: 0.75rem !important;
          scroll-margin-top: 20px;
        }
        .markdown-content h1:first-child {
          margin-top: 0 !important;
        }
        .markdown-content h2 {
          margin-top: 1.25rem !important;
          margin-bottom: 0.5rem !important;
          scroll-margin-top: 20px;
        }
        .markdown-content h3 {
          margin-top: 1rem !important;
          margin-bottom: 0.5rem !important;
          scroll-margin-top: 20px;
        }
        .markdown-content h4,
        .markdown-content h5,
        .markdown-content h6 {
          margin-top: 0.75rem !important;
          margin-bottom: 0.25rem !important;
          scroll-margin-top: 20px;
        }
        .markdown-content p {
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }
        .markdown-content ul,
        .markdown-content ol {
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }
      `}</style>
    </div>
  )
}
