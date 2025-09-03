// 展開任務的完整HTML - 暫存文件，待整合
getExpandedTaskHTML(task) {
    const drawerPreview = this.getDrawerPreview(task);
    const sourceInfo = this.getSourceInfo(task);
    
    return `
        <div class="expand-backdrop" onclick="this.parentElement.remove()"></div>
        <div class="expand-container">
            
            <!-- 抬頭區 -->
            <div class="expand-header">
                <div class="header-main">
                    <input type="text" class="expand-title" value="${task.title}" placeholder="任務標題">
                    <button class="close-btn" onclick="this.closest('.task-expand-modal').remove()">×</button>
                </div>
                
                <div class="header-meta">
                    ${sourceInfo}
                    <div class="tag-editor">
                        <label>標籤：</label>
                        <input type="text" class="task-tags-input" value="${(task.tags || []).join(', ')}" placeholder="機票, 住宿, 餐飲...">
                    </div>
                    ${task.assigned_from ? `<div class="assign-info">指派來源：${task.assigned_from}</div>` : ''}
                </div>
                
                <div class="header-actions">
                    <button class="quick-btn package" onclick="window.activeModule.addToPackage('${task.id}')">加入專案打包</button>
                    <button class="quick-btn complete" onclick="window.activeModule.markComplete('${task.id}')">標記完成</button>
                    <button class="quick-btn today" onclick="window.activeModule.addToToday('${task.id}')">加到今天</button>
                </div>
            </div>

            <!-- 內容區 -->
            <div class="expand-content">
                <div class="content-section">
                    <label>內容/備註：</label>
                    <textarea class="task-notes" placeholder="輸入重點內容...">${task.description || ''}</textarea>
                </div>
                
                <div class="attachments-section">
                    <label>附件：</label>
                    <div class="attachment-list">
                        ${task.attachments ? task.attachments.map(att => `
                            <div class="attachment-item">
                                <span>${att.name}</span>
                                <button onclick="window.activeModule.removeAttachment('${task.id}', '${att.id}')">×</button>
                            </div>
                        `).join('') : '<div class="no-attachments">暫無附件</div>'}
                        <button class="add-attachment-btn">+ 新增附件</button>
                    </div>
                </div>
                
                <div class="comments-section">
                    <label>留言（時間線）：</label>
                    <div class="comments-timeline">
                        ${task.comments ? task.comments.map(comment => `
                            <div class="comment-item">
                                <div class="comment-time">${new Date(comment.created_at).toLocaleString('zh-TW')}</div>
                                <div class="comment-text">${comment.text}</div>
                            </div>
                        `).join('') : '<div class="no-comments">暫無留言</div>'}
                    </div>
                    <div class="add-comment">
                        <input type="text" class="comment-input" placeholder="例：等客戶、週五追...">
                        <button onclick="window.activeModule.addComment('${task.id}')">新增</button>
                    </div>
                </div>
            </div>

            <!-- 延伸區 -->
            <div class="expand-extension">
                ${drawerPreview}
            </div>
            
            <!-- 保存按鈕 -->
            <div class="expand-footer">
                <button class="save-btn" onclick="window.activeModule.saveExpandedTask('${task.id}')">儲存變更</button>
            </div>
        </div>
    `;
}

// 相關功能函數
addToPackage(taskId) {
    const task = this.todos.find(t => t.id === taskId);
    if (task) {
        task.status = 'project';
        task.updated_at = new Date().toISOString();
        this.saveData();
        this.showToast('已移至專案打包', 'success');
        // 關閉展開視窗並重新渲染
        document.querySelector('.task-expand-modal')?.remove();
        this.render(this.currentUser.uuid);
    }
}

markComplete(taskId) {
    const task = this.todos.find(t => t.id === taskId);
    if (task) {
        if (task.project_id) {
            // 專案任務：只在專案內標記完成，不移動到完成欄位
            task.completed = true;
            task.completed_at = new Date().toISOString();
            this.showToast('專案任務已完成', 'success');
        } else {
            // 個人任務：移動到完成欄位
            task.status = 'completed';
            task.completed_at = new Date().toISOString();
            this.showToast('任務已完成', 'success');
        }
        this.saveData();
        document.querySelector('.task-expand-modal')?.remove();
        this.render(this.currentUser.uuid);
    }
}

addComment(taskId) {
    const input = document.querySelector('.comment-input');
    const text = input.value.trim();
    if (!text) return;

    const task = this.todos.find(t => t.id === taskId);
    if (task) {
        if (!task.comments) task.comments = [];
        task.comments.push({
            id: this.generateUUID(),
            text: text,
            created_at: new Date().toISOString()
        });
        input.value = '';
        this.saveData();
        
        // 重新渲染留言區
        const timeline = document.querySelector('.comments-timeline');
        timeline.innerHTML = task.comments.map(comment => `
            <div class="comment-item">
                <div class="comment-time">${new Date(comment.created_at).toLocaleString('zh-TW')}</div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `).join('');
    }
}

saveExpandedTask(taskId) {
    const task = this.todos.find(t => t.id === taskId);
    if (!task) return;

    // 儲存修改
    const title = document.querySelector('.expand-title').value;
    const notes = document.querySelector('.task-notes').value;
    const tags = document.querySelector('.task-tags-input').value
        .split(',')
        .map(t => t.trim())
        .filter(t => t);

    task.title = title;
    task.description = notes;
    task.tags = tags;
    task.updated_at = new Date().toISOString();

    this.saveData();
    this.showToast('任務已更新', 'success');
    
    // 關閉展開視窗並重新渲染
    document.querySelector('.task-expand-modal').remove();
    this.render(this.currentUser.uuid);
}

bindExpandedTaskEvents(taskId) {
    // 可以在這裡綁定其他事件，如鍵盤快捷鍵等
}