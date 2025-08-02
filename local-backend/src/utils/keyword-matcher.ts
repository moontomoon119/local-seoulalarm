
import * as admin from 'firebase-admin';

interface UserSubscription {
  fcmToken: string;
  subscribedKeywords: string[];
  uid: string;
}

export class KeywordMatcher {
  private async getUserSubscriptions(): Promise<UserSubscription[]> {
    try {
      const usersSnapshot = await admin.firestore().collection('users').get();
      return usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          fcmToken: data.fcmToken,
          subscribedKeywords: JSON.parse(data.subscribedKeywords || '[]'),
          uid: doc.id
        };
      });
    } catch (error) {
      console.error('❌ 사용자 구독 정보 조회 실패:', error);
      return [];
    }
  }

  async findMatchingSubscribers(content: string): Promise<Map<string, UserSubscription[]>> {
    const matches = new Map<string, UserSubscription[]>();
    
    // 모든 키워드 구독 정보 가져오기
    const subscriptionsSnapshot = await admin.firestore()
      .collection('keywordSubscriptions')
      .get();
    
    // 컨텐츠에 포함된 키워드 찾기
    for (const doc of subscriptionsSnapshot.docs) {
      const keyword = doc.id;
      if (content.includes(keyword)) {
        const data = doc.data();
        
        // 구독자 정보 가져오기
        const userSnapshots = await admin.firestore()
          .collection('users')
          .where('uid', 'in', data.subscribers)
          .get();
          
        const subscribers = userSnapshots.docs.map(userDoc => ({
          fcmToken: userDoc.data().fcmToken,
          subscribedKeywords: userDoc.data().subscribedKeywords,
          uid: userDoc.id
        }));
        
        matches.set(keyword, subscribers);
      }
    }
    
    return matches;
  }
} 