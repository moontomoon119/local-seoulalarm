// src/lib/api.js
/**
 * 로컬 백엔드 API 클라이언트
 */

// 환경 변수 파일이 없는 경우를 대비해 하드코딩
const API_BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001')
  : 'http://localhost:3001';

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API 요청 실패');
      }
      
      return data;
    } catch (error) {
      console.error(`API 요청 오류 (${endpoint}):`, error);
      throw error;
    }
  }

  // GET 요청
  async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params);
    const url = searchParams.toString() ? `${endpoint}?${searchParams}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST 요청
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 최근 공지사항 조회
  async getRecentNotices(limit = 20) {
    return this.get('/api/notices/recent', { limit });
  }

  // 공지사항 검색
  async searchNotices(keyword, limit = 20) {
    return this.get('/api/notices/search', { q: keyword, limit });
  }

  // 날짜 범위로 공지사항 조회
  async getNoticesByDateRange(startDate, endDate) {
    return this.get('/api/notices/date-range', { start: startDate, end: endDate });
  }

  // 지역별 통계 조회
  async getDistrictStatistics() {
    return this.get('/api/statistics/districts');
  }

  // 수동 스크래핑 (특정 지역)
  async scrapeDistrict(district, fullScrape = false) {
    return this.post(`/api/scrape/${district}${fullScrape ? '?full=true' : ''}`);
  }

  // 전체 스크래핑
  async scrapeAll() {
    return this.post('/api/scrape/all');
  }

  // 서버 상태 확인
  async getHealthStatus() {
    return this.get('/api/health');
  }
}

// 싱글톤 인스턴스
const apiClient = new ApiClient();

export default apiClient;

// 편의 함수들 (destructuring 대신 직접 export)
export const getRecentNotices = (limit = 20) => apiClient.getRecentNotices(limit);
export const searchNotices = (keyword, limit = 20) => apiClient.searchNotices(keyword, limit);
export const getNoticesByDateRange = (startDate, endDate) => apiClient.getNoticesByDateRange(startDate, endDate);
export const getDistrictStatistics = () => apiClient.getDistrictStatistics();
export const scrapeDistrict = (district, fullScrape = false) => apiClient.scrapeDistrict(district, fullScrape);
export const scrapeAll = () => apiClient.scrapeAll();
export const getHealthStatus = () => apiClient.getHealthStatus();

// 데이터 변환 함수들
export const formatNoticeDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

export const formatNoticeDateTime = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

// 지역명 한글 변환
export const getDistrictKoreanName = (district) => {
  const districtNames = {
    'gangnam': '강남구',
    'gangdong': '강동구',
    'gangbuk': '강북구',
    'gangseo': '강서구',
    'gwanak': '관악구',
    'gwangjin': '광진구',
    'guro': '구로구',
    'geumcheon': '금천구',
    'nowon': '노원구',
    'dobong': '도봉구',
    'dongdaemun': '동대문구',
    'dongjak': '동작구',
    'mapo': '마포구',
    'seodaemun': '서대문구',
    'seocho': '서초구',
    'seongdong': '성동구',
    'seongbuk': '성북구',
    'songpa': '송파구',
    'yangcheon': '양천구',
    'yeongdeungpo': '영등포구',
    'yongsan': '용산구',
    'eunpyeong': '은평구',
    'jongno': '종로구',
    'junggu': '중구',
    'jungnang': '중랑구',
    'jeongbi': '정비'
  };
  
  return districtNames[district] || district;
};