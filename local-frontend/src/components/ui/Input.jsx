'use client';

import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Label = styled.label`
  font-size: ${props => props.theme.fontSizes.sm};
  margin-bottom: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const StyledInput = styled.input`
  font-size: ${props => props.theme.fontSizes.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.cardBg};
  color: ${props => props.theme.colors.textPrimary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: ${props => props.theme.transitions.fast};
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 1px ${props => props.theme.colors.primary};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
    opacity: 0.6;
  }
  
  ${props => props.$error && css`
    border-color: ${props => props.theme.colors.error};
    
    &:focus {
      border-color: ${props => props.theme.colors.error};
      box-shadow: 0 0 0 1px ${props => props.theme.colors.error};
    }
  `}
  
  &:disabled {
    background-color: ${props => props.theme.colors.background};
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.error};
  margin-top: ${props => props.theme.spacing.xs};
  margin-bottom: 0;
`;

const HelpText = styled.p`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: ${props => props.theme.spacing.xs};
  margin-bottom: 0;
`;

const Input = forwardRef(({
  label,
  error,
  helpText,
  className,
  ...props
}, ref) => {
  return (
    <InputWrapper className={className}>
      {label && <Label>{label}</Label>}
      <StyledInput ref={ref} $error={!!error} {...props} />
      {helpText && !error && <HelpText>{helpText}</HelpText>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
});

Input.displayName = 'Input';

export default Input; 