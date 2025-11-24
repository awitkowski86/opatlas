import { Search as SearchIcon } from 'lucide-react'

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Search</h1>
        <p className="text-slate-400">Find playbooks across your workspace</p>
      </div>

      <div className="max-w-2xl">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search playbooks, tags, content..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <SearchIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Search your playbooks</h3>
        <p className="text-slate-400">Enter keywords to find relevant playbooks and content</p>
      </div>
    </div>
  )
}
