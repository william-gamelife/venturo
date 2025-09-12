'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkPermission()
    loadUsers()
  }, [])

  const checkPermission = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/signin')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard')
      return
    }

    setCurrentUser(profile)
  }

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setUsers(data || [])
    }
    setLoading(false)
  }

  const updateUserRole = async (userId, newRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        role: newRole,
        world_mode: newRole === 'CORNER_EMPLOYEE' ? 'corner' : 'game',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (!error) {
      alert('權限更新成功！')
      loadUsers()
    } else {
      alert('更新失敗：' + error.message)
    }
  }

  if (loading) return <div className="p-8">載入中...</div>

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">👥 用戶管理</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用戶名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顯示名稱</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">等級</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">註冊時間</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.display_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' :
                    user.role === 'CORNER_EMPLOYEE' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">Lv.{user.level || 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                    disabled={user.id === currentUser?.id}
                  >
                    <option value="FRIEND">一般用戶</option>
                    <option value="CORNER_EMPLOYEE">Corner 員工</option>
                    <option value="SUPER_ADMIN">超級管理員</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}