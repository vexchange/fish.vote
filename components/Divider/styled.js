import styled from '@emotion/styled';
import { css } from '@emotion/react'

export const Wrapper = styled.div`
  hr {
    height: 1px;
    background-color: #F5A788;
    border: none;
    margin-bottom: 24px;
  }

  ${props => props.horizontal ? css`
    hr {
      width: 1px;
      height: 24px;
      background-color: #F5A788;
      border: none;
      margin-bottom: 24px;
    }
  ` : ``
  }
`;
