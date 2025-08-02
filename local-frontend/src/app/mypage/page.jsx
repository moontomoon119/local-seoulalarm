'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Card, Button } from '@/components/ui';
import { Container } from '@/components/style';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/AuthContext';
import { logout, USER_ROLES } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, collection, getDoc, setDoc, Timestamp, deleteDoc } from 'firebase/firestore';

const Title = styled.h1`
  margin: 0;
  margin-bottom: ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.fontSizes.xl};
  color: ${props => props.theme.colors.textPrimary};
`;

const ProfileCard = styled(Card)`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const CardTitle = styled.h2`
  margin: 0;
  margin-bottom: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.fontSizes.lg};
  color: ${props => props.theme.colors.textPrimary};
`;

const ProfileInfo = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: ${props => props.theme.spacing.sm};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  width: 120px;
  color: ${props => props.theme.colors.textSecondary};
`;

const InfoValue = styled.span`
  color: ${props => props.theme.colors.textPrimary};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
`;

const Badge = styled.span`
  display: inline-block;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background-color: ${props => 
    props.$type === 'developer' ? '#6a0dad' :
    props.$type === 'manager' ? '#e84393' :
    props.$type === 'subscriber_a' ? '#00b894' :
    props.$type === 'subscriber_b' ? '#fdcb6e' :
    props.$type === 'subscriber_c' ? '#0984e3' :
    '#b2bec3'
  };
  color: white;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: 500;
`;

const KeywordInput = styled.input`
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  margin-right: ${props => props.theme.spacing.sm};
  width: 200px;
`;

const KeywordList = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
`;

const KeywordTag = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.danger};
  margin-left: ${props => props.theme.spacing.xs};
  cursor: pointer;
  padding: 2px 6px;
  
  &:hover {
    opacity: 0.8;
  }
`;

// 구독 등급별 표시 이름
const getSubscriptionName = (role) => {
  switch (role) {
    case USER_ROLES.DEVELOPER:
      return '개발자';
    case USER_ROLES.MANAGER:
      return '관리자';
    case USER_ROLES.SUBSCRIBER_A:
      return '프리미엄';
    case USER_ROLES.SUBSCRIBER_B:
      return '스탠다드';
    case USER_ROLES.SUBSCRIBER_C:
      return '베이직';
    case USER_ROLES.FREE:
    default:
      return '무료';
  }
};

// 구독 등급별 혜택 설명
const getSubscriptionBenefits = (role) => {
  switch (role) {
    case USER_ROLES.DEVELOPER:
      return '모든 기능 접근 및 개발 권한';
    case USER_ROLES.MANAGER:
      return '관리자 기능 및 콘텐츠 관리 권한';
    case USER_ROLES.SUBSCRIBER_A:
      return '모든 자치구 공시 정보 열람, 맞춤 알림, 광고 제거';
    case USER_ROLES.SUBSCRIBER_B:
      return '모든 자치구 공시 정보 열람, 맞춤 알림';
    case USER_ROLES.SUBSCRIBER_C:
      return '모든 자치구 공시 정보 열람';
    case USER_ROLES.FREE:
    default:
      return '기본 자치구 공시 정보 열람 (제한적)';
  }
};

