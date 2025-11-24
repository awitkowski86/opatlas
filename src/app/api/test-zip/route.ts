import { NextResponse } from 'next/server';
import archiver from 'archiver';

export async function GET() {
  try {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Test Landing Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 min-h-screen p-12">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-5xl font-bold mb-6">Test Landing Page</h1>
    <p class="text-xl text-slate-400 mb-8">This is a test export from PublishNotion</p>
    
    <form id="waitlistForm" class="max-w-md space-y-4">
      <input 
        type="email" 
        id="emailInput"
        placeholder="you@example.com" 
        required
        class="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-700 focus:border-indigo-500 text-white"
      />
      <button 
        type="submit"
        class="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium">
        Join Waitlist
      </button>
    </form>
    
    <div id="successMessage" class="hidden text-green-400 mt-4">
      ✓ Thanks! Check your email to confirm.
    </div>
  </div>
  
  <script>
    document.getElementById('waitlistForm').addEventListener('submit', function(e) {
      e.preventDefault();
      this.classList.add('hidden');
      document.getElementById('successMessage').classList.remove('hidden');
    });
  </script>
</body>
</html>`;

    const readme = `# Test Landing Page

This is a test export from PublishNotion.

## Files Included
- index.html - Your landing page
- README.md - This file

## Next Steps
1. Open index.html in a browser to preview
2. Deploy to Vercel/Netlify for production
`;

    // Create zip
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Uint8Array[] = [];

    // Set up promise before adding event listeners
    const zipPromise = new Promise<void>((resolve, reject) => {
      archive.on('end', () => resolve());
      archive.on('error', (err) => reject(err));
    });

    archive.on('data', (chunk) => chunks.push(chunk));

    // Add files
    archive.append(html, { name: 'index.html' });
    archive.append(readme, { name: 'README.md' });
    
    // Finalize must happen before waiting
    archive.finalize();

    // Wait for completion
    await zipPromise;

    const buffer = Buffer.concat(chunks);
    
    console.log('Zip created:', {
      size: buffer.length,
      chunks: chunks.length
    });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="test-landing-page.zip"',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Test zip error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
