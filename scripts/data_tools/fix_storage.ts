import fs from 'fs';
const appPath = './src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

const storageHelper = `
const safeStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Ignored
    }
  }
};
`;

// Insert the storageHelper after the first import block or something similar.
// Since App.tsx has many imports, let's inject it before `export default function App() {`
code = code.replace("export default function App() {", storageHelper + "\nexport default function App() {");

code = code.replace(/localStorage\./g, 'safeStorage.');

fs.writeFileSync(appPath, code);
