'use client';

import React, { memo } from 'react';
import { Container, Text } from '@/components/style';
import styled from 'styled-components';

const MainContent = styled.main`
  padding: 1rem 0;
`;

const Footer = styled.footer`
  background-color: ${props => props.theme.colors.cardBg};
  border-top: 1px solid ${props => props.theme.colors.border};
  padding: 1rem 0;
  margin-top: 1.5rem;
  text-align: center;
`;

// 푸터 컴포넌트 분리 및 메모이제이션
const FooterComponent = memo(() => (
  <Footer>
    <Container>
      <Text size="xs" variant="secondary" noMargin>
        © 2025 서울시 자치구별 고시공고 정보
      </Text>
    </Container>
  </Footer>
));

FooterComponent.displayName = 'FooterComponent';

// PageLayout은 MainLayout에서 사용하는 것과 동일한 스타일 적용
const PageLayout = memo(({ children }) => {
  return (
    <>
      <MainContent>
        {children}
      </MainContent>
      
      <FooterComponent />
    </>
  );
});

PageLayout.displayName = 'PageLayout';

export default PageLayout; 