# TON Contract Frontend

This project is related to the creation fisrt contract frontend. This project is the task on the:

- Platform: [Stepik](https://stepik.org/catalog)
- Course: [TON & Telegram Blockchain Сourse](https://stepik.org/course/176754/syllabus)

## Prerequisites

### Node.js

Check if you have an installed Node.js on your local machine. To check this enter the following command

```bash
node -v
```

- If you get something like `v23.3.0`, that means you have installed Node.js on your device.
- If it is failed, then follow the link to install Node.js for you local machine: [Node.js Download](https://nodejs.org/en/download/package-manager)

## Steps to re-do the task from scratch

### 1. Create Node + Vite + Typescript project

To start we need to create our project using `Vite` and `Typescript` template. For this we need to run this commands:

```bash
yarn create vite first_contract_frontend --template react-ts
cd first_contract_frontend && yarn
```

**or**

```bash
npx create-vite@latest first_contract_frontend --template react-ts
cd first_contract_frontend && npm install
```

### 2. Add additional libraries

For working with TON we need to add extra libraries:

- `ton`
- `ton-core`
- `ton-crypto`
- `@orbs-network/ton-access`

```bash
yarn add ton ton-core ton-crypto
yarn add @orbs-network/ton-access
```

**or**

```bash
npm install ton ton-core ton-crypto
npm install @orbs-network/ton-access
```

### 3. Add polyfills plugin

Additionally, we need to add `vite-plugin-node-polyfills` to our project. We can do this using this command:

```bash
yarn add vite-plugin-node-polyfills
```

**or**

```bash
npm install vite-plugin-node-polyfills
```

!!! If the command `npm` is failed, try to use this one `npm install vite-plugin-node-polyfills --legacy-peer-deps`

### 4. Update `vite.configs.ts` file:

Before running our application, we need to modify (overwrite) `vite.configs.ts` file with that code:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  base: "/",
});
```

### 5. Run Application

To run this application you need to enter next command:

```bash
yarn dev
```

**or**

```
npm run dev
```

The result will be available here: http://localhost:5173/

## How to run the Application

TO run this code on your machine, you need to do next steps.

### 1. Clone repository

Open `bash` move to willing directory (for instance `\Downloads`) using:

```bash
cd Downloads
```

In `\Downloads` directory run command:

```bash
git clone https://github.com/BlacktorDied/TON-Learning.git
```

### 2. Install Dependencies

Open the project directory and install all dependencies usign these commands:

```bash
cd TON-Learning\first_contract_frontend && yarn
```

**or**

```bash
cd TON-Learning\first_contract_frontend && npm install
```

### 3. Run Application

Now you can run this project using this command:

```bash
yarn dev
```

**or**

```bash
npm run dev
```

The result will be available here: http://localhost:5173/

# References

- Stepick TON & Telegram Blockchain Course Chapter 5.1: https://stepik.org/lesson/1011508/step/3?unit=1019368
