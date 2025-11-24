import { redirect } from 'next/navigation'
import { getCurrentUserAndWorkspace } from '@/lib/auth'

export default async function LoginPage() {
  const context = await getCurrentUserAndWorkspace()
  
  // If already authenticated and has workspace, redirect to app
  if (context) {
    redirect('/app')
  }


  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{
      backgroundColor: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)'
    }}>
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative">
              {/* Globe Logo - matching sidebar */}
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="url(#globe-gradient)" strokeWidth="1.5" fill="none"/>
                <ellipse cx="12" cy="12" rx="9" ry="4" stroke="url(#globe-gradient)" strokeWidth="1.5" fill="none" opacity="0.6"/>
                <ellipse cx="12" cy="12" rx="9" ry="6.5" stroke="url(#globe-gradient)" strokeWidth="1.5" fill="none" opacity="0.4"/>
                <path d="M 12 3 Q 7 12 12 21 Q 17 12 12 3" stroke="url(#globe-gradient)" strokeWidth="1.5" fill="none" opacity="0.6"/>
                <circle cx="12" cy="12" r="1.5" fill="url(#globe-gradient)"/>
                <defs>
                  <linearGradient id="globe-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#06b6d4"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold" style={{ 
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em'
              }}>
                OpAtlas
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Operational Intelligence
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Welcome back
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Sign in to access your playbooks and team knowledge
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="border rounded-xl p-8 backdrop-blur-sm" style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <div className="space-y-4">
            {/* GitHub Sign In */}
            <a
              href="/api/auth/signin/github"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-all group hover-subtle"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-secondary)',
                border: '1px solid',
                color: 'var(--text-primary)'
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </a>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'var(--border-secondary)' }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 text-xs font-medium" style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-muted)'
                }}>
                  or continue with
                </span>
              </div>
            </div>

            {/* Email Sign In */}
            <a
              href="/api/auth/signin/email"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-all hover-lift"
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--info) 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Continue with Email
            </a>
          </div>

          {/* Footer Text */}
          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'var(--border-secondary)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <span style={{ color: 'var(--text-accent)' }} className="font-medium">
              Sign up during authentication
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
