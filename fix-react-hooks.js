// Script to fix React hooks usage with React namespace
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Find all TypeScript/React files
const pattern = 'src/**/*.{ts,tsx}';
const files = glob.sync(pattern);

let fixedCount = 0;

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Replace hook calls with React prefix
    const hooks = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext', 'useReducer'];

    hooks.forEach(hook => {
      const regex = new RegExp(`\\b${hook}\\b`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `React.${hook}`);
        modified = true;
      }
    });

    // Also handle Component and other React exports
    const reactExports = ['Component', 'PureComponent', 'Fragment', 'Suspense', 'memo', 'forwardRef'];

    reactExports.forEach(exportName => {
      const regex = new RegExp(`\\b${exportName}\\b`, 'g');
      if (regex.test(content) && !content.includes(`React.${exportName}`)) {
        content = content.replace(regex, `React.${exportName}`);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(file, content);
      console.log(`Fixed: ${file}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`\nFixed React hooks in ${fixedCount} files.`);
