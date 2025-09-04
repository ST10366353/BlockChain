// Script to revert React hooks back to normal usage
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

    // Replace React.hook back to hook
    const hooks = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext', 'useReducer'];

    hooks.forEach(hook => {
      const regex = new RegExp(`React\.${hook}`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, hook);
        modified = true;
      }
    });

    // Also revert React.Component, etc.
    const reactExports = ['Component', 'PureComponent', 'Fragment', 'Suspense', 'memo', 'forwardRef'];

    reactExports.forEach(exportName => {
      const regex = new RegExp(`React\.${exportName}`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, exportName);
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

console.log(`\nReverted React hooks in ${fixedCount} files.`);
