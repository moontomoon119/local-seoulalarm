'use client';

// src/components/NoticeCard.jsx
import { formatDate } from '@/lib/dateUtils';
import { Card, Text, Badge, Flex } from './style';
import styled from 'styled-components';

const StyledCard = styled(Card)`
  padding: 0.75rem;
  height: 100%;
`;

const CardTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.base};
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const DistrictBadge = styled(Badge)`
  margin-left: 0.5rem;
  flex-shrink: 0;
`;

const DateText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.xs};
  margin-bottom: 0;
`;

const DetailLink = styled.a`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.primary};
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  transition: ${props => props.theme.transitions.fast};
  
  &:hover {
    color: ${props => props.theme.colors.primaryDark};
  }
  
  svg {
    width: 0.75rem;
    height: 0.75rem;
    margin-left: 0.25rem;
  }
`;

export default function NoticeCard({ notice }) {
  return (
    <StyledCard hover>
      <Flex justify="space-between" align="flex-start">
        <CardTitle>{notice.title}</CardTitle>
        <DistrictBadge>{notice.district}</DistrictBadge>
      </Flex>
      
      <Flex justify="space-between" align="center" style={{ marginTop: '0.5rem' }}>
        <DateText variant="secondary">{formatDate(notice.publishDate)}</DateText>
        
        <DetailLink 
          href={notice.url} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          자세히
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </DetailLink>
      </Flex>
    </StyledCard>
  );
}