import DropZone from "@/components/DropZone";
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6">PublishNotion</h1>
        <p className="text-2xl text-slate-300 mb-12">
          Turn any Notion page into a beautiful website in 60 seconds
        </p>
        <DropZone />
        <Pricing />
      </div>
    </main>
  );
}