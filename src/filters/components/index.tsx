import React, { FC, ReactNode, useState } from 'react';
import PublicRoundedIcon from '@material-ui/icons/PublicRounded';
import FilterContent from './FilterContent';

interface INode {
  value: string;
  label: string;
  children?: INode[];
}

export interface FilterProps {
  width?: number;
  maxSelectedItems?: number;
  bgColor: string;
  icon?: ReactNode;
  label?: ReactNode;
  dataGroup: any[];
  multipleSelection: boolean;
  onChange: (data: INode[]) => void;
  preSelected: INode[];
  summaryText: ReactNode | string | undefined;
};

export const Filter: FC<FilterProps> = ({ bgColor = '#ffffff', icon, dataGroup, onChange, multipleSelection, preSelected, label, ...otherProps }) => (
  <FilterContent
    bgColor={bgColor}
    icon={icon || <PublicRoundedIcon width={55} height={55} />}
    label={label}
    dataGroup={dataGroup}
    onChange={onChange}
    multipleSelection={multipleSelection}
    preSelected={preSelected}
    {...otherProps}
  />
);
