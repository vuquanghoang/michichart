import React, {FC, useRef} from 'react';
import styled from 'styled-components';

const SearchBoxStyled = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 5px;
  padding: 5px 10px;
  
  input {
    outline: 0;
    border: 0;
    flex: 1 0 auto;
    padding: 0 5px;
  }

  .reset-btn {
    cursor: pointer;
  }
`;

export interface SearchBoxProps {
  iconSearch: React.ReactNode | null;
  iconClose: React.ReactNode | null;
  placeholder: string;
  onSearch: (e: string) => void;
  keyword: string,
  className?: string,
}

const SearchBox: FC<SearchBoxProps> = ({iconSearch = null, iconClose = null, placeholder = '', keyword, onSearch, className = ''}) => {
  const ref = useRef(null);

  const resetSearch: (el: HTMLInputElement | null) => void = (el) => {
    if (el !== null) {
      el.value = '';
      onSearch('')
    }
  };

  return (
    <SearchBoxStyled className={className}>
      {iconSearch}
      <input
        value={keyword}
        ref={ref}
        type="text"
        placeholder={placeholder}
        autoFocus={true}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          return onSearch(e.target.value);
        }}
      />
      {iconClose && (
        <span className="reset-btn" onClick={() => resetSearch(ref?.current || null)}>
          {iconClose}
        </span>
      )}
    </SearchBoxStyled>
  );
};

export default SearchBox;
