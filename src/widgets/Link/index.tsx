import { ReactNode, LinkHTMLAttributes } from 'react'

import { Container } from './styles'

type Props = {
  children: ReactNode;
} & LinkHTMLAttributes<HTMLLinkElement>;

export function Link(props: Props) {
  return <Container type="link" {...props} />
}
