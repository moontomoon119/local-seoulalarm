'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingIndicator from './LoadingIndicator';

export default function ProtectedRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 인증 상태 확인이 완료되었고 사용자가 인증되지 않은 경우
    if (!loading && !isAuthenticated) {
      router.replace('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [isAuthenticated, loading, router]);

  // 로딩 중인 경우 로딩 표시
  if (loading) {
    return <LoadingIndicator />;
  }

  // 인증된 경우에만 자식 컴포넌트 렌더링
  return isAuthenticated ? children : null;
} 