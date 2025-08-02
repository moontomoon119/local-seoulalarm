'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { db, USER_ROLES, updateUserRole } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui';
import { Container } from '@/components/style';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';

// 스타일 컴포넌트 정의
const Title = styled.h1`
  margin: 0;
  margin-bottom: ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.fontSizes.xl};
  color: ${props => props.theme.colors.textPrimary};
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.cardBackground};
  box-shadow: ${props => props.theme.shadows.sm};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing.md};
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const UserEmail = styled.div`
  font-weight: bold;
  color: ${props => props.theme.colors.textPrimary};
`;

const UserName = styled.div`
  color: ${props => props.theme.colors.textSecondary};
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.xs};
  background-color: ${props => {
    switch(props.$role) {
      case 'developer': return '#6a0dad';
      case 'manager': return '#e84393';
      case 'subscriber_a': return '#00b894';
      case 'subscriber_b': return '#fdcb6e';
      case 'subscriber_c': return '#0984e3';
      default: return '#b2bec3';
    }
  }};
  color: white;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: 500;
`;

const Actions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  
  @media (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
    
    button {
      flex: 1;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: ${props => props.theme.fontSizes.lg};
  color: ${props => props.theme.colors.textSecondary};
`;

const AdminUsersPage = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // 관리자 권한 체크
  useEffect(() => {
    if (!userProfile) {
      return;
    }
    
    if (userProfile.role !== USER_ROLES.DEVELOPER && userProfile.role !== USER_ROLES.MANAGER) {
      router.push('/');
    }
  }, [userProfile, router]);
  
  // 사용자 목록 가져오기
  useEffect(() => {
    const fetchUsers = async () => {
      if (!userProfile) {
        return;
      }
      
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      } catch (error) {
        console.error('사용자 목록 가져오기 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userProfile) {
      fetchUsers();
    }
  }, [userProfile]);
  
  // 사용자 역할 변경
  const handleUpdateUserRole = async (userId, role) => {
    try {
      const result = await updateUserRole(userId, role);
      
      if (result.success) {
        // 목록 갱신
        setUsers(users.map(user => {
          if (user.id === userId) {
            // 역할에 따른 플랜 이름 설정
            let planName;
            switch (role) {
              case USER_ROLES.DEVELOPER: planName = '개발자'; break;
              case USER_ROLES.MANAGER: planName = '관리자'; break;
              case USER_ROLES.SUBSCRIBER_A: planName = '프리미엄'; break;
              case USER_ROLES.SUBSCRIBER_B: planName = '스탠다드'; break;
              case USER_ROLES.SUBSCRIBER_C: planName = '베이직'; break;
              default: planName = '무료';
            }
            
            return {
              ...user, 
              role, 
              subscription: {
                ...user.subscription,
                plan: planName
              }
            };
          }
          return user;
        }));
      }
    } catch (error) {
      console.error('역할 업데이트 오류:', error);
    }
  };
  
  // 권한이 없으면 로딩 중 표시
  if (!userProfile || (userProfile.role !== USER_ROLES.DEVELOPER && userProfile.role !== USER_ROLES.MANAGER)) {
    return (
      <Container>
        <LoadingContainer>접근 권한을 확인 중입니다...</LoadingContainer>
      </Container>
    );
  }
  
  return (
    <Container>
      <Title>사용자 관리</Title>
      
      {loading ? (
        <LoadingContainer>사용자 목록을 불러오는 중...</LoadingContainer>
      ) : (
        <UserList>
          {users.map(user => (
            <UserItem key={user.id}>
              <UserInfo>
                <UserEmail>{user.email || '이메일 없음'}</UserEmail>
                <UserName>{user.displayName || '이름 없음'}</UserName>
                <RoleBadge $role={user.role}>{user.subscription?.plan || '무료'}</RoleBadge>
              </UserInfo>
              <Actions>
                <Button 
                  variant={user.role === USER_ROLES.DEVELOPER ? 'secondary' : 'outline'} 
                  onClick={() => handleUpdateUserRole(user.id, USER_ROLES.DEVELOPER)}
                  disabled={user.role === USER_ROLES.DEVELOPER}
                >
                  {user.role === USER_ROLES.DEVELOPER ? '개발자 상태' : '개발자 지정'}
                </Button>
                <Button 
                  variant={user.role === USER_ROLES.MANAGER ? 'secondary' : 'outline'} 
                  onClick={() => handleUpdateUserRole(user.id, USER_ROLES.MANAGER)}
                  disabled={user.role === USER_ROLES.MANAGER}
                >
                  {user.role === USER_ROLES.MANAGER ? '관리자 상태' : '관리자 지정'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleUpdateUserRole(user.id, USER_ROLES.FREE)}
                  disabled={user.role === USER_ROLES.FREE}
                >
                  일반회원으로 변경
                </Button>
              </Actions>
            </UserItem>
          ))}
        </UserList>
      )}
    </Container>
  );
};

export default AdminUsersPage;
