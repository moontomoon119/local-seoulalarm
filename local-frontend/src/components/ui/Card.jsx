'use client';

import React from 'react';
import styled, { css } from 'styled-components';

// 카드의 변형에 따른 스타일
const getCardVariantStyle = (variant) => {
  switch (variant) {
    case 'outlined':
      return css`
        background-color: transparent;
        border: 1px solid ${props => props.theme.colors.border};
      `;
    case 'elevated':
      return css`
        background-color: ${props => props.theme.colors.cardBg};
        box-shadow: ${props => props.theme.shadows.sm};
        border: none;
      `;
    default:
      return css`
        background-color: ${props => props.theme.colors.cardBg};
        border: 1px solid ${props => props.theme.colors.border};
      `;
  }
};

const CardContainer = styled.div`
  border-radius: ${props => props.theme.borderRadius.sm};
  overflow: hidden;
  transition: ${props => props.theme.transitions.normal};
  display: flex;
  flex-direction: column;
  width: 100%;
  
  ${props => getCardVariantStyle(props.variant)}
  
  &:hover {
    ${props => props.$clickable && css`
      transform: translateY(-1px);
      box-shadow: ${props => props.theme.shadows.sm};
      cursor: pointer;
    `}
  }
`;

const CardHeader = styled.div`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-bottom: ${props => props.$divider ? `1px solid ${props.theme.colors.border}` : 'none'};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.md};
  color: ${props => props.theme.colors.textPrimary};
`;

const CardContent = styled.div`
  padding: ${props => props.$noPadding ? '0' : `${props.theme.spacing.sm} ${props.theme.spacing.md}`};
  flex: 1;
`;

const CardFooter = styled.div`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-top: ${props => props.$divider ? `1px solid ${props.theme.colors.border}` : 'none'};
  display: flex;
  align-items: center;
  justify-content: ${props => props.align || 'flex-start'};
  gap: ${props => props.theme.spacing.xs};
`;

const Card = ({
  children,
  variant = 'default',
  clickable = false,
  className,
  ...props
}) => {
  return (
    <CardContainer 
      variant={variant} 
      $clickable={clickable} 
      className={className}
      {...props}
    >
      {children}
    </CardContainer>
  );
};

// 서브 컴포넌트 연결
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card; 