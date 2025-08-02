'use client';

import { useState } from 'react';
import { Container } from '@/components/style';
import { Card, Button } from '@/components/ui';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SettingsPage() {
  // TODO: 각 설정 섹션에 대한 상태 및 처리 로직 구현
  const [isLoading, setIsLoading] = useState(false);
  
  // TODO: 설정 저장 처리 함수 구현
  const handleSaveSettings = () => {
    setIsLoading(true);
    // 설정 저장 로직
    setTimeout(() => {
      setIsLoading(false);
      // TODO: 성공 메시지 표시
    }, 1000);
  };
  
  return (
    <ProtectedRoute>
      <Container>
        <h1>설정</h1>
        
        {/* 알림 설정 섹션 */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Card.Content>
            <h2>알림 설정</h2>
            <div style={{ padding: '1rem 0' }}>
              {/* TODO: 구독한 자치구별 알림 설정 컴포넌트 구현 */}
              <p>이 섹션은 개발 중입니다.</p>
            </div>
          </Card.Content>
        </Card>
        
        {/* 테마 설정 섹션 */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Card.Content>
            <h2>테마 설정</h2>
            <div style={{ padding: '1rem 0' }}>
              {/* TODO: 다크모드 / 라이트모드 토글 구현 */}
              <p>이 섹션은 개발 중입니다.</p>
            </div>
          </Card.Content>
        </Card>
        
        {/* 개인정보 설정 섹션 */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Card.Content>
            <h2>개인정보 설정</h2>
            <div style={{ padding: '1rem 0' }}>
              {/* TODO: 비밀번호 변경, 계정 삭제 등 기능 구현 */}
              <p>이 섹션은 개발 중입니다.</p>
            </div>
          </Card.Content>
        </Card>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            {isLoading ? '저장 중...' : '설정 저장'}
          </Button>
        </div>
      </Container>
    </ProtectedRoute>
  );
}

/**
 * ## 개발 TODO 리스트
 * 
 * 1. 알림 설정 기능
 *    - 구독한 자치구별 알림 On/Off 토글 UI
 *    - 알림 주기 설정 (실시간, 일간, 주간)
 *    - 알림 방식 선택 (이메일, 푸시 알림)
 *    - Firebase Cloud Messaging 연동 준비
 * 
 * 2. 테마 설정
 *    - 다크모드/라이트모드 토글 구현
 *    - 선택한 테마 로컬 스토리지 저장
 *    - 시스템 설정 연동 옵션
 * 
 * 3. 개인정보 설정
 *    - 비밀번호 변경 기능
 *    - 계정 연결 관리 (소셜 계정 연결/해제)
 *    - 계정 삭제 기능 (확인 모달 포함)
 *    - 개인정보 다운로드 기능
 * 
 * 4. 설정 저장 매커니즘
 *    - 각 설정을 Firestore에 저장
 *    - 변경 이력 추적
 *    - 설정 변경 시 실시간 적용
 * 
 * 5. UI/UX 개선
 *    - 모바일 최적화
 *    - 토글, 스위치 등 인터랙티브 컴포넌트 구현
 *    - 설정 변경 시 성공/실패 피드백
 * 
 * 6. 보안
 *    - 민감한 작업(비밀번호 변경, 계정 삭제)에 재인증 요구
 *    - 브라우저 세션 관리
 */
