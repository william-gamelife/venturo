import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExtendedTodo } from '@/lib/models/unified-group-order-model';
import { 
  Users, 
  Construction, 
  Edit, 
  Check, 
  Briefcase, 
  Archive,
  Clock,
  Phone,
  Calendar,
  AlertCircle
} from 'lucide-react';

/**
 * 角落模式專屬標籤定義
 */
export const CornerTags = {
  // 角落模式專屬標籤
  business: {
    '📋 待開團': { 
      color: 'blue' as const, 
      icon: Users, 
      description: '適合建立團體的任務',
      bgColor: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    '🏗️ 團體框架': { 
      color: 'yellow' as const, 
      icon: Construction,
      description: '已建立基本框架',
      bgColor: 'bg-yellow-50 border-yellow-200 text-yellow-700'
    },
    '📝 資料待補': { 
      color: 'orange' as const, 
      icon: Edit,
      description: '需要補充基本資料',
      bgColor: 'bg-orange-50 border-orange-200 text-orange-700'
    },
    '✅ 資料完整': { 
      color: 'green' as const, 
      icon: Check,
      description: '資料完整可處理',
      bgColor: 'bg-green-50 border-green-200 text-green-700'
    },
    '💼 訂單處理中': { 
      color: 'purple' as const, 
      icon: Briefcase,
      description: '正在處理訂單',
      bgColor: 'bg-purple-50 border-purple-200 text-purple-700'
    },
    '🏛️ 已結團': { 
      color: 'gray' as const, 
      icon: Archive,
      description: '團體已完成',
      bgColor: 'bg-gray-50 border-gray-200 text-gray-700'
    }
  },
  
  // 狀態標籤
  status: {
    '⏰ 今日出發': { 
      color: 'red' as const, 
      icon: Clock, 
      priority: 'high',
      bgColor: 'bg-red-50 border-red-200 text-red-700'
    },
    '📞 待補聯絡人': { 
      color: 'amber' as const, 
      icon: Phone,
      priority: 'medium',
      bgColor: 'bg-amber-50 border-amber-200 text-amber-700'
    },
    '📅 待設日期': { 
      color: 'blue' as const, 
      icon: Calendar,
      priority: 'medium',
      bgColor: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    '⚠️ 缺資料': { 
      color: 'red' as const, 
      icon: AlertCircle,
      priority: 'high',
      bgColor: 'bg-red-50 border-red-200 text-red-700'
    }
  },
  
  // 快速篩選器
  filters: [
    { 
      label: '需要開團', 
      query: 'tag:待開團',
      count: 0,
      description: '還沒建立團體的任務'
    },
    { 
      label: '資料不完整', 
      query: 'completeness:!complete',
      count: 0,
      description: '需要補充資料的團體'
    },
    { 
      label: '今日出發', 
      query: 'departure:today',
      count: 0,
      description: '今天出發的團體'
    },
    { 
      label: '待補聯絡人', 
      query: 'missing:contactPerson',
      count: 0,
      description: '缺少聯絡人資訊'
    },
    {
      label: '本週行程',
      query: 'departure:thisWeek',
      count: 0,
      description: '本週出發的行程'
    }
  ]
} as const;

/**
 * 任務卡片標籤顯示組件
 */
interface TaskCardTagsProps {
  task: ExtendedTodo;
  showAll?: boolean;
}

export function TaskCardTags({ task, showAll = false }: TaskCardTagsProps) {
  
  /**
   * 根據任務狀態產生業務標籤
   */
  const getBusinessTags = (): string[] => {
    if (!task.businessType) {
      // 智慧判斷是否適合建立團體
      const isGroupCandidate = task.title.includes('團') || 
                             task.title.includes('旅') ||
                             task.title.includes('行程') ||
                             task.description?.includes('團體');
      
      return isGroupCandidate ? ['📋 待開團'] : [];
    }
    
    if (task.dataCompleteness === 'skeleton') {
      return ['🏗️團體框架', '📝 資料待補'];
    }
    
    if (task.dataCompleteness === 'basic') {
      return ['📝 資料待補'];
    }
    
    if (task.dataCompleteness === 'detailed') {
      return ['💼 訂單處理中'];
    }
    
    if (task.dataCompleteness === 'complete') {
      return ['✅ 資料完整'];
    }
    
    return ['💼 訂單處理中'];
  };

  /**
   * 根據任務狀態產生狀態標籤
   */
  const getStatusTags = (): string[] => {
    const tags: string[] = [];
    
    // 檢查出發日期
    if (task.cornerModeData) {
      // 這裡應該從實際的團體資料檢查
      // 暫時用模擬邏輯
      const today = new Date().toDateString();
      // if (task.departureDate === today) tags.push('⏰ 今日出發');
    }
    
    // 檢查缺少的資料
    if (task.dataCompleteness === 'skeleton' || task.dataCompleteness === 'basic') {
      if (!task.cornerModeData?.contactPerson) tags.push('📞 待補聯絡人');
    }
    
    return tags;
  };

  const businessTags = getBusinessTags();
  const statusTags = getStatusTags();
  const allTags = [...businessTags, ...statusTags];

  if (allTags.length === 0) return null;

  const displayTags = showAll ? allTags : allTags.slice(0, 3);
  const hasMoreTags = allTags.length > 3 && !showAll;

  return (
    <div className="flex gap-1 flex-wrap mt-2">
      {displayTags.map(tag => {
        const tagConfig = CornerTags.business[tag as keyof typeof CornerTags.business] || 
                         CornerTags.status[tag as keyof typeof CornerTags.status];
        
        if (!tagConfig) return null;

        const IconComponent = tagConfig.icon;

        return (
          <Badge
            key={tag}
            variant="outline"
            className={`text-xs flex items-center gap-1 ${tagConfig.bgColor}`}
          >
            <IconComponent className="w-3 h-3" />
            {tag}
          </Badge>
        );
      })}
      
      {hasMoreTags && (
        <Badge variant="outline" className="text-xs text-gray-500">
          +{allTags.length - 3}
        </Badge>
      )}
    </div>
  );
}

/**
 * 標籤篩選器組件
 */
interface TagFilterProps {
  onFilterSelect: (query: string) => void;
  activeFilters: string[];
  taskCounts?: Record<string, number>;
}

export function TagFilter({ onFilterSelect, activeFilters, taskCounts = {} }: TagFilterProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const filteredFilters = CornerTags.filters.filter(filter =>
    filter.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    filter.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tag-filter space-y-3">
      {/* 搜尋框 */}
      <div className="relative">
        <Input
          placeholder="搜尋標籤..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-sm"
        />
      </div>

      {/* 快速篩選器 */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">快速篩選</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filteredFilters.map(filter => {
            const isActive = activeFilters.includes(filter.query);
            const count = taskCounts[filter.query] || 0;
            
            return (
              <Button
                key={filter.query}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className="justify-between text-xs"
                onClick={() => onFilterSelect(filter.query)}
              >
                <span className="flex items-center gap-2">
                  {filter.label}
                  {count > 0 && (
                    <Badge variant="secondary" className="text-xs px-1">
                      {count}
                    </Badge>
                  )}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* 業務標籤 */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">業務狀態</div>
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(CornerTags.business).map(([tag, config]) => (
            <Badge
              key={tag}
              variant="outline"
              className={`text-xs cursor-pointer hover:opacity-80 ${config.bgColor}`}
              onClick={() => onFilterSelect(`businessTag:${tag}`)}
            >
              <config.icon className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* 狀態標籤 */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">狀態提醒</div>
        <div className="grid grid-cols-1 gap-1">
          {Object.entries(CornerTags.status).map(([tag, config]) => (
            <Badge
              key={tag}
              variant="outline"
              className={`text-xs cursor-pointer hover:opacity-80 justify-start ${config.bgColor}`}
              onClick={() => onFilterSelect(`statusTag:${tag}`)}
            >
              <config.icon className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 標籤統計組件
 */
interface TagStatsProps {
  tasks: ExtendedTodo[];
}

export function TagStats({ tasks }: TagStatsProps) {
  const stats = React.useMemo(() => {
    const businessStats = Object.keys(CornerTags.business).reduce((acc, tag) => {
      acc[tag] = 0;
      return acc;
    }, {} as Record<string, number>);
    
    const statusStats = Object.keys(CornerTags.status).reduce((acc, tag) => {
      acc[tag] = 0;
      return acc;
    }, {} as Record<string, number>);

    tasks.forEach(task => {
      // 計算業務標籤統計
      if (!task.businessType && (task.title.includes('團') || task.title.includes('旅'))) {
        businessStats['📋 待開團']++;
      } else if (task.dataCompleteness === 'skeleton') {
        businessStats['🏗️ 團體框架']++;
        businessStats['📝 資料待補']++;
      } else if (task.dataCompleteness === 'complete') {
        businessStats['✅ 資料完整']++;
      }
      
      // 計算狀態標籤統計
      if (task.dataCompleteness === 'skeleton' || task.dataCompleteness === 'basic') {
        statusStats['📞 待補聯絡人']++;
      }
    });

    return { businessStats, statusStats };
  }, [tasks]);

  const totalTasks = tasks.length;
  const businessTasks = tasks.filter(t => t.businessType).length;
  const completeTasks = tasks.filter(t => t.dataCompleteness === 'complete').length;

  return (
    <div className="tag-stats space-y-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-sm font-medium text-gray-700">標籤統計</div>
      
      {/* 總覽 */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-white rounded">
          <div className="text-lg font-bold text-gray-800">{totalTasks}</div>
          <div className="text-xs text-gray-600">總任務</div>
        </div>
        <div className="p-2 bg-white rounded">
          <div className="text-lg font-bold text-blue-600">{businessTasks}</div>
          <div className="text-xs text-gray-600">團體相關</div>
        </div>
        <div className="p-2 bg-white rounded">
          <div className="text-lg font-bold text-green-600">{completeTasks}</div>
          <div className="text-xs text-gray-600">資料完整</div>
        </div>
      </div>

      {/* 詳細統計 */}
      <div className="space-y-2">
        {Object.entries(stats.businessStats)
          .filter(([_, count]) => count > 0)
          .map(([tag, count]) => (
            <div key={tag} className="flex justify-between items-center text-xs">
              <span className="text-gray-600">{tag}</span>
              <Badge variant="outline" className="text-xs">
                {count}
              </Badge>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default TaskCardTags;