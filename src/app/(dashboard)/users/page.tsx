'use client'

import { useEffect, useState } from 'react'
import { venturoAuth } from '@/lib/venturo-auth'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Button } from '@/components/Button'
import { Icons } from '@/components/icons'
import { VersionIndicator } from '@/components/VersionIndicator'

interface User {
  id: string
  username: string
  display_name: string
  title: string
  role: 'SUPER_ADMIN' | 'BUSINESS_ADMIN' | 'GENERAL_USER'
  created_at: string
  last_login_at?: string
  permissions: {
    users: { read: boolean; write: boolean; delete: boolean; admin: boolean }
    todos: { read: boolean; write: boolean; delete: boolean; admin: boolean; packaging: boolean }
    projects: { read: boolean; write: boolean; delete: boolean; admin: boolean }
    calendar: { read: boolean; write: boolean; delete: boolean; admin: boolean }
    finance: { read: boolean; write: boolean; delete: boolean; admin: boolean }
    timebox: { read: boolean; write: boolean; delete: boolean; admin: boolean }
    'life-simulator': { read: boolean; write: boolean; delete: boolean; admin: boolean }
    'pixel-life': { read: boolean; write: boolean; delete: boolean; admin: boolean }
    'travel-pdf': { read: boolean; write: boolean; delete: boolean; admin: boolean }
    themes: { read: boolean; write: boolean; delete: boolean; admin: boolean }
    sync: { read: boolean; write: boolean; delete: boolean; admin: boolean }
    settings: { read: boolean; write: boolean; delete: boolean; admin: boolean }
  }
}

interface EditUser {
  password?: string
  cornerMode: boolean
}

