import { NextRequest, NextResponse } from 'next/server';
import { getServerDataService } from '@/lib/storage/server-db';

export async function GET(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  try {
    const dataService = getServerDataService();
    const data = await dataService.read(params.collection);
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Failed to read data' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  try {
    const dataService = getServerDataService();
    const newItem = await request.json();
    
    // 獲取現有資料
    const existing = await dataService.read(params.collection);
    
    // 添加新項目
    const updated = [...existing, newItem];
    
    // 寫入更新後的資料
    await dataService.write(params.collection, updated);
    
    return NextResponse.json(newItem);
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create data' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  try {
    const dataService = getServerDataService();
    const data = await request.json();
    
    // 直接覆寫整個集合
    await dataService.write(params.collection, data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update data' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  try {
    const dataService = getServerDataService();
    const { id } = await request.json();
    
    // 獲取現有資料
    const existing = await dataService.read(params.collection);
    
    // 過濾掉要刪除的項目
    const filtered = existing.filter((item: any) => item.id !== id);
    
    // 寫入更新後的資料
    await dataService.write(params.collection, filtered);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    );
  }
}