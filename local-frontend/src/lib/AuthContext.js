//frontend/src/lib/AuthContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { auth, getUserProfile } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

// 로컬 스토리지 키
const AUTH_USER_KEY = 'auth_user';
const AUTH_TIMESTAMP_KEY = 'auth_timestamp';
const USER_PROFILE_KEY = 'user_profile';

// 로컬 스토리지에서 사용자 정보 가져오기
const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    const timestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY);
    
    // 캐시가 1시간 이상 지났으면 무효화
    if (timestamp && Date.now() - parseInt(timestamp, 10) > 3600000) {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TIMESTAMP_KEY);
      localStorage.removeItem(USER_PROFILE_KEY);
      return null;
    }
    
    return storedUser ? JSON.parse(storedUser) : null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {  // 또는 catch (_error)
    return null;
  }
};

// 로컬 스토리지에서 사용자 프로필 정보 가져오기
const getStoredProfile = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedProfile = localStorage.getItem(USER_PROFILE_KEY);
    return storedProfile ? JSON.parse(storedProfile) : null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
};

export function AuthProvider({ children }) {
  // 초기 상태를 로컬 스토리지에서 가져옴
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 로컬 스토리지 확인
  useEffect(() => {
    const storedUser = getStoredUser();
    const storedProfile = getStoredProfile();
    
    if (storedUser) {
      setUser(storedUser);
      setUserProfile(storedProfile);
      setLoading(false);
    }
  }, []);

  // Firestore에서 사용자 프로필 정보 가져오기
// AuthContext.js - 안전한 fetchUserProfile 함수
const fetchUserProfile = async (uid) => {
  if (!uid) return null;
  
  try {
    const profileResult = await getUserProfile(uid);
    if (profileResult.success && profileResult.data) {
      setUserProfile(profileResult.data);
      
      // 안전한 로컬 스토리지 저장
      try {
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profileResult.data));
      } catch (storageError) {
        console.warn('프로필 저장 실패:', storageError);
      }
      
      return profileResult.data;
    }
    return null;
  } catch (error) {
    console.error('프로필 정보 가져오기 오류:', error);
    return null;
  }
};

// 안전한 refreshUserProfile
const refreshUserProfile = async () => {
  if (!user?.uid) return null;
  
  try {
    // 로컬 스토리지 안전 클리어
    localStorage.removeItem(USER_PROFILE_KEY);
    
    return await fetchUserProfile(user.uid);
  } catch (error) {
    console.error('프로필 새로고침 오류:', error);
    return null;
  }
};


  // 인증 상태 변경 감지 (로컬 환경에서는 비활성화)
  useEffect(() => {
    // 로컬 환경이거나 auth가 null인 경우 Firebase 인증 건너뛰기
    if (!auth) {
      console.log('🔧 로컬 환경: Firebase 인증이 비활성화되었습니다.');
      setLoading(false);
      return () => {}; // 빈 cleanup 함수 반환
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 사용자 로그인 상태
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          metadata: {
            creationTime: user.metadata?.creationTime,
            lastSignInTime: user.metadata?.lastSignInTime
          }
        };
        
        // 로컬 스토리지에 저장
        try {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
          localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
        } catch (error) {
          console.error('로컬 스토리지 저장 오류:', error);
        }
        
        setUser(userData);
        
        // Firestore에서 추가 사용자 정보 가져오기
        await fetchUserProfile(user.uid);
      } else {
        // 사용자 로그아웃 상태
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_TIMESTAMP_KEY);
        localStorage.removeItem(USER_PROFILE_KEY);
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 컨텍스트 값
  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    refreshUserProfile: user ? refreshUserProfile : null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다');
  }
  return context;
}

export default AuthContext; 