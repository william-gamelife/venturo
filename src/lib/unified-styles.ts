
// 🎨 VENTURO 統一元件樣式
export const UnifiedStyles = {
  // 頁面容器
  pageContainer: {
    background: 'linear-gradient(135deg, #fdfbf7 0%, #f5f1ea 100%)',
    minHeight: '100vh',
    padding: '24px'
  },
  
  // 模組標題
  moduleHeader: {
    background: 'linear-gradient(135deg, #c9a961 0%, #b8975a 100%)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    color: 'white'
  },
  
  // 卡片
  card: {
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(201, 169, 97, 0.2)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease'
  },
  
  // 按鈕
  primaryButton: {
    background: 'linear-gradient(135deg, #c9a961 0%, #b8975a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '10px 20px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(201, 169, 97, 0.3)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(201, 169, 97, 0.4)'
    }
  },
  
  // 表格
  table: {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(201, 169, 97, 0.2)'
  },
  
  // 表格頭
  tableHeader: {
    background: 'linear-gradient(135deg, #c9a961 0%, #b8975a 100%)',
    color: 'white',
    fontWeight: '600',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '16px'
  },
  
  // 輸入框
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid rgba(201, 169, 97, 0.3)',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    background: 'white',
    '&:focus': {
      outline: 'none',
      borderColor: '#c9a961',
      boxShadow: '0 0 0 3px rgba(201, 169, 97, 0.1)'
    }
  },
  
  // 標籤
  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid currentColor'
  },
  
  // 成功標籤
  badgeSuccess: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    border: '1px solid #10b981'
  },
  
  // 警告標籤
  badgeWarning: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
    border: '1px solid #f59e0b'
  },
  
  // 危險標籤
  badgeDanger: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid #ef4444'
  }
};

export default UnifiedStyles;
