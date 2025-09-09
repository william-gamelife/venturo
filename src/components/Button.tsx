'use client'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
  fullWidth?: boolean
  className?: string
}

export function Button({ variant = 'primary', size = 'md', icon, children, onClick, fullWidth = false, className = '' }: ButtonProps) {
  return (
    <button className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full-width' : ''} ${className}`} onClick={onClick}>
      {icon && <span className="btn-icon">{icon}</span>}
      <span>{children}</span>
      
      <style jsx>{`
        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        
        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }
        
        .btn-md {
          padding: 10px 16px;
          font-size: 14px;
        }
        
        .btn-lg {
          padding: 14px 20px;
          font-size: 16px;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(244, 164, 96, 0.3);
        }
        
        .btn-secondary {
          background: white;
          color: var(--primary);
          border: 1px solid rgba(244, 164, 96, 0.3);
        }
        
        .btn-secondary:hover {
          background: rgba(244, 164, 96, 0.05);
          border-color: rgba(244, 164, 96, 0.5);
        }
        
        .btn-ghost {
          background: transparent;
          color: var(--text-secondary);
        }
        
        .btn-ghost:hover {
          background: rgba(244, 164, 96, 0.1);
          color: var(--primary);
        }
        
        .btn-icon {
          display: flex;
          align-items: center;
        }
        
        .btn-full-width {
          width: 100%;
          justify-content: center;
        }
      `}</style>
    </button>
  )
}