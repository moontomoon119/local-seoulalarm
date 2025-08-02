'use client';
//frontend/src/app/auth/login/page.jsx

import React, { useState, useEffect, Suspense } from 'react';
import styled from 'styled-components';
import { Card, Input, Button } from '@/components/ui';
import Link from 'next/link';
import { loginWithEmail, loginWithGoogle } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { initializeFCM } from '@/lib/fcm';

const LoginPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${props => props.theme.spacing.xl};
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing.md};
  }
`;

const LoginCard = styled(Card)`
  max-width: 450px;
  width: 100%;
`;

const Title = styled.h1`
  margin: 0;
  margin-bottom: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.fontSizes.xl};
  color: ${props => props.theme.colors.textPrimary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const ButtonContainer = styled.div`
  margin-top: ${props => props.theme.spacing.md};
`;

const Footer = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
`;

const FooterLink = styled(Link)`
  color: ${props => props.theme.colors.primary};
  &:hover {
    text-decoration: underline;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${props => props.theme.spacing.md} 0;
  color: ${props => props.theme.colors.textSecondary};
  
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${props => props.theme.colors.borderLight};
    margin: 0 ${props => props.theme.spacing.sm};
  }
`;

const SocialButton = styled(Button)`
  margin-top: ${props => props.theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
`;

const GoogleIcon = () => (
  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

// SearchParams를 사용하는 컴포넌트를 별도로 분리
function LoginForm({ onRedirect }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  
  // 리다이렉트 정보를 상위 컴포넌트에 전달
  useEffect(() => {
    onRedirect(redirect);
  }, [redirect, onRedirect]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 간단한 유효성 검사
    const newErrors = {};
    if (!email) newErrors.email = '이메일을 입력해주세요';
    if (!password) newErrors.password = '비밀번호를 입력해주세요';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await loginWithEmail(email, password);
      if (result.success) {
        // FCM 토큰 초기화
        try {
          await initializeFCM(result.user.uid);
        } catch (fcmError) {
          console.error('FCM 초기화 실패:', fcmError);
          // FCM 초기화 실패해도 로그인은 계속 진행
        }
        router.replace(redirect);
      } else {
        setErrors({ form: '로그인에 실패했습니다: ' + result.error });
      }
    } catch (error) {
      setErrors({ form: '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        // FCM 토큰 초기화
        try {
          await initializeFCM(result.user.uid);
        } catch (fcmError) {
          console.error('FCM 초기화 실패:', fcmError);
        }
        router.replace(redirect);
      } else {
        setErrors({ form: result.error });
      }
    } catch (error) {
      setErrors({ 
        form: '구글 로그인에 실패했습니다. 브라우저의 서드파티 쿠키 설정을 확인해보세요.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        label="이메일"
        type="email"
        placeholder="이메일 주소 입력"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      
      <Input
        label="비밀번호"
        type="password"
        placeholder="비밀번호 입력"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      
      {errors.form && (
        <div style={{ color: 'red', marginTop: '10px' }}>{errors.form}</div>
      )}
      
      <ButtonContainer>
        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
      </ButtonContainer>
      
      <Divider>또는</Divider>
      
      <SocialButton 
        type="button" 
        variant="outline" 
        fullWidth 
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <GoogleIcon /> Google로 로그인
      </SocialButton>
    </Form>
  );
}

// 로딩 중 표시를 위한 컴포넌트
function LoginFormFallback() {
  return (
    <Form>
      <div>로딩 중...</div>
    </Form>
  );
}

const LoginPage = () => {
  const [redirectPath, setRedirectPath] = useState('/');
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  // 이미 로그인된 사용자는 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [isAuthenticated, redirectPath, router]);
  
  return (
    <LoginPageContainer>
      <LoginCard>
        <Card.Content>
          <Title>로그인</Title>
          
          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm onRedirect={setRedirectPath} />
          </Suspense>
          
          <Footer>
            계정이 없으신가요? <FooterLink href="/auth/signup">회원가입</FooterLink>
          </Footer>
        </Card.Content>
      </LoginCard>
    </LoginPageContainer>
  );
};

export default LoginPage;