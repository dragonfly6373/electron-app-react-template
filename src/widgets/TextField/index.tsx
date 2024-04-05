import { ReactNode, InputHTMLAttributes } from 'react'

import { Container } from './styles'

type InputProps = {
  children: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function InputField(props: InputProps) {
  return <Container type="text" {...props} />
}
