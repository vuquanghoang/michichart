import styled from "styled-components";

export const NodeStyled = styled.li`
  list-style-type: none;
  > div:first-child {
    display: flex;
    button {
      background: transparent;
      border: 0;
    }
  }
  span {
    display: flex;
    align-items: center;
  }
  > ul {
    display: none;
    transform: translateY(-10px);
    opacity: 0;
    transition: opacity 0.1s ease-out, transform 0.1s ease-out;
  }

  &.expanded {
    > ul {
      display: block;
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

export const BranchStyled = styled.ul`
  padding-left: 10px;
`;