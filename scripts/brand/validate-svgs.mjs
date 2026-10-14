#!/usr/bin/env node
/**
 * SVG Validation Script
 * Validates all brand SVGs meet requirements
 * Run with: node scripts/brand/validate-svgs.mjs
 */

import { promises as fs } from 'fs';
import path from 'path';

const BRAND_DIR = path.resolve('./public/brand');
const ALLOWED_COLORS = ['#111111', '#F6F1E7', '#C2410C', '#111', '#F6F1E7', '#C2410C']; // with and without full hex
const MAX_SIZE_KB = 4;

async function validateSVGs() {
  console.log('Validating brand SVGs...\n');
  
  const files = await fs.readdir(BRAND_DIR);
  const svgFiles = files.filter(f => f.endsWith('.svg') && f !== 'logo-directions.svg');
  
  let allPassed = true;
  
  for (const file of svgFiles) {
    const filePath = path.join(BRAND_DIR, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);
    const sizeKB = stats.size / 1024;
    
    console.log(`Checking ${file} (${sizeKB.toFixed(2)} KB)...`);
    let passed = true;
    
    // 1. Valid XML (basic check)
    if (!content.trim().startsWith('<svg')) {
      console.log(`  ❌ Does not start with <svg>`);
      passed = false;
    }
    if (!content.includes('xmlns="http://www.w3.org/2000/svg"')) {
      console.log(`  ❌ Missing xmlns attribute`);
      passed = false;
    }
    
    // 2. Has viewBox
    if (!content.includes('viewBox')) {
      console.log(`  ❌ Missing viewBox`);
      passed = false;
    }
    
    // 3. Has title for accessibility
    if (!content.includes('<title>')) {
      console.log(`  ❌ Missing <title> for accessibility`);
      passed = false;
    }
    
    // 4. Has role="img"
    if (!content.includes('role="img"')) {
      console.log(`  ❌ Missing role="img"`);
      passed = false;
    }
    
    // 5. No <text> elements (text converted to paths)
    if (content.includes('<text')) {
      console.log(`  ❌ Contains <text> elements - text should be outlined paths`);
      passed = false;
    }
    
    // 6. Only allowed fill colours
    const fillMatches = content.match(/fill=["']([^"']+)["']/g) || [];
    for (const match of fillMatches) {
      const color = match.replace(/fill=["']([^"']+)["']/, '$1');
      // Check if it's one of our allowed colours or a CSS variable reference
      const isAllowed = ALLOWED_COLORS.some(c => color.includes(c)) || 
                       color.startsWith('var(') || 
                       color === 'currentColor' ||
                       color === 'none';
      if (!isAllowed) {
        console.log(`  ❌ Disallowed fill colour: ${color}`);
        passed = false;
      }
    }
    
    // 7. Check stroke colours too
    const strokeMatches = content.match(/stroke=["']([^"']+)["']/g) || [];
    for (const match of strokeMatches) {
      const color = match.replace(/stroke=["']([^"']+)["']/, '$1');
      const isAllowed = ALLOWED_COLORS.some(c => color.includes(c)) || 
                       color.startsWith('var(') || 
                       color === 'currentColor' ||
                       color === 'none';
      if (!isAllowed) {
        console.log(`  ❌ Disallowed stroke colour: ${color}`);
        passed = false;
      }
    }
    
    // 8. File size under 4KB
    if (sizeKB > MAX_SIZE_KB) {
      console.log(`  ❌ File size ${sizeKB.toFixed(2)} KB exceeds ${MAX_SIZE_KB} KB limit`);
      passed = false;
    }
    
    // 9. No unused defs or metadata (basic check)
    if (content.includes('<metadata') || content.includes('<defs>')) {
      // Check if defs are actually used
      if (content.includes('<defs>') && !content.match(/<defs>[\s\S]*<\/defs>/)) {
        console.log(`  ⚠️  Has <defs> - verify they are used`);
      }
    }
    
    if (passed) {
      console.log(`  ✅ Passed`);
    } else {
      allPassed = false;
    }
    console.log('');
  }
  
  if (allPassed) {
    console.log('✅ All SVG validations passed!');
    process.exit(0);
  } else {
    console.log('❌ Some SVG validations failed');
    process.exit(1);
  }
}

validateSVGs().catch(console.error);