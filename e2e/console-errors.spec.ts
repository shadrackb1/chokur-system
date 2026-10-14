
import { test, expect } from '@playwright/test';

test.describe('Chokur System - Console Error Check', () => {
  const routes = ['/welcome', '/overview', '/marks-entry', '/rankings', '/subject-analysis', '/grade-distribution', '/report-cards', '/students', '/settings'];
  
  for (const route of routes) {
    test(`Route ${route} loads without console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      page.on('pageerror', error => {
        errors.push(error.message);
      });
      
      await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      expect(errors).toHaveLength(0);
    });
  }
});
