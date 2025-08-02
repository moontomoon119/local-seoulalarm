//frontend/src/components/ClientNoticeSection.jsx
'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { hasPermission, getDataPeriodLimit, filterByDateLimit, getPlanName } from '@/lib/permissions';
import NoticeList from './NoticeList';
import SearchAndFilters from './SearchAndFilters';
import AdvancedSearchAndFilters from './AdvancedSearchAndFilters';
import LoadingIndicator from './LoadingIndicator';
import AdBanner from './AdBanner';
import StatisticsDashboard from './StatisticsDashboard';
import { Flex, Text, Card } from './style';
import styled from 'styled-components';

import StatusDisplay from './notice/StatusDisplay';
import useRealtimeNotices from './notice/useRealtimeNotices';

const ErrorContainer = styled.div`
  background-color: #4A0404;
  border: 1px solid #CF6679;
  color: #CF6679;
  padding: 0.75rem 1rem;
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const PlanLimitCard = styled(Card)`
  background: #1a1a1a;
  border: 1px solid #333;
  color: #d4d4d4;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PlanInfoContainer = styled.div`
  flex: 1;
`;

const UpgradeButton = styled.button`
  background: #333;
  border: 1px solid #444;
  color: #d4d4d4;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.7rem;
  margin-left: 1rem;
  white-space: nowrap;
  
  &:hover {
    background: #444;
    border-color: #555;
  }
`;

export default function ClientNoticeSection({ initialNotices, initialDistricts, initialError }) {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  
  // 고급 검색 상태 (스탠다드+ 전용)
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const {
    notices,
    districts: realTimeDistricts,
    loading,
    error,
    isRealTimeConnected,
    lastUpdated
  } = useRealtimeNotices({ initialNotices, initialDistricts, initialError });

  // 사용자 권한 정보
  const userRole = userProfile?.role || 'free_user';
  const planName = getPlanName(userRole);
  const dayLimit = getDataPeriodLimit(userRole);
  
  // 권한별 필터링된 공지사항
  const filteredNotices = useMemo(() => {
    let filtered = notices;
    
    // 1. 기간 제한 적용 (무료 사용자: 5일)
    if (dayLimit) {
      filtered = filterByDateLimit(filtered, dayLimit);
    }
    
    return filtered;
  }, [notices, dayLimit]);

  // 기간 제한 알림 표시 여부
  const showPlanLimit = dayLimit && notices.length > filteredNotices.length;

  return (
    <>
      <StatusDisplay 
        loading={loading}
        error={error}
        isRealTimeConnected={isRealTimeConnected}
        noticesCount={filteredNotices.length}
        districtsCount={realTimeDistricts.length}
        lastUpdated={lastUpdated}
      />

      {/* 플랜 제한 알림 */}
      {showPlanLimit && (
        <PlanLimitCard>
          <PlanInfoContainer>
            <Text bold size="xs" noMargin>
              {planName} 플랜: 최근 {dayLimit}일 공지만 표시됩니다
            </Text>
            <Text size="xs" noMargin style={{ opacity: 0.7, fontSize: '0.7rem', marginTop: '0.15rem' }}>
              전체 {notices.length}개 중 {filteredNotices.length}개 표시
            </Text>
          </PlanInfoContainer>
          <UpgradeButton onClick={() => window.location.href = '/subscription'}>
            플랜 업그레이드
          </UpgradeButton>
        </PlanLimitCard>
      )}

      {/* 프리미엄 통계 대시보드 */}
      {hasPermission(userRole, 'STATISTICS') && (
        <StatisticsDashboard notices={filteredNotices} districts={realTimeDistricts} />
      )}

      {/* 광고 (프리미엄 제외) */}
      {!hasPermission(userRole, 'NO_ADS') && (
        <AdBanner planName={planName} />
      )}

      {/* 검색 필터 */}
      {hasPermission(userRole, 'ADVANCED_SEARCH') ? (
        <AdvancedSearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          districts={realTimeDistricts}
          selectedDistrict={selectedDistrict}
          onDistrictChange={setSelectedDistrict}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      ) : (
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          districts={realTimeDistricts}
          selectedDistrict={selectedDistrict}
          onDistrictChange={setSelectedDistrict}
        />
      )}
      
      {loading && filteredNotices.length === 0 ? (
        <LoadingIndicator />
      ) : error && filteredNotices.length === 0 ? (
        <ErrorContainer>
          <Flex align="center">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '0.5rem' }}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <Text as="strong" bold style={{ fontSize: '0.875rem', marginRight: '0.5rem' }} noMargin>
              오류 발생!
            </Text>
            <Text size="xs" noMargin>{typeof error === 'string' ? error : error?.message || '알 수 없는 오류'}</Text>
          </Flex>
        </ErrorContainer>
      ) : (
        <NoticeList 
          notices={filteredNotices} 
          searchTerm={searchTerm}
          selectedDistrict={selectedDistrict}
          dateRange={hasPermission(userRole, 'ADVANCED_SEARCH') ? dateRange : null}
          selectedCategory={hasPermission(userRole, 'ADVANCED_SEARCH') ? selectedCategory : null}
        />
      )}
    </>
  );
}