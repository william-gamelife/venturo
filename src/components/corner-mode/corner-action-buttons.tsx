import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Link, 
  Eye, 
  Settings,
  Calendar,
  Phone,
  MapPin
} from 'lucide-react';
import { ExtendedTodo } from '@/lib/models/unified-group-order-model';
import { SmartGroupOrderService } from '@/lib/services/smart-group-order-service';

interface CornerActionButtonsProps {
  todo: ExtendedTodo;
  userId: string;
  onGroupCreated?: (groupCode: string) => void;
  onGroupLinked?: (groupCode: string) => void;
  onViewGroup?: (groupCode: string) => void;
}

export function CornerActionButtons({
  todo,
  userId,
  onGroupCreated,
  onGroupLinked,
  onViewGroup
}: CornerActionButtonsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  // 判斷當前任務的業務狀態
  const getBusinessState = () => {
    if (todo.groupCode) {
      return {
        type: 'linked' as const,
        groupCode: todo.groupCode,
        completeness: todo.dataCompleteness || 'skeleton'
      };
    }
    
    if (todo.cornerModeData?.isGroupRelated) {
      return {
        type: 'ready' as const,
        canCreate: true
      };
    }
    
    // 智慧判斷是否適合建立團體
    const isGroupCandidate = todo.title.includes('團') || 
                           todo.title.includes('旅') ||
                           todo.title.includes('行程') ||
                           todo.description?.includes('團體');
    
    return {
      type: isGroupCandidate ? 'candidate' : 'general' as const,
      canCreate: isGroupCandidate
    };
  };

  const businessState = getBusinessState();

  // 快速開團
  const handleQuickCreateGroup = async () => {
    setIsCreating(true);
    try {
      const groupOrder = await SmartGroupOrderService.quickCreateGroup(userId, todo);
      onGroupCreated?.(groupOrder.group.groupCode);
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // 連結到現有團體
  const handleLinkToGroup = () => {
    setIsLinking(true);
    // 開啟團體選擇對話框
    // TODO: 實作團體選擇器
  };

  // 查看團體詳情
  const handleViewGroup = () => {
    if (businessState.type === 'linked') {
      onViewGroup?.(businessState.groupCode);
    }
  };

  // 取得完整度指示器
  const getCompletenessIndicator = (level?: string) => {
    const indicators = {
      skeleton: { emoji: '🏗️', text: '框架', color: 'secondary' as const },
      basic: { emoji: '📝', text: '基礎', color: 'default' as const },
      detailed: { emoji: '📊', text: '詳細', color: 'secondary' as const },
      complete: { emoji: '✅', text: '完整', color: 'default' as const }
    };
    
    return indicators[level as keyof typeof indicators] || indicators.skeleton;
  };

  return (
    <div className="corner-action-buttons space-y-2">
      {/* 業務狀態指示 */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="font-medium">角落模式</span>
        {businessState.type === 'linked' && (
          <Badge variant="default" className="text-xs">
            {getCompletenessIndicator(businessState.completeness).emoji}
            {getCompletenessIndicator(businessState.completeness).text}
          </Badge>
        )}
      </div>

      {/* 動作按鈕組 */}
      <div className="flex gap-2 flex-wrap">
        {/* 未連結團體的情況 */}
        {businessState.type !== 'linked' && (
          <>
            {/* 快速開團按鈕 */}
            <Button
              size="sm"
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleQuickCreateGroup}
              disabled={isCreating}
            >
              <Plus className="w-4 h-4 mr-1" />
              {isCreating ? '建立中...' : '開團'}
            </Button>

            {/* 連結現有團體 */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleLinkToGroup}
              disabled={isLinking}
            >
              <Link className="w-4 h-4 mr-1" />
              連結團體
            </Button>
          </>
        )}

        {/* 已連結團體的情況 */}
        {businessState.type === 'linked' && (
          <>
            {/* 查看團體詳情 */}
            <Button
              size="sm"
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleViewGroup}
            >
              <Eye className="w-4 h-4 mr-1" />
              查看團體
            </Button>

            {/* 快速動作按鈕 */}
            <div className="flex gap-1">
              {businessState.completeness === 'skeleton' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="px-2"
                  title="新增聯絡人"
                >
                  <Phone className="w-4 h-4" />
                </Button>
              )}
              
              {(businessState.completeness === 'skeleton' || businessState.completeness === 'basic') && (
                <Button
                  size="sm"
                  variant="outline"
                  className="px-2"
                  title="設定日期"
                >
                  <Calendar className="w-4 h-4" />
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                className="px-2"
                title="團體設定"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* 團體資訊摘要 */}
      {businessState.type === 'linked' && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs">
          <div className="font-medium text-gray-700">
            團體：{businessState.groupCode}
          </div>
          <div className="text-gray-500 mt-1">
            {businessState.completeness === 'skeleton' && '需要補充基本資料'}
            {businessState.completeness === 'basic' && '已有聯絡人，可補充行程'}
            {businessState.completeness === 'detailed' && '資料詳細，可最終確認'}
            {businessState.completeness === 'complete' && '資料完整，可以處理'}
          </div>
        </div>
      )}

      {/* 快速提示 */}
      {businessState.type === 'candidate' && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md text-xs">
          <div className="text-blue-700 font-medium">
            💡 這個任務適合建立團體
          </div>
          <div className="text-blue-600 mt-1">
            點擊「開團」快速建立框架，細節之後再補
          </div>
        </div>
      )}
    </div>
  );
}

export default CornerActionButtons;