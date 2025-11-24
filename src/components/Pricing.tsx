export default function Pricing() {
  return (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-7 backdrop-blur-sm shadow-xl">
      <div className="text-center mb-5">
        <span className="text-4xl font-bold text-white">$29</span>
        <span className="text-slate-400 ml-2.5 text-sm font-medium">lifetime</span>
      </div>
      <p className="text-xs text-indigo-300 font-medium mb-5 text-center tracking-wide">Launch special — First 100 users only</p>
      <div className="space-y-2.5 mb-5">
        <div className="flex items-center gap-2.5 text-slate-300">
          <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          <span className="text-xs font-medium">Unlimited landing pages</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-300">
          <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          <span className="text-xs font-medium">Email capture forms</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-300">
          <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          <span className="text-xs font-medium">Built-in analytics</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-300">
          <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          <span className="text-xs font-medium">Notion template included</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 text-center leading-relaxed">One-time payment. Skip the $50/mo designer.</p>
    </div>
  );
}