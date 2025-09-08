'use client'

import { useEffect, useState } from 'react'
import { authManager } from '@/lib/auth'

interface PageHeaderProps {
  title?: string
  subtitle?: string
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const user = authManager.getCurrentUser()
    setCurrentUser(user)
  }, [])

  if (!currentUser) {
    return null
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '系統管理員'
      case 'BUSINESS_ADMIN':
        return '業務管理員'
      default:
        return '一般使用者'
    }
  }

  return (
    <div className="page-header">
      <div className="welcome-section">
        <h1 className="welcome-title">
          歡迎回來，{currentUser.display_name}
        </h1>
        <p className="welcome-subtitle">
          {getRoleDisplayName(currentUser.role)}
        </p>
      </div>
      
      {(title || subtitle) && (
        <div className="page-info">
          {title && <h2 className="page-title">{title}</h2>}
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      )}

      <style jsx>{`
        .page-header {
          padding: 2rem 0;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 2rem;
        }

        .welcome-section {
          margin-bottom: ${title || subtitle ? '1.5rem' : '0'};
        }

        .welcome-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .welcome-subtitle {
          font-size: 1.2rem;
          color: #718096;
          margin: 0;
        }

        .page-info {
          padding-top: 1.5rem;
          border-top: 1px solid #f7fafc;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          font-size: 1rem;
          color: #718096;
          margin: 0;
        }
      `}</style>
    </div>
  )
}