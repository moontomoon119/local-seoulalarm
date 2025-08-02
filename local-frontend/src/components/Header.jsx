'use client';

import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Container, Flex } from './style';
import { Button } from './ui';
import { useAuth } from '@/lib/AuthContext';
import { logout } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const HeaderWrapper = styled.header`
  width: 100%;
  background-color: ${props => props.theme.colors.cardBg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  height: 60px;
  display: flex;
  align-items: center;
`;

// 헤더 전용 컨테이너: 모든 페이지에서 일관된 정렬을 위해
const HeaderContainer = styled.div`
  width: 100%;
  max-width: 42rem;
  margin: 0 auto;
  padding: 0 1rem;
  box-sizing: border-box;
`;

const Logo = styled.h1`
  font-size: ${props => props.theme.fontSizes.base};
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0;
`;

const LogoIcon = styled.svg`
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
  color: ${props => props.theme.colors.primary};
  flex-shrink: 0;
`;

const NavItem = styled.div`
  margin-left: ${props => props.theme.spacing.sm};
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  cursor: pointer;
  overflow: hidden;
`;

const UserMenu = styled.div`
  position: absolute;
  top: 100%;
  right: ${props => props.theme.spacing.md};
  width: 200px;
  background-color: ${props => props.theme.colors.cardBg};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.md};
  margin-top: ${props => props.theme.spacing.sm};
  display: ${props => props.$isOpen ? 'block' : 'none'};
  overflow: hidden;
  z-index: 100;
`;

const UserMenuItem = styled.div`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

// 로딩 상태를 표시할 플레이스홀더
const AuthPlaceholder = styled.div`
  width: 80px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.sm};
  background-color: ${props => props.theme.colors.border};
  opacity: 0.5;
`;

export default function Header() {
  const { isAuthenticated, user, userProfile, loading } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef(null);
  const avatarRef = useRef(null);
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };
  
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      setUserMenuOpen(false);
      router.push('/');
    }
  };
  
  // 외부 클릭 감지를 위한 이벤트 리스너 추가
  useEffect(() => {
    function handleClickOutside(event) {
      // 메뉴가 열려있고, 클릭이 메뉴 바깥쪽과 아바타 바깥쪽에서 발생했을 때만 메뉴를 닫음
      if (
        userMenuOpen && 
        menuRef.current && 
        avatarRef.current && 
        !menuRef.current.contains(event.target) && 
        !avatarRef.current.contains(event.target)
      ) {
        setUserMenuOpen(false);
      }
    }
    
    // 전역 클릭 이벤트 리스너 등록
    document.addEventListener('mousedown', handleClickOutside);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]); // userMenuOpen 상태가 변경될 때마다 이펙트 재실행
  
  return (
    <HeaderWrapper>
      <HeaderContainer>
        <Flex align="center" justify="space-between">
          <Flex align="center">
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <LogoIcon 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="currentColor" opacity="0.7" />
              </LogoIcon>
              <Logo>서울시 자치구별 고시공고 정보</Logo>
            </Link>
          </Flex>
          
          <Flex align="center">
            {loading ? (
              <NavItem>
                <AuthPlaceholder />
              </NavItem>
            ) : !isAuthenticated ? (
              <>
                <NavItem>
                  <Link href="/auth/login" prefetch={true} passHref>
                    <Button variant="outline" size="small">로그인</Button>
                  </Link>
                </NavItem>
                <NavItem>
                  <Link href="/auth/signup" prefetch={true} passHref>
                    <Button size="small">회원가입</Button>
                  </Link>
                </NavItem>
              </>
            ) : (
              <NavItem style={{ position: 'relative' }}>
                <Avatar ref={avatarRef} onClick={toggleUserMenu}>
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="프로필 이미지" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    user?.email?.charAt(0).toUpperCase() || '사용자'
                  )}
                </Avatar>
                <UserMenu ref={menuRef} $isOpen={userMenuOpen}>
                  <Link href="/mypage" prefetch={true} passHref>
                    <UserMenuItem onClick={() => setUserMenuOpen(false)}>마이페이지</UserMenuItem>
                  </Link>
                  <Link href="/subscription" prefetch={true} passHref>
                    <UserMenuItem onClick={() => setUserMenuOpen(false)}>구독 관리</UserMenuItem>
                  </Link>
                  <UserMenuItem onClick={handleLogout}>로그아웃</UserMenuItem>
                </UserMenu>
              </NavItem>
            )}
          </Flex>
        </Flex>
      </HeaderContainer>
    </HeaderWrapper>
  );
}