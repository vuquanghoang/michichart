import React, { FC } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

const OverlayStyled = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const Overlay: FC<{
  zIndex?: number;
  opacity?: number;
  backgroundColor?: string;
  onClick?: () => void;
}> = ({
  zIndex = 1000,
  opacity = 0.1,
  backgroundColor = '#000',
  ...otherProps
}) => {
  return createPortal(
    <OverlayStyled style={{ zIndex, opacity, backgroundColor }} {...otherProps}>
      ddd
    </OverlayStyled>,
    document.body
  );
};

export default Overlay;
