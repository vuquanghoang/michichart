import React, { FC } from 'react';

export interface SummaryProps {
  text: React.ReactNode | string;
}

const Summary: FC<SummaryProps> = ({ text, ...otherProps }) => {
  return <div {...otherProps}>{text}</div>;
};

export default Summary;
