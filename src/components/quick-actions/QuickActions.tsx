'use client';

import { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  CheckSquare, 
  Users, 
  FileText, 
  TrendingUp,
  Settings,
  Search,
  Bell,
  Zap
} from 'lucide-react';

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  action: () => void;
}

export function QuickActions() {
  const [searchQuery, setSearchQuery] = useState('');

  const quickActions: QuickAction[] = [
    {
      id: 'new-todo',
      icon: <CheckSquare size={24} />,
      title: '新增任務',
      description: '快速建立新任務',
      color: 'bg-purple-500',
      action: () => window.location.href = '/dashboard/todos'
    },
    {
      id: 'new-event',
      icon: <Calendar size={24} />,
      title: '新增事件',
      description: '在行事曆加入事件',
      color: 'bg-blue-500',
      action: () => window.location.href = '/dashboard/calendar'
    },
    {
      id: 'new-project',
      icon: <FileText size={24} />,
      title: '新增專案',
      description: '開始新的冒險專案',
      color: 'bg-green-500',
      action: () => window.location.href = '/dashboard/projects'
    },
    {
      id: 'view-stats',
      icon: <TrendingUp size={24} />,
      title: '查看統計',
      description: '檢視你的成就數據',
      color: 'bg-orange-500',
      action: () => window.location.href = '/dashboard/stats'
    },
    {
      id: 'quick-note',
      icon: <FileText size={24} />,
      title: '快速筆記',
      description: '記下重要想法',
      color: 'bg-pink-500',
      action: () => window.location.href = '/dashboard/notes'
    }
  ];

  const filteredActions = quickActions.filter(action =>
    action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="text-yellow-400" />
          快捷操作
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
          <input
            type="text"
            placeholder="搜尋操作..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-start gap-4">
              <div className={`${action.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-white font-semibold mb-1">{action.title}</h3>
                <p className="text-white/60 text-sm">{action.description}</p>
              </div>
            </div>
            
            {/* 裝飾性光效 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          </button>
        ))}
      </div>

      {filteredActions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-white/60">找不到符合的操作</p>
        </div>
      )}
    </div>
  );
}