import { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Flex } from '../style'; // Flex 컴포넌트 경로 수정

// 깜빡이는 애니메이션
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

const blinkGreen = keyframes`
  0%, 100% { background-color: #48BB78; }
  50% { background-color: #68D391; }
`;

const StatusContainer = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: ${props => props.theme.borderRadius?.lg || '0.5rem'};
  margin-bottom: 0.75rem;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

const StatusHeader = styled.div`
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #222;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #2a2a2a;
  }
`;

const StatusDetails = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOpen'
})`
  max-height: ${props => props.isOpen ? '150px' : '0'};
  overflow: hidden;
  transition: max-height 0.2s ease;
  background: #1a1a1a;
`;

const StatusContent = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOpen'
})`
  padding: ${props => props.isOpen ? '0.75rem' : '0 0.75rem'};
  transition: padding 0.2s ease;
`;

const StatusIndicator = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
  transition: all 0.2s ease;
  
  ${props => {
    if (props.status === 'connected') {
      return css`
        background-color: #48BB78;
        animation: ${blinkGreen} 1.5s infinite;
        box-shadow: 0 0 5px rgba(72, 187, 120, 0.3);
      `;
    } else if (props.status === 'error') {
      return css`
        background-color: #F56565;
        animation: ${pulse} 0.8s infinite;
      `;
    } else if (props.status === 'loading') {
      return css`
        background-color: #ED8936;
        animation: ${pulse} 0.6s infinite;
      `;
    }
    return css`background-color: #666;`;
  }}
`;

const ExpandIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOpen'
})`
  transition: transform 0.3s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  color: #4299E1;
`;

const StatusText = styled.span`
  color: #d4d4d4;
  font-size: 0.8rem;
  font-weight: 500;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.35rem 0;
  border-bottom: 1px solid #333;
  color: #a0a0a0;
  font-size: 0.75rem;
  
  &:last-child {
    border-bottom: none;
  }
`;

const Badge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'type'
})`
  background-color: ${props => {
    if (props.type === 'success') return '#2D3748';
    if (props.type === 'error') return '#822727';
    if (props.type === 'warning') return '#744210';
    return '#2D3748';
  }};
  color: #d4d4d4;
  padding: 0.15rem 0.4rem;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 500;
`;

export default function StatusDisplay({ 
  loading, 
  error, 
  isRealTimeConnected, 
  noticesCount,
  districtsCount,
  lastUpdated
}) {
  const [isStatusOpen, setIsStatusOpen] = useState(false); // 기본적으로 닫힌 상태로 시작

  const getStatusInfo = () => {
    if (loading) {
      return {
        status: 'loading',
        text: '데이터 연결 중...',
        details: {
          state: '로딩',
          notices: noticesCount,
          districts: districtsCount
        }
      };
    }
    if (error) {
      return {
        status: 'error',
        text: '연결 실패',
        details: {
          state: '오류',
          error: error,
          notices: noticesCount
        }
      };
    }
    if (isRealTimeConnected) {
      return {
        status: 'connected',
        text: '연결됨',
        details: {
          state: '활성',
          notices: noticesCount,
          districts: districtsCount,
          lastUpdate: lastUpdated ? lastUpdated.toLocaleTimeString() : ''
        }
      };
    }
    // 초기 데이터가 있는 경우 (isRealTimeConnected는 false일 수 있음)
    if (noticesCount > 0 && !isRealTimeConnected && !loading && !error) {
        return {
          status: 'initial',
          text: '초기 데이터 로드됨',
          details: {
            state: '정적',
            notices: noticesCount,
            districts: districtsCount
          }
        };
      }
    return {
      status: 'connecting',
      text: '연결 준비 중...',
      details: {
        state: '대기',
        notices: 0,
        districts: 0
      }
    };
  };

  const statusInfo = getStatusInfo();

  const toggleStatus = () => {
    setIsStatusOpen(!isStatusOpen);
  };

  return (
    <StatusContainer>
      <StatusHeader onClick={toggleStatus}>
        <Flex align="center">
          <StatusIndicator status={statusInfo.status} />
          <StatusText>{statusInfo.text}</StatusText>
          {isRealTimeConnected && (
            <Badge type="success" style={{ marginLeft: '0.5rem' }}>
              LIVE
            </Badge>
          )}
          {error && (
            <Badge type="error" style={{ marginLeft: '0.5rem' }}>
              ERROR
            </Badge>
          )}
        </Flex>
        <ExpandIcon isOpen={isStatusOpen}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </ExpandIcon>
      </StatusHeader>
      
      <StatusDetails isOpen={isStatusOpen}>
        <StatusContent isOpen={isStatusOpen}>
          <DetailItem>
            <span>연결 상태</span>
            <Badge type={statusInfo.status === 'connected' ? 'success' : statusInfo.status === 'error' ? 'error' : 'info'}>
              {statusInfo.details.state}
            </Badge>
          </DetailItem>
          <DetailItem>
            <span>공지사항 수</span>
            <span>{statusInfo.details.notices}개</span>
          </DetailItem>
          <DetailItem>
            <span>지역 수</span>
            <span>{statusInfo.details.districts}개</span>
          </DetailItem>
          {statusInfo.details.lastUpdate && (
            <DetailItem>
              <span>마지막 업데이트</span>
              <span>{statusInfo.details.lastUpdate}</span>
            </DetailItem>
          )}
          {statusInfo.details.error && (
            <DetailItem>
              <span>오류 내용</span>
              <span style={{ color: '#F56565', fontSize: '0.75rem' }}>
                {typeof statusInfo.details.error === 'string' ? statusInfo.details.error : JSON.stringify(statusInfo.details.error)}
              </span>
            </DetailItem>
          )}
        </StatusContent>
      </StatusDetails>
    </StatusContainer>
  );
} 