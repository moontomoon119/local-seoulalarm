'use client';

import React from 'react';
import { Container } from './style';

// 공지사항 페이지 클라이언트 컴포넌트
export default function NoticePageClient({ children }) {
  return (
    <Container>
      {children}
    </Container>
  );
} 