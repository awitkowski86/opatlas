import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { marked } from 'marked';
import archiver from 'archiver';

const notion = new Client({ auth: process.env.NOTION_KEY });

export async function POST(req: Request) {
  const { url } = await req.json();
  const pageId = url.split('-').pop()?.split('?')[0] ?? '';

  const n2m = new NotionToMarkdown({ notionClient: notion });
  const mdBlocks = await n2m.pageToMarkdown(pageId);
  const markdown = n2m.toMarkdownString(mdBlocks).parent;
  const html = marked(markdown);

  const fullHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Published with PublishNotion</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900">
<article class="prose prose-lg max-w-4xl mx-auto p-8">${html}</article>
</body></html>`;

  const zip = archiver('zip');
  zip.append(fullHtml, { name: 'index.html' });
  zip.finalize();

  return new Response(zip as any, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=site.zip',
    },
  });
}