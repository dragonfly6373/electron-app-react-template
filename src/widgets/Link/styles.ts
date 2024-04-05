import styled from 'styled-components'

export const Container = styled.link`
  padding: 0 24px;

  color: #0FF;
  font-size: 16px;
  font-weight: bold;

  cursor: pointer;

  &:hover {
    filter: brightness(0.9);
  }

  &:active {
    filter: brightness(0.7);
  }
`
