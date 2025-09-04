// Script to fix React imports using namespace import pattern
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

    // Pattern 1: import { hooks } from 'react'; import React from 'react';
    const pattern1 = /import\s*\{\s*([^}]+)\s*\}\s*from\s+['"]react['"];\s*import\s+React\s+from\s+['"]react['"]/g;
    if (pattern1.test(content)) {
      content = content.replace(pattern1, (match, hooks) => {
        modified = true;
        return `import * as React from 'react';\nimport { ${hooks} } from 'react';`;
      });
    }

    // Pattern 2: import React from 'react'; import { hooks } from 'react';
    const pattern2 = /import\s+React\s+from\s+['"]react['"];\s*import\s*\{\s*([^}]+)\s*\}\s*from\s+['"]react['"]/g;
    if (pattern2.test(content)) {
      content = content.replace(pattern2, (match, hooks) => {
        modified = true;
        return `import * as React from 'react';\nimport { ${hooks} } from 'react';`;
      });
    }

    // Pattern 3: import React, { hooks } from 'react';
    const pattern3 = /import\s+React\s*,\s*\{\s*([^}]+)\s*\}\s*from\s+['"]react['"]/g;
    if (pattern3.test(content)) {
      content = content.replace(pattern3, (match, hooks) => {
        modified = true;
        return `import * as React from 'react';\nimport { ${hooks} } from 'react';`;
      });
    }

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
