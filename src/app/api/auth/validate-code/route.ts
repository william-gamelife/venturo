import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/lib/auth/invitation-system';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { error: 'Invitation code is required' },
        { status: 400 }
      );
    }
    
    const authService = getAuthService();
    const invitation = authService.validateInvitationCode(code);
    
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation code' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      valid: true,
      invitation
    });
    
  } catch (error) {
    console.error('Validate code error:', error);
    return NextResponse.json(
      { error: 'Failed to validate code' },
      { status: 500 }
    );
  }
}