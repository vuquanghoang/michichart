import React, { FC, useEffect, useState } from 'react';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import CheckboxTree from 'react-checkbox-tree';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import {
  CheckboxCheckedIcon,
  CheckboxUnCheckedIcon,
  RadioCheckedIcon,
  RadioUncheckedIcon,
} from '../../../ui/components/Icons';
import { CheckboxTreeStyled } from '../Styled';

interface IState {
  expanded: string[];
}

export interface IData {
  value: string;
  label: string;
  children?: IData[];
  parent?: IData;
}

const SelectionTree: FC<{
  dataSource: IData[];
  selected: IData[];
  handleSelect: (selectedVal: IData[] | undefined) => void;
  multipleSelection: boolean;
  keyword: string;
}> = ({ dataSource, selected, handleSelect, multipleSelection, keyword }) => {
  const [state, setState] = useState<IState>({ expanded: [] });
  const [filteredData, setFilteredData] = useState<IData[]>(dataSource);
  // const searchKeyword: string = useSelector(selectSearchKeyword, shallowEqual);
  const handleExpand = (expanded: string[]) => {
    setState({
      ...state,
      expanded,
    });
  };

  const filterByKeyword = (data: IData[], keyword: string) => {
    if (keyword.trim().length === 0) return data;

    const getNodes = (result: IData[], object: IData) => {
      if (
        object.label
          .toLocaleLowerCase()
          .includes(keyword.toLocaleLowerCase().trim())
      ) {
        result.push(object);
        return result;
      }
      if (Array.isArray(object?.children)) {
        const children: IData[] = object.children.reduce(getNodes, []);
        if (children.length) result.push({ ...object, children });
      }

      return result;
    };

    return data.reduce(getNodes, []);
  };

  const getExpandedNodes = (data: IData[]) => {
    const getNodes = (result: string[], object: IData) => {
      result.push(object.value);

      if (Array.isArray(object.children)) {
        const children = object.children.reduce(getNodes, []);
        if (children.length) result.push(...children);
      }
      return result;
    };

    return data.reduce(getNodes, []);
  };

  useEffect(() => {
    setFilteredData(filterByKeyword(dataSource, keyword));
    handleExpand(getExpandedNodes(filteredData));
  }, [keyword]);

  useEffect(() => {
    setFilteredData(filterByKeyword(dataSource, keyword));
  }, []);

  return (
    <CheckboxTreeStyled>
      <CheckboxTree
        noCascade
        nameAsArray
        nodes={filteredData}
        checked={selected.map((d) => d.value)}
        expanded={state.expanded}
        onClick={(node) => {
          const { label, value, parent } = (node as unknown) as IData;
          handleSelect([{ label, value, parent }]);
        }}
        onExpand={(expanded) => handleExpand(expanded)}
        icons={{
          check: multipleSelection ? (
            <CheckboxCheckedIcon />
          ) : (
            <RadioCheckedIcon />
          ),
          uncheck: multipleSelection ? (
            <CheckboxUnCheckedIcon />
          ) : (
            <RadioUncheckedIcon />
          ),
          halfCheck: <CheckboxCheckedIcon />,
          expandAll: <FontAwesomeIcon icon={faChevronDown} />,
          collapseAll: <FontAwesomeIcon icon={faChevronUp} />,
          parentClose: <FontAwesomeIcon icon={faChevronUp} />,
          parentOpen: null,
          leaf: null,
          expandClose: <FontAwesomeIcon icon={faChevronUp} />,
          expandOpen: <FontAwesomeIcon icon={faChevronDown} />,
        }}
      />
    </CheckboxTreeStyled>
  );
};

export default SelectionTree;
