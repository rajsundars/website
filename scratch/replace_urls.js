const fs = require('fs');
const path = require('path');

// 1. Write src/config.ts relative to workspace folder
const configPath = path.join(process.cwd(), 'src/config.ts');
console.log("Writing config to:", configPath);
fs.writeFileSync(configPath, 'export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";\n', 'utf8');

// 2. Helper to recursively find .tsx files
function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, files);
    } else if (file.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const appDir = path.join(process.cwd(), 'src/app');
console.log("Scanning app files in:", appDir);
const tsxFiles = getFiles(appDir);

for (const file of tsxFiles) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('http://localhost:5000')) {
    console.log('Processing URL replacements for:', path.basename(file));
    
    // Inject import at the top (after "use client" if present)
    const importStr = '\nimport { API_BASE_URL } from "@/config";\n';
    if (content.includes('"use client";')) {
      content = content.replace('"use client";', '"use client";' + importStr);
    } else if (content.includes("'use client';")) {
      content = content.replace("'use client';", "'use client';" + importStr);
    } else {
      content = importStr + content;
    }

    // Replace double quote strings
    content = content.replace(/"http:\/\/localhost:5000/g, 'API_BASE_URL + "');
    // Replace single quote strings
    content = content.replace(/'http:\/\/localhost:5000/g, "API_BASE_URL + '");
    // Replace backtick template strings (only matches remainder, e.g. inside template literals)
    content = content.replace(/http:\/\/localhost:5000/g, '${API_BASE_URL}');

    fs.writeFileSync(file, content, 'utf8');
  }
}
console.log('URLs refactored successfully!');
