import React, {FC} from 'react';

export interface FilterProps {
  children: React.ReactNode;
}

const Filter: FC<FilterProps> = ({children}) => {
  return (
    <div>
      {children}
    </div>
  );
};

export default Filter;
