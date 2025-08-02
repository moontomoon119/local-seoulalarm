'use client';

import styled from 'styled-components';
import { Card, Flex, Input, Select } from './style';

const FilterCard = styled(Card)`
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #1a1a1a;
  border: 1px solid #333;
  box-shadow: none;
  width: 100%;
  overflow: hidden;
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
  
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 0.5rem;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
  
  svg {
    width: 14px;
    height: 14px;
    color: #666;
  }
`;

const SearchInput = styled(Input)`
  width: 100%;
  padding: 0.4rem 0.5rem 0.4rem 2rem;
  border-radius: 4px;
  border: 1px solid #333;
  background: #222;
  color: #d4d4d4;
  font-size: 0.8rem;

  &:focus {
    border-color: #444;
    box-shadow: none;
  }

  &::placeholder {
    color: #666;
  }
`;

const FiltersRow = styled(Flex)`
  margin-top: 0.5rem;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

const StyledSelect = styled(Select)`
  padding: 0.4rem 2rem 0.4rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #333;
  background: #222;
  color: #d4d4d4;
  font-size: 0.8rem;
  min-width: 110px;
  cursor: pointer;

  @media (max-width: 768px) {
    flex: 1;
    min-width: calc(50% - 0.375rem); // 2개씩 배치하기 위한 너비 계산
  }

  @media (max-width: 480px) {
    min-width: 100%; // 모바일에서는 한줄에 하나씩
  }

  &:focus {
    border-color: #444;
    box-shadow: none;
  }

  option {
    background: #222;
    color: #d4d4d4;
  }
`;

const DateRangeWrapper = styled(Flex)`
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    flex: 1;
    min-width: 100%;
    justify-content: space-between;
  }
`;

const DateInput = styled(Input)`
  padding: 0.4rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #333;
  background: #222;
  color: #d4d4d4;
  font-size: 0.8rem;
  width: 120px;

  @media (max-width: 768px) {
    flex: 1;
    width: calc(50% - 1rem); // 물결 표시 여백 고려
  }

  &:focus {
    border-color: #444;
    box-shadow: none;
  }

  &::-webkit-calendar-picker-indicator {
    filter: invert(0.7);
    cursor: pointer;
  }
`;

const ToggleButton = styled.button`
  padding: 0.4rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #333;
  background: #222;
  color: #d4d4d4;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  &:hover {
    background: #2a2a2a;
    border-color: #444;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export default function AdvancedSearchAndFilters({ 
  searchTerm, onSearchChange, districts, selectedDistrict, onDistrictChange,
  dateRange, onDateRangeChange, selectedCategory, onCategoryChange 
}) {
  return (
    <FilterCard>
      <Flex direction="column">
        {/* 검색어 입력 줄 */}
        <Flex gap="0.75rem" align="center">
          <SearchWrapper>
            <SearchIcon>
              <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </SearchIcon>
            <SearchInput
              placeholder="검색어를 입력하세요..."
              value={searchTerm || ''}
              onChange={e => onSearchChange(e.target.value)}
            />
          </SearchWrapper>
        </Flex>

        {/* 필터 줄 */}
        <FiltersRow>
          <StyledSelect 
            value={selectedDistrict || ''} 
            onChange={e => onDistrictChange(e.target.value || null)}
          >
            <option value="">모든 자치구</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </StyledSelect>
          
          <StyledSelect 
            value={selectedCategory || ''} 
            onChange={e => onCategoryChange(e.target.value)}
          >
            <option value="">모든 카테고리</option>
            <option value="공고">공고</option>
            <option value="고시">고시</option>
            <option value="입찰">입찰</option>
            <option value="채용">채용</option>
          </StyledSelect>

          <DateRangeWrapper>
            <DateInput
              type="date"
              value={dateRange?.start || ''}
              onChange={e => onDateRangeChange({...dateRange, start: e.target.value})}
            />
            <span style={{ color: '#666' }}>~</span>
            <DateInput
              type="date"
              value={dateRange?.end || ''}
              onChange={e => onDateRangeChange({...dateRange, end: e.target.value})}
            />
          </DateRangeWrapper>
        </FiltersRow>
      </Flex>
    </FilterCard>
  );
}