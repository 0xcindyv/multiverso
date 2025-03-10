// plotVerifierTest.ts
// Test script to verify all plots in the map

import { verifyPlots } from './plotVerifier';

// Default bitmap data from App.tsx
const defaultBitmapString = '5,6,6,5,6,5,7,5,5,6,6,8,5,5,5,5,6,5,4,6,5,5,5,5,5,6,5,5,5,5,5,7,5,7,5,5,5,5,5,5,5,5,5,4,5,5,5,5,5,5,5,4,5,5,4,5,5,5,5,4,4,5,4,6,4,5,4,5,5,4,4,4,5,5,6,5,5,4,4,6,5,4,5,5,5,4,5,4,5,5,4,4,4,4,4,3,4,3,3,3,5,5,4,3,3,3,2,3,4,3,5,4,3,3,3,4,3,4,5,2,4,5,5,5,5,5,4,5,4,4,4,4,3,4,3,5,5,4,5,4,4,3,5,4,4,5,5,5,5,3,4,5,5,3,4,4,5,2,3,5,4,5,5,5,5,4,4,3,4,4,3,4,4,3,3,3,4,3,4,3,4,4,4,4,4,3,3,4,3,4,4,4,4,4,4,4,3,4,4,4,4,4,3,3,3,4,4,4,4,4,3,3,3,3,4,3,3,4,3,3,4,3,4,1,3,3,3,4,2,4,3,4,5,2,3,4,3,3,3,4,3,3,4,3,2,2,2,3,3,2,2,3,3,2,2,2,4,3,3,3,1,3,2,1,1,1,1,1,4,2,3,1,2,1,2,4,2,2,8,3,3';

// Parse the bitmap string into an array of numbers
const parseBitmapString = (str: string): number[] => {
  return str.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
};

// Run the verification
const bitmapData = parseBitmapString(defaultBitmapString);
const results = verifyPlots(bitmapData);

// Display the results
console.log('Plot Verification Results:');
console.log('-------------------------');
console.log(`Total plots found: ${results.totalPlots}`);
console.log(`Expected plots: ${results.expectedPlots}`);
console.log(`Is correct: ${results.isCorrect ? 'Yes' : 'No'}`);

if (results.missingPlotNumbers.length > 0) {
  console.log(`Missing plot numbers: ${results.missingPlotNumbers.join(', ')}`);
} else {
  console.log('No missing plot numbers');
}

if (results.duplicatePlotNumbers.length > 0) {
  console.log(`Duplicate plot numbers: ${results.duplicatePlotNumbers.join(', ')}`);
} else {
  console.log('No duplicate plot numbers');
}

console.log(`Highest plot number: ${results.highestPlotNumber}`);

// If there are issues, provide more detailed information
if (!results.isCorrect || results.missingPlotNumbers.length > 0 || results.duplicatePlotNumbers.length > 0) {
  console.log('\nDetailed Analysis:');
  console.log('-------------------------');
  
  if (results.totalPlots < results.expectedPlots) {
    console.log(`There are ${results.expectedPlots - results.totalPlots} plots missing from the expected total.`);
    console.log('This could be due to:');
    console.log('1. The layout algorithm not generating enough plots');
    console.log('2. The numbering algorithm skipping some indices');
  } else if (results.totalPlots > results.expectedPlots) {
    console.log(`There are ${results.totalPlots - results.expectedPlots} extra plots beyond the expected total.`);
    console.log('This could be due to:');
    console.log('1. The layout algorithm generating more plots than expected');
    console.log('2. Duplicate plots being counted multiple times');
  }
  
  if (results.missingPlotNumbers.length > 0) {
    console.log(`\nMissing plot numbers (${results.missingPlotNumbers.length}): ${results.missingPlotNumbers.join(', ')}`);
    console.log('This means these plot numbers are not assigned to any plot in the map.');
  }
  
  if (results.duplicatePlotNumbers.length > 0) {
    console.log(`\nDuplicate plot numbers (${results.duplicatePlotNumbers.length}): ${results.duplicatePlotNumbers.join(', ')}`);
    console.log('This means these plot numbers are assigned to multiple plots in the map.');
  }
} 