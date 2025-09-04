// Simple script to fix React imports using standard pattern
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

    // Remove all existing React imports first
    content = content.replace(/import\s+\*\s+as\s+React\s+from\s+['"]react['"];\s*/g, '');
    content = content.replace(/import\s+React\s+from\s+['"]react['"];\s*/g, '');
    content = content.replace(/import\s+\{\s*[^}]+\}\s+from\s+['"]react['"];\s*/g, '');

    // Add standard React import at the top (after "use client")
    const reactImport = `import React from 'react';\n`;

    if (content.includes('"use client"')) {
      content = content.replace(/"use client";\s*/, '"use client";\n\n' + reactImport);
    } else if (content.includes("'use client'")) {
      content = content.replace(/'use client';\s*/, "'use client';\n\n" + reactImport);
    } else {
      content = reactImport + content;
    }

    modified = true;

    if (modified) {
      fs.writeFileSync(file, content);
      console.log(`Fixed: ${file}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`\nFixed React imports in ${fixedCount} files.`);
