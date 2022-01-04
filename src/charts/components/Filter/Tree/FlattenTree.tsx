import React from 'react';
import { NodeStyled } from './Styled';

const Node = ({data, iconCheck, iconUncheck, children, selectedItems, onChange}) => {
  return (
    <NodeStyled>
      <div onClick={(e) => e.preventDefault()}>
        <span
          onClick={(e) => {
            const flag = !selectedItems.includes(data.value);
            e.preventDefault();
            onChange({value: data.value, flag: flag});
          }}
        >
          {selectedItems.includes(data.value) ? iconCheck : iconUncheck}{" "}
          {data.label}
        </span>
      </div>
      {children}
    </NodeStyled>
  );
};

const Tree = ({data, iconCheck, iconUncheck, selectedItems, ...otherProps}) => {
  if (!data) {
    return null;
  }



  return (
    <ul>
      {data.map(({label, value}) => (
        // @ts-ignore
        <Node
          data={{label, value}}
          iconCheck={iconCheck}
          iconUncheck={iconUncheck}
          selectedItems={selectedItems}
          {...otherProps}
        />
      ))}
    </ul>
  );
};

export default Tree;
