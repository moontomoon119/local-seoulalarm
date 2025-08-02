// src/app/layout.js
import './globals.css';
import StyledComponentsRegistry from '@/lib/registry';
import ClientLayout from '@/components/ClientLayout';
import Script from 'next/script';

export const metadata = {
  title: '서울시 자치구별 고시공고 정보',
  description: '서울 25개 자치구별 고시공시 정보를 한 곳에서 확인하세요',
  keywords: '서울시, 자치구, 공시, 공지사항, 정보',
  openGraph: {
    title: '서울시 자치구별 고시공고 정보',
    description: '서울 25개 자치구별 고시공시 정보를 한 곳에서 확인하세요',
    type: 'website',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  // 개발 환경에서는 캐시 설정을 비활성화
  other: process.env.NODE_ENV === 'production' 
    ? { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } 
    : { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
};

// 새로운 viewport 내보내기 추가
export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet" />
        {/* FCM 관련 메타 태그 */}
        <meta name="firebase-messaging-sender-id" content={process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID} />
        <meta name="firebase-messaging-vapid-key" content="BMQRL0wvGp0OgDSzzCbDsRlt6YwfS437fOrNwYuhhHyVr0Rsm4RrbLJZyAjnymAywXbGLxFw9dhFkVud0Mel--0" />
      </head>
      <body suppressHydrationWarning>
        <StyledComponentsRegistry>
          <ClientLayout>{children}</ClientLayout>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}