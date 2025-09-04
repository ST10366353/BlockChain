// Script to fix React hooks usage with React namespace (excluding imports)
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

    // First, fix any broken import statements that the previous script created
    content = content.replace(/import\s*\{\s*React\.(\w+)\s*(,\s*React\.(\w+))*\s*\}\s*from\s+['"]react['"]/g,
                            (match, ...args) => {
      const hooks = args.filter((arg, index) => index % 2 === 0 && arg).join(', ');
      modified = true;
      return `import { ${hooks} } from 'react'`;
    });

    // Now replace hook calls with React prefix, but NOT in import statements
    const hooks = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext', 'useReducer'];

    hooks.forEach(hook => {
      // Use negative lookbehind to avoid replacing in import statements
      const regex = new RegExp(`(?<!import\\s*\\{[^}]*)(?<!from\\s*['"]react['"]\\s*;\\s*)\\b${hook}\\b`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `React.${hook}`);
        modified = true;
      }
    });

    // Also handle Component and other React exports (but not in imports)
    const reactExports = ['Component', 'PureComponent', 'Fragment', 'Suspense', 'memo', 'forwardRef'];

    reactExports.forEach(exportName => {
      const regex = new RegExp(`(?<!import\\s*\\{[^}]*)\\b${exportName}\\b(?!\\s*from\\s*['"]react['"])`, 'g');
      if (regex.test(content)) {
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
