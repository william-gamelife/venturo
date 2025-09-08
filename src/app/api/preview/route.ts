import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');

  // 檢查密鑰（可選，增加安全性）
  if (secret !== process.env.PREVIEW_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  // 啟用 Draft Mode（Next.js 13+ 的新 API）
  draftMode().enable();

  // 重新導向到指定頁面或首頁
  const redirectUrl = slug ? `/${slug}` : '/';
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, slug } = body;

    // 檢查密鑰（可選）
    if (secret !== process.env.PREVIEW_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // 啟用 Draft Mode
    draftMode().enable();

    return NextResponse.json({ 
      message: 'Preview mode enabled',
      redirectTo: slug ? `/${slug}` : '/'
    });
  } catch (error) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}