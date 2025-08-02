import { getMessaging, getToken } from 'firebase/messaging';
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';

// FCM 토큰 가져오기
export const getFCMToken = async () => {
  try {
    if (!auth.currentUser) {
      console.log('사용자가 로그인되어 있지 않습니다.');
      return null;
    }

    const messaging = getMessaging();
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('알림 권한이 거부되었습니다.');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: "BMQRL0wvGp0OgDSzzCbDsRlt6YwfS437fOrNwYuhhHyVr0Rsm4RrbLJZyAjnymAywXbGLxFw9dhFkVud0Mel--0"
    });

    if (!token) {
      console.log('FCM 토큰을 생성할 수 없습니다.');
      return null;
    }

    return token;
  } catch (error) {
    console.error('FCM 토큰 생성 중 오류:', error);
    return null;
  }
};

// 이전 토큰 컬렉션 정리
const cleanupOldTokens = async (userId) => {
  try {
    // 이전 'tokens' 컬렉션의 모든 문서 가져오기
    const oldTokensRef = collection(db, 'users', userId, 'tokens');
    const oldTokensSnapshot = await getDocs(oldTokensRef);

    // 각 토큰 문서 삭제
    const deletePromises = oldTokensSnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );

    await Promise.all(deletePromises);
    console.log('이전 토큰이 성공적으로 정리되었습니다.');
  } catch (error) {
    console.error('이전 토큰 정리 중 오류:', error);
  }
};

// Firestore에 FCM 토큰 저장
export const saveFCMToken = async (userId, token) => {
  try {
    // 기본적인 유효성 검사
    if (!auth.currentUser || !userId || !token) {
      console.log('토큰 저장을 위한 유효한 정보가 없습니다.');
      return false;
    }

    // 현재 로그인한 사용자의 ID와 전달된 userId가 일치하는지 확인
    if (auth.currentUser.uid !== userId) {
      console.log('사용자 ID가 일치하지 않습니다.');
      return false;
    }

    // 이전 토큰 컬렉션 정리
    await cleanupOldTokens(userId);

    // 새로운 토큰 저장 - fcm_tokens 컬렉션 사용
    const tokenRef = doc(db, 'users', userId, 'fcm_tokens', token);
    await setDoc(tokenRef, {
      token,
      createdAt: new Date().toISOString()
    });

    console.log('FCM 토큰이 성공적으로 저장되었습니다.');
    return true;
  } catch (error) {
    console.error('FCM 토큰 저장 중 오류:', error);
    return false;
  }
};

// FCM 초기화
export const initializeFCM = async (userId) => {
  try {
    const token = await getFCMToken();
    if (token) {
      const saved = await saveFCMToken(userId, token);
      if (saved) {
        console.log('FCM 초기화가 완료되었습니다.');
        return token;
      }
    }
    return null;
  } catch (error) {
    console.error('FCM 초기화 중 오류:', error);
    return null;
  }
}; 