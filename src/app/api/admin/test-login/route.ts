import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 使用 Anon Key 進行登入測試
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const DEFAULT_ADMIN = {
  username: 'admin',
  email: 'admin@venturo.local',
  password: 'admin123'
}

export async function POST() {
  try {
    console.log('🔐 API: 測試管理員登入...')
    
    // 嘗試登入
    const { data, error } = await supabase.auth.signInWithPassword({
      email: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password
    })
    
    if (error) {
      console.error('登入失敗:', error)
      return NextResponse.json({ 
        success: false, 
        message: `登入失敗: ${error.message}`,
        details: error
      }, { status: 400 })
    }
    
    if (!data.user) {
      return NextResponse.json({ 
        success: false, 
        message: '登入失敗: 未獲得用戶資料' 
      }, { status: 400 })
    }
    
    // 檢查 Profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    console.log('✅ API: 登入成功')
    
    // 登出以避免影響其他操作
    await supabase.auth.signOut()
    
    return NextResponse.json({
      success: true,
      message: '登入測試成功',
      user: {
        id: data.user.id,
        email: data.user.email,
        profile: profile
      }
    })
    
  } catch (error) {
    console.error('❌ API: 登入測試錯誤:', error)
    return NextResponse.json({ 
      success: false, 
      message: `登入測試錯誤: ${error}` 
    }, { status: 500 })
  }
}