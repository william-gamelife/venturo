#!/bin/bash
# 工作進度追蹤腳本

PROGRESS_FILE="progress-log.txt"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "🎯 Venturo 工作進度追蹤器"
echo "=========================="

if [ "$1" == "start" ]; then
    echo "📝 開始新的工作會話"
    echo ""
    read -p "🎯 今天要做什麼? " TASK
    read -p "⏰ 預計花多少時間? " TIME
    
    echo "" >> $PROGRESS_FILE
    echo "=== 工作會話開始 ===" >> $PROGRESS_FILE
    echo "日期: $DATE" >> $PROGRESS_FILE
    echo "目標: $TASK" >> $PROGRESS_FILE
    echo "預期時間: $TIME" >> $PROGRESS_FILE
    echo "當前分支: $(git branch --show-current)" >> $PROGRESS_FILE
    echo "最新提交: $(git log -1 --oneline)" >> $PROGRESS_FILE
    echo "" >> $PROGRESS_FILE
    
    # 自動備份
    ./safe-backup.sh
    
    echo "✅ 工作會話已開始記錄"
    echo "💾 已自動備份當前狀態"

elif [ "$1" == "end" ]; then
    echo "📝 結束工作會話"
    echo ""
    read -p "✅ 完成了什麼? " COMPLETED
    read -p "❌ 遇到什麼問題? " ISSUES
    read -p "➡️  下次要繼續什麼? " NEXT
    
    echo "完成內容: $COMPLETED" >> $PROGRESS_FILE
    echo "遇到問題: $ISSUES" >> $PROGRESS_FILE
    echo "下次任務: $NEXT" >> $PROGRESS_FILE
    echo "結束時間: $DATE" >> $PROGRESS_FILE
    echo "最終分支: $(git branch --show-current)" >> $PROGRESS_FILE
    echo "最終提交: $(git log -1 --oneline)" >> $PROGRESS_FILE
    echo "=== 工作會話結束 ===" >> $PROGRESS_FILE
    echo "" >> $PROGRESS_FILE
    
    echo "✅ 工作會話已結束記錄"
    
elif [ "$1" == "status" ]; then
    echo "📊 當前工作狀態"
    echo ""
    echo "🔄 Git 狀態:"
    git status --short
    echo ""
    echo "📝 最近的工作記錄:"
    tail -20 $PROGRESS_FILE
    echo ""
    echo "💾 可用備份:"
    git stash list | head -5

elif [ "$1" == "resume" ]; then
    echo "🔄 恢復工作會話"
    echo ""
    echo "📝 上次工作記錄:"
    grep -A 10 -B 2 "下次任務:" $PROGRESS_FILE | tail -15
    echo ""
    echo "💾 可用備份:"
    git stash list | head -3
    echo ""
    echo "使用 './work-progress-tracker.sh start' 開始新會話"

else
    echo "使用方式:"
    echo "  ./work-progress-tracker.sh start    - 開始工作會話"
    echo "  ./work-progress-tracker.sh end      - 結束工作會話"  
    echo "  ./work-progress-tracker.sh status   - 查看當前狀態"
    echo "  ./work-progress-tracker.sh resume   - 查看上次進度"
fi