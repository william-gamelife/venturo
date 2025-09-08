// src/app/test/page.tsx
export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">🎮 VENTURO</h1>
        <p className="text-xl text-purple-200 mb-4">測試頁面</p>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <p className="text-gray-200">如果你能看到這個頁面，表示系統正常運作！</p>
          <div className="mt-4">
            <a href="/" className="text-purple-400 hover:text-purple-300">回到首頁</a>
          </div>
        </div>
      </div>
    </div>
  );
}