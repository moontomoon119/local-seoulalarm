'use client';

// src/components/NoticeList.jsx - 수정된 버전
import { useState, useMemo } from 'react';
import styled from 'styled-components';
import NoticeCard from './NoticeCard';
import NoResults from './NoResults';
import { Text, Grid } from './style';

const ListContainer = styled.div`
  margin-top: 1rem;
`;

const ResultCount = styled(Text)`
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
`;

const NoticeGrid = styled(Grid)`
  grid-template-columns: 1fr;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const NoticeItem = styled.div`
  height: 100%;
`;

export default function NoticeList({ 
  notices, 
  searchTerm, 
  selectedDistrict, 
  dateRange = null, 
  selectedCategory = null 
}) {
  // 필터링된 공지사항
  const filteredNotices = useMemo(() => {
    if (!notices) return [];
    
    return notices.filter(notice => {
      // 자치구 필터링
      if (selectedDistrict && notice.district !== selectedDistrict) {
        return false;
      }
      
      // 검색어 필터링
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          notice.title?.toLowerCase().includes(searchLower) ||
          notice.content?.toLowerCase().includes(searchLower) ||
          notice.district?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // 날짜 범위 필터 (고급 검색)
      if (dateRange?.start && dateRange?.end) {
        const publishDate = new Date(notice.publishDate);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        
        if (publishDate < startDate || publishDate > endDate) {
          return false;
        }
      }
      
      // 카테고리 필터 (고급 검색)
      if (selectedCategory) {
        const matchesCategory = 
          notice.title?.includes(selectedCategory) ||
          notice.category === selectedCategory;
        
        if (!matchesCategory) return false;
      }
      
      return true;
    });
  }, [notices, searchTerm, selectedDistrict, dateRange, selectedCategory]);

  if (filteredNotices.length === 0) {
    return <NoResults />;
  }

  return (
    <ListContainer>
      <ResultCount size="xs">검색 결과: {filteredNotices.length}개</ResultCount>
      <NoticeGrid gap="0.75rem">
        {filteredNotices.map(notice => (
          <NoticeItem key={notice.id}>
            <NoticeCard notice={notice} />
          </NoticeItem>
        ))}
      </NoticeGrid>
    </ListContainer>
  );
}