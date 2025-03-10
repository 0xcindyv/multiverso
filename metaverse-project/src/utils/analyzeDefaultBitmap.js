// analyzeDefaultBitmap.js
// Simple script to analyze the default bitmap data

// Default bitmap data from App.tsx
const defaultBitmapString = '5,6,6,5,6,5,7,5,5,6,6,8,5,5,5,5,6,5,4,6,5,5,5,5,5,6,5,5,5,5,5,7,5,7,5,5,5,5,5,5,5,5,5,4,5,5,5,5,5,5,5,4,5,5,4,5,5,5,5,4,4,5,4,6,4,5,4,5,5,4,4,4,5,5,6,5,5,4,4,6,5,4,5,5,5,4,5,4,5,5,4,4,4,4,4,3,4,3,3,3,5,5,4,3,3,3,2,3,4,3,5,4,3,3,3,4,3,4,5,2,4,5,5,5,5,5,4,5,4,4,4,4,3,4,3,5,5,4,5,4,4,3,5,4,4,5,5,5,5,3,4,5,5,3,4,4,5,2,3,5,4,5,5,5,5,4,4,3,4,4,3,4,4,3,3,3,4,3,4,3,4,4,4,4,4,3,3,4,3,4,4,4,4,4,4,4,3,4,4,4,4,4,3,3,3,4,4,4,4,4,3,3,3,3,4,3,3,4,3,3,4,3,4,1,3,3,3,4,2,4,3,4,5,2,3,4,3,3,3,4,3,3,4,3,2,2,2,3,3,2,2,3,3,2,2,2,4,3,3,3,1,3,2,1,1,1,1,1,4,2,3,1,2,1,2,4,2,2,8,3,3';

// Parse the bitmap string into an array of numbers
const parseBitmapString = (str) => {
  return str.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
};

// Analyze the bitmap data
const analyzeBitmap = (bitmapData) => {
  // Count the total number of plots
  const totalPlots = bitmapData.length;
  
  // Count plots by size
  const plotsBySize = {};
  bitmapData.forEach(size => {
    plotsBySize[size] = (plotsBySize[size] || 0) + 1;
  });
  
  // Calculate the total area
  const totalArea = bitmapData.reduce((sum, size) => sum + size * size, 0);
  
  // Calculate the expected grid size
  const gridSize = Math.ceil(Math.sqrt(totalArea));
  
  return {
    totalPlots,
    plotsBySize,
    totalArea,
    gridSize
  };
};

// Run the analysis
const bitmapData = parseBitmapString(defaultBitmapString);
const results = analyzeBitmap(bitmapData);

// Display the results
console.log('Bitmap Analysis Results:');
console.log('-------------------------');
console.log(`Total plots in bitmap data: ${results.totalPlots}`);
console.log(`Total area of all plots: ${results.totalArea} square units`);
console.log(`Estimated grid size: ${results.gridSize} x ${results.gridSize}`);

console.log('\nPlots by size:');
Object.entries(results.plotsBySize)
  .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
  .forEach(([size, count]) => {
    console.log(`Size ${size}: ${count} plots (${count * 100 / results.totalPlots}%)`);
  });

// Check if the total number of plots matches the expected count
const expectedPlots = bitmapData.length;
if (results.totalPlots === expectedPlots) {
  console.log(`\nThe total number of plots (${expectedPlots}) matches the expected count.`);
} else {
  console.log(`\nWarning: The total number of plots (${results.totalPlots}) does not match the expected count (${expectedPlots}).`);
  
  if (results.totalPlots < expectedPlots) {
    console.log(`There are ${expectedPlots - results.totalPlots} plots missing.`);
  } else {
    console.log(`There are ${results.totalPlots - expectedPlots} extra plots.`);
  }
} 