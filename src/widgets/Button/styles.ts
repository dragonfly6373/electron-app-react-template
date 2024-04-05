import styled from 'styled-components';

export const Container = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 0.3em;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  line-height: 1.2em;
  color: white;
  cursor: pointer;

  &.primary {
    background-color: var(--color-primary);
  }

  &.warn {
    background-color: var(--color-warn);
  }

  &.danger {
    background-color: var(--color-danger);
  }

  &.success {
    background-color: var(--color-success);
  }

  &.square {
    height: 100%;
    aspect-ratio: 1;
  }

  &.circle {
    height: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
  }

  &.sm {
    padding: 0.2em 0.4em;
    &.icon { width: 1.6em; }
  }

  &.md {
    padding: 0.3em 0.6em;
    &.icon { width: 2.2em; }
  }

  &.lg {
    padding: 0.5em 0.8em;
    &.icon { width: 2.8em; }
  }

  &:hover {
    filter: brightness(0.9);
  }

  &:active {
    filter: brightness(0.7);
  }
`
