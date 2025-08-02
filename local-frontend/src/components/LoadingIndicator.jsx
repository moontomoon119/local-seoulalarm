'use client';

import styled, { keyframes } from 'styled-components';
import { Text } from './style';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2.5rem 0;
`;

const SpinnerContainer = styled.div`
  position: relative;
  width: 4rem;
  height: 4rem;
`;

const OuterSpinner = styled.div`
  position: absolute;
  inset: 0;
  border: 4px solid;
  border-color: ${props => props.theme.colors.primary};
  border-top-color: transparent;
  border-bottom-color: transparent;
  border-radius: 9999px;
  animation: ${spin} 1s linear infinite;
`;

const InnerSpinner = styled.div`
  position: absolute;
  inset: 0.5rem;
  border: 4px solid;
  border-color: ${props => props.theme.colors.accent};
  border-top-color: transparent;
  border-bottom-color: transparent;
  border-radius: 9999px;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingText = styled(Text)`
  margin-top: 1rem;
  color: ${props => props.theme.colors.textSecondary};
`;

export default function LoadingIndicator() {
  return (
    <LoadingContainer>
      <SpinnerContainer>
        <OuterSpinner />
        <InnerSpinner />
      </SpinnerContainer>
      <LoadingText>정보를 불러오는 중...</LoadingText>
    </LoadingContainer>
  );
} 