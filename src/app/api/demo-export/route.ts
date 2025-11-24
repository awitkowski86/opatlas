import { NextResponse } from 'next/server';
import archiver from 'archiver';

// This tests the full export flow with mock Notion content
export async function GET() {
  try {
    // Mock markdown content (what would come from Notion)
    const mockMarkdown = `# Ship Your SaaS Fast

Launch your idea in days, not months. Built for indie hackers and technical founders.

## Why We Exist

Most developers spend 60% of their time on boilerplate: auth, payments, deployment pipelines.

Your competitors are shipping and getting feedback.

We help you skip the boring parts and focus on what makes your idea unique.

## Features

**⚡ Lightning Fast Setup**
Start coding in 5 minutes, not 5 hours.

**🔐 Auth Built-In**  
Login, signup, password reset ready to go.

**💳 Stripe Integration**
Accept payments from day one.

**🚀 Deploy Anywhere**
Vercel, Netlify, or your own server.

## Pricing

$29 - Lifetime Access

What's included:
- Unlimited projects
- All current features  
- Lifetime updates
- Email support
- Commercial license

## Join the Waitlist

Be the first to know when we launch.`;

    // Convert markdown to HTML (simplified - in production uses marked.parse)
    const html = mockMarkdown
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^\*\*(.+?)\*\*$/gm, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>');

    // Full landing page HTML (same as production)
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Launching soon - Join the waitlist">
  <title>Ship Your SaaS Fast</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; }
  </style>
  <!-- Simple Analytics -->
  <script>
    window.addEventListener('load', function() {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('https://plausible.io/api/event', JSON.stringify({
          n: 'pageview',
          u: location.href,
          d: location.hostname,
          r: document.referrer || null
        }));
      }
    });
    
    function trackConversion(email) {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('https://plausible.io/api/event', JSON.stringify({
          n: 'signup',
          u: location.href,
          d: location.hostname,
          props: { email: email }
        }));
      }
    }
  </script>
</head>
<body class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 min-h-screen">
  <div class="max-w-5xl mx-auto px-6 py-16">
    <!-- Hero Section -->
    <div class="text-center mb-16">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-6">
        <span class="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
        <span>Built from Notion</span>
      </div>
      <article class="prose prose-invert prose-lg max-w-4xl mx-auto">
        ${html}
      </article>
    </div>
    
    <!-- Email Capture Form -->
    <div class="mt-16 text-center">
      <div class="inline-flex flex-col gap-6 p-8 rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 max-w-md mx-auto">
        <div>
          <h3 class="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-2">
            Ready to launch your idea?
          </h3>
          <p class="text-slate-400 text-sm">
            Join the waitlist and be the first to know when we launch
          </p>
        </div>
        
        <form id="waitlistForm" class="w-full space-y-3">
          <input 
            type="email" 
            id="emailInput"
            name="email"
            placeholder="you@example.com" 
            required
            class="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder-slate-500 text-sm"
          />
          <button 
            type="submit"
            class="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/20">
            Join Waitlist
          </button>
        </form>
        
        <p class="text-xs text-slate-500">No spam. Unsubscribe anytime.</p>
        
        <div id="successMessage" class="hidden text-green-400 text-sm font-medium">
          ✓ Thanks! Check your email to confirm.
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <footer class="mt-20 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
      <p>Powered by <a href="https://publishnotion.com" class="text-indigo-400 hover:text-indigo-300">PublishNotion</a></p>
    </footer>
  </div>
  
  <script>
    document.getElementById('waitlistForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('emailInput').value;
      const form = e.target;
      const submitBtn = form.querySelector('button[type="submit"]');
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Joining...';
      
      try {
        const webhookUrl = 'https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/';
        
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: email,
            timestamp: new Date().toISOString(),
            page: location.href
          })
        });
        
        trackConversion(email);
        
        form.classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');
      } catch (error) {
        window.location.href = \`mailto:you@example.com?subject=Waitlist Signup&body=Email: \${email}\`;
        form.classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');
      }
    });
  </script>
</body>
</html>`;

    const readme = `# Your SaaS Landing Page

Generated by PublishNotion - Ship your landing page in 10 minutes

## Quick Start

1. Open \`index.html\` in a browser to preview locally
2. Deploy to Vercel/Netlify/Cloudflare Pages for free hosting

## Email Form Setup (Required)

The email form uses a webhook. Replace the webhook URL in \`index.html\`:

\`\`\`javascript
const webhookUrl = 'https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/';
\`\`\`

### Option 1: Zapier (Easiest)
1. Go to https://zapier.com/app/zaps
2. Create a new Zap with "Webhooks by Zapier" trigger
3. Choose "Catch Hook"
4. Copy the webhook URL
5. Replace YOUR_WEBHOOK_ID in index.html
6. Connect to Gmail, Slack, Notion, or any app

### Option 2: Make.com (Similar to Zapier)
1. Go to https://make.com
2. Create scenario with Webhook trigger
3. Copy webhook URL and update index.html

### Option 3: Email Fallback
If you don't set up a webhook, it falls back to opening the user's email client (mailto:)
Update the email in index.html: \`mailto:you@example.com\`

## Analytics Setup (Optional)

The page tracks pageviews and signups using Plausible.io format.

To enable analytics:
1. Sign up at https://plausible.io or use self-hosted version
2. Add your domain to Plausible
3. Analytics will automatically start tracking

## Custom Domain

Deploy to any static host:
- Vercel: \`vercel --prod\`
- Netlify: Drag & drop this folder
- Cloudflare Pages: Connect to Git repo
- GitHub Pages: Push to gh-pages branch

Then point your custom domain in the hosting settings.

## What's Included

✓ Mobile-responsive design
✓ Email capture form with webhook integration
✓ Analytics tracking (Plausible-compatible)
✓ SEO meta tags
✓ Fast loading with CDN fonts

---

Need help? Visit https://publishnotion.com
`;

    // Create zip
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Uint8Array[] = [];

    const zipPromise = new Promise<void>((resolve, reject) => {
      archive.on('end', () => resolve());
      archive.on('error', (err) => reject(err));
    });

    archive.on('data', (chunk) => chunks.push(chunk));

    archive.append(fullHtml, { name: 'index.html' });
    archive.append(readme, { name: 'README.md' });
    
    archive.finalize();
    await zipPromise;

    const buffer = Buffer.concat(chunks);
    
    console.log('Mock export created:', {
      size: buffer.length,
      files: 2
    });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="saas-landing-page.zip"',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Mock export error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
