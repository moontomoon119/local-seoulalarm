'use client';

import styled from 'styled-components';
import { Card } from './style';

const AdCard = styled(Card)`
  background: #1a1a1a;
  border: 1px solid #333;
  color: #d4d4d4;
  margin: 0.5rem 0;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AdContent = styled.div`
  flex: 1;
`;

const AdTitle = styled.div`
  font-size: 0.75rem;
  font-weight: bold;
  color: #d4d4d4;
`;

const AdDescription = styled.div`
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 0.15rem;
`;

const UpgradeButton = styled.button`
  background: #333;
  border: 1px solid #444;
  color: #d4d4d4;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.7rem;
  margin-left: 1rem;
  white-space: nowrap;
  
  &:hover {
    background: #444;
    border-color: #555;
  }
`;

export default function AdBanner({ planName }) {
  return (
    <AdCard>
      <AdContent>
        <AdTitle>
           현재 : {planName} 플랜
        </AdTitle>
        <AdDescription>
          프리미엄으로 업그레이드하고 광고를 제거하세요!
        </AdDescription>
      </AdContent>
      <UpgradeButton onClick={() => window.location.href = '/subscription'}>
        플랜 업그레이드
      </UpgradeButton>
    </AdCard>
  );
}