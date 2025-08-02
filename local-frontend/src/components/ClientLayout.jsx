'use client';
//frontend/src/components/ClientLayout.jsx
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from '@/lib/theme';
import GlobalStyles from '@/lib/globalStyles';
import MainLayout from './MainLayout';
import { AuthProvider } from '@/lib/AuthContext';
import { usePathname, useSearchParams } from 'next/navigation';
import styled from 'styled-components';

// 페이지 전환 로딩 인디케이터
const PageTransition = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: ${props => props.theme.colors.primary};
  z-index: 1000;
  transform: scaleX(${props => (props.$isNavigating ? '100%' : '0')});
  transform-origin: left;
  transition: transform 0.3s ease-in-out;
  opacity: ${props => (props.$isNavigating ? 1 : 0)};
`;

// 클라이언트 전용 페이지 전환 컴포넌트
const ClientPageTransition = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // 페이지 전환 시작
    setIsNavigating(true);
    
    // 페이지 전환 완료 (약간의 지연 추가)
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);
  
  return <PageTransition $isNavigating={isNavigating} />;
};

export default function ClientLayout({ children }) {
  // 클라이언트 사이드 하이드레이션을 위한 로딩 상태
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // 마운트 후 클라이언트 사이드로 표시
    setIsClient(true);
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {isClient && <ClientPageTransition />}
      <AuthProvider>
        <MainLayout>{children}</MainLayout>
      </AuthProvider>
    </ThemeProvider>
  );
} 