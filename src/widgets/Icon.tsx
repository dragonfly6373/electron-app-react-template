import { ReactNode, HTMLAttributes } from 'react'
import styled from 'styled-components'

export const Container = styled.span``;

type InputProps = {
  // children: ReactNode;
  type: string;
} & HTMLAttributes<HTMLSpanElement>;

export function Icon(props: InputProps) {
  return <Container className={"icon fonticons-" + props.type} />
}
