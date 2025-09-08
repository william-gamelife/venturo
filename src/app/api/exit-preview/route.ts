import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

export async function GET(request: NextRequest) {
  // 關閉 Draft Mode
  draftMode().disable();

  // 重新導向到首頁或指定頁面
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get('redirect') || '/';
  
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}

export async function POST() {
  // 關閉 Draft Mode
  draftMode().disable();

  return NextResponse.json({ 
    message: 'Preview mode disabled'
  });
}