# Ops Atlas

An AI-powered playbook management system for small teams. Create, organize, and query your team's operational knowledge with an intelligent assistant.

## Features

- **Centralized Playbooks**: Store all SOPs, runbooks, and processes with markdown support
- **AI-Powered Q&A**: Ask questions and get instant answers grounded in your playbooks
- **Role-Based Access**: Owner, Editor, and Viewer roles for team collaboration
- **Workspace Management**: Multi-tenant architecture with workspace isolation
- **Modern UI**: Clean, dark-themed interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with GitHub OAuth and Email providers
- **AI**: OpenAI GPT-4 with RAG pattern
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 22.x
- PostgreSQL database (Supabase, Neon, or local)
- OpenAI API key

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd opsatlas
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random string (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your app URL (http://localhost:3000 in dev)
- `GITHUB_ID` & `GITHUB_SECRET`: GitHub OAuth app credentials
- `EMAIL_SERVER_*`: SMTP settings for magic link emails
- `OPENAI_API_KEY`: Your OpenAI API key

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Schema

- **User**: NextAuth user model
- **Workspace**: Team workspace with isolated data
- **WorkspaceMember**: User-workspace membership with roles (owner/editor/viewer)
- **Playbook**: Documentation with markdown content
- **Tag**: Playbook categorization
- **PlaybookTag**: Many-to-many relationship
- **QuestionLog**: AI Q&A history

## Role Permissions

- **Owner**: Full access - manage workspace, members, and playbooks
- **Editor**: Create and edit playbooks
- **Viewer**: Read-only access to playbooks and Ask Ops

## Project Structure

```
src/
├── app/
│   ├── app/              # Protected app routes
│   │   ├── ask/          # AI Q&A interface
│   │   ├── playbooks/    # Playbook CRUD
│   │   └── layout.tsx    # App shell with sidebar
│   ├── api/
│   │   ├── ask/          # OpenAI integration
│   │   ├── auth/         # NextAuth endpoint
│   │   ├── onboarding/   # Workspace creation
│   │   └── playbooks/    # Playbook API
│   ├── login/            # Sign in page
│   ├── onboarding/       # First-run workspace setup
│   └── page.tsx          # Public landing page
├── components/
│   ├── AppSidebar.tsx
│   ├── AppHeader.tsx
│   ├── PlaybookForm.tsx
│   └── DeletePlaybookButton.tsx
├── lib/
│   ├── prisma.ts         # Database client
│   └── auth.ts           # Auth helpers
└── prisma/
    └── schema.prisma     # Database schema
```

## Development

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Open Prisma Studio
npm run db:studio
```

### Build

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Environment Variables for Production

Make sure to set all required env vars:
- Update `NEXTAUTH_URL` to your production domain
- Use production database URL
- Configure email provider for magic links
- Add GitHub OAuth callback URL

## License

MIT
