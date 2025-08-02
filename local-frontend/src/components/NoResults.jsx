'use client';

// src/components/NoResults.jsx
import styled from 'styled-components';
import { Card, Title, Text, Button } from './style';

const NoResultsCard = styled(Card)`
  padding: 2rem;
  text-align: center;
  margin: 2rem 0;
`;

const NoResultsIcon = styled.svg`
  width: 4rem;
  height: 4rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 auto;
`;

const NoResultsTitle = styled(Title)`
  margin-top: 1rem;
`;

const NoResultsText = styled(Text)`
  margin-top: 0.5rem;
`;

export default function NoResults() {
  return (
    <NoResultsCard>
      <NoResultsIcon fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      </NoResultsIcon>
      <NoResultsTitle>검색 결과가 없습니다</NoResultsTitle>
      <NoResultsText variant="secondary">다른 검색어를 입력하거나 필터를 변경해보세요.</NoResultsText>
      <Button variant="primary" style={{ marginTop: '1rem' }}>
        모든 공지사항 보기
      </Button>
    </NoResultsCard>
  );
}