import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronRight, 
  Save, 
  Calendar,
  Users,
  DollarSign,
  MapPin
} from 'lucide-react';
import { UnifiedGroupOrder } from '@/lib/models/unified-group-order-model';
import { SmartGroupOrderService } from '@/lib/services/smart-group-order-service';
import { AutoSaveService } from '@/lib/services/auto-save-service';

interface ProgressiveGroupFormProps {
  groupOrder: UnifiedGroupOrder;
  userId: string;
  onUpdate?: (updatedOrder: UnifiedGroupOrder) => void;
}

export function ProgressiveGroupForm({ 
  groupOrder, 
  userId,
  onUpdate
}: ProgressiveGroupFormProps) {
  const [formData, setFormData] = useState({
    // 階段 1：最少必要資料（開團時）
    stage1: {
      groupName: groupOrder.group.groupName || '',
      tentativeDate: groupOrder.group.departureDate || ''
    },
    
    // 階段 2：處理中逐步補充
    stage2: {
      contactPerson: groupOrder.primaryOrder.contactPerson || '',
      contactPhone: groupOrder.primaryOrder.contactPhone || '',
      contactEmail: groupOrder.primaryOrder.contactEmail || '',
      departureDate: groupOrder.group.departureDate || '',
      returnDate: groupOrder.group.returnDate || ''
    },
    
    // 階段 3：詳細資料（有空再填）
    stage3: {
      totalMembers: groupOrder.group.totalMembers || 0,
      budget: groupOrder.group.budget || 0,
      itinerary: groupOrder.group.itinerary || '',
      notes: groupOrder.group.notes || '',
      specialRequests: groupOrder.primaryOrder.specialRequests || ''
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: false,
    detailed: false
  });

  // 計算資料完整度
  const dataCompleteness = groupOrder.dataCompleteness;

  // 取得完整度樣式
  const getCompletenessBadge = (level: string) => {
    const styles = {
      skeleton: { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-700' },
      basic: { variant: 'default' as const, className: 'bg-blue-100 text-blue-700' },
      detailed: { variant: 'default' as const, className: 'bg-green-100 text-green-700' },
      complete: { variant: 'default' as const, className: 'bg-emerald-100 text-emerald-700' }
    };
    
    return styles[level as keyof typeof styles] || styles.skeleton;
  };

  // 更新表單資料
  const updateFormData = (stage: 'stage1' | 'stage2' | 'stage3', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        [field]: value
      }
    }));

    // 觸發自動儲存
    const updateData = {
      group: stage === 'stage1' || stage === 'stage2' || stage === 'stage3' ? {
        groupName: stage === 'stage1' && field === 'groupName' ? value : formData.stage1.groupName,
        departureDate: stage === 'stage2' && field === 'departureDate' ? value : formData.stage2.departureDate,
        returnDate: stage === 'stage2' && field === 'returnDate' ? value : formData.stage2.returnDate,
        totalMembers: stage === 'stage3' && field === 'totalMembers' ? value : formData.stage3.totalMembers,
        budget: stage === 'stage3' && field === 'budget' ? value : formData.stage3.budget,
        itinerary: stage === 'stage3' && field === 'itinerary' ? value : formData.stage3.itinerary,
        notes: stage === 'stage3' && field === 'notes' ? value : formData.stage3.notes
      } : undefined,
      primaryOrder: stage === 'stage2' || stage === 'stage3' ? {
        contactPerson: stage === 'stage2' && field === 'contactPerson' ? value : formData.stage2.contactPerson,
        contactPhone: stage === 'stage2' && field === 'contactPhone' ? value : formData.stage2.contactPhone,
        contactEmail: stage === 'stage2' && field === 'contactEmail' ? value : formData.stage2.contactEmail,
        specialRequests: stage === 'stage3' && field === 'specialRequests' ? value : formData.stage3.specialRequests
      } : undefined
    };

    AutoSaveService.queueSave(groupOrder.group.groupCode, updateData);
  };

  // 手動儲存
  const handleManualSave = async () => {
    setIsSaving(true);
    try {
      const updatedOrder = await SmartGroupOrderService.progressiveUpdate(
        userId,
        groupOrder.group.groupCode,
        {
          group: {
            groupName: formData.stage1.groupName,
            departureDate: formData.stage2.departureDate,
            returnDate: formData.stage2.returnDate,
            totalMembers: formData.stage3.totalMembers,
            budget: formData.stage3.budget,
            itinerary: formData.stage3.itinerary,
            notes: formData.stage3.notes
          },
          primaryOrder: {
            contactPerson: formData.stage2.contactPerson,
            contactPhone: formData.stage2.contactPhone,
            contactEmail: formData.stage2.contactEmail,
            specialRequests: formData.stage3.specialRequests
          }
        }
      );
      
      setLastSaved(new Date());
      onUpdate?.(updatedOrder);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 格式化最後儲存時間
  const formatLastSaved = () => {
    if (!lastSaved) return '尚未儲存';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    
    if (diff < 60) return `${diff} 秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)} 分鐘前`;
    return lastSaved.toLocaleTimeString();
  };

  return (
    <div className="progressive-group-form">
      <Card className="border-2 border-dashed border-blue-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              {formData.stage1.groupName || '新團體'}
            </h3>
            
            {/* 完整度指示器 */}
            <div className="flex items-center gap-2">
              <Badge 
                variant={getCompletenessBadge(dataCompleteness.level).variant}
                className={getCompletenessBadge(dataCompleteness.level).className}
              >
                {dataCompleteness.level === 'skeleton' && '🏗️ 框架'}
                {dataCompleteness.level === 'basic' && '📝 基礎'}
                {dataCompleteness.level === 'detailed' && '📊 詳細'}
                {dataCompleteness.level === 'complete' && '✅ 完整'}
              </Badge>
              
              <div className="text-xs text-gray-500">
                {dataCompleteness.completionPercentage}%
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 快速開團區（一直顯示） */}
          <div className="quick-start-section p-3 bg-blue-50 rounded-lg">
            <Label className="text-sm font-medium mb-2 block">基本資訊</Label>
            <div className="space-y-3">
              <div>
                <Input
                  placeholder="團名/專案名稱"
                  value={formData.stage1.groupName}
                  onChange={(e) => updateFormData('stage1', 'groupName', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="date"
                  placeholder="預計出發日期"
                  value={formData.stage1.tentativeDate}
                  onChange={(e) => updateFormData('stage1', 'tentativeDate', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            {dataCompleteness.level === 'skeleton' && (
              <p className="text-xs text-blue-600 mt-2">
                先建立基本框架，細節之後再補充
              </p>
            )}
          </div>

          {/* 基礎資料區（開團後顯示） */}
          {dataCompleteness.level !== 'skeleton' && (
            <Collapsible 
              open={expandedSections.basic}
              onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, basic: open }))}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <ChevronRight className={`w-4 h-4 mr-2 transition-transform ${expandedSections.basic ? 'rotate-90' : ''}`} />
                  <Users className="w-4 h-4 mr-2" />
                  聯絡資訊
                  {dataCompleteness.missingFields.some(field => ['contactPerson', 'contactPhone'].includes(field)) && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      需要補充
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-3 mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">聯絡人 *</Label>
                      <Input
                        placeholder="客戶姓名"
                        value={formData.stage2.contactPerson}
                        onChange={(e) => updateFormData('stage2', 'contactPerson', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">聯絡電話 *</Label>
                      <Input
                        placeholder="電話號碼"
                        value={formData.stage2.contactPhone}
                        onChange={(e) => updateFormData('stage2', 'contactPhone', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">電子郵件</Label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.stage2.contactEmail}
                      onChange={(e) => updateFormData('stage2', 'contactEmail', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">出發日期</Label>
                      <Input
                        type="date"
                        value={formData.stage2.departureDate}
                        onChange={(e) => updateFormData('stage2', 'departureDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">回程日期</Label>
                      <Input
                        type="date"
                        value={formData.stage2.returnDate}
                        onChange={(e) => updateFormData('stage2', 'returnDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* 詳細資料區（有基礎資料後顯示） */}
          {(dataCompleteness.level === 'basic' || dataCompleteness.level === 'detailed' || dataCompleteness.level === 'complete') && (
            <Collapsible 
              open={expandedSections.detailed}
              onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, detailed: open }))}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <ChevronRight className={`w-4 h-4 mr-2 transition-transform ${expandedSections.detailed ? 'rotate-90' : ''}`} />
                  <MapPin className="w-4 h-4 mr-2" />
                  詳細資料
                  {dataCompleteness.level !== 'complete' && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      選填
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4 mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        參團人數
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.stage3.totalMembers}
                        onChange={(e) => updateFormData('stage3', 'totalMembers', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        預估預算
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.stage3.budget}
                        onChange={(e) => updateFormData('stage3', 'budget', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">行程概要</Label>
                    <Textarea
                      placeholder="請簡述行程安排..."
                      value={formData.stage3.itinerary}
                      onChange={(e) => updateFormData('stage3', 'itinerary', e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm">特殊需求</Label>
                    <Textarea
                      placeholder="素食、輪椅、其他特殊需求..."
                      value={formData.stage3.specialRequests}
                      onChange={(e) => updateFormData('stage3', 'specialRequests', e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm">備註</Label>
                    <Textarea
                      placeholder="其他相關資訊..."
                      value={formData.stage3.notes}
                      onChange={(e) => updateFormData('stage3', 'notes', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* 手動儲存與狀態指示器 */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-gray-500">
              <span>自動儲存</span>
              <span className="ml-2">上次儲存：{formatLastSaved()}</span>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualSave}
              disabled={isSaving}
              className="flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              {isSaving ? '儲存中...' : '手動儲存'}
            </Button>
          </div>

          {/* 缺少欄位提醒 */}
          {dataCompleteness.missingFields.length > 0 && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
              <div className="text-amber-800 text-xs font-medium">
                💡 還可以補充的資訊：
              </div>
              <div className="text-amber-700 text-xs mt-1">
                {dataCompleteness.missingFields.map(field => {
                  const fieldNames = {
                    contactPerson: '聯絡人',
                    contactPhone: '聯絡電話',
                    departureDate: '出發日期',
                    returnDate: '回程日期',
                    totalMembers: '參團人數',
                    budget: '預算',
                    itinerary: '行程概要'
                  };
                  return fieldNames[field as keyof typeof fieldNames];
                }).join('、')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProgressiveGroupForm;