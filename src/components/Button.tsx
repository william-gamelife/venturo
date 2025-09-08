'use client'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ variant = 'primary', icon, children, onClick }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {icon && <span className="btn-icon">{icon}</span>}
      <span>{children}</span>
      
      <style jsx>{`
        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #f4a460, #2f4f2f);
          color: white;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(244, 164, 96, 0.3);
        }
        
        .btn-secondary {
          background: white;
          color: #f4a460;
          border: 1px solid rgba(244, 164, 96, 0.3);
        }
        
        .btn-secondary:hover {
          background: rgba(244, 164, 96, 0.05);
          border-color: rgba(244, 164, 96, 0.5);
        }
        
        .btn-ghost {
          background: transparent;
          color: #6d685f;
        }
        
        .btn-ghost:hover {
          background: rgba(244, 164, 96, 0.1);
          color: #f4a460;
        }
        
        .btn-icon {
          display: flex;
          align-items: center;
        }
      `}</style>
    </button>
  )
}