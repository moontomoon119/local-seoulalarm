'use client';

import React, { useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { createPortal } from 'react-dom';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${props => props.theme.spacing.md};
`;

const getModalSize = (size) => {
  switch (size) {
    case 'small':
      return css`
        max-width: 400px;
      `;
    case 'medium':
      return css`
        max-width: 600px;
      `;
    case 'large':
      return css`
        max-width: 800px;
      `;
    case 'fullscreen':
      return css`
        max-width: 100%;
        width: 100%;
        height: 100%;
        border-radius: 0;
      `;
    default:
      return css`
        max-width: 600px;
      `;
  }
};

const ModalContainer = styled.div`
  background: ${props => props.theme.colors.cardBg};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.md};
  width: 100%;
  max-height: calc(100vh - ${props => props.theme.spacing.xl} * 2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  ${props => getModalSize(props.$size)}
`;

const ModalHeader = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.lg};
  color: ${props => props.theme.colors.textPrimary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.fast};
  width: 30px;
  height: 30px;
  border-radius: ${props => props.theme.borderRadius.sm};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: ${props => props.theme.colors.textPrimary};
  }
`;

const ModalContent = styled.div`
  padding: ${props => props.theme.spacing.md};
  overflow-y: auto;
  flex: 1;
`;

const ModalFooter = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: ${props => props.align || 'flex-end'};
  gap: ${props => props.theme.spacing.sm};
`;

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  size = 'medium'
}) => {
  const modalRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer ref={modalRef} $size={size}>
        {children}
      </ModalContainer>
    </ModalOverlay>,
    document.body
  );
};

// 서브 컴포넌트 연결
Modal.Header = ({ children, onClose }) => (
  <ModalHeader>
    {typeof children === 'string' ? <ModalTitle>{children}</ModalTitle> : children}
    {onClose && (
      <CloseButton onClick={onClose}>×</CloseButton>
    )}
  </ModalHeader>
);

Modal.Content = ({ children }) => <ModalContent>{children}</ModalContent>;

Modal.Footer = ({ children, align }) => (
  <ModalFooter align={align}>{children}</ModalFooter>
);

export default Modal; 