export default function UsersPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<EditUser>({
    password: '',
    cornerMode: false
  })
  const [newUser, setNewUser] = useState({
    username: '',
    display_name: '',
    title: '',
    password: 'pass1234',
    role: 'GENERAL_USER' as 'SUPER_ADMIN' | 'BUSINESS_ADMIN' | 'GENERAL_USER'
  })

  useEffect(() => {
    venturoAuth.getCurrentUser().then(user => {
      setCurrentUser(user)
      
      if (!user || user.role !== 'SUPER_ADMIN') {
        return
      }

      loadUsers()
    })
  }, [])

  const loadUsers = async () => {
    // Get all users from venturoAuth
    const allUsers = await venturoAuth.getUsers()
    setUsers(allUsers.map(user => ({
      ...user,
      created_at: user.created_at || new Date().toISOString(),
      last_login_at: user.last_login_at
    })))
  }

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.display_name) {
      alert('請填寫使用者名稱和顯示名稱')
      return
    }

    const defaultPermissions = getDefaultPermissions(newUser.role)
    
    const userData = {
      id: generateUUID(),
      username: newUser.username,
      display_name: newUser.display_name,
      title: newUser.title,
      role: newUser.role,
      password: newUser.password,
      created_at: new Date().toISOString(),
      permissions: defaultPermissions
    }

    if (await venturoAuth.addUser(userData)) {
      await loadUsers()
      setShowAddModal(false)
      setNewUser({
        username: '',
        display_name: '',
        title: '',
        password: 'pass1234',
        role: 'GENERAL_USER'
      })
    } else {
      alert('創建用戶失敗，請檢查用戶名是否已存在或聯繫系統管理員')
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    
    // 檢查用戶是否為角落員工（角落模式）
    const isCornerMode = user.role === 'CORNER_EMPLOYEE'
    
    setEditForm({
      password: '',
      cornerMode: isCornerMode
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return

    // 根據角落模式設定角色和權限
    const newRole = editForm.cornerMode ? 'CORNER_EMPLOYEE' : editingUser.role
    const permissions = getDefaultPermissions(newRole)

    const updatedUser = {
      ...editingUser,
      role: newRole,
      world_mode: editForm.cornerMode ? 'corner' : 'game',
      permissions,
      ...(editForm.password && editForm.password.trim() !== '' ? { password: editForm.password } : {})
    }

    if (await venturoAuth.updateUser(updatedUser)) {
      await loadUsers()
      setShowEditModal(false)
      setEditingUser(null)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (user.id === currentUser.id) {
      alert('不能刪除自己的帳戶')
      return
    }

    if (confirm(`確定要刪除使用者 "${user.display_name}" 嗎？`)) {
      if (await venturoAuth.removeUser(user.id)) {
        await loadUsers()
      }
    }
  }

  const getDefaultPermissions = (role: string): User['permissions'] => {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
          users: { read: true, write: true, delete: true, admin: true },
          todos: { read: true, write: true, delete: true, admin: true, packaging: true },
          projects: { read: true, write: true, delete: true, admin: true },
          calendar: { read: true, write: true, delete: true, admin: true },
          finance: { read: true, write: true, delete: true, admin: true },
          timebox: { read: true, write: true, delete: true, admin: true },
          'life-simulator': { read: true, write: true, delete: true, admin: true },
          'pixel-life': { read: true, write: true, delete: true, admin: true },
          'travel-pdf': { read: true, write: true, delete: true, admin: true },
          themes: { read: true, write: true, delete: true, admin: true },
          sync: { read: true, write: true, delete: true, admin: true },
          settings: { read: true, write: true, delete: true, admin: true }
        }
      case 'BUSINESS_ADMIN':
        return {
          users: { read: false, write: false, delete: false, admin: false },
          todos: { read: true, write: true, delete: true, admin: false, packaging: true },
          projects: { read: true, write: true, delete: true, admin: false },
          calendar: { read: true, write: true, delete: false, admin: false },
          finance: { read: true, write: true, delete: false, admin: false },
          timebox: { read: true, write: true, delete: false, admin: false },
          'life-simulator': { read: true, write: false, delete: false, admin: false },
          'pixel-life': { read: true, write: false, delete: false, admin: false },
          'travel-pdf': { read: false, write: false, delete: false, admin: false },
          themes: { read: true, write: false, delete: false, admin: false },
          sync: { read: false, write: false, delete: false, admin: false },
          settings: { read: false, write: false, delete: false, admin: false }
        }
      default: // GENERAL_USER
        return {
          users: { read: false, write: false, delete: false, admin: false },
          todos: { read: true, write: true, delete: false, admin: false, packaging: false },
          projects: { read: false, write: false, delete: false, admin: false },
          calendar: { read: true, write: true, delete: false, admin: false },
          finance: { read: false, write: false, delete: false, admin: false },
          timebox: { read: true, write: true, delete: false, admin: false },
          'life-simulator': { read: true, write: false, delete: false, admin: false },
          'pixel-life': { read: true, write: false, delete: false, admin: false },
          'travel-pdf': { read: false, write: false, delete: false, admin: false },
          themes: { read: true, write: false, delete: false, admin: false },
          sync: { read: false, write: false, delete: false, admin: false },
          settings: { read: false, write: false, delete: false, admin: false }
        }
    }
  }

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }



  if (!currentUser) {
    return (
      <div className="loading">
        正在載入...
      </div>
    )
  }

  if (currentUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="access-denied">
        <div className="access-denied-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2>權限不足</h2>
        <p>您沒有權限查看使用者管理功能</p>
        <p className="sub-text">需要超級管理員權限</p>
      </div>
    )
  }

  return (
    <ModuleLayout
      header={{
        icon: Icons.users,
        title: "使用者管理",
        subtitle: "管理系統使用者及其權限設定",
        actions: (
          <Button 
            variant="primary"
            icon={
              <svg viewBox="0 0 16 16" width="16" height="16">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
            onClick={() => setShowAddModal(true)}
          >
            新增使用者
          </Button>
        )
      }}
    >
      <div className="users-grid">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-actions">
              <button 
                className="action-btn edit-btn"
                onClick={() => handleEditUser(user)}
                title="編輯權限"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M8.5 1L11 3.5 4 10.5H1.5V8L8.5 1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </button>
              {user.id !== currentUser.id && (
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteUser(user)}
                  title="刪除"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>

            <div className="user-info">
              <div className="user-avatar">
                {user.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <h4 className="user-name">{user.display_name}</h4>
                <p className="user-username">@{user.username}</p>
              </div>
              <div className="status-indicator online"></div>
            </div>

            <div className="user-meta">
              <span className={`role-badge role-${user.role.toLowerCase().replace('_', '-')}`}>
                {user.role === 'SUPER_ADMIN' ? '超級管理員' : 
                 user.role === 'BUSINESS_ADMIN' ? '業務管理員' : '一般使用者'}
              </span>
            </div>

            <div className="user-stats">
              <div className="stat-item">
                <span className="stat-label">職稱</span>
                <span className="stat-value">{user.title || '未設定'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">註冊日期</span>
                <span className="stat-value">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">特殊權限</span>
                <span className="stat-value">
                  {user.permissions.todos.packaging ? '打包權限' : 
                   user.permissions.projects.read ? '專案管理' : '基本權限'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 新增使用者對話框 */}
      {showAddModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="modal-content">
            <h3 className="modal-title">新增使用者</h3>
            
            <div className="form-group">
              <label>使用者名稱</label>
              <input
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                placeholder="輸入登入用的使用者名稱"
              />
            </div>

            <div className="form-group">
              <label>顯示名稱</label>
              <input
                type="text"
                value={newUser.display_name}
                onChange={(e) => setNewUser({...newUser, display_name: e.target.value})}
                placeholder="輸入顯示的姓名"
              />
            </div>

            <div className="form-group">
              <label>職稱</label>
              <input
                type="text"
                value={newUser.title}
                onChange={(e) => setNewUser({...newUser, title: e.target.value})}
                placeholder="輸入職稱"
              />
            </div>

            <div className="form-group">
              <label>密碼</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="輸入登入密碼"
              />
              <small>預設: pass1234</small>
            </div>

            <div className="form-group">
              <label>角色</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
              >
                <option value="GENERAL_USER">一般使用者</option>
                <option value="BUSINESS_ADMIN">業務管理員</option>
                <option value="SUPER_ADMIN">超級管理員</option>
              </select>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowAddModal(false)}
              >
                取消
              </button>
              <button 
                className="btn-primary" 
                onClick={handleAddUser}
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 編輯用戶對話框 */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}>
          <div className="modal-content">
            <h3 className="modal-title">編輯使用者 - {editingUser.display_name}</h3>
            
            <div className="form-group">
              <label>重設密碼 (可選)</label>
              <input
                type="password"
                value={editForm.password || ''}
                onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                placeholder="如需重設密碼請輸入新密碼"
              />
              <small>留空則不修改密碼</small>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={editForm.cornerMode}
                  onChange={(e) => setEditForm({...editForm, cornerMode: e.target.checked})}
                />
                <span>啟用角落模式</span>
              </label>
              <small>角落模式適用於 Corner 員工，將限制部分功能存取</small>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowEditModal(false)}
              >
                取消
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSaveEdit}
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`

        .users-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .users-title {
          font-size: 28px;
          font-weight: 700;
          color: #3a3833;
          margin: 0 0 8px 0;
        }

        .users-subtitle {
          font-size: 16px;
          color: #6d685f;
          margin: 0;
        }

        .add-user-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .add-user-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(201, 169, 97, 0.3);
        }

        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }

        .user-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          transition: all 0.3s ease;
          position: relative;
        }

        .user-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
        }

        .user-actions {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .user-card:hover .user-actions {
          opacity: 1;
        }

        .action-btn {
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .edit-btn {
          background: #3b82f6;
          color: white;
        }

        .delete-btn {
          background: #ef4444;
          color: white;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 18px;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #3a3833;
        }

        .user-username {
          margin: 0;
          font-size: 13px;
          color: #6d685f;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-indicator.online {
          background: #22c55e;
        }

        .user-meta {
          margin-bottom: 16px;
        }

        .role-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .role-super-admin {
          background: rgba(168,85,247,0.15);
          color: #a855f7;
        }

        .role-business-admin {
          background: rgba(34,197,94,0.1);
          color: #22c55e;
        }

        .role-general-user {
          background: rgba(59,130,246,0.1);
          color: #3b82f6;
        }

        .user-stats {
          border-top: 1px solid rgba(201, 169, 97, 0.2);
          padding-top: 16px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .stat-item:last-child {
          margin-bottom: 0;
        }

        .stat-label {
          color: #6d685f;
        }

        .stat-value {
          font-weight: 500;
          color: #3a3833;
        }

        .access-denied {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          color: #6d685f;
        }

        .access-denied-icon {
          width: 64px;
          height: 64px;
          margin-bottom: 20px;
          color: #c9a961;
        }

        .access-denied h2 {
          margin: 0 0 8px 0;
          color: #3a3833;
          font-size: 1.5rem;
        }

        .access-denied p {
          margin: 0;
        }

        .sub-text {
          font-size: 0.9rem;
          margin-top: 8px !important;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #6d685f;
          font-size: 16px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }


        .modal-title {
          margin: 0 0 20px 0;
          color: #3a3833;
          font-size: 20px;
          font-weight: 600;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
          color: #3a3833;
          font-size: 14px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 8px;
          font-size: 14px;
        }

        .form-group small {
          color: #6d685f;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .checkbox-label input[type="checkbox"] {
          width: auto;
          margin: 0;
        }

        .checkbox-label span {
          color: #3a3833;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .btn-secondary {
          padding: 10px 20px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          background: white;
          border-radius: 8px;
          cursor: pointer;
          color: #6d685f;
        }

        .btn-primary {
          padding: 10px 20px;
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .users-grid {
            grid-template-columns: 1fr;
          }
          
          .users-header {
            flex-direction: column;
            gap: 16px;
          }
          
        }
      `}</style>
      
      <VersionIndicator 
        page="用戶管理"
        authSystem="venturoAuth" 
        version="2.0"
        status="working"
      />
    </ModuleLayout>
  )
}