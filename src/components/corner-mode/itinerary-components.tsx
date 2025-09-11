import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  MapPin, 
  Car, 
  Camera, 
  Utensils, 
  Hotel,
  Activity,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { ItineraryItem, ItineraryDesign } from './itinerary-designer';

// 行程項目卡片
interface ItineraryItemCardProps {
  item: ItineraryItem;
  isEditable: boolean;
  onEdit?: (item: ItineraryItem) => void;
  onDelete?: (itemId: string) => void;
}

export function ItineraryItemCard({ 
  item, 
  isEditable, 
  onEdit, 
  onDelete 
}: ItineraryItemCardProps) {
  const getCategoryIcon = (category: string) => {
    const iconProps = { className: "h-4 w-4" };
    switch (category) {
      case 'transport': return <Car {...iconProps} />;
      case 'sightseeing': return <Camera {...iconProps} />;
      case 'meal': return <Utensils {...iconProps} />;
      case 'hotel': return <Hotel {...iconProps} />;
      case 'activity': return <Activity {...iconProps} />;
      default: return <MapPin {...iconProps} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'transport': return 'bg-blue-100 text-blue-800';
      case 'sightseeing': return 'bg-green-100 text-green-800';
      case 'meal': return 'bg-orange-100 text-orange-800';
      case 'hotel': return 'bg-purple-100 text-purple-800';
      case 'activity': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getCategoryColor(item.category)}>
                {getCategoryIcon(item.category)}
                <span className="ml-1 capitalize">{item.category}</span>
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {item.time}
              </div>
            </div>
            
            <h4 className="font-semibold mb-1">{item.title}</h4>
            
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <MapPin className="h-3 w-3 mr-1" />
              {item.location}
            </div>
            
            <p className="text-sm text-gray-600">{item.description}</p>
            
            {item.duration && (
              <p className="text-xs text-muted-foreground mt-2">
                預計時間: {item.duration} 分鐘
              </p>
            )}
          </div>
          
          {isEditable && (
            <div className="flex gap-1 ml-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit?.(item)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete?.(item.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 天數選擇器
interface DaySelectorProps {
  totalDays: number;
  activeDay: number;
  onDayChange: (day: number) => void;
}

export function DaySelector({ totalDays, activeDay, onDayChange }: DaySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
        <Button
          key={day}
          variant={activeDay === day ? "default" : "outline"}
          size="sm"
          onClick={() => onDayChange(day)}
        >
          第 {day} 天
        </Button>
      ))}
      <Button variant="ghost" size="sm" disabled>
        <Plus className="h-4 w-4 mr-1" />
        添加天數
      </Button>
    </div>
  );
}

// 行程統計
interface ItineraryStatsProps {
  design: ItineraryDesign;
}

export function ItineraryStats({ design }: ItineraryStatsProps) {
  const stats = {
    totalItems: design.items.length,
    byCategory: design.items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    totalDuration: design.items.reduce((sum, item) => sum + (item.duration || 0), 0),
    totalCost: design.items.reduce((sum, item) => sum + (item.cost || 0), 0)
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">行程統計</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>總項目數:</span>
            <span className="font-medium">{stats.totalItems}</span>
          </div>
          <div className="flex justify-between">
            <span>預計總時間:</span>
            <span className="font-medium">{Math.round(stats.totalDuration / 60)} 小時</span>
          </div>
          {stats.totalCost > 0 && (
            <div className="flex justify-between">
              <span>預計總費用:</span>
              <span className="font-medium">${stats.totalCost}</span>
            </div>
          )}
          
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">分類統計:</p>
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="flex justify-between text-xs">
                <span className="capitalize">{category}:</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 快速添加按鈕組
interface QuickAddButtonsProps {
  onAddItem: (category: ItineraryItem['category']) => void;
  disabled?: boolean;
}

export function QuickAddButtons({ onAddItem, disabled = true }: QuickAddButtonsProps) {
  const categories = [
    { key: 'transport' as const, label: '交通', icon: Car },
    { key: 'sightseeing' as const, label: '景點', icon: Camera },
    { key: 'meal' as const, label: '用餐', icon: Utensils },
    { key: 'hotel' as const, label: '住宿', icon: Hotel },
    { key: 'activity' as const, label: '活動', icon: Activity }
  ];

  return (
    <div className="grid grid-cols-5 gap-2 mb-6">
      {categories.map(({ key, label, icon: Icon }) => (
        <Button
          key={key}
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onAddItem(key)}
          className="flex flex-col h-16 p-2"
        >
          <Icon className="h-4 w-4 mb-1" />
          <span className="text-xs">{label}</span>
        </Button>
      ))}
    </div>
  );
}

// 行程模板選擇器
export function ItineraryTemplates() {
  const templates = [
    { id: 1, name: '城市觀光', days: 3, description: '經典城市景點路線' },
    { id: 2, name: '自然風光', days: 5, description: '山水風景深度遊' },
    { id: 3, name: '美食之旅', days: 2, description: '在地美食體驗' },
    { id: 4, name: '文化探索', days: 4, description: '歷史文化巡禮' }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">行程模板</h3>
        <div className="space-y-2">
          {templates.map((template) => (
            <Button
              key={template.id}
              variant="ghost"
              disabled
              className="w-full justify-start h-auto p-3"
            >
              <div className="text-left">
                <p className="font-medium">{template.name}</p>
                <p className="text-xs text-muted-foreground">
                  {template.days} 天 · {template.description}
                </p>
              </div>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          開發中 - 敬請期待
        </p>
      </CardContent>
    </Card>
  );
}