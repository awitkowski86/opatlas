'use client'

import { useState, useRef, useEffect } from 'react'
import { AtSign } from 'lucide-react'

interface MentionInputProps {
  value: string
  onChange: (value: string, mentions: string[]) => void
  placeholder?: string
  className?: string
  style?: React.CSSProperties
  onSubmit?: () => void
  autoFocus?: boolean
  onCancel?: () => void
}

const TEAM_MEMBERS = [
  { id: '1', name: 'Demo User' },
  { id: '2', name: 'Alice Johnson' },
  { id: '3', name: 'Bob Smith' },
  { id: '4', name: 'Carol Williams' },
  { id: '5', name: 'David Brown' }
]

export default function MentionInput({
  value,
  onChange,
  placeholder = 'Type @ to mention someone...',
  className = '',
  style,
  onSubmit,
  autoFocus,
  onCancel
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState(TEAM_MEMBERS)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Extract mentions from text
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g
    const matches = text.matchAll(mentionRegex)
    const mentionedNames: string[] = []
    
    for (const match of matches) {
      const name = match[1]
      const member = TEAM_MEMBERS.find(m => 
        m.name.toLowerCase() === name.toLowerCase()
      )
      if (member) {
        mentionedNames.push(member.id)
      }
    }
    
    return [...new Set(mentionedNames)]
  }

  // Check if we should show suggestions
  useEffect(() => {
    const checkForMention = () => {
      const textBeforeCursor = value.slice(0, cursorPosition)
      const lastAtIndex = textBeforeCursor.lastIndexOf('@')
      
      if (lastAtIndex === -1) {
        setShowSuggestions(false)
        return
      }

      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1)
      
      // Only show if @ is at start or after whitespace and no space after @
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' '
      if (!/\s/.test(charBeforeAt) && lastAtIndex !== 0) {
        setShowSuggestions(false)
        return
      }

      if (/\s/.test(textAfterAt)) {
        setShowSuggestions(false)
        return
      }

      // Filter suggestions
      const filtered = TEAM_MEMBERS.filter(member =>
        member.name.toLowerCase().includes(textAfterAt.toLowerCase())
      )

      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
      setSelectedIndex(0)
    }

    checkForMention()
  }, [value, cursorPosition])

  const insertMention = (member: typeof TEAM_MEMBERS[0]) => {
    const textBeforeCursor = value.slice(0, cursorPosition)
    const textAfterCursor = value.slice(cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')
    
    const newText = 
      textBeforeCursor.slice(0, lastAtIndex) + 
      `@${member.name} ` + 
      textAfterCursor

    const mentions = extractMentions(newText)
    onChange(newText, mentions)
    setShowSuggestions(false)

    // Move cursor after the mention
    setTimeout(() => {
      const newPosition = lastAtIndex + member.name.length + 2
      inputRef.current?.setSelectionRange(newPosition, newPosition)
      inputRef.current?.focus()
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % suggestions.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insertMention(suggestions[selectedIndex])
      } else if (e.key === 'Escape') {
        setShowSuggestions(false)
      }
    } else {
      if (e.key === 'Enter' && !e.shiftKey && onSubmit) {
        e.preventDefault()
        onSubmit()
      } else if (e.key === 'Escape' && onCancel) {
        onCancel()
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const mentions = extractMentions(newValue)
    onChange(newValue, mentions)
  }

  const handleSelect = () => {
    setCursorPosition(inputRef.current?.selectionStart || 0)
  }

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        onClick={handleSelect}
        placeholder={placeholder}
        className={className}
        style={style}
        autoFocus={autoFocus}
        rows={3}
      />

      {showSuggestions && (
        <div 
          className="absolute z-50 border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-secondary)',
            bottom: '100%',
            left: 0,
            right: 0,
            marginBottom: '4px'
          }}
        >
          {suggestions.map((member, index) => (
            <button
              key={member.id}
              onClick={() => insertMention(member)}
              className="w-full px-4 py-2 text-left transition-all flex items-center gap-2"
              style={{
                backgroundColor: index === selectedIndex ? 'var(--bg-tertiary)' : 'transparent',
                color: 'var(--text-primary)'
              }}
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                style={{
                  backgroundColor: 'var(--text-accent)',
                  color: 'white'
                }}
              >
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span>{member.name}</span>
              <AtSign className="w-3 h-3 ml-auto" style={{ color: 'var(--text-secondary)' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
