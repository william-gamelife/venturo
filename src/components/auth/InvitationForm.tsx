'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthContext } from './AuthProvider';
import { InvitationCode } from '@/lib/auth/invitation-system';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function InvitationForm() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [validatedCode, setValidatedCode] = useState<InvitationCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'code' | 'details'>('code');
  
  const { validateCode, createUser, isLoading } = useAuthContext();
  
  // 驗證邀請碼
  const handleValidateCode = () => {
    setError(null);
    
    if (!code.trim()) {
      setError('請輸入邀請碼');
      return;
    }
    
    const invitation = validateCode(code);
    
    if (!invitation) {
      setError('邀請碼無效或已過期');
      return;
    }
    
    setValidatedCode(invitation);
    setStep('details');
  };
  
  // 建立使用者
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name.trim() || !nickname.trim()) {
      setError('請填寫完整資料');
      return;
    }
    
    try {
      await createUser(code, name.trim(), nickname.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : '建立使用者失敗');
    }
  };
  
  // 返回輸入邀請碼
  const handleBack = () => {
    setStep('code');
    setValidatedCode(null);
    setError(null);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            歡迎來到 Venturo
          </CardTitle>
          <CardDescription>
            {step === 'code' 
              ? '請輸入您的邀請碼以開始使用' 
              : '請完善您的基本資料'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === 'code' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">邀請碼</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="輸入邀請碼"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleValidateCode()}
                  className="text-center tracking-wider"
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={handleValidateCode}
                className="w-full"
                disabled={isLoading || !code.trim()}
              >
                驗證邀請碼
              </Button>
              
              {/* 開發模式快速登入 */}
              {process.env.NODE_ENV === 'development' && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center mb-2">
                    開發模式
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCode('DEV')}
                    >
                      DEV
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCode('ADMIN2025')}
                    >
                      ADMIN
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCode('CORNER2025')}
                    >
                      CORNER
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* 顯示邀請碼資訊 */}
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <p className="text-sm font-medium">角色權限</p>
                <p className="text-xs text-muted-foreground">
                  {validatedCode?.title} - {validatedCode?.description}
                </p>
                {validatedCode?.specialBonus && (
                  <p className="text-xs text-primary">
                    🎁 {validatedCode.specialBonus}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">真實姓名</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="請輸入您的姓名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nickname">暱稱</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="請輸入暱稱"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex-1"
                >
                  返回
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading || !name.trim() || !nickname.trim()}
                  className="flex-1"
                >
                  {isLoading ? '建立中...' : '開始冒險'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}