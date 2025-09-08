import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/lib/auth/invitation-system';

export async function POST(request: NextRequest) {
  try {
    const { invitationCode, name, nickname } = await request.json();
    
    if (!invitationCode || !name || !nickname) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    const authService = getAuthService();
    const user = await authService.createUser(invitationCode, name, nickname);
    
    return NextResponse.json({
      success: true,
      user
    });
    
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    );
  }
}