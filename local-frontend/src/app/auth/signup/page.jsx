'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Input, Button } from '@/components/ui';
import Link from 'next/link';
import { registerWithEmail, loginWithGoogle } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

const SignupPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${props => props.theme.spacing.xl};
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing.md};
  }
`;

const SignupCard = styled(Card)`
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

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // 이미 로그인된 사용자는 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 입력 값이 변경되면 해당 필드의 오류 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // 이름 검증
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }
    
    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }
    
    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다';
    }
    
    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Firebase Authentication 회원가입 연동
      const result = await registerWithEmail(
        formData.email, 
        formData.password, 
        { displayName: formData.name }
      );
      
      if (result.success) {
        // 성공 시 로그인 페이지로 리다이렉트
        router.push('/auth/login?registered=true');
      } else {
        setErrors({ form: '회원가입 실패: ' + result.error });
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      setErrors({ form: '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        // Google 로그인은 즉시 인증되므로 메인 페이지로 리다이렉트
        router.replace('/');
      } else {
        setErrors({ form: 'Google 회원가입에 실패했습니다: ' + result.error });
      }
    } catch (error) {
      setErrors({ form: 'Google 회원가입에 실패했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SignupPageContainer>
      <SignupCard>
        <Card.Content>
          <Title>회원가입</Title>
          
          <Form onSubmit={handleSubmit}>
            <Input
              label="이름"
              name="name"
              type="text"
              placeholder="이름을 입력하세요"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />
            
            <Input
              label="이메일"
              name="email"
              type="email"
              placeholder="이메일 주소 입력"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
            
            <Input
              label="비밀번호"
              name="password"
              type="password"
              placeholder="비밀번호 입력 (6자 이상)"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />
            
            <Input
              label="비밀번호 확인"
              name="confirmPassword"
              type="password"
              placeholder="비밀번호 재입력"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
            
            {errors.form && (
              <div style={{ color: 'red', marginTop: '10px' }}>{errors.form}</div>
            )}
            
            <ButtonContainer>
              <Button type="submit" fullWidth disabled={isLoading}>
                {isLoading ? '처리 중...' : '회원가입'}
              </Button>
            </ButtonContainer>
            
            <Divider>또는</Divider>
            
            <SocialButton 
              type="button" 
              variant="outline" 
              fullWidth 
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              <GoogleIcon /> Google로 회원가입
            </SocialButton>
          </Form>
          
          <Footer>
            이미 계정이 있으신가요? <FooterLink href="/auth/login">로그인</FooterLink>
          </Footer>
        </Card.Content>
      </SignupCard>
    </SignupPageContainer>
  );
};

export default SignupPage; 