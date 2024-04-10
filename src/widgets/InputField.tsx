import { ReactNode, InputHTMLAttributes } from 'react'
import styled from 'styled-components'

export const Container = styled.input`
  padding: 0.2em 0.4em;
  font-size: 16px;
  font-weight: bold;
`;

type InputProps = {
  // children: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function InputField(props: InputProps) {
  return <Container type="text" {...props} />
}
