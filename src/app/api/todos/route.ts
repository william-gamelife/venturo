import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET: 獲取待辦事項列表
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 獲取當前用戶
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    // 獲取查詢參數
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')

    // 建構查詢
    let query = supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // 添加過濾條件
    if (status) query = query.eq('status', status)
    if (type) query = query.eq('type', type)
    if (priority) query = query.eq('priority', priority)

    const { data, error } = await query

    if (error) {
      console.error('獲取待辦事項失敗:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API 錯誤:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

// POST: 建立新待辦事項
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 獲取當前用戶
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    // 獲取請求資料
    const body = await request.json()
    const {
      title,
      description,
      priority = 'medium',
      type = 'task',
      due_date,
      exp_reward = 10,
      tags = [],
      corner_data = {},
      related_id,
      related_type
    } = body

    // 驗證必填欄位
    if (!title) {
      return NextResponse.json({ error: '標題為必填' }, { status: 400 })
    }

    // 建立待辦事項
    const { data, error } = await supabase
      .from('todos')
      .insert({
        user_id: user.id,
        title,
        description,
        priority,
        type,
        due_date,
        exp_reward,
        tags,
        corner_data,
        related_id,
        related_type,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('建立待辦事項失敗:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 如果是角落模式的特殊類型，建立關聯資料
    if (type !== 'task' && related_type) {
      await handleCornerModeCreation(supabase, user.id, type, data.id, corner_data)
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('API 錯誤:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

// PUT: 更新待辦事項
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 獲取當前用戶
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    // 獲取請求資料
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
    }

    // 檢查任務原始狀態（用於經驗值判斷）
    const { data: originalTodo } = await supabase
      .from('todos')
      .select('status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    // 更新待辦事項
    const { data, error } = await supabase
      .from('todos')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('更新待辦事項失敗:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 如果任務從非完成變為完成，觸發升級檢查
    if (originalTodo?.status !== 'completed' && updateData.status === 'completed') {
      await supabase.rpc('check_level_up', { user_id: user.id })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API 錯誤:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

// DELETE: 刪除待辦事項
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 獲取當前用戶
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    // 獲取 ID
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
    }

    // 刪除待辦事項
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('刪除待辦事項失敗:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API 錯誤:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

// 處理角落模式的關聯建立
async function handleCornerModeCreation(
  supabase: any,
  userId: string,
  type: string,
  todoId: string,
  cornerData: any
) {
  try {
    switch (type) {
      case 'project':
        await supabase.from('projects').insert({
          user_id: userId,
          title: cornerData.title || '新專案',
          description: cornerData.description,
          client_name: cornerData.client_name,
          client_contact: cornerData.client_contact || {}
        })
        break

      case 'order':
        await supabase.from('orders').insert({
          user_id: userId,
          order_number: `ORD-${Date.now()}`,
          customer_name: cornerData.customer_name || '待補充',
          amount: cornerData.amount || 0
        })
        break

      case 'group':
        await supabase.from('groups').insert({
          user_id: userId,
          name: cornerData.name || '新團體',
          code: `GRP-${Date.now()}`,
          contact_person: cornerData.contact_person,
          contact_phone: cornerData.contact_phone,
          contact_email: cornerData.contact_email
        })
        break

      // 其他類型待實作...
    }
  } catch (error) {
    console.error('建立角落模式關聯失敗:', error)
  }
}
