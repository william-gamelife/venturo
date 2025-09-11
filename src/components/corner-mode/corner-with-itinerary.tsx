import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CornerActionButtons } from './corner-action-buttons';
import { ItineraryDesigner } from './itinerary-designer';
import type { ExtendedTodo, ItineraryDesign } from './';

interface CornerWithItineraryProps {
  todo: ExtendedTodo;
  userId: string;
  onGroupCreated?: (groupCode: string) => void;
  onGroupLinked?: (groupCode: string) => void;
  onViewGroup?: (groupCode: string) => void;
  onItinerarySaved?: (design: ItineraryDesign) => void;
}

export default function CornerWithItinerary({
  todo,
  userId,
  onGroupCreated,
  onGroupLinked,
  onViewGroup,
  onItinerarySaved
}: CornerWithItineraryProps) {
  const [showItineraryDesigner, setShowItineraryDesigner] = useState(false);
  const [currentDesign, setCurrentDesign] = useState<ItineraryDesign | null>(null);

  const handleDesignItinerary = (todoItem: ExtendedTodo) => {
    setShowItineraryDesigner(true);
  };

  const handleSaveItinerary = (design: ItineraryDesign) => {
    setCurrentDesign(design);
    onItinerarySaved?.(design);
    // 暫時不關閉對話框，讓用戶可以繼續編輯
    // setShowItineraryDesigner(false);
  };

  const handleCloseItineraryDesigner = () => {
    setShowItineraryDesigner(false);
  };

  return (
    <div className="corner-with-itinerary">
      {/* 原有的角落模式按鈕，加上行程表設計功能 */}
      <CornerActionButtons
        todo={todo}
        userId={userId}
        onGroupCreated={onGroupCreated}
        onGroupLinked={onGroupLinked}
        onViewGroup={onViewGroup}
        onDesignItinerary={handleDesignItinerary}
      />

      {/* 行程表設計對話框 */}
      <Dialog open={showItineraryDesigner} onOpenChange={setShowItineraryDesigner}>
        <DialogContent className="max-w-7xl w-full max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>行程表設計器</DialogTitle>
          </DialogHeader>
          
          <ItineraryDesigner
            todo={todo}
            onSave={handleSaveItinerary}
            onClose={handleCloseItineraryDesigner}
          />
        </DialogContent>
      </Dialog>

      {/* 如果有保存的行程表設計，顯示摘要 */}
      {currentDesign && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">{currentDesign.title}</h4>
              <p className="text-sm text-blue-700">
                {currentDesign.totalDays} 天行程 · {currentDesign.travelers} 人 · 
                {currentDesign.items.length} 個項目
              </p>
            </div>
            <div className="text-xs text-blue-600">
              最後更新: {new Date(currentDesign.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}