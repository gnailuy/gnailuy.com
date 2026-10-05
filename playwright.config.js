const { defineConfig, devices } = require('@playwright/test');
const { existsSync } = require('node:fs');
const systemChrome = '/usr/bin/google-chrome-stable';
const executablePath = process.env.CHROME_PATH || (existsSync(systemChrome) ? systemChrome : undefined);
module.exports = defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  reporter: 'line',
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: executablePath ? { executablePath } : {}
  },
  webServer: {
    command: 'python3 -m http.server 4173 --directory public --bind 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } }
  ]
});
