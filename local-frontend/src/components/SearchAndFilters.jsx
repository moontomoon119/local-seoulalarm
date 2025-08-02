'use client';

// src/components/SearchAndFilters.jsx
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
  
  @media (max-width: 480px) {
    min-width: 100%;
    margin-bottom: 0.5rem;
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

const StyledSelect = styled(Select)`
  padding: 0.4rem 2rem 0.4rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #333;
  background: #222;
  color: #d4d4d4;
  font-size: 0.8rem;
  min-width: 110px;
  cursor: pointer;

  @media (max-width: 480px) {
    min-width: 100%;
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

export default function SearchAndFilters({ 
  searchTerm, 
  onSearchChange, 
  districts, 
  selectedDistrict, 
  onDistrictChange 
}) {
  return (
    <FilterCard>
      <Flex gap="0.75rem" align="center" wrap="wrap">
        <SearchWrapper>
          <SearchIcon>
            <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </SearchIcon>
          <SearchInput
            id="search"
            type="search"
            placeholder="검색어를 입력하세요..."
            value={searchTerm || ''}
            onChange={e => onSearchChange(e.target.value)}
          />
        </SearchWrapper>
        
        <StyledSelect
          id="district"
          value={selectedDistrict || ''}
          onChange={e => onDistrictChange(e.target.value || null)}
        >
          <option value="">모든 자치구</option>
          {districts.map(district => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </StyledSelect>
      </Flex>
    </FilterCard>
  );
}