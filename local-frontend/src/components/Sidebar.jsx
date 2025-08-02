'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SidebarContainer = styled.aside`
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.cardBg};
  border-right: 1px solid ${props => props.theme.colors.border};
  width: 250px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  transition: transform 0.3s ease;
  
  @media (max-width: 768px) {
    transform: translateX(${props => (props.$isOpen ? '0' : '-100%')});
    box-shadow: ${props => (props.$isOpen ? '0 0 10px rgba(0, 0, 0, 0.5)' : 'none')};
    width: 80%;
    max-width: 250px;
  }
`;

const SidebarHeader = styled.div`
  padding: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  height: 60px;
`;

const Logo = styled.div`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
`;

const NavSection = styled.nav`
  flex: 1;
  padding: ${props => props.theme.spacing.md} 0;
  overflow-y: auto;
`;

const NavItem = styled.div`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  color: ${props => props.$active 
    ? props.theme.colors.primary 
    : props.theme.colors.textSecondary
  };
  background-color: ${props => props.$active 
    ? props.theme.colors.primaryLight 
    : 'transparent'
  };
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: ${props => props.theme.transitions.fast};
  border-left: 3px solid ${props => props.$active 
    ? props.theme.colors.primary 
    : 'transparent'
  };
  
  &:hover {
    background-color: ${props => props.$active 
      ? props.theme.colors.primaryLight 
      : 'rgba(255, 255, 255, 0.05)'
    };
    color: ${props => props.theme.colors.textPrimary};
  }
`;

const NavText = styled.span`
  margin-left: ${props => props.theme.spacing.sm};
`;

const AdSection = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border};
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
  text-align: center;
`;

const MobileOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => (props.$isOpen ? 'block' : 'none')};
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${props => props.theme.colors.textPrimary};
  font-size: 24px;
  cursor: pointer;
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 101;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.cardBg};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  const closeSidebar = () => {
    setIsOpen(false);
  };
  
  // 모바일에서 사이드바 외부 영역 클릭 시 사이드바 닫기
  const handleOverlayClick = () => {
    closeSidebar();
  };
  
  const menuItems = [
    { id: 'home', path: '/', label: '홈', icon: '🏠' },
    { id: 'notices', path: '/notices', label: '공지사항 목록', icon: '📢' },
    { id: 'mypage', path: '/mypage', label: '마이페이지', icon: '👤' },
    { id: 'subscription', path: '/subscription', label: '구독 관리', icon: '💳' },
    { id: 'settings', path: '/settings', label: '설정', icon: '⚙️' },
  ];
  
  return (
    <>
      <MenuButton onClick={toggleSidebar}>
        {isOpen ? '✕' : '☰'}
      </MenuButton>
      
      <MobileOverlay $isOpen={isOpen} onClick={handleOverlayClick} />
      
      <SidebarContainer $isOpen={isOpen}>
        <SidebarHeader>
          <Logo>자치구 공지</Logo>
        </SidebarHeader>
        
        <NavSection>
          {menuItems.map(item => (
            <Link href={item.path} key={item.id} onClick={closeSidebar} style={{ textDecoration: 'none' }}>
              <NavItem $active={pathname === item.path}>
                {item.icon}
                <NavText>{item.label}</NavText>
              </NavItem>
            </Link>
          ))}
        </NavSection>
        
        <AdSection>
          광고 배너 영역
        </AdSection>
      </SidebarContainer>
    </>
  );
};

export default Sidebar; 