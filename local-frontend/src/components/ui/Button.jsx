'use client';

import React from 'react';
import styled, { css } from 'styled-components';

const getButtonStyles = (variant) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: ${(props) => props.theme.colors.primary};
        color: white;
        &:hover {
          background-color: ${(props) => props.theme.colors.primaryDark};
        }
      `;
    case 'secondary':
      return css`
        background-color: ${(props) => props.theme.colors.background};
        color: ${(props) => props.theme.colors.primary};
        border: 1px solid ${(props) => props.theme.colors.primary};
        &:hover {
          background-color: ${(props) => props.theme.colors.primaryLight};
        }
      `;
    case 'outline':
      return css`
        background-color: transparent;
        color: ${(props) => props.theme.colors.textPrimary};
        border: 1px solid ${(props) => props.theme.colors.border};
        &:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
      `;
    case 'text':
      return css`
        background-color: transparent;
        color: ${(props) => props.theme.colors.primary};
        &:hover {
          background-color: rgba(79, 195, 247, 0.1);
        }
      `;
    default:
      return css`
        background-color: ${(props) => props.theme.colors.primary};
        color: white;
      `;
  }
};

const getSizeStyles = (size) => {
  switch (size) {
    case 'small':
      return css`
        font-size: ${(props) => props.theme.fontSizes.xs};
        padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
        border-radius: ${(props) => props.theme.borderRadius.sm};
      `;
    case 'medium':
      return css`
        font-size: ${(props) => props.theme.fontSizes.sm};
        padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
        border-radius: ${(props) => props.theme.borderRadius.md};
      `;
    case 'large':
      return css`
        font-size: ${(props) => props.theme.fontSizes.base};
        padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
        border-radius: ${(props) => props.theme.borderRadius.md};
      `;
    default:
      return css`
        font-size: ${(props) => props.theme.fontSizes.sm};
        padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
        border-radius: ${(props) => props.theme.borderRadius.md};
      `;
  }
};

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: ${(props) => props.theme.transitions.normal};
  gap: ${(props) => props.theme.spacing.sm};
  ${(props) => getButtonStyles(props.variant)}
  ${(props) => getSizeStyles(props.size)}
  width: ${(props) => (props.$fullWidth ? '100%' : 'auto')};
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${(props) => props.theme.colors.primaryLight};
  }
`;

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  ...props
}) => {
  return (
    <StyledButton variant={variant} size={size} $fullWidth={fullWidth} {...props}>
      {children}
    </StyledButton>
  );
};

export default Button; 