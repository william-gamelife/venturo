import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExtendedTodo } from '@/lib/models/unified-group-order-model';
import CornerActionButtons from './corner-action-buttons';
import ProgressiveGroupForm from './progressive-group-form';
import { TaskCardTags } from './corner-tags';
import { SmartGroupOrderService } from '@/lib/services/smart-group-order-service';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Settings } from 'lucide-react';

interface EnhancedTaskCardProps {
  todo: ExtendedTodo;
  userId: string;
  worldMode: 'corner' | 'game';
  onTodoUpdate?: (updatedTodo: ExtendedTodo) => void;
}

/**
 * 增強版任務卡片 - 支援角落模式的雙模式設計
 */
export function EnhancedTaskCard({ 
  todo, 
  userId, 
  worldMode,
  onTodoUpdate 
}: EnhancedTaskCardProps) {
  const [groupOrder, setGroupOrder] = useState<any>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 處理團體建立
  const handleGroupCreated = async (groupCode: string) => {
    try {
      const order = await SmartGroupOrderService.getGroupOrder(userId, groupCode);
      setGroupOrder(order);
      
      // 更新待辦事項資料
      const updatedTodo: ExtendedTodo = {
        ...todo,
        businessType: 'group',
        groupCode,
        dataCompleteness: 'skeleton',
        cornerModeData: {
          isGroupRelated: true,
          quickActions: ['edit_contact', 'set_date'],
          priority: 'high'
        }
      };
      
      onTodoUpdate?.(updatedTodo);
      setShowGroupForm(true);
    } catch (error) {
      console.error('Failed to handle group creation:', error);
    }
  };

  // 處理查看團體
  const handleViewGroup = async (groupCode: string) => {
    setIsLoading(true);
    try {
      const order = await SmartGroupOrderService.getGroupOrder(userId, groupCode);
      setGroupOrder(order);
      setShowGroupForm(true);
    } catch (error) {
      console.error('Failed to load group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 處理團體更新
  const handleGroupUpdate = (updatedOrder: any) => {
    setGroupOrder(updatedOrder);
    
    // 更新待辦事項的完整度狀態
    const updatedTodo: ExtendedTodo = {
      ...todo,
      dataCompleteness: updatedOrder.dataCompleteness.level
    };
    
    onTodoUpdate?.(updatedTodo);
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      worldMode === 'corner' ? 'border-blue-200' : 'border-gray-200'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">
              {todo.title}
            </h3>
            
            {todo.description && (
              <p className="text-sm text-gray-600 mb-2">
                {todo.description}
              </p>
            )}
            
            {/* 標籤顯示 */}
            {worldMode === 'corner' && <TaskCardTags task={todo} />}
          </div>
          
          {/* 世界模式指示器 */}
          <Badge 
            variant={worldMode === 'corner' ? 'default' : 'secondary'}
            className="text-xs ml-2"
          >
            {worldMode === 'corner' ? '角落' : '冒險'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* 基礎模式動作（冒險/日常） */}
        {worldMode === 'game' && (
          <div className="flex gap-2 mb-3">
            <Button size="sm" variant="default">
              完成
            </Button>
            <Button size="sm" variant="outline">
              編輯
            </Button>
            <Button size="sm" variant="outline">
              刪除
            </Button>
          </div>
        )}

        {/* 角落模式專屬功能 */}
        {worldMode === 'corner' && (
          <div className="space-y-3">
            {/* 角落模式動作按鈕 */}
            <CornerActionButtons
              todo={todo}
              userId={userId}
              onGroupCreated={handleGroupCreated}
              onViewGroup={handleViewGroup}
            />

            {/* 團體表單（摺疊式） */}
            {(showGroupForm && groupOrder) && (
              <Collapsible open={showGroupForm} onOpenChange={setShowGroupForm}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-between"
                    disabled={isLoading}
                  >
                    <span className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      團體管理
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      showGroupForm ? 'rotate-180' : ''
                    }`} />
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <ProgressiveGroupForm
                      groupOrder={groupOrder}
                      userId={userId}
                      onUpdate={handleGroupUpdate}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}

        {/* 共用功能 */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t text-xs text-gray-500">
          <span>
            建立：{new Date(todo.createdAt || Date.now()).toLocaleDateString()}
          </span>
          
          {todo.groupCode && (
            <Badge variant="outline" className="text-xs">
              {todo.groupCode}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default EnhancedTaskCard;