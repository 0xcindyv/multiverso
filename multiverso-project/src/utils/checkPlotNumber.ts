// checkPlotNumber.ts
// Utility to check if a specific plot number exists in the map

import { verifyPlots } from './plotVerifier';

/**
 * Checks if a specific plot number exists in the map
 * @param bitmapData The array of plot sizes
 * @param plotNumber The plot number to check
 * @returns Information about the plot
 */
export function checkPlotNumber(bitmapData: number[], plotNumber: number) {
  const results = verifyPlots(bitmapData);
  
  const exists = results.plotNumbers.includes(plotNumber);
  const isInRange = plotNumber >= 0 && plotNumber < results.expectedPlots;
  
  return {
    exists,
    isInRange,
    totalPlots: results.totalPlots,
    expectedPlots: results.expectedPlots,
    highestPlotNumber: results.highestPlotNumber,
    message: exists 
      ? `Plot #${plotNumber} exists in the map.` 
      : isInRange 
        ? `Plot #${plotNumber} should exist but is missing from the map.` 
        : `Plot #${plotNumber} is out of range. Valid plot numbers are 0-${results.expectedPlots - 1}.`
  };
}

// If this script is run directly, check for plot #281
if (require.main === module) {
  // Default bitmap data from App.tsx
  const defaultBitmapString = '5,6,6,5,6,5,7,5,5,6,6,8,5,5,5,5,6,5,4,6,5,5,5,5,5,6,5,5,5,5,5,7,5,7,5,5,5,5,5,5,5,5,5,4,5,5,5,5,5,5,5,4,5,5,4,5,5,5,5,4,4,5,4,6,4,5,4,5,5,4,4,4,5,5,6,5,5,4,4,6,5,4,5,5,5,4,5,4,5,5,4,4,4,4,4,3,4,3,3,3,5,5,4,3,3,3,2,3,4,3,5,4,3,3,3,4,3,4,5,2,4,5,5,5,5,5,4,5,4,4,4,4,3,4,3,5,5,4,5,4,4,3,5,4,4,5,5,5,5,3,4,5,5,3,4,4,5,2,3,5,4,5,5,5,5,4,4,3,4,4,3,4,4,3,3,3,4,3,4,3,4,4,4,4,4,3,3,4,3,4,4,4,4,4,4,4,3,4,4,4,4,4,3,3,3,4,4,4,4,4,3,3,3,3,4,3,3,4,3,3,4,3,4,1,3,3,3,4,2,4,3,4,5,2,3,4,3,3,3,4,3,3,4,3,2,2,2,3,3,2,2,3,3,2,2,2,4,3,3,3,1,3,2,1,1,1,1,1,4,2,3,1,2,1,2,4,2,2,8,3,3';

  // Parse the bitmap string into an array of numbers
  const parseBitmapString = (str: string): number[] => {
    return str.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
  };

  // Check for plot #281
  const bitmapData = parseBitmapString(defaultBitmapString);
  const plotNumberToCheck = 281;
  const result = checkPlotNumber(bitmapData, plotNumberToCheck);
  
  console.log(`Checking for Plot #${plotNumberToCheck}:`);
  console.log('-------------------------');
  console.log(`Exists: ${result.exists ? 'Yes' : 'No'}`);
  console.log(`In valid range: ${result.isInRange ? 'Yes' : 'No'}`);
  console.log(`Total plots: ${result.totalPlots}`);
  console.log(`Expected plots: ${result.expectedPlots}`);
  console.log(`Highest plot number: ${result.highestPlotNumber}`);
  console.log(`Message: ${result.message}`);
} 