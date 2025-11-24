'use client'

import Link from 'next/link'
import { BookOpen, Sparkles, Users, ArrowRight, CheckCircle2, Zap, Shield, Globe } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 backdrop-blur-lg" style={{
        backgroundColor: 'rgba(10, 14, 18, 0.8)',
        borderBottom: '1px solid var(--border-primary)'
      }}>
        <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo matching the app */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="url(#globe-gradient-header)" strokeWidth="1.5" fill="none"/>
              <ellipse cx="12" cy="12" rx="9" ry="4" stroke="url(#globe-gradient-header)" strokeWidth="1.5" fill="none" opacity="0.6"/>
              <ellipse cx="12" cy="12" rx="9" ry="6.5" stroke="url(#globe-gradient-header)" strokeWidth="1.5" fill="none" opacity="0.4"/>
              <path d="M 12 3 Q 7 12 12 21 Q 17 12 12 3" stroke="url(#globe-gradient-header)" strokeWidth="1.5" fill="none" opacity="0.6"/>
              <circle cx="12" cy="12" r="1.5" fill="url(#globe-gradient-header)"/>
              <defs>
                <linearGradient id="globe-gradient-header" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6"/>
                  <stop offset="100%" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="font-bold text-xl" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              OpAtlas
            </span>
          </div>
          <Link
            href="/login"
            className="px-5 py-2 rounded-lg font-medium transition-all hover-lift"
            style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--info) 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-32 pb-20 text-center">
        {/* Background gradient effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 transition-all hover:scale-105" style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: 'var(--text-accent)'
          }}>
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Operational Intelligence</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{
            background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Your Team's Playbooks,<br />
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Powered by AI
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Stop searching through scattered docs. Centralize your SOPs, runbooks, and processes—then ask questions and get instant, AI-powered answers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all text-lg group hover-lift"
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--info) 100%)',
                color: 'white',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
              }}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all text-lg border hover-subtle"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              Learn More
            </a>
          </div>

          {/* Social Proof / Stats */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} />
              <span>Free for small teams</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} />
              <span>Setup in minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Everything you need for operational excellence
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Built for teams that value speed, clarity, and consistency
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-8 rounded-xl border transition-all hover:scale-105" style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <BookOpen className="w-7 h-7" style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="font-semibold text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
              Centralized Playbooks
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Store all your SOPs, runbooks, and processes in one searchable place with full markdown support.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-xl border transition-all hover:scale-105" style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.05) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.3)'
            }}>
              <Sparkles className="w-7 h-7" style={{ color: 'var(--info)' }} />
            </div>
            <h3 className="font-semibold text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
              AI-Powered Q&A
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Ask natural questions and get instant answers grounded in your team's playbooks with step-by-step guidance.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-xl border transition-all hover:scale-105" style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <Users className="w-7 h-7" style={{ color: 'var(--success)' }} />
            </div>
            <h3 className="font-semibold text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
              Team Collaboration
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Role-based access, real-time presence, mentions, and comments keep everyone aligned.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-8 rounded-xl border transition-all hover:scale-105" style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{
              background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(251, 146, 60, 0.05) 100%)',
              border: '1px solid rgba(251, 146, 60, 0.3)'
            }}>
              <Zap className="w-7 h-7" style={{ color: 'var(--warning)' }} />
            </div>
            <h3 className="font-semibold text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
              Track Execution
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Turn playbooks into trackable runs with progress monitoring, step notes, and completion metrics.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-8 rounded-xl border transition-all hover:scale-105" style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.05) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.3)'
            }}>
              <Shield className="w-7 h-7" style={{ color: '#a855f7' }} />
            </div>
            <h3 className="font-semibold text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
              Secure & Private
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Your data stays private with workspace isolation and role-based permissions.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-8 rounded-xl border transition-all hover:scale-105" style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.05) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <Globe className="w-7 h-7" style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="font-semibold text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
              Smart Recommendations
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Get contextual playbook suggestions based on your team's activity and patterns.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="rounded-2xl p-12 text-center border" style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
          borderColor: 'var(--border-primary)'
        }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Ready to streamline your operations?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            Join teams using OpAtlas to build better operational processes
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all text-lg hover-lift"
            style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--info) 100%)',
              color: 'white',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
            }}
          >
            Start Free Today
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="url(#globe-gradient-footer)" strokeWidth="1.5" fill="none"/>
                <ellipse cx="12" cy="12" rx="9" ry="4" stroke="url(#globe-gradient-footer)" strokeWidth="1.5" fill="none" opacity="0.6"/>
                <path d="M 12 3 Q 7 12 12 21 Q 17 12 12 3" stroke="url(#globe-gradient-footer)" strokeWidth="1.5" fill="none" opacity="0.6"/>
                <circle cx="12" cy="12" r="1.5" fill="url(#globe-gradient-footer)"/>
                <defs>
                  <linearGradient id="globe-gradient-footer" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#06b6d4"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>OpAtlas</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              © 2025 OpAtlas. Built for teams that move fast.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

