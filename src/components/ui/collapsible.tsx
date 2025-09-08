// 臨時 Collapsible 元件 - 快速通道
import React, { createContext, useContext, useState } from 'react'

const CollapsibleContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({ open: false, setOpen: () => {} })

export function Collapsible({ 
  children, 
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false 
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setOpen = onOpenChange || setUncontrolledOpen

  return (
    <CollapsibleContext.Provider value={{ open, setOpen }}>
      <div>{children}</div>
    </CollapsibleContext.Provider>
  )
}

export function CollapsibleTrigger({ 
  children,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen, open } = useContext(CollapsibleContext)
  
  return (
    <button
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </button>
  )
}

export function CollapsibleContent({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { open } = useContext(CollapsibleContext)
  
  if (!open) return null
  
  return <div>{children}</div>
}
