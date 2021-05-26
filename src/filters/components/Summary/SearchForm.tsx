import React, { FC, useRef, useEffect } from 'react';
import styled from 'styled-components';

const Input = styled.input`
  min-width: 70px;
  width: 100%;
  outline: 0;
  border: 0;
  border-bottom: 1px solid var(--color-border);
  padding: 5px 15px;
  margin-bottom: 3px;
`;

const SearchForm: FC<{ keyword: string; onSearch: (keyword: string) => void }> = ({ keyword, onSearch }) => {
  const ref = useRef(null);
  
  useEffect(() => {
    if (ref?.current !== null ) {
      const el = ref?.current as unknown as HTMLElement;
      el.focus();
    }
  }, [ref]);
  
  return <Input ref={ref} defaultValue={keyword} onChange={(event) => onSearch(event.target.value)} placeholder="Keyword" />;
};

export default SearchForm;
