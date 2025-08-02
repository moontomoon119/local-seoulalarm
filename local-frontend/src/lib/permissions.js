// src/lib/permissions.js
import { USER_ROLES } from './firebase';

// 권한별 기능 매핑
export const PERMISSIONS = {
  // 데이터 접근
  ACCESS_ALL_PERIODS: [USER_ROLES.SUBSCRIBER_C, USER_ROLES.SUBSCRIBER_B, USER_ROLES.SUBSCRIBER_A, USER_ROLES.MANAGER, USER_ROLES.DEVELOPER],
  ACCESS_RECENT_ONLY: [USER_ROLES.FREE],
  
  // 고급 기능
  ADVANCED_SEARCH: [USER_ROLES.SUBSCRIBER_B, USER_ROLES.SUBSCRIBER_A, USER_ROLES.MANAGER, USER_ROLES.DEVELOPER],
  CUSTOM_ALERTS: [USER_ROLES.SUBSCRIBER_B, USER_ROLES.SUBSCRIBER_A, USER_ROLES.MANAGER, USER_ROLES.DEVELOPER],
  
  // 프리미엄 기능
  NO_ADS: [USER_ROLES.SUBSCRIBER_A, USER_ROLES.MANAGER, USER_ROLES.DEVELOPER],
  STATISTICS: [USER_ROLES.SUBSCRIBER_A, USER_ROLES.MANAGER, USER_ROLES.DEVELOPER],
  
  // 관리자 기능
  ADMIN_TOOLS: [USER_ROLES.MANAGER, USER_ROLES.DEVELOPER]
};

// 권한 확인 함수
export const hasPermission = (userRole, permission) => {
  if (!userRole || !PERMISSIONS[permission]) return false;
  return PERMISSIONS[permission].includes(userRole);
};

// 데이터 기간 제한 확인
export const getDataPeriodLimit = (userRole) => {
  if (hasPermission(userRole, 'ACCESS_ALL_PERIODS')) {
    return null; // 제한 없음
  }
  return 5; // 5일
};

// 최근 N일 데이터 필터링
export const filterByDateLimit = (notices, dayLimit) => {
  if (!dayLimit) return notices;
  
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - dayLimit);
  
  return notices.filter(notice => {
    const publishDate = new Date(notice.publishDate);
    return publishDate >= limitDate;
  });
};

// 권한별 플랜 이름 가져오기
export const getPlanName = (userRole) => {
  switch (userRole) {
    case USER_ROLES.DEVELOPER: return '개발자';
    case USER_ROLES.MANAGER: return '관리자';
    case USER_ROLES.SUBSCRIBER_A: return '프리미엄';
    case USER_ROLES.SUBSCRIBER_B: return '스탠다드';
    case USER_ROLES.SUBSCRIBER_C: return '베이직';
    case USER_ROLES.FREE:
    default: return '무료';
  }
};