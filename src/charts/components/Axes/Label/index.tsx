import React, { FC } from 'react';
import styled from 'styled-components';

const LblStyled = styled.text`
  font-family: var(--font-sans-serif-primary);
  font-weight: 600;
  font-size: 1em;
  fill: #918b86;
`;

const Index: FC<{ x: number; y: number; textAnchor?: string }> = ({ children, x, y, ...otherProps }) => {
  return (
    <LblStyled x={x} y={y} {...otherProps}>
      {children}
    </LblStyled>
  );
};

export default Index;
