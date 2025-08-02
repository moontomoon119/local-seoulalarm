'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// 페이지 전환 관련 이벤트 리스너 추가
export function useRouteLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // 페이지 전환 시작
    const handleRouteChangeStart = () => {
      setIsLoading(true);
    };

    // // 페이지 전환 완료
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleRouteChangeComplete = () => {
      setIsLoading(false);
    };

    // // 페이지 전환 오류
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleRouteChangeError = () => {
      setIsLoading(false);
    };


    // 돔 이벤트 리스너 (Next.js 이벤트 대안)
    window.addEventListener('beforeunload', handleRouteChangeStart);
    
    // 패스가 변경될 때 로딩 상태 업데이트
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => {
      window.removeEventListener('beforeunload', handleRouteChangeStart);
      clearTimeout(timer);
    };
  }, [pathname]);

  return isLoading;
}

// 초기 데이터를 미리 로드하는 함수
export function preloadData(key, fetchFunction) {
  let cache = {};
  
  // 이미 캐시에 있으면 반환
  if (cache[key]) {
    return Promise.resolve(cache[key]);
  }
  
  // 없으면 fetch하고 저장
  return fetchFunction()
    .then(data => {
      cache[key] = data;
      return data;
    })
    .catch(error => {
      console.error('프리로드 실패:', error);
      throw error;
    });
}

// 페이지 전환 시 초기 데이터를 미리 로드
export function usePagePreloader(pageData = {}) {
  useEffect(() => {
    // 페이지별 데이터 프리로딩
    Object.entries(pageData).forEach(([key, fetchFn]) => {
      preloadData(key, fetchFn);
    });
  }, [pageData]);
} 