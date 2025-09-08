'use client'

interface PreviewBannerProps {
  isPreview: boolean;
}

export default function PreviewBanner({ isPreview }: PreviewBannerProps) {
  if (!isPreview) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 px-4 z-[9999] shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="font-semibold">🔍 預覽模式</span>
          <span className="text-sm">此為即時預覽，修改會立即顯示</span>
        </div>
        <button
          onClick={() => window.open('/api/exit-preview', '_self')}
          className="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800 transition-colors"
        >
          退出預覽
        </button>
      </div>
    </div>
  );
}