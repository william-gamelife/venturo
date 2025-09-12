'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ModuleLayout } from '@/components/ModuleLayout'
import { Icons } from '@/components/icons'

export default function NewContractPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientEmail: '',
    contractType: 'service',
    startDate: '',
    endDate: '',
    totalAmount: 0,
    currency: 'TWD',
    description: '',
    terms: ['']
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTermChange = (index: number, value: string) => {
    const newTerms = [...formData.terms]
    newTerms[index] = value
    setFormData(prev => ({ ...prev, terms: newTerms }))
  }

  const addTerm = () => {
    setFormData(prev => ({ ...prev, terms: [...prev.terms, ''] }))
  }

  const removeTerm = (index: number) => {
    if (formData.terms.length > 1) {
      const newTerms = formData.terms.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, terms: newTerms }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 實際儲存合約邏輯
    console.log('儲存合約:', formData)
    alert('合約已儲存！')
    router.push('/dashboard/contracts')
  }

  return (
    <ModuleLayout
      header={{
        icon: Icons.contracts,
        title: "新增合約",
        subtitle: "New Contract",
        backButton: {
          label: "返回合約列表",
          onClick: () => router.push('/dashboard/contracts')
        }
      }}
    >
      <div className="contract-form-container">
        <form onSubmit={handleSubmit} className="contract-form">
          {/* 基本資訊 */}
          <div className="form-section">
            <h3 className="section-title">基本資訊</h3>
            
            <div className="form-row">
              <div className="form-field">
                <label>合約標題 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="輸入合約標題"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>客戶名稱 *</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="輸入客戶名稱"
                  required
                />
              </div>
              <div className="form-field">
                <label>客戶信箱</label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  placeholder="輸入客戶信箱"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>合約類型 *</label>
                <select
                  value={formData.contractType}
                  onChange={(e) => handleInputChange('contractType', e.target.value)}
                >
                  <option value="service">服務合約</option>
                  <option value="product">產品合約</option>
                  <option value="lease">租賃合約</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div className="form-field">
                <label>貨幣 *</label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                >
                  <option value="TWD">台幣 (TWD)</option>
                  <option value="USD">美元 (USD)</option>
                  <option value="EUR">歐元 (EUR)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 合約期間與金額 */}
          <div className="form-section">
            <h3 className="section-title">期間與金額</h3>
            
            <div className="form-row">
              <div className="form-field">
                <label>開始日期 *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label>結束日期</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>合約總金額 *</label>
                <input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => handleInputChange('totalAmount', parseFloat(e.target.value) || 0)}
                  placeholder="輸入金額"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* 合約說明 */}
          <div className="form-section">
            <h3 className="section-title">合約說明</h3>
            
            <div className="form-field">
              <label>詳細說明</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="輸入合約詳細說明..."
                rows={4}
              />
            </div>
          </div>

          {/* 合約條款 */}
          <div className="form-section">
            <h3 className="section-title">合約條款</h3>
            
            {formData.terms.map((term, index) => (
              <div key={index} className="term-row">
                <div className="term-field">
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => handleTermChange(index, e.target.value)}
                    placeholder={`條款 ${index + 1}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTerm(index)}
                  className="remove-term-btn"
                  disabled={formData.terms.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addTerm}
              className="add-term-btn"
            >
              + 新增條款
            </button>
          </div>

          {/* 提交按鈕 */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => router.push('/dashboard/contracts')}
              className="cancel-btn"
            >
              取消
            </button>
            <button
              type="submit"
              className="submit-btn"
            >
              建立合約
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .contract-form-container {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(201, 169, 97, 0.2);
          max-width: 800px;
          margin: 0 auto;
        }

        .contract-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .form-section {
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(201, 169, 97, 0.1);
        }

        .form-section:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #3a3833;
          margin: 0 0 20px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #c9a961;
          display: inline-block;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-field label {
          font-weight: 500;
          color: #3a3833;
          font-size: 14px;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          padding: 10px 12px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 8px;
          font-size: 14px;
          background: white;
          transition: border-color 0.2s ease;
        }

        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: #c9a961;
        }

        .form-field textarea {
          resize: vertical;
          font-family: inherit;
        }

        .term-row {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 12px;
        }

        .term-field {
          flex: 1;
        }

        .term-field input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 6px;
          font-size: 14px;
        }

        .remove-term-btn {
          width: 32px;
          height: 32px;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .remove-term-btn:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.2);
        }

        .remove-term-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .add-term-btn {
          padding: 8px 16px;
          background: rgba(201, 169, 97, 0.1);
          color: #c9a961;
          border: 1px solid rgba(201, 169, 97, 0.3);
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .add-term-btn:hover {
          background: rgba(201, 169, 97, 0.2);
        }

        .form-actions {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
          padding-top: 24px;
          border-top: 1px solid rgba(201, 169, 97, 0.1);
        }

        .cancel-btn {
          padding: 10px 24px;
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
          border: 1px solid rgba(107, 114, 128, 0.3);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover {
          background: rgba(107, 114, 128, 0.2);
        }

        .submit-btn {
          padding: 10px 24px;
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(201, 169, 97, 0.3);
        }

        @media (max-width: 768px) {
          .contract-form-container {
            padding: 16px;
            margin: 0 12px;
          }
          
          .form-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .cancel-btn,
          .submit-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </ModuleLayout>
  )
}