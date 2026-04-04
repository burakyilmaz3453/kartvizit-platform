/**
 * Vercel Speed Insights initialization
 * This file loads and initializes Vercel Speed Insights for the application.
 */

// Import the injectSpeedInsights function from the package
import { injectSpeedInsights } from './node_modules/@vercel/speed-insights/dist/index.mjs';

// Initialize Speed Insights
injectSpeedInsights({
  debug: false, // Set to true in development if you want to see debug logs
  framework: 'vanilla' // Specify that this is a vanilla JavaScript project
});