const MyPage = () => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [subscribedKeywords, setSubscribedKeywords] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();
  
  useEffect(() => {
    const loadProfile = async () => {
      if (!userProfile && user) {
        setLoading(true);
        await refreshUserProfile();
        setLoading(false);
      }
      
      if (userProfile?.subscribedKeywords) {
        try {
          const keywords = JSON.parse(userProfile.subscribedKeywords);
          setSubscribedKeywords(keywords);
        } catch (error) {
          console.error('키워드 파싱 오류:', error);
          setSubscribedKeywords([]);
        }
      }
    };
    
    loadProfile();
  }, [user, userProfile, refreshUserProfile]);
  
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push('/');
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim() || !user) return;
    
    try {
      setError('');
      setLoading(true);
      
      // 키워드 중복 체크
      if (subscribedKeywords.includes(newKeyword.trim())) {
        setError('이미 등록된 키워드입니다.');
        return;
      }
      
      // 사용자 문서 업데이트
      const userRef = doc(db, 'users', user.uid);
      const updatedKeywords = [...subscribedKeywords, newKeyword];
      await updateDoc(userRef, {
        subscribedKeywords: JSON.stringify(updatedKeywords)
      });
      
      // keyword_subscriptions 컬렉션 업데이트
      const keywordRef = doc(db, 'keyword_subscriptions', newKeyword);
      const keywordDoc = await getDoc(keywordRef);
      
      if (keywordDoc.exists()) {
        const data = keywordDoc.data();
        const subscribers = JSON.parse(data.subscribers || '[]');
        if (!subscribers.includes(user.uid)) {
          await updateDoc(keywordRef, {
            subscribers: JSON.stringify([...subscribers, user.uid]),
            subscriberCount: (data.subscriberCount || 0) + 1,
            updatedAt: Timestamp.now()
          });
        }
      } else {
        await setDoc(keywordRef, {
          keyword: newKeyword,
          subscribers: JSON.stringify([user.uid]),
          subscriberCount: 1,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
      
      setSubscribedKeywords(updatedKeywords);
      setNewKeyword('');
      await refreshUserProfile();
    } catch (error) {
      console.error('키워드 추가 오류:', error);
      setError('키워드 추가 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveKeyword = async (keyword) => {
    if (!user) return;
    
    try {
      setError('');
      setLoading(true);
      
      // 사용자 문서 업데이트
      const userRef = doc(db, 'users', user.uid);
      const updatedKeywords = subscribedKeywords.filter(k => k !== keyword);
      await updateDoc(userRef, {
        subscribedKeywords: JSON.stringify(updatedKeywords)
      });
      
      // keyword_subscriptions 컬렉션 업데이트
      const keywordRef = doc(db, 'keyword_subscriptions', keyword);
      const keywordDoc = await getDoc(keywordRef);
      
      if (keywordDoc.exists()) {
        const data = keywordDoc.data();
        const subscribers = JSON.parse(data.subscribers || '[]');
        const updatedSubscribers = subscribers.filter(id => id !== user.uid);
        
        if (updatedSubscribers.length === 0) {
          // 구독자가 없으면 문서 삭제
          await deleteDoc(keywordRef);
        } else {
          await updateDoc(keywordRef, {
            subscribers: JSON.stringify(updatedSubscribers),
            subscriberCount: data.subscriberCount - 1,
            updatedAt: Timestamp.now()
          });
        }
      }
      
      setSubscribedKeywords(updatedKeywords);
      await refreshUserProfile();
    } catch (error) {
      console.error('키워드 제거 오류:', error);
      setError('키워드 제거 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };
  
  const userRole = userProfile?.role || USER_ROLES.FREE;
  const subscription = userProfile?.subscription || { plan: '무료', status: 'active' };
  
  return (
    <ProtectedRoute>
      <Container>
        <Title>내 정보</Title>
        
        <ProfileCard>
          <Card.Content>
            <CardTitle>회원 정보</CardTitle>
            
            <ProfileInfo>
              <InfoRow>
                <InfoLabel>이메일</InfoLabel>
                <InfoValue>{user?.email || '-'}</InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>이름</InfoLabel>
                <InfoValue>{userProfile?.displayName || user?.displayName || '-'}</InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>가입일</InfoLabel>
                <InfoValue>
                  {userProfile?.createdAt 
                    ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString() 
                    : user?.metadata?.creationTime 
                      ? new Date(user.metadata.creationTime).toLocaleDateString() 
                      : '-'}
                </InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>회원 등급</InfoLabel>
                <InfoValue>
                  <Badge $type={userRole}>{getSubscriptionName(userRole)}</Badge>
                </InfoValue>
              </InfoRow>
            </ProfileInfo>
            
            <ButtonContainer>
              <Button variant="outline" onClick={() => router.push('/mypage/edit')}>
                정보 수정
              </Button>
              <Button variant="secondary" onClick={handleLogout}>
                로그아웃
              </Button>
            </ButtonContainer>
          </Card.Content>
        </ProfileCard>
        
        <ProfileCard>
          <Card.Content>
            <CardTitle>구독 정보</CardTitle>
            
            <ProfileInfo>
              <InfoRow>
                <InfoLabel>현재 구독</InfoLabel>
                <InfoValue>
                  <Badge $type={userRole}>{getSubscriptionName(userRole)}</Badge>
                </InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>구독 상태</InfoLabel>
                <InfoValue>
                  {subscription.status === 'active' ? '활성화' : '비활성화'}
                </InfoValue>
              </InfoRow>
              
              {subscription.endDate && (
                <InfoRow>
                  <InfoLabel>만료일</InfoLabel>
                  <InfoValue>
                    {new Date(subscription.endDate.seconds * 1000).toLocaleDateString()}
                  </InfoValue>
                </InfoRow>
              )}
              
              <InfoRow>
                <InfoLabel>혜택</InfoLabel>
                <InfoValue>{getSubscriptionBenefits(userRole)}</InfoValue>
              </InfoRow>
            </ProfileInfo>
            
            <ButtonContainer>
              <Button onClick={() => router.push('/subscription')}>
                구독 관리
              </Button>
            </ButtonContainer>
          </Card.Content>
        </ProfileCard>
        
        <ProfileCard>
          <Card.Content>
            <CardTitle>키워드 알람 설정</CardTitle>
            
            <ProfileInfo>
              {error && (
                <InfoRow>
                  <div style={{ color: 'red', marginBottom: '1rem' }}>
                    {error}
                  </div>
                </InfoRow>
              )}
              
              <InfoRow>
                <InfoLabel>키워드 추가</InfoLabel>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <KeywordInput
                    type="text"
                    value={newKeyword}
                    onChange={(e) => {
                      setError('');
                      setNewKeyword(e.target.value);
                    }}
                    placeholder="알림 받을 키워드 입력"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                  />
                  <Button
                    onClick={handleAddKeyword}
                    disabled={loading || !newKeyword.trim()}
                  >
                    {loading ? '처리 중...' : '추가'}
                  </Button>
                </div>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>등록된 키워드</InfoLabel>
                <KeywordList>
                  {subscribedKeywords.map((keyword) => (
                    <KeywordTag key={keyword}>
                      {keyword}
                      <DeleteButton
                        onClick={() => handleRemoveKeyword(keyword)}
                        disabled={loading}
                      >
                        ×
                      </DeleteButton>
                    </KeywordTag>
                  ))}
                  {subscribedKeywords.length === 0 && (
                    <InfoValue>등록된 키워드가 없습니다.</InfoValue>
                  )}
                </KeywordList>
              </InfoRow>
            </ProfileInfo>
          </Card.Content>
        </ProfileCard>
        
        {userProfile?.role === USER_ROLES.DEVELOPER && (
          <ProfileCard>
            <Card.Content>
              <CardTitle>개발자 도구</CardTitle>
              <ButtonContainer>
                <Button onClick={() => router.push('/admin/users')}>
                  사용자 관리
                </Button>
                <Button onClick={() => router.push('/admin/stats')}>
                  통계 대시보드
                </Button>
                <Button onClick={() => router.push('/admin/settings')}>
                  시스템 설정
                </Button>
              </ButtonContainer>
            </Card.Content>
          </ProfileCard>
        )}
      </Container>
    </ProtectedRoute>
  );
};

export default MyPage; 