## Electron + TypeScript + React

Boilerplate for a project using Electron, React and Typescript.

## Installation

Use a package manager of your choice (npm, yarn, etc.) in order to install all dependencies

> npm install -D @babel/core @babel/plugin-transform-runtime @babel/preset-env @babel/preset-react @babel/preset-typescript @electron-forge/cli @electron-forge/maker-deb @electron-forge/maker-rpm @electron-forge/maker-squirrel @electron-forge/maker-zip @electron-forge/plugin-webpack
> npm install -D @types/electron-devtools-installer @types/jest @types/react @types/react-dom @types/styled-components @typescript-eslint/eslint-plugin @typescript-eslint/parser babel-loader cross-env electron eslint eslint-config-prettier eslint-config-standard eslint-plugin-import eslint-plugin-node eslint-plugin-prettier eslint-plugin-promise eslint-plugin-react eslint-plugin-standard
> npm install -D file-loader jest npm-run-all prettier ts-jest typescript
> npm install -D @marshallofsound/webpack-asset-relocator-loader @testing-library/jest-dom @testing-library/react --legacy-peer-deps
```

## Usage

Just run `start` script.

```bash
npm start
// or
yarn start
```

## Packaging

To generate the project package based on the OS you're running on, just run:

```bash
npm run package
// or
yarn package
```

## Contributing

Pull requests are always welcome 😃.

## License

[MIT](https://choosealicense.com/licenses/mit/)
