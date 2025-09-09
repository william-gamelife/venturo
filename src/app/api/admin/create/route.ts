import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 檢查環境變數
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
}

// 使用 Service Role Key 創建管理員客戶端
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const DEFAULT_ADMIN = {
  username: 'admin',
  email: 'admin@venturo.local',
  password: 'admin123',
  displayName: 'System Administrator'
}

export async function POST() {
  try {
    console.log('🔧 API: 創建預設管理員...')
    
    // 1. 檢查是否已存在管理員
    const { data: existingAdmin } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
    
    if (existingAdmin && existingAdmin.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: '管理員已存在',
        existing: true
      })
    }
    
    // 2. 創建 Auth 用戶
    console.log('📝 API: 創建 Auth 用戶...')
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password,
      email_confirm: true,
      user_metadata: {
        username: DEFAULT_ADMIN.username,
        display_name: DEFAULT_ADMIN.displayName
      }
    })
    
    if (authError) {
      console.error('Auth 用戶創建失敗:', authError)
      return NextResponse.json({ 
        success: false, 
        message: `Auth 創建失敗: ${authError.message}` 
      }, { status: 400 })
    }
    
    if (!authData.user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Auth 用戶創建失敗' 
      }, { status: 400 })
    }
    
    console.log('✅ API: Auth 用戶創建成功:', authData.user.id)
    
    // 3. 創建 Profile
    console.log('📊 API: 創建 Profile...')
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: DEFAULT_ADMIN.email,
        username: DEFAULT_ADMIN.username,
        role: 'admin',
        level: 99,
        experience: 9999,
        settings: {
          display_name: DEFAULT_ADMIN.displayName,
          world_mode: 'corner',
          coins: 99999,
          is_active: true,
          is_default_admin: true
        }
      })
      .select()
    
    if (profileError) {
      console.error('Profile 創建失敗:', profileError)
      return NextResponse.json({ 
        success: false, 
        message: `Profile 創建失敗: ${profileError.message}` 
      }, { status: 400 })
    }
    
    console.log('✅ API: 預設管理員創建成功!')
    
    return NextResponse.json({
      success: true,
      message: '預設管理員創建成功',
      admin: {
        id: authData.user.id,
        username: DEFAULT_ADMIN.username,
        email: DEFAULT_ADMIN.email,
        profile: profileData?.[0]
      }
    })
    
  } catch (error) {
    console.error('❌ API: 創建預設管理員錯誤:', error)
    return NextResponse.json({ 
      success: false, 
      message: `創建錯誤: ${error}` 
    }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    console.log('🗑️ API: 刪除預設管理員...')
    
    // 查找預設管理員
    const { data: adminProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', DEFAULT_ADMIN.username)
      .single()
    
    if (!adminProfile) {
      return NextResponse.json({ 
        success: true, 
        message: '預設管理員不存在' 
      })
    }
    
    // 刪除 Profile
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', adminProfile.id)
    
    // 刪除 Auth 用戶
    await supabaseAdmin.auth.admin.deleteUser(adminProfile.id)
    
    console.log('✅ API: 預設管理員已刪除')
    return NextResponse.json({ 
      success: true, 
      message: '預設管理員已刪除' 
    })
    
  } catch (error) {
    console.error('❌ API: 刪除預設管理員錯誤:', error)
    return NextResponse.json({ 
      success: false, 
      message: `刪除錯誤: ${error}` 
    }, { status: 500 })
  }
}