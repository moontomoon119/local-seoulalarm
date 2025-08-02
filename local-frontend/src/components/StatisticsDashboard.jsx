'use client';

import styled from 'styled-components';
import { Card, Flex, Text } from './style';

const StatsCard = styled(Card)`
  background: #1a1a1a;
  border: 1px solid #333;
  color: #d4d4d4;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  overflow: hidden;
  width: 100%;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 0.35rem;
  flex: 1;
  min-width: 80px;
  
  @media (max-width: 480px) {
    min-width: 60px;
    padding: 0.25rem;
  }
  
  &:not(:last-child) {
    border-right: 1px solid #333;
  }
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 0.15rem;
  color: #fff;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: #888;
  
  @media (max-width: 480px) {
    font-size: 0.6rem;
  }
`;

const TopDistrictInfo = styled.div`
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  font-size: 0.7rem;
  text-align: center;
  color: #888;
  border-top: 1px solid #333;
`;

const DashboardTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  color: #d4d4d4;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

export default function StatisticsDashboard({ notices, districts }) {
  const today = new Date().toDateString();
  const todayNotices = notices.filter(n => 
    new Date(n.publishDate).toDateString() === today
  );
  
  const districtStats = districts.map(district => ({
    name: district,
    count: notices.filter(n => n.district === district).length
  })).sort((a, b) => b.count - a.count);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyNotices = notices.filter(n => 
    new Date(n.publishDate) >= weekAgo
  );

  return (
    <StatsCard>
      <DashboardTitle>
        <span>통계 대시보드</span>
        <span style={{ color: '#666', fontSize: '0.7rem' }}>프리미엄(고도화 예정)</span>
      </DashboardTitle>
      
      <Flex justify="space-between" wrap>
        <StatItem>
          <StatValue>{notices.length}</StatValue>
          <StatLabel>총 공지</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{todayNotices.length}</StatValue>
          <StatLabel>오늘 공지</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{weeklyNotices.length}</StatValue>
          <StatLabel>최근 7일</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{districts.length}</StatValue>
          <StatLabel>활성 자치구</StatLabel>
        </StatItem>
      </Flex>
      
      {districtStats.length > 0 && (
        <TopDistrictInfo>
          가장 많은 공지: {districtStats[0].name} ({districtStats[0].count}개)
        </TopDistrictInfo>
      )}
    </StatsCard>
  );
}