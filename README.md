## Electron + TypeScript + React

Boilerplate for a project using Electron, React and Typescript.

## Installation

```
sudo dnf update -y
sudo dnf install mono-devel -y
sudo dnf install nuget nuget-devel -y
```

Use a package manager of your choice (npm, yarn, etc.) in order to install all dependencies

> npm install --legacy-peer-deps

```bash
export PUPPETEER_SKIP_DOWNLOAD='true'
# on Windows
SET PUPPETEER_SKIP_DOWNLOAD='true'
npm install --legacy-peer-deps
```

Detail installation

```bash
# install required dependencies
npm install @reduxjs/toolkit dotenv react react-dom react-hot-loader react-redux react-router-dom styled-components

# install electron dev-tools dependencies
npm install -D typescript file-loader @types/electron-devtools-installer @types/jest @types/react @types/react-dom @types/styled-components

# install build tools and plugins develop-dependencies
npm install -D @babel/core @babel/plugin-transform-runtime @babel/preset-env @babel/preset-react @babel/preset-typescript @electron-forge/cli @electron-forge/maker-deb @electron-forge/maker-rpm @electron-forge/maker-squirrel @electron-forge/maker-zip @electron-forge/plugin-webpack @typescript-eslint/eslint-plugin @typescript-eslint/parser babel-loader cross-env electron eslint eslint-config-prettier eslint-config-standard eslint-plugin-import eslint-plugin-node eslint-plugin-prettier eslint-plugin-promise eslint-plugin-react eslint-plugin-standard

# install testing dependencies
npm install -D jest npm-run-all prettier ts-jest

# install build tools dependencies
npm install -D @marshallofsound/webpack-asset-relocator-loader @testing-library/jest-dom @testing-library/react --legacy-peer-deps
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
## Technical Refferences

ipcMain:

* [ipcMain](https://www.electronjs.org/docs/latest/api/ipc-main)
* [IPC](https://www.geeksforgeeks.org/difference-between-shared-memory-model-and-message-passing-model-in-ipc/) - Share Memory Model and Message Passing Model

Electron Storage:
* [electron-store](https://github.com/sindresorhus/electron-store)
* [safeStorage](https://www.electronjs.org/docs/latest/api/safe-storage) - allows access to simple encryption and decryption of strings for storage on the local machine.
* [nedb](https://dev.to/ctxhou/local-data-storage-for-electron-2h4p) - local data storage example

## Contributing

Pull requests are always welcome 😃.

## License

[MIT](https://choosealicense.com/licenses/mit/)
