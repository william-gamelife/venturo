import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Plus,
  Edit,
  Trash2,
  Save
} from 'lucide-react';

// 行程表設計器主組件
export interface ItineraryItem {
  id: string;
  day: number;
  time: string;
  title: string;
  location: string;
  description: string;
  duration: number; // 分鐘
  category: 'transport' | 'sightseeing' | 'meal' | 'hotel' | 'activity';
  cost?: number;
  notes?: string;
}

export interface ItineraryDesign {
  id: string;
  title: string;
  description: string;
  totalDays: number;
  travelers: number;
  startDate: string;
  endDate: string;
  items: ItineraryItem[];
  createdAt: string;
  updatedAt: string;
}

interface ItineraryDesignerProps {
  todo: any; // 來自角落模式的todo
  onSave?: (design: ItineraryDesign) => void;
  onClose?: () => void;
}

export default function ItineraryDesigner({ 
  todo, 
  onSave, 
  onClose 
}: ItineraryDesignerProps) {
  const [design, setDesign] = useState<ItineraryDesign>({
    id: `itinerary-${Date.now()}`,
    title: todo?.title || '新行程計劃',
    description: '開發中...',
    totalDays: 1,
    travelers: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [activeDay, setActiveDay] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* 標題區域 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                行程表設計器
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                基於 Todo: {todo?.title || '未指定'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? '完成編輯' : '編輯模式'}
              </Button>
              <Button onClick={() => onSave?.(design)}>
                <Save className="h-4 w-4 mr-2" />
                儲存
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 基本資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">總天數</p>
              <p className="text-2xl font-bold">{design.totalDays}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">旅客人數</p>
              <p className="text-2xl font-bold">{design.travelers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">行程項目</p>
              <p className="text-2xl font-bold">{design.items.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 開發中提示 */}
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-2xl font-semibold mb-4">開發中</h3>
            <p className="text-muted-foreground mb-6">
              行程表設計功能正在開發中，敬請期待！
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" disabled>
                <Plus className="h-4 w-4 mr-2" />
                添加行程項目
              </Button>
              <Button variant="outline" disabled>
                <Edit className="h-4 w-4 mr-2" />
                編輯詳細資訊
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 預留的功能區域 */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>即將推出的功能:</p>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          <span className="px-2 py-1 bg-muted rounded">拖拽排序</span>
          <span className="px-2 py-1 bg-muted rounded">時間衝突檢測</span>
          <span className="px-2 py-1 bg-muted rounded">費用計算</span>
          <span className="px-2 py-1 bg-muted rounded">地圖整合</span>
          <span className="px-2 py-1 bg-muted rounded">範本系統</span>
        </div>
      </div>
    </div>
  );
}