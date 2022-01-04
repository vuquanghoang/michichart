import React, { useEffect, useState } from 'react';
import { BranchStyled, NodeStyled } from './Styled';
import intersection from 'lodash/intersection';
import flattenDeep from 'lodash/flattenDeep';

interface NodeProps {
  data,
  iconCollapse,
  iconExpand,
  iconCheck,
  iconUncheck,
  children,
  selectedItems,
  isExpandedOnInit,
  onChange,
}

const Node = ({
  data,
  iconCollapse,
  iconExpand,
  iconCheck,
  iconUncheck,
  children,
  selectedItems,
  isExpandedOnInit,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(!!isExpandedOnInit);

  useEffect(() => {

    if (data.children && intersection(
      selectedItems,
      // @ts-ignore
      flattenDeep(data.children).map(({ value }) => value)
    ).length > 0) {
      setIsExpanded(true);
    }
  }, []);

  return (
    <NodeStyled className={isExpanded ? 'expanded' : ''}>
      <div>
        <span
          onClick={(e) => {
            const flag = !selectedItems.includes(data.value);
            e.preventDefault();
            onChange({ value: data.value, flag: flag });
          }}
        >
          {selectedItems.includes(data.value) ? iconCheck : iconUncheck} {data.label}
        </span>
        {data?.children && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? iconCollapse : iconExpand}
          </button>
        )}
      </div>
      {children}
    </NodeStyled>
  );
};

const Branch = ({ children }) => <BranchStyled>{children}</BranchStyled>;

const Root = ({
  data,
  iconCheck,
  iconUncheck,
  iconCollapse,
  iconExpand,
  selectedItems,
  expandByDefault,
  level = 0,
  ...otherProps
}) => {
  if (!data || !data.value || !data.label) {
    return null;
  }

  return (
    // @ts-ignore
    <Node
      data={data}
      iconCollapse={iconCollapse}
      iconExpand={iconExpand}
      iconCheck={iconCheck}
      iconUncheck={iconUncheck}
      selectedItems={selectedItems}
      isExpandedOnInit={level <= expandByDefault}
      {...otherProps}
    >
      {data.children &&
        data.children.map((item) => (
          <Branch key={item.code}>
            <Root
              data={item}
              iconCheck={iconCheck}
              iconUncheck={iconUncheck}
              iconCollapse={iconCollapse}
              iconExpand={iconExpand}
              selectedItems={selectedItems}
              expandByDefault={expandByDefault}
              level={level + 1}
              {...otherProps}
            />
          </Branch>
        ))}
    </Node>
  );
};

const Tree = (props) => <Root {...props} />;

export default Tree;
