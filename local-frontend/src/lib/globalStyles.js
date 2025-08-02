'use client';

import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.textPrimary};
    font-family: ${props => props.theme.fonts.main};
    overflow: hidden; /* 페이지 전체에서 스크롤바 제거하고 컨텐츠 영역에만 표시 */
  }
  
  *, *:before, *:after {
    box-sizing: inherit;
  }
  
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
  }
  
  h1, h2, h3, h4, h5, h6, p {
    margin-top: 0;
  }
  
  button, input, select, textarea {
    font-family: inherit;
  }
  
  /* 글로벌 스크롤바 스타일 */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(100, 100, 100, 0.4);
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 100, 100, 0.6);
  }
  
  /* Firefox 스크롤바 스타일링 */
  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(100, 100, 100, 0.4) transparent;
  }
`;

export default GlobalStyles; 