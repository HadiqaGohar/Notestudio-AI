import SourceInput from "@/components/SourceInput";
import TabBar from "@/components/TabBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3">
            NoteStudio AI
          </h1>
          <p className="text-xl text-purple-200">
            Transform your notes into multiple formats with AI
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <SourceInput />
          <TabBar />
        </div>
      </div>
    </div>
  );
}
