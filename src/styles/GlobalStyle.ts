import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  html, body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 16px;
    color: #5F5F5F;
    background: #FFF;
    height: 100%;
  }
  #root {
    height: 100%;
    display: flex;
    flex-flow: column;
    padding-bottom: 0.25em;
  }
  .flex-row {
    display: flex;
    flex-flow: row;
  }
  .flex-col {
    display: flex;
    flex-flow: column;
  }
  .flex-auto { flex: 1 1 auto; min-height: 1px; }
  .justify-center { justify-content: center; }
  .justify-start: { justify-content: flex-start; }
  .justify-end: { justify-content: flex-end; }
  .align-center { align-items: center; }
  .text-center { text-align: center; }

  .section {
    padding: 0.2em 0.6em;
  }
  :root {
    --color-default: #CCC;
    --color-primary: #1c85c7;
    --color-warn: #c7b51c;
    --color-danger: #ff4444;
    --color-success: #5bc32a;
  }
`
