import { NextResponse } from 'next/server';
import { getAuthService } from '@/lib/auth/invitation-system';

export async function GET() {
  try {
    const authService = getAuthService();
    const user = await authService.checkUser();
    
    // 開發模式：如果沒有使用者，自動建立
    if (!user && process.env.NODE_ENV === 'development') {
      const devUser = await authService.autoLoginDev();
      return NextResponse.json({
        exists: true,
        user: devUser,
        autoCreated: true
      });
    }
    
    return NextResponse.json({
      exists: !!user,
      user
    });
    
  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json(
      { error: 'Failed to check user' },
      { status: 500 }
    );
  }
}