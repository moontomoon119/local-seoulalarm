'use client';

import React, { memo } from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header';
import { Container, Text, LayoutWrapper, ContentWrapper, HeaderContainer } from './style';
import { useRouteLoader } from '@/lib/routeLoader';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${props => props.theme.colors.background};
`;

// SidebarWrapper는 제거될 예정이므로 주석 처리하거나 삭제합니다.
// const SidebarWrapper = styled.div`
//   width: 250px;
//   flex-shrink: 0;
//   
//   @media (max-width: 768px) {
//     display: none;
//   }
// `;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${props => props.$hasSidebar ? '250px' : '0'};
  width: calc(100% - ${props => props.$hasSidebar ? '250px' : '0px'});
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    overflow-x: hidden;
  }
`;

const HeaderWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background-color: ${props => props.theme.colors.cardBg};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
`;

// 페이지 전환 로딩 인디케이터
const PageLoadingIndicator = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: ${props => props.theme.colors.primary};
  z-index: 1000;
  transform: scaleX(${props => (props.$isLoading ? '100%' : '0')});
  transform-origin: left;
  transition: transform 0.3s ease-in-out;
  opacity: ${props => (props.$isLoading ? 1 : 0)};
`;

// 메인 콘텐츠 영역 (MainLayout에서만 사용)
const MainContentWrapper = styled.main`
  flex: 1;
  padding: ${props => props.theme.spacing.lg};
  width: 100%;
  height: calc(100vh - 60px - 52px);
  overflow-y: auto;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing.md};
    width: 100%;
    min-width: 0;
    overflow-x: hidden;
  }

  /* 사용자 지정 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(100, 100, 100, 0.4);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 100, 100, 0.6);
  }
`;

// 푸터 컴포넌트
const Footer = styled.footer`
  background-color: ${props => props.theme.colors.cardBg};
  border-top: 1px solid ${props => props.theme.colors.border};
  padding: 1rem 0;
  height: 52px; /* 푸터 높이 고정 */
  text-align: center;
  box-sizing: border-box;
`;

// 사이드바 메모이제이션
const MemoizedSidebar = memo(Sidebar);

// 헤더 메모이제이션
const MemoizedHeader = memo(Header);

// 푸터 컴포넌트 분리 및 메모이제이션
const FooterComponent = memo(() => (
  <Footer>
    <Container>
      <Text size="xs" variant="secondary" noMargin>
      © 2025 서울시 자치구별 고시공고 정보
      </Text>
    </Container>
  </Footer>
));

FooterComponent.displayName = 'FooterComponent';

// MainLayout 자체도 메모이제이션
const MainLayout = memo(({ children }) => {
  // 라우트 로딩 상태 가져오기
  const isLoading = useRouteLoader();
  
  return (
    <LayoutWrapper>
      <PageLoadingIndicator $isLoading={isLoading} />
      <MemoizedSidebar />
      
      {/* <SidebarWrapper /> */}{/* SidebarWrapper 제거 */}
      
      <MainContent $hasSidebar={true}>
        <HeaderContainer>
          <MemoizedHeader />
        </HeaderContainer>
        
        <MainContentWrapper>
          {children}
        </MainContentWrapper>
        
        <FooterComponent />
      </MainContent>
    </LayoutWrapper>
  );
});

MainLayout.displayName = 'MainLayout';

export default MainLayout; 