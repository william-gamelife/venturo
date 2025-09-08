'use client'

import React from 'react'
import { PageHeader } from '@/components/PageHeader'

interface ModuleLayoutProps {
  header?: {
    icon: React.ReactNode
    title: string
    subtitle: string
    actions?: React.ReactNode
  }
  children: React.ReactNode
  className?: string
}

export function ModuleLayout({ 
  header, 
  children, 
  className = '' 
}: ModuleLayoutProps) {
  return (
    <div className={`module-container ${className}`}>
      {header && (
        <PageHeader
          icon={header.icon}
          title={header.title}
          subtitle={header.subtitle}
          actions={header.actions}
        />
      )}
      
      <div className="module-content">
        {children}
      </div>
      
      <style jsx>{`
        .module-container {
          max-width: none;
          margin: 0;
          padding: 0;
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .module-content {
          margin-top: -10px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        @media (max-width: 768px) {
          .module-container {
            padding: 0;
          }
          
          .module-content {
            margin-top: 0;
          }
        }
        
        @media (max-width: 480px) {
          .module-container {
            padding: 0;
          }
          
          .module-content {
            margin-top: 0;
          }
        }
      `}</style>
    </div>
  )
}