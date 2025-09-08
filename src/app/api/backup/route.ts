import { NextResponse } from 'next/server';
import { createDataService } from '@/lib/storage/local-db';

export async function POST() {
  try {
    const dataService = createDataService();
    await dataService.backup();
    
    return NextResponse.json({
      success: true,
      message: 'Backup created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}