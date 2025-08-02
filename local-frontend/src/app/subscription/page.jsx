'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Card, Button } from '@/components/ui';
import { Container } from '@/components/style';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { USER_ROLES, updateUserSubscription, getUserProfile } from '@/lib/firebase';

const Title = styled.h1`
  margin: 0;
  margin-bottom: ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.fontSizes.xl};
  color: ${props => props.theme.colors.textPrimary};
`;

const Subtitle = styled.h2`
  font-size: ${props => props.theme.fontSizes.lg};
  margin: ${props => props.theme.spacing.md} 0;
  color: ${props => props.theme.colors.textPrimary};
`;

const PlanGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin: ${props => props.theme.spacing.lg} 0;
`;

const CurrentSubscriptionCard = styled(Card)`
  margin-bottom: ${props => props.theme.spacing.lg};
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
`;

const PlanHeader = styled.div`
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.$primary ? props.theme.colors.primary : 'transparent'};
  border-top-left-radius: ${props => props.theme.borderRadius.md};
  border-top-right-radius: ${props => props.theme.borderRadius.md};
`;

const PlanTitle = styled.h3`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.lg};
  color: ${props => props.$primary ? 'white' : props.theme.colors.textPrimary};
`;

const PlanPrice = styled.div`
  display: flex;
  align-items: baseline;
  margin-top: ${props => props.theme.spacing.sm};
`;

const Price = styled.span`
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: 700;
  color: ${props => props.$primary ? 'white' : props.theme.colors.textPrimary};
`;

const PricePeriod = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.$primary ? 'rgba(255, 255, 255, 0.8)' : props.theme.colors.textSecondary};
  margin-left: ${props => props.theme.spacing.xs};
`;

const PlanCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
  background-color: ${props => props.theme.colors.background};
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    background-color: ${props => props.theme.colors.primary};
    color: white;
    
    ${PlanTitle}, ${Price}, ${PricePeriod} {
      color: white;
    }
  }

  ${props => props.$isPopular && `
    border: 2px solid ${props.theme.colors.primary};
    position: relative;
    
    &::before {
      content: '인기';
      position: absolute;
      top: -10px;
      right: 20px;
      background: ${props.theme.colors.primary};
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
  `}
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${props => props.theme.spacing.md} 0;
`;

const Feature = styled.li`
  padding: ${props => props.theme.spacing.xs} 0;
  display: flex;
  align-items: center;
  
  &:before {
    content: '✓';
    margin-right: ${props => props.theme.spacing.sm};
    color: ${props => props.theme.colors.success};
    font-weight: bold;
  }
`;

const NotAvailable = styled(Feature)`
  color: ${props => props.theme.colors.textSecondary};
  
  &:before {
    content: '✗';
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const SubscriptionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.success};
  color: white;
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.fontSizes.xs};
  margin-left: ${props => props.theme.spacing.sm};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: ${props => props.theme.fontSizes.lg};
`;

const CardContent = styled(Card.Content)`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ButtonWrapper = styled.div`
  margin-top: auto;
  padding-top: ${props => props.theme.spacing.md};
`;

const SuccessAlert = styled(Card)`
  background-color: #4cd137;
  color: white;
  margin-bottom: ${props => props.theme.spacing.lg};
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ErrorAlert = styled(Card)`
  background-color: #e74c3c;
  color: white;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SubscriptionInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  
  strong {
    margin-bottom: ${props => props.theme.spacing.xs};
    color: ${props => props.theme.colors.textPrimary};
  }
  
  span {
    color: ${props => props.theme.colors.textSecondary};
    font-size: ${props => props.theme.fontSizes.sm};
  }
`;

const AdminRequestCard = styled(Card)`
  margin-top: ${props => props.theme.spacing.lg};
  border: 1px dashed ${props => props.theme.colors.border};
`;

const SubscriptionPage = () => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userStatus, setUserStatus] = useState(null);
  const router = useRouter();
  
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // userProfile이 있으면 그것을 사용, 없으면 직접 가져오기
        if (userProfile) {
          setUserStatus(userProfile);
        } else {
          const result = await getUserProfile(user.uid);
          if (result.success) {
            setUserStatus(result.data);
          } else {
            setError('사용자 정보를 불러올 수 없습니다.');
          }
        }
      } catch (err) {
        console.error('사용자 데이터 로드 오류:', err);
        setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [user, userProfile]);
  
  // 구독 업그레이드 처리
// SubscriptionPage.js - 수정된 handleUpgradeSubscription 함수
const handleUpgradeSubscription = async (plan, role) => {
  if (!user) {
    setError('로그인이 필요합니다.');
    return;
  }
  
  // 이미 업그레이드 중이면 중단
  if (upgrading) {
    return;
  }
  
  setUpgrading(true);
  setError('');
  
  try {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    
    let planName;
    switch (role) {
      case USER_ROLES.DEVELOPER:
        planName = '개발자';
        break;
      case USER_ROLES.MANAGER:
        planName = '관리자';
        break;
      case USER_ROLES.SUBSCRIBER_A:
        planName = '프리미엄';
        break;
      case USER_ROLES.SUBSCRIBER_B:
        planName = '스탠다드';
        break;
      case USER_ROLES.SUBSCRIBER_C:
        planName = '베이직';
        break;
      case USER_ROLES.FREE:
      default:
        planName = '무료';
    }
    
    const subscriptionData = {
      plan: planName,
      role,
      startDate: now,
      endDate,
      status: 'active'
    };
    
    // DB 업데이트
    const result = await updateUserSubscription(user.uid, subscriptionData, role);
    
    if (result.success) {
      // 로컬 스토리지 클리어
      try {
        localStorage.removeItem('user_profile');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_timestamp');
      } catch (storageError) {
        console.warn('로컬 스토리지 클리어 실패:', storageError);
      }
      
      // 새로운 사용자 정보 가져오기
      const updatedResult = await getUserProfile(user.uid);
      if (updatedResult.success) {
        setUserStatus(updatedResult.data);
        
        // AuthContext도 업데이트
        if (refreshUserProfile) {
          setTimeout(() => {
            refreshUserProfile().catch(err => 
              console.warn('AuthContext 새로고침 실패:', err)
            );
          }, 100);
        }
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } else {
      setError(result.error || '구독 업그레이드에 실패했습니다.');
    }
  } catch (error) {
    console.error('구독 업그레이드 오류:', error);
    setError('구독 업그레이드 중 오류가 발생했습니다.');
  } finally {
    setUpgrading(false);
  }
};

// 현재 사용자 구독 등급 - 안전한 접근
const userRole = userStatus?.role || USER_ROLES.FREE;
const currentSubscription = userStatus?.subscription || {};

// 안전한 플랜 정보 가져오기
const getCurrentPlanInfo = () => {
  if (!userStatus) return '무료';
  
  const role = userStatus.role || USER_ROLES.FREE;
  const plan = subscriptionPlans.find(p => p && p.role === role);
  
  return plan?.title || currentSubscription?.plan || '무료';
};

  // 구독 플랜 정보
  const subscriptionPlans = [
    {
      id: 'free',
      title: '무료',
      role: USER_ROLES.FREE,
      price: '0',
      features: [
        '기본 자치구 공시 정보 열람',
        '최근 3일 공시 정보만 조회 가능',
        '광고 포함'
      ],
      notAvailable: [
        '모든 자치구 공시 정보 열람',
        '맞춤 알림 서비스',
        '광고 제거'
      ]
    },
    {
      id: 'basic',
      title: '베이직',
      role: USER_ROLES.SUBSCRIBER_C,
      price: '0', //일단 무료로 설정
      features: [
        '모든 자치구 공시 정보 열람',
        '모든 기간 자료 조회 가능',
        '광고 포함'
      ],
      notAvailable: [
        '맞춤 알림 서비스',
        '광고 제거'
      ]
    },
    {
      id: 'standard',
      title: '스탠다드',
      role: USER_ROLES.SUBSCRIBER_B,
      price: '0', //일단 무료로 설정
      isPopular: true,
      features: [
        '모든 자치구 공시 정보 열람',
        '맞춤 알림 서비스',
        '모든 기간 자료 조회 가능',
        '관심 자치구 설정(5개)',
        '광고 포함'
      ],
      notAvailable: [
        '광고 제거'
      ]
    },
    {
      id: 'premium',
      title: '프리미엄',
      role: USER_ROLES.SUBSCRIBER_A,
      price: '0', //일단 무료로 설정
      features: [
        '모든 자치구 공시 정보 열람',
        '맞춤 알림 서비스',
        '모든 기간 자료 조회 가능',
        '관심 자치구 설정(무제한)',
        '광고 제거',
        '자치구 통계 데이터 제공'
      ],
      notAvailable: []
    }
  ];

  // 날짜 포맷팅 함수
  const formatDate = (date) => {
    if (!date) return '-';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Container>
          <LoadingSpinner>사용자 정보를 불러오는 중...</LoadingSpinner>
        </Container>
      </ProtectedRoute>
    );
  }
  
  return (
    <ProtectedRoute>
      <Container>
        <Title>구독 관리</Title>
        
        {success && (
          <SuccessAlert>
            <Card.Content>
              ✅ 구독이 성공적으로 업그레이드되었습니다!
            </Card.Content>
          </SuccessAlert>
        )}

        {error && (
          <ErrorAlert>
            <Card.Content>
              ❌ {error}
            </Card.Content>
          </ErrorAlert>
        )}
        
        <CurrentSubscriptionCard>
          <Card.Content>
            <Subtitle style={{ margin: 0, marginBottom: '15px' }}>내 구독 정보</Subtitle>
            <SubscriptionInfo>
              <InfoItem>
                <strong>현재 플랜</strong>
                <span>{getCurrentPlanInfo()}</span>
            </InfoItem>
              <InfoItem>
                <strong>구독 상태</strong>
                <span>{currentSubscription?.status === 'active' ? '활성' : '비활성'}</span>
              </InfoItem>
              <InfoItem>
                <strong>시작일</strong>
                <span>{formatDate(currentSubscription?.startDate)}</span>
              </InfoItem>
              <InfoItem>
                <strong>만료일</strong>
                <span>{formatDate(currentSubscription?.endDate)}</span>
              </InfoItem>
            </SubscriptionInfo>
          </Card.Content>
        </CurrentSubscriptionCard>
        
        <Subtitle>구독 플랜 선택</Subtitle>
        
        <PlanGrid>
          {subscriptionPlans.map((plan) => {
            const isCurrentPlan = plan.role === userRole;
            const canUpgrade = !isCurrentPlan && !upgrading;
            
            return (
              <PlanCard key={plan.id} $isPopular={plan.isPopular}>
                <PlanHeader>
                  <PlanTitle>
                    {plan.title}
                    {isCurrentPlan && <SubscriptionBadge>현재 구독 중</SubscriptionBadge>}
                  </PlanTitle>
                  <PlanPrice>
                    <Price>{plan.price.toLocaleString()}</Price>
                    <PricePeriod>원/월</PricePeriod>
                  </PlanPrice>
                </PlanHeader>
                
                <CardContent>
                  <FeatureList>
                    {plan.features.map((feature, index) => (
                      <Feature key={index}>{feature}</Feature>
                    ))}
                    
                    {plan.notAvailable.map((feature, index) => (
                      <NotAvailable key={`na-${index}`}>{feature}</NotAvailable>
                    ))}
                  </FeatureList>
                  
                  <ButtonWrapper>
                    <Button
                      fullWidth
                      variant={isCurrentPlan ? 'secondary' : plan.isPopular ? 'primary' : 'outline'}
                      disabled={!canUpgrade}
                      onClick={() => handleUpgradeSubscription(plan.title, plan.role)}
                    >
                      {isCurrentPlan 
                        ? '현재 구독 중' 
                        : upgrading 
                          ? '처리 중...' 
                          : '구독하기'
                      }
                    </Button>
                  </ButtonWrapper>
                </CardContent>
              </PlanCard>
            );
          })}
        </PlanGrid>
        
        {userRole !== USER_ROLES.DEVELOPER && userRole !== USER_ROLES.MANAGER && (
          <AdminRequestCard>
            <Card.Content>
              <h3>🔐 고급 권한이 필요하신가요?</h3>
              <p>개발자나 관리자 권한은 시스템 관리자의 승인이 필요합니다.</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = 'mailto:admin@example.com?subject=개발자/관리자 권한 요청&body=안녕하세요. 고급 권한을 요청드립니다.%0A%0A사용자 ID: ' + (user?.uid || '')}
              >
                📧 권한 요청하기
              </Button>
            </Card.Content>
          </AdminRequestCard>
        )}
        
        {/* 개발자/관리자용 추가 정보 */}
        {(userRole === USER_ROLES.DEVELOPER || userRole === USER_ROLES.MANAGER) && (
          <Card style={{marginTop: '20px', border: '2px solid #3498db'}}>
            <Card.Content>
              <h3>🛠️ 개발자/관리자 정보</h3>
              <p>현재 {userRole === USER_ROLES.DEVELOPER ? '개발자' : '관리자'} 권한으로 로그인되어 있습니다.</p>
              <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
                <li>모든 기능에 대한 전체 액세스 권한</li>
                <li>시스템 관리 도구 사용 가능</li>
                <li>사용자 관리 기능 이용 가능</li>
                <li>데이터 분석 및 통계 기능</li>
              </ul>
            </Card.Content>
          </Card>
        )}
        
      </Container>
    </ProtectedRoute>
  );
};

export default SubscriptionPage;