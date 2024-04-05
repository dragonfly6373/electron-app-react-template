import { Button } from '../../widgets/Button'
import { Container, Image, Text } from './styles'
import { useEffect } from 'react';

export function Greetings() {
  useEffect(() => {
    window.ipc.on("message", (data: any) => {
      console.log("new message from server:", data);
    });
  }, []);

  function handleSayHello() {
    window.ipc.sendMessage(JSON.stringify({event: 'greeting', data: 'Hello World'}));
    console.log('Message sent! Check main process log in terminal.')
  }

  return (
    <Container>
      <Image
        src="https://www.vectorlogo.zone/logos/reactjs/reactjs-icon.svg"
        alt="ReactJS logo"
      />
      <Text>An Electron boilerplate including TypeScript, React, Jest and ESLint.</Text>
      <Button onClick={handleSayHello}>Send message to main process</Button>
    </Container>
  )
}
 
