import React from "react";
import sortBy from "lodash/sortBy";
import styled from "styled-components";
import afcfta from "./mockData/afcfta.json";
import rec from "./mockData/rec.json";
import regions from "./mockData/regions.json";
import status from "./mockData/status.json";

const SuggestedListStyled = styled.div`
  height: 200px;
  border: 1px solid #eee;
`;

interface SuggestedListProps {
  keyword: string,
  selectedItems: string[],
  onSelect: (e) => void,
  className?: string,
}

const SuggestedList = ({ keyword = "", selectedItems, onSelect, className = '' }) => {
  const data = [...afcfta, ...rec, ...regions, ...status];

  return (
    <SuggestedListStyled className={className}>
      {keyword.length > 1 && (
        <>
          <ul>
            {sortBy(
              data.filter(
                (d) =>
                  d.label.toLowerCase().trim().indexOf(keyword.toLowerCase().trim()) !== -1 &&
                  !selectedItems.includes(d.value)
              ),
              ["label"]
            ).map((d) => (
              <li onClick={() => onSelect({ ...d, flag: true })}>{d.label}</li>
            ))}
          </ul>
          {data.filter((d) => d.label.toLowerCase().indexOf(keyword.toLowerCase().trim()) !== -1).length === 0 && (
            <span>No region found</span>
          )}
        </>
      )}
    </SuggestedListStyled>
  );
};

export default SuggestedList;
