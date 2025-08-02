import { useState, useEffect, useCallback } from 'react';
import { getRecentNotices } from '@/lib/api';

export default function useRealtimeNotices({ initialNotices, initialDistricts, initialError }) {
  const [notices, setNotices] = useState(initialNotices || []);
  const [districts, setDistricts] = useState(initialDistricts || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // 수동으로 데이터 새로고침하는 함수
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getRecentNotices(100);
      const noticeData = response.data || [];
      const newDistricts = [...new Set(noticeData.map(notice => notice.district))].sort();
      
      setNotices(noticeData);
      setDistricts(newDistricts);
      setLastUpdated(new Date());
      setIsRealTimeConnected(true);
      
      console.log('데이터 새로고침 완료:', noticeData.length, '개 공지사항');
    } catch (err) {
      console.error('데이터 새로고침 오류:', err);
      setError(`데이터 새로고침 오류: ${err.message}`);
      setIsRealTimeConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 페이지 새로고침 여부를 확인
    const isPageRefresh = window.performance?.navigation?.type === 1;
    
    if (!isPageRefresh && initialNotices?.length > 0) {
      // 새로고침이 아니고 초기 데이터가 있으면 폴링을 설정하지 않음
      setNotices(initialNotices);
      setDistricts(initialDistricts || []);
      setIsRealTimeConnected(false);
      return;
    }

    // 초기 데이터 로드 (서버 사이드 렌더링에서 실패한 경우)
    if (!initialNotices?.length && !initialError) {
      refreshData();
    }

    // 폴링 설정 (5분마다 업데이트 확인)
    const pollInterval = setInterval(async () => {
      try {
        const response = await getRecentNotices(100);
        const noticeData = response.data || [];
        
        // 새로운 데이터가 있는지 확인 (간단한 비교)
        if (noticeData.length !== notices.length || 
            (noticeData[0]?.id !== notices[0]?.id)) {
          console.log('새로운 데이터 감지됨, 업데이트 중...');
          
          const newDistricts = [...new Set(noticeData.map(notice => notice.district))].sort();
          setNotices(noticeData);
          setDistricts(newDistricts);
          setLastUpdated(new Date());
        }
        
        setIsRealTimeConnected(true);
        setError(null);
      } catch (err) {
        console.error('폴링 업데이트 오류:', err);
        setIsRealTimeConnected(false);
        // 폴링 오류는 사용자에게 표시하지 않음 (너무 자주 발생할 수 있음)
      }
    }, 5 * 60 * 1000); // 5분마다 실행

    return () => {
      clearInterval(pollInterval);
    };
  }, [initialNotices, initialDistricts, initialError, notices.length, notices, refreshData]);

  return { 
    notices, 
    districts, 
    loading, 
    error, 
    isRealTimeConnected, 
    lastUpdated,
    refreshData // 수동 새로고침 함수 제공
  };
} 