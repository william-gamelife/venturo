'use client'

import { useState } from 'react'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Button } from '@/components/Button'
import { Icons } from '@/components/icons'
import { FinancialOverview } from './components/FinancialOverview'
import { AssetManagement } from './components/AssetManagement'
import { BudgetManagement } from './components/BudgetManagement'
import { TransactionHistory } from './components/TransactionHistory'
import { AdvanceManagement } from './components/AdvanceManagement'
import { VersionIndicator } from '@/components/VersionIndicator'

type FinanceTab = 'overview' | 'assets' | 'budget' | 'transactions' | 'advances'

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview')

  const tabs = [
    { id: 'overview' as const, name: '總覽', icon: '' },
    { id: 'assets' as const, name: '資產管理', icon: '' },
    { id: 'budget' as const, name: '預算編列', icon: '' },
    { id: 'transactions' as const, name: '收支記錄', icon: '' },
    { id: 'advances' as const, name: '墊款核銷', icon: '' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <FinancialOverview />
      case 'assets':
        return <AssetManagement />
      case 'budget':
        return <BudgetManagement />
      case 'transactions':
        return <TransactionHistory />
      case 'advances':
        return <AdvanceManagement />
      default:
        return <FinancialOverview />
    }
  }

  return (
    <ModuleLayout
      header={{
        icon: Icons.finance,
        title: "財務管理",
        subtitle: "您的理財冒險夥伴",
        actions: (
          <div className="finance-tabs-header">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`header-tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-name">{tab.name}</span>
              </button>
            ))}
          </div>
        )
      }}
    >
      <div className="finance-content">
        {renderContent()}
      </div>

      <style jsx>{`
        .finance-tabs-header {
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 12px;
          padding: 4px;
          border: 1px solid rgba(201, 169, 97, 0.2);
        }

        .header-tab-button {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: #6d685f;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 13px;
          white-space: nowrap;
          border-radius: 8px;
          font-weight: 500;
          min-width: fit-content;
        }

        .header-tab-button:hover {
          background: rgba(201, 169, 97, 0.1);
          color: #3a3833;
        }

        .header-tab-button.active {
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          box-shadow: 0 2px 12px rgba(201, 169, 97, 0.25);
        }

        .finance-content {
          min-height: 500px;
        }
        
        /* Override PageHeader's column layout for our tabs */
        @media (max-width: 768px) {
          .finance-tabs-header {
            display: flex !important;
            flex-direction: row !important;
            gap: 4px;
            padding: 3px;
            width: 100%;
            justify-content: flex-start;
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          
          .finance-tabs-header::-webkit-scrollbar {
            display: none;
          }
          
          .header-tab-button {
            padding: 6px 12px;
            font-size: 12px;
            flex-shrink: 0;
            min-width: max-content;
          }
        }
        
        @media (max-width: 480px) {
          .finance-tabs-header {
            gap: 2px;
            padding: 2px;
            flex-direction: row !important;
          }
          
          .header-tab-button {
            padding: 4px 8px;
            font-size: 10px;
            flex-shrink: 0;
          }
          
          .header-tab-button .tab-name {
            font-size: 10px;
          }
        }
      `}</style>
      
      <VersionIndicator 
        page="財務管理"
        authSystem="mixed" 
        version="1.0"
        status="error"
      />
    </ModuleLayout>
  )
}