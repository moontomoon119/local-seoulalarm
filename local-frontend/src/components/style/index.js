'use client';

import styled from 'styled-components';

const shouldNotForward = prop => 
  !['noMargin', 'noMargin', 'fullWidth', 'hover', 'noPadding', 'narrow', 'bold', 'variant', 'size', 'gap', 'align', 'justify', 'direction', 'wrap'].includes(prop);

// 컨테이너 스타일
export const Container = styled.div.attrs(() => ({}))`
  width: 100%;
  max-width: ${props => props.narrow ? "28rem" : "42rem"}; // md: 448px, xl: 672px
  margin: 0 auto;
  padding-left: ${props => props.noPadding ? "0" : "1rem"};
  padding-right: ${props => props.noPadding ? "0" : "1rem"};
  box-sizing: border-box;
`;

// 카드 스타일
export const Card = styled.div.withConfig({
  shouldForwardProp: shouldNotForward
})`
  background-color: ${props => props.theme.colors.cardBg};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.sm};
  transition: ${props => props.theme.transitions.normal};
  
  &:hover {
    box-shadow: ${props => props.hover ? props.theme.shadows.md : props.theme.shadows.sm};
    transform: ${props => props.hover ? "translateY(-2px)" : "none"};
  }
`;

// 헤더 래퍼 스타일
export const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background-color: ${props => props.theme.colors.cardBg};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  height: 60px; /* 헤더 높이 고정 */
  display: flex;
  align-items: center;
`;

// 레이아웃 래퍼 스타일
export const LayoutWrapper = styled.div`
  display: flex;
  height: 100vh; /* vh 단위로 화면 전체 높이 차지 */
  width: 100vw; /* vw 단위로 화면 전체 너비 차지 */
  background-color: ${props => props.theme.colors.background};
  overflow: hidden; /* 레이아웃 자체에서 스크롤 비활성화 */
  position: fixed; /* 고정 위치 설정으로 스크롤 방지 */
  top: 0;
  left: 0;
`;

// 메인 콘텐츠 영역 스타일 - 삭제 (MainLayout.jsx에 직접 정의되어 있음)

// 콘텐츠 컨테이너 스타일
export const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${props => props.$hasSidebar ? "250px" : "0"}; // 사이드바 너비만큼 왼쪽 여백 (조건부)
  height: 100%; /* 높이를 100%로 설정하여 부모 요소 꽉 채우기 */
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

// 버튼 스타일
export const Button = styled.button.withConfig({
  shouldForwardProp: shouldNotForward
})`
  padding: ${props => props.size === "sm" ? "0.375rem 0.75rem" : "0.5rem 1rem"};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 500;
  transition: ${props => props.theme.transitions.fast};
  background-color: ${props => 
    props.variant === "primary" ? props.theme.colors.primary : 
    props.variant === "secondary" ? "transparent" : 
    props.theme.colors.background};
  color: ${props => 
    props.variant === "primary" ? "#fff" : 
    props.variant === "secondary" ? props.theme.colors.primary : 
    props.theme.colors.textPrimary};
  border: ${props => 
    props.variant === "secondary" ? `1px solid ${props.theme.colors.primary}` : "none"};
  
  &:hover {
    background-color: ${props => 
      props.variant === "primary" ? props.theme.colors.primaryDark : 
      props.variant === "secondary" ? props.theme.colors.primaryLight : 
      props.theme.colors.border};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

// 제목 스타일
export const Title = styled.h1.withConfig({
  shouldForwardProp: shouldNotForward
})`
  color: ${props => props.theme.colors.textPrimary};
  font-weight: ${props => props.weight || "700"};
  font-size: ${props => {
    switch (props.size) {
      case "xl": return props.theme.fontSizes.xl;
      case "lg": return props.theme.fontSizes.lg;
      case "sm": return props.theme.fontSizes.sm;
      case "xs": return props.theme.fontSizes.xs;
      default: return props.theme.fontSizes.base;
    }
  }};
  line-height: 1.4;
  margin-bottom: ${props => props.noMargin ? "0" : "0.5rem"};
`;

// 텍스트 스타일
export const Text = styled.p.withConfig({
  shouldForwardProp: shouldNotForward
})`
  color: ${props => 
    props.variant === "secondary" ? props.theme.colors.textSecondary : 
    props.color ? props.color : props.theme.colors.textPrimary};
  font-size: ${props => 
    props.size === "xs" ? props.theme.fontSizes.xs : 
    props.size === "sm" ? props.theme.fontSizes.sm :
    props.size === "lg" ? props.theme.fontSizes.lg :
    props.theme.fontSizes.base};
  line-height: 1.5;
  margin-bottom: ${props => props.noMargin ? "0" : "0.5rem"};
  font-weight: ${props => props.bold ? "600" : "400"};
`;

// 입력 필드 스타일
export const Input = styled.input.withConfig({
  shouldForwardProp: shouldNotForward
})`
  padding: 0.5rem 0.75rem;
  background-color: ${props => props.theme.colors.cardBg};
  color: ${props => props.theme.colors.textPrimary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.base};
  transition: ${props => props.theme.transitions.fast};
  width: ${props => props.fullWidth ? "100%" : 'auto'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primaryLight};
  }
`;

// 셀렉트 필드 스타일
export const Select = styled.select.withConfig({
  shouldForwardProp: shouldNotForward
})`
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  background-color: ${props => props.theme.colors.cardBg};
  color: ${props => props.theme.colors.textPrimary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.base};
  appearance: none;
  transition: ${props => props.theme.transitions.fast};
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239e9e9e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.25rem;
  width: ${props => props.fullWidth ? "100%" : 'auto'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primaryLight};
  }
`;

// 플렉스 레이아웃
export const Flex = styled.div.withConfig({
  shouldForwardProp: shouldNotForward
})`
  display: flex;
  flex-direction: ${props => props.direction || "row"};
  justify-content: ${props => props.justify || "flex-start"};
  align-items: ${props => props.align || "stretch"};
  flex-wrap: ${props => props.wrap || "nowrap"};
  gap: ${props => props.gap || "0"};
`;

// 그리드 레이아웃
export const Grid = styled.div.withConfig({
  shouldForwardProp: shouldNotForward
})`
  display: grid;
  grid-template-columns: ${props => props.columns || "repeat(1, 1fr)"};
  gap: ${props => props.gap || "1rem"};
`;

// 공간 (마진) 헬퍼
export const Space = styled.div.withConfig({
  shouldForwardProp: shouldNotForward
})`
  margin-top: ${props => props.mt || "0"};
  margin-right: ${props => props.mr || "0"};
  margin-bottom: ${props => props.mb || "0"};
  margin-left: ${props => props.ml || "0"};
`;

// 이미지 스타일
export const Image = styled.img.withConfig({
  shouldForwardProp: shouldNotForward
})`
  max-width: 100%;
  height: ${props => props.height || "auto"};
  border-radius: ${props => props.rounded ? props.theme.borderRadius.md : "0"};
`;

// 배지 (태그) 스타일
export const Badge = styled.span.withConfig({
  shouldForwardProp: shouldNotForward
})`
  display: inline-block;
  background-color: ${props => props.theme.colors.primaryLight};
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.full};
  padding: 0.125rem 0.5rem;
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: 500;
`; 