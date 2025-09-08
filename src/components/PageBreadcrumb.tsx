'use client';

import React from 'react';
import { Breadcrumbs, Typography, Link } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface PageBreadcrumbProps {
  className?: string;
}

/**
 * 簡單的頁面麵包屑組件
 */
function PageBreadcrumb({ className = '' }: PageBreadcrumbProps) {
  const pathname = usePathname();
  
  // 解析路径生成面包屑
  const pathSegments = pathname.split('/').filter(segment => segment);
  
  // 移除 dashboard 段，因為它不需要顯示
  const displaySegments = pathSegments.filter(segment => segment !== 'dashboard');
  
  if (displaySegments.length <= 1) {
    return null; // 不顯示面包屑如果只有一層
  }

  const breadcrumbItems = displaySegments.map((segment, index) => {
    const isLast = index === displaySegments.length - 1;
    const href = `/dashboard/${displaySegments.slice(0, index + 1).join('/')}`;
    
    // 簡單的段名稱轉換
    const displayName = segment
      .replace('-', ' ')
      .replace('corner', '角落')
      .replace('orders', '訂單')
      .replace('groups', '旅遊團')
      .replace('customers', '客戶')
      .replace('suppliers', '供應商');

    return {
      name: displayName,
      href: href,
      isLast
    };
  });

  return (
    <Breadcrumbs 
      separator={<ChevronRight size={14} />} 
      className={className}
      aria-label="breadcrumb"
    >
      <Link 
        href="/dashboard" 
        color="text.secondary" 
        className="text-sm hover:text-primary"
      >
        首頁
      </Link>
      {breadcrumbItems.map((item, index) => (
        item.isLast ? (
          <Typography key={index} color="text.primary" className="text-sm font-medium">
            {item.name}
          </Typography>
        ) : (
          <Link 
            key={index} 
            href={item.href} 
            color="text.secondary" 
            className="text-sm hover:text-primary"
          >
            {item.name}
          </Link>
        )
      ))}
    </Breadcrumbs>
  );
}

export default PageBreadcrumb;