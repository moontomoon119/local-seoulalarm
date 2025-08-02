// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';

// 로컬 환경에서는 Firebase 기능 비활성화
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'dummy-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'dummy-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'dummy-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:dummy-app-id',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-DUMMY-ID'
};

// 로컬 환경 감지
const isLocalEnvironment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Firebase 초기화
let app;
let auth;
let db;
let messaging;
let googleProvider;

try {
  // 로컬 환경에서는 Firebase 초기화를 건너뛰기
  if (!isLocalEnvironment) {
    // Firebase 앱이 이미 초기화되었는지 확인
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // messaging은 브라우저 환경에서만 초기화
    if (typeof window !== 'undefined') {
      messaging = getMessaging(app);
      // Google 로그인 프로바이더 초기화
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
    }
  } else {
    console.log('🔧 로컬 환경: Firebase 기능이 비활성화되었습니다.');
  }
} catch (error) {
  console.error('Firebase 초기화 오류 (로컬 환경에서는 무시됨):', error);
}

// 인증 상태 변경 리스너 (로컬 환경에서는 비활성화)
if (auth && !isLocalEnvironment) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('사용자가 로그인했습니다:', user.uid);
    } else {
      console.log('사용자가 로그아웃했습니다.');
    }
  });
} else if (isLocalEnvironment) {
  console.log('🔧 로컬 환경: Firebase 인증이 비활성화되었습니다.');
}

// 사용자 구독 등급 정의
export const USER_ROLES = {
  FREE: 'free_user',       // 무료 이용자
  SUBSCRIBER_A: 'subscriber_a',  // 구독 A 등급
  SUBSCRIBER_B: 'subscriber_b',  // 구독 B 등급
  SUBSCRIBER_C: 'subscriber_c',  // 구독 C 등급
  MANAGER: 'manager',      // 매니저
  DEVELOPER: 'developer',  // 개발자
};

// Firestore에 사용자 정보 저장
const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  // 사용자가 존재하지 않는 경우에만 생성
  if (!snapshot.exists()) {
    const { email, displayName, photoURL } = user;
    const createdAt = new Date();

    try {
      await setDoc(userRef, {
        uid: user.uid,
        email,
        displayName: displayName || additionalData.displayName || '이름 없음',
        photoURL: photoURL || '',
        createdAt,
        role: USER_ROLES.FREE, // 기본 무료 이용자
        subscription: {
          plan: '무료',
          startDate: createdAt,
          endDate: null,
          status: 'active',
        },
        ...additionalData,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: true };
};

// 사용자 정보 가져오기
const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    
    if (userSnapshot.exists()) {
      return { success: true, data: userSnapshot.data() };
    } else {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 사용자 구독 정보 업데이트
const updateUserSubscription = async (userId, subscriptionData, userRole = null) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // 업데이트할 데이터 구성
    const updateData = { 
      subscription: subscriptionData 
    };
    
    // userRole이 제공되면 최상위 role도 함께 업데이트
    if (userRole) {
      updateData.role = userRole;
    }
    
    await setDoc(userRef, updateData, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 이메일/비밀번호 로그인
const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 이메일/비밀번호로 회원가입
const registerWithEmail = async (email, password, additionalData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(userCredential.user, additionalData);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Google 로그인
const loginWithGoogle = async () => {
  if (!auth || !googleProvider) {
    console.error('Firebase 인증이 초기화되지 않았습니다.');
    return { success: false, error: 'Firebase 인증이 초기화되지 않았습니다.' };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Google 로그인 오류:', error.code, error.message);
    if (error.code === 'auth/unauthorized-domain') {
      return { 
        success: false, 
        error: '이 도메인은 Firebase에서 승인되지 않았습니다. Firebase 콘솔에서 도메인을 추가해주세요.' 
      };
    }
    return { success: false, error: error.message };
  }
};

// 로그아웃
const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 사용자 역할 업데이트
const updateUserRole = async (userId, role) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // 역할에 따른 플랜 이름 설정
    let planName;
    switch (role) {
      case USER_ROLES.DEVELOPER:
        planName = '개발자';
        break;
      case USER_ROLES.MANAGER:
        planName = '관리자';
        break;
      case USER_ROLES.SUBSCRIBER_A:
        planName = '프리미엄';
        break;
      case USER_ROLES.SUBSCRIBER_B:
        planName = '스탠다드';
        break;
      case USER_ROLES.SUBSCRIBER_C:
        planName = '베이직';
        break;
      case USER_ROLES.FREE:
      default:
        planName = '무료';
    }
    
    await setDoc(userRef, {
      role,
      subscription: {
        plan: planName,
        status: 'active'
      }
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 로컬 환경에서는 Firebase 객체들을 null로 처리
const exportedApp = isLocalEnvironment ? null : app;
const exportedAuth = isLocalEnvironment ? null : auth;
const exportedDb = isLocalEnvironment ? null : db;
const exportedMessaging = isLocalEnvironment ? null : messaging;
const exportedGoogleProvider = isLocalEnvironment ? null : googleProvider;

export { 
  exportedApp as app,
  exportedAuth as auth,
  exportedDb as db,
  exportedMessaging as messaging,
  exportedGoogleProvider as googleProvider,
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle,
  logout,
  getUserProfile,
  updateUserSubscription,
  updateUserRole
};