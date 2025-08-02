import * as admin from 'firebase-admin';

interface NotificationData {
  title: string;
  body: string;
  noticeUrl?: string;
  district?: string;
  keyword?: string;
  postId?: string;
  timestamp?: number;
}

interface BatchResult {
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
}

export class FCMService {
  private readonly BATCH_SIZE = 500; // FCM 일괄 전송 최대 개수

  /**
   * 단일 FCM 토큰으로 알림 전송
   */
  async sendNotification(fcmToken: string, data: NotificationData): Promise<string | null> {
    try {
      const message = {
        notification: {
          title: data.title,
          body: data.body
        },
        data: {
          noticeUrl: data.noticeUrl || '',
          district: data.district || '',
          keyword: data.keyword || '',
          postId: data.postId || '',
          timestamp: (data.timestamp || Date.now()).toString(),
          clickAction: 'FLUTTER_NOTIFICATION_CLICK' // Flutter 앱에서 처리하기 위한 액션
        },
        token: fcmToken
      };

      const response = await admin.messaging().send(message);
      console.log('📱 FCM 알림 전송 성공:', response);
      return response;
    } catch (error: any) {
      console.error('❌ FCM 알림 전송 실패:', error);
      
      // 무효한 토큰인 경우 처리
      if (this.isInvalidToken(error)) {
        console.log('🗑️ 무효한 토큰 발견:', fcmToken);
        await this.removeInvalidToken(fcmToken);
      }
      
      throw error;
    }
  }

  /**
   * 여러 FCM 토큰으로 일괄 알림 전송
   */
  async sendBatchNotifications(tokens: string[], data: NotificationData): Promise<BatchResult[]> {
    if (tokens.length === 0) {
      console.log('⚠️ 전송할 토큰이 없습니다.');
      return [];
    }

    console.log(`📤 총 ${tokens.length}개 토큰으로 일괄 알림 전송 시작`);

    // 500개씩 나누어서 전송 (FCM 제한)
    const results: BatchResult[] = [];
    
    for (let i = 0; i < tokens.length; i += this.BATCH_SIZE) {
      const batchTokens = tokens.slice(i, i + this.BATCH_SIZE);
      console.log(`📦 배치 ${Math.floor(i / this.BATCH_SIZE) + 1}: ${batchTokens.length}개 토큰 처리 중...`);
      
      const result = await this.sendBatch(batchTokens, data);
      results.push(result);
      
      // 배치 간 약간의 딜레이 (선택사항)
      if (i + this.BATCH_SIZE < tokens.length) {
        await this.delay(100); // 100ms 딜레이
      }
    }

    // 전체 결과 요약
    const totalSuccess = results.reduce((sum, result) => sum + result.successCount, 0);
    const totalFailure = results.reduce((sum, result) => sum + result.failureCount, 0);
    const totalInvalidTokens = results.reduce((arr, result) => arr.concat(result.invalidTokens), [] as string[]);

    console.log('📊 FCM 일괄 알림 전송 완료:', {
      총_성공: totalSuccess,
      총_실패: totalFailure,
      무효한_토큰_수: totalInvalidTokens.length
    });

    return results;
  }

  /**
   * 실제 배치 전송 로직
   */
  private async sendBatch(tokens: string[], data: NotificationData): Promise<BatchResult> {
    try {
      const message = {
        notification: {
          title: data.title,
          body: data.body
        },
        data: {
          noticeUrl: data.noticeUrl || '',
          district: data.district || '',
          keyword: data.keyword || '',
          postId: data.postId || '',
          timestamp: (data.timestamp || Date.now()).toString(),
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        },
        tokens: tokens
      };

      const response = await admin.messaging().sendMulticast(message);
      
      // 무효한 토큰 처리
      const invalidTokens: string[] = [];
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            const errorCode = resp.error.code;
            if (this.isInvalidTokenError(errorCode)) {
              invalidTokens.push(tokens[idx]);
            }
          }
        });
        
        if (invalidTokens.length > 0) {
          console.log(`🗑️ 배치에서 ${invalidTokens.length}개 무효한 토큰 발견`);
          await this.removeInvalidTokens(invalidTokens);
        }
      }

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens
      };
    } catch (error) {
      console.error('❌ FCM 배치 전송 실패:', error);
      throw error;
    }
  }

  /**
   * 키워드 기반 알림 전송 (키워드 알림 시스템에서 사용)
   */
  async sendKeywordNotification(
    subscriberTokens: string[], 
    keyword: string, 
    postTitle: string, 
    postId: string,
    district?: string
  ): Promise<BatchResult[]> {
    const notificationData: NotificationData = {
      title: `새로운 "${keyword}" 관련 글이 등록되었습니다`,
      body: postTitle.length > 50 ? postTitle.substring(0, 50) + '...' : postTitle,
      keyword: keyword,
      postId: postId,
      district: district,
      noticeUrl: `https://yourapp.com/post/${postId}`, // TODO: 실제 앱 URL로 변경
      timestamp: Date.now()
    };

    return await this.sendBatchNotifications(subscriberTokens, notificationData);
  }

  /**
   * 에러가 무효한 토큰 관련인지 확인
   */
  private isInvalidToken(error: any): boolean {
    return error?.code === 'messaging/invalid-registration-token' ||
           error?.code === 'messaging/registration-token-not-registered';
  }

  /**
   * 에러 코드가 무효한 토큰 관련인지 확인
   */
  private isInvalidTokenError(errorCode: string): boolean {
    return errorCode === 'messaging/invalid-registration-token' ||
           errorCode === 'messaging/registration-token-not-registered';
  }

  /**
   * 단일 무효한 토큰을 DB에서 제거
   * TODO: Firestore에서 해당 토큰을 가진 사용자를 찾아서 fcmToken 필드를 null로 업데이트
   */
  private async removeInvalidToken(invalidToken: string): Promise<void> {
    try {
      // TODO: 실제 구현 필요
      // 1. users 컬렉션에서 fcmToken이 invalidToken과 일치하는 문서 찾기
      // 2. 해당 사용자의 fcmToken을 null 또는 삭제
      
      console.log(`TODO: DB에서 무효한 토큰 제거 필요: ${invalidToken}`);
      
      // 예시 구현 (실제로는 이 코드를 사용):
      /*
      const usersRef = admin.firestore().collection('users');
      const snapshot = await usersRef.where('fcmToken', '==', invalidToken).get();
      
      const batch = admin.firestore().batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { fcmToken: admin.firestore.FieldValue.delete() });
      });
      
      if (!snapshot.empty) {
        await batch.commit();
        console.log(`✅ 무효한 토큰 ${invalidToken} 제거 완료`);
      }
      */
    } catch (error) {
      console.error('❌ 무효한 토큰 제거 실패:', error);
    }
  }

  /**
   * 여러 무효한 토큰들을 DB에서 제거
   * TODO: Firestore에서 해당 토큰들을 가진 사용자들을 찾아서 fcmToken 필드를 null로 업데이트
   */
  private async removeInvalidTokens(invalidTokens: string[]): Promise<void> {
    try {
      // 배치로 처리하여 효율성 향상
      for (const token of invalidTokens) {
        await this.removeInvalidToken(token);
      }
    } catch (error) {
      console.error('❌ 무효한 토큰들 제거 실패:', error);
    }
  }

  /**
   * 딜레이 유틸리티 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * FCM 서비스 상태 확인
   */
  async checkService(): Promise<boolean> {
    try {
      // Firebase Admin이 초기화되어 있는지 확인
      if (!admin.apps.length) {
        console.error('❌ Firebase Admin이 초기화되지 않았습니다.');
        return false;
      }
      
      console.log('✅ FCM 서비스 정상 작동 중');
      return true;
    } catch (error) {
      console.error('❌ FCM 서비스 상태 확인 실패:', error);
      return false;
    }
  }
}

// 싱글톤 패턴으로 FCM 서비스 인스턴스 제공
export const fcmService = new FCMService();