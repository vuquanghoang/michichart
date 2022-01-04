import React, { FC } from 'react';
import styled from 'styled-components';
import afcfta from './mockData/afcfta.json';
import rec from './mockData/rec.json';
import regions from './mockData/regions.json';
import status from './mockData/status.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

const SelectedItemsStyled = styled.ul`
  padding: 0;
`;

const Items = styled.li`
  display: inline-block;
  margin: 2px;
  padding: 3px 10px;
  border-radius: 15px;
  background: #aaa;
  color: #fff;

  &:first-child {
    margin-left: 0;
  }

  button {
    margin-right: 0;
    padding-right: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    color: #fff;
  }
`;

interface SelectedItemsProps {
  selectedItems: string[];
  onDeselect: (e) => void;
  icon: IconProp | null;
  className?: string;
}

const SelectedItems: FC<SelectedItemsProps> = ({ selectedItems, onDeselect, icon, className = '' }) => {
  const data = [...afcfta, ...rec, ...regions, ...status];

  if (!selectedItems) return null;
  return (
    <SelectedItemsStyled className={className}>
      {data
        .filter(({ value }) => selectedItems.includes(value))
        .map((d) => (
          <Items onClick={onDeselect}>
            <span>{d.label}</span>
            <button>
              <FontAwesomeIcon icon={icon ? icon : faTimesCircle} />
            </button>
          </Items>
        ))}
    </SelectedItemsStyled>
  );
};

export default SelectedItems;
