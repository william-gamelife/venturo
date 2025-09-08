import { UnifiedGroupOrder } from '../models/unified-group-order-model';
import { SmartGroupOrderService } from './smart-group-order-service';

interface SaveQueueItem {
  data: Partial<UnifiedGroupOrder>;
  lastModified: number;
  retryCount: number;
}

/**
 * 自動儲存服務
 * 使用防抖機制避免頻繁寫入，支援離線暫存
 */
export class AutoSaveService {
  private static saveQueue = new Map<string, SaveQueueItem>();
  private static saveTimer: NodeJS.Timeout | null = null;
  private static readonly DEBOUNCE_DELAY = 2000; // 2秒防抖
  private static readonly MAX_RETRY = 3;
  private static isOnline = navigator.onLine;
  
  static {
    // 監聽網路狀態
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * 智慧自動儲存
   * 使用防抖機制，避免頻繁寫入
   */
  static queueSave(groupCode: string, data: Partial<UnifiedGroupOrder>): void {
    // 1. 更新儲存佇列
    const existing = this.saveQueue.get(groupCode) || { 
      data: {}, 
      lastModified: 0, 
      retryCount: 0 
    };
    
    const mergedData = this.deepMerge(existing.data, data);
    
    this.saveQueue.set(groupCode, {
      data: mergedData,
      lastModified: Date.now(),
      retryCount: existing.retryCount
    });
    
    // 2. 重置防抖計時器
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    
    // 3. 設定防抖延遲
    this.saveTimer = setTimeout(() => {
      this.executeSave();
    }, this.DEBOUNCE_DELAY);
    
    // 4. 立即本地暫存（防止資料丟失）
    this.saveToLocalStorage(groupCode, mergedData);
  }

  /**
   * 執行批次儲存
   */
  private static async executeSave(): Promise<void> {
    const updates = Array.from(this.saveQueue.entries());
    
    if (updates.length === 0) return;

    try {
      if (this.isOnline) {
        // 線上模式：儲存到正式儲存體
        await this.saveToMainStorage(updates);
        
        // 清空成功儲存的項目
        updates.forEach(([groupCode]) => {
          this.saveQueue.delete(groupCode);
        });
        
        // 清理本地暫存
        this.cleanupLocalStorage(updates.map(([code]) => code));
        
        this.showToast('自動儲存成功', 'success');
      } else {
        // 離線模式：僅本地暫存
        this.showToast('離線模式，資料暫存本地', 'info');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      
      // 增加重試次數
      updates.forEach(([groupCode, item]) => {
        if (item.retryCount < this.MAX_RETRY) {
          this.saveQueue.set(groupCode, {
            ...item,
            retryCount: item.retryCount + 1
          });
        } else {
          // 超過重試次數，移到待同步清單
          this.moveToSyncPending(groupCode, item.data);
          this.saveQueue.delete(groupCode);
        }
      });
      
      this.showToast('自動儲存失敗，資料已本地暫存', 'warning');
    }
  }

  /**
   * 儲存到主要儲存體
   */
  private static async saveToMainStorage(
    updates: [string, SaveQueueItem][]
  ): Promise<void> {
    const savePromises = updates.map(async ([groupCode, item]) => {
      // 需要從某處取得 userId，這裡假設有全域方法
      const userId = this.getCurrentUserId();
      
      return SmartGroupOrderService.progressiveUpdate(
        userId,
        groupCode,
        item.data
      );
    });

    await Promise.all(savePromises);
  }

  /**
   * 本地暫存（即時暫存，防止資料丟失）
   */
  private static saveToLocalStorage(
    groupCode: string, 
    data: Partial<UnifiedGroupOrder>
  ): void {
    try {
      const localDataKey = 'venturo_temp_saves';
      const existing = localStorage.getItem(localDataKey);
      const tempSaves = existing ? JSON.parse(existing) : {};
      
      tempSaves[groupCode] = {
        data,
        savedAt: Date.now(),
        syncStatus: 'pending'
      };
      
      localStorage.setItem(localDataKey, JSON.stringify(tempSaves));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  /**
   * 移到待同步清單（多次重試失敗後）
   */
  private static moveToSyncPending(
    groupCode: string, 
    data: Partial<UnifiedGroupOrder>
  ): void {
    try {
      const pendingKey = 'venturo_pending_sync';
      const existing = localStorage.getItem(pendingKey);
      const pending = existing ? JSON.parse(existing) : {};
      
      pending[groupCode] = {
        data,
        failedAt: Date.now(),
        retryAfter: Date.now() + (1000 * 60 * 5), // 5分鐘後重試
        syncStatus: 'failed'
      };
      
      localStorage.setItem(pendingKey, JSON.stringify(pending));
    } catch (error) {
      console.error('Failed to move to sync pending:', error);
    }
  }

  /**
   * 清理本地暫存
   */
  private static cleanupLocalStorage(groupCodes: string[]): void {
    try {
      const localDataKey = 'venturo_temp_saves';
      const existing = localStorage.getItem(localDataKey);
      
      if (existing) {
        const tempSaves = JSON.parse(existing);
        groupCodes.forEach(code => {
          delete tempSaves[code];
        });
        localStorage.setItem(localDataKey, JSON.stringify(tempSaves));
      }
    } catch (error) {
      console.error('Failed to cleanup localStorage:', error);
    }
  }

  /**
   * 同步待處理的資料（網路恢復時）
   */
  private static async syncPendingData(): Promise<void> {
    try {
      // 同步暫存資料
      await this.syncTempSaves();
      
      // 同步失敗重試資料
      await this.syncFailedRetries();
      
      this.showToast('資料同步完成', 'success');
    } catch (error) {
      console.error('Failed to sync pending data:', error);
      this.showToast('資料同步失敗，將稍後重試', 'warning');
    }
  }

  /**
   * 同步暫存資料
   */
  private static async syncTempSaves(): Promise<void> {
    const localDataKey = 'venturo_temp_saves';
    const existing = localStorage.getItem(localDataKey);
    
    if (!existing) return;
    
    const tempSaves = JSON.parse(existing);
    const syncPromises = Object.entries(tempSaves).map(
      async ([groupCode, saveData]: [string, any]) => {
        try {
          const userId = this.getCurrentUserId();
          await SmartGroupOrderService.progressiveUpdate(
            userId,
            groupCode,
            saveData.data
          );
          
          // 同步成功，從暫存中移除
          delete tempSaves[groupCode];
        } catch (error) {
          console.error(`Failed to sync ${groupCode}:`, error);
          // 移到失敗重試清單
          this.moveToSyncPending(groupCode, saveData.data);
          delete tempSaves[groupCode];
        }
      }
    );

    await Promise.all(syncPromises);
    localStorage.setItem(localDataKey, JSON.stringify(tempSaves));
  }

  /**
   * 同步失敗重試資料
   */
  private static async syncFailedRetries(): Promise<void> {
    const pendingKey = 'venturo_pending_sync';
    const existing = localStorage.getItem(pendingKey);
    
    if (!existing) return;
    
    const pending = JSON.parse(existing);
    const now = Date.now();
    
    const retryPromises = Object.entries(pending).map(
      async ([groupCode, pendingData]: [string, any]) => {
        // 檢查是否到了重試時間
        if (now < pendingData.retryAfter) return;
        
        try {
          const userId = this.getCurrentUserId();
          await SmartGroupOrderService.progressiveUpdate(
            userId,
            groupCode,
            pendingData.data
          );
          
          // 同步成功，從待同步清單移除
          delete pending[groupCode];
        } catch (error) {
          // 延長重試時間
          pending[groupCode].retryAfter = now + (1000 * 60 * 10); // 10分鐘後重試
          console.error(`Retry failed for ${groupCode}:`, error);
        }
      }
    );

    await Promise.all(retryPromises);
    localStorage.setItem(pendingKey, JSON.stringify(pending));
  }

  /**
   * 深度合併物件
   */
  private static deepMerge(target: any, source: any): any {
    if (source === null || source === undefined) return target;
    if (target === null || target === undefined) return source;
    
    const result = { ...target };
    
    Object.keys(source).forEach(key => {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    });
    
    return result;
  }

  /**
   * 取得當前用戶 ID
   * 這裡需要根據實際的認證系統實作
   */
  private static getCurrentUserId(): string {
    // 這裡應該從認證系統取得用戶 ID
    // 暫時使用模擬值
    return 'current_user_id';
  }

  /**
   * 顯示提示訊息
   */
  private static showToast(
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info'
  ): void {
    // 這裡應該呼叫實際的 toast 組件
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // 可以觸發自定義事件讓 UI 組件接收
    window.dispatchEvent(new CustomEvent('venturo-toast', {
      detail: { message, type }
    }));
  }

  /**
   * 取得儲存狀態統計
   */
  static getSaveStatus(): {
    pendingCount: number;
    tempSaveCount: number;
    failedRetryCount: number;
    isOnline: boolean;
  } {
    try {
      const tempSaves = localStorage.getItem('venturo_temp_saves');
      const pendingSync = localStorage.getItem('venturo_pending_sync');
      
      const tempSaveCount = tempSaves ? Object.keys(JSON.parse(tempSaves)).length : 0;
      const failedRetryCount = pendingSync ? Object.keys(JSON.parse(pendingSync)).length : 0;
      
      return {
        pendingCount: this.saveQueue.size,
        tempSaveCount,
        failedRetryCount,
        isOnline: this.isOnline
      };
    } catch (error) {
      console.error('Failed to get save status:', error);
      return {
        pendingCount: 0,
        tempSaveCount: 0,
        failedRetryCount: 0,
        isOnline: this.isOnline
      };
    }
  }

  /**
   * 手動同步（供 UI 呼叫）
   */
  static async manualSync(): Promise<void> {
    if (!this.isOnline) {
      this.showToast('目前為離線狀態，無法同步', 'warning');
      return;
    }

    try {
      await this.syncPendingData();
    } catch (error) {
      this.showToast('手動同步失敗', 'error');
      throw error;
    }
  }

  /**
   * 清理過期的本地資料
   */
  static cleanupExpiredData(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    
    try {
      // 清理暫存資料
      const tempSaves = localStorage.getItem('venturo_temp_saves');
      if (tempSaves) {
        const saves = JSON.parse(tempSaves);
        const filtered = Object.fromEntries(
          Object.entries(saves).filter(([_, data]: [string, any]) => 
            now - data.savedAt < maxAge
          )
        );
        localStorage.setItem('venturo_temp_saves', JSON.stringify(filtered));
      }

      // 清理失敗重試資料
      const pendingSync = localStorage.getItem('venturo_pending_sync');
      if (pendingSync) {
        const pending = JSON.parse(pendingSync);
        const filtered = Object.fromEntries(
          Object.entries(pending).filter(([_, data]: [string, any]) => 
            now - data.failedAt < maxAge
          )
        );
        localStorage.setItem('venturo_pending_sync', JSON.stringify(filtered));
      }
    } catch (error) {
      console.error('Failed to cleanup expired data:', error);
    }
  }
}