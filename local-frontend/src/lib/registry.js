'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

export default function StyledComponentsRegistry({ children }) {
  // 서버 사이드 렌더링에서 스타일을 처리하기 위한 상태
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    // 중요: 스타일을 삽입한 후 sheet 인스턴스를 정리해야 함
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  // 클라이언트 사이드에서는 StyleSheetManager를 사용하지 않고 직접 자식 컴포넌트를 렌더링
  if (typeof window !== 'undefined') {
    return <>{children}</>;
  }

  // 서버 사이드에서는 StyleSheetManager를 사용하여 스타일을 수집
  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance} enableVendorPrefixes={true} shouldForwardProp={(prop) => !prop.startsWith('$')}>
      {children}
    </StyleSheetManager>
  );
} 