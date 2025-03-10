// plotVerifier.js
// Utility to verify all plots in the metaverse map

import MondrianLayout from './MondrianLayout.js';

/**
 * Verifies if all plots in the map are correctly numbered from 0 to the total number of plots - 1
 * @param {Array<number>} bitmapData The array of plot sizes
 * @returns {Object} An object with verification results
 */
export function verifyPlots(bitmapData) {
  // Generate the layout using MondrianLayout
  const mondrian = new MondrianLayout(bitmapData);
  const size = mondrian.getSize();
  
  // Apply the same scale factor as in MetaverseViewer
  const scaleFactor = 20;
  const scaledSize = {
    width: size.width * scaleFactor,
    height: size.height * scaleFactor
  };
  
  // Process the layout data into cube data
  const processedCubes = [];
  
  for (const slot of mondrian.slots) {
    // Apply the scale factor to positions and sizes
    processedCubes.push({
      position: [
        (slot.position.x + slot.size / 2) * scaleFactor, 
        slot.size / 2 * scaleFactor, 
        (slot.position.y + slot.size / 2) * scaleFactor
      ],
      size: slot.size * scaleFactor
    });
  }
  
  // Create a grid to properly sort plots
  // First, determine the grid dimensions
  const gridWidth = Math.ceil(scaledSize.width);
  const gridHeight = Math.ceil(scaledSize.height);
  
  // Create a 2D grid to map positions to indices
  const grid = Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(-1));
  
  // Assign each plot to its grid cells
  processedCubes.forEach((cube, index) => {
    const x = Math.floor(cube.position[0] - cube.size / 2);
    const z = Math.floor(cube.position[2] - cube.size / 2);
    const plotSize = Math.ceil(cube.size);
    
    // Mark all cells covered by this plot
    for (let i = 0; i < plotSize; i++) {
      for (let j = 0; j < plotSize; j++) {
        const gridX = x + i;
        const gridZ = z + j;
        
        if (gridX >= 0 && gridX < gridWidth && gridZ >= 0 && gridZ < gridHeight) {
          grid[gridZ][gridX] = index;
        }
      }
    }
  });
  
  // Create a mapping of plot indices to their new numbers
  const plotNumberMap = {};
  let plotNumber = 0;
  
  // Assign numbers from left to right, top to bottom
  for (let z = 0; z < gridHeight; z++) {
    for (let x = 0; x < gridWidth; x++) {
      const index = grid[z][x];
      if (index !== -1 && plotNumberMap[index] === undefined) {
        plotNumberMap[index] = plotNumber++;
      }
    }
  }
  
  // Assign plot numbers based on the mapping
  processedCubes.forEach((cube, index) => {
    cube.plotNumber = plotNumberMap[index] !== undefined ? plotNumberMap[index] : index;
  });
  
  // Check if we have the correct number of plots
  const totalPlots = plotNumber;
  const expectedPlots = bitmapData.length;
  const isCorrect = totalPlots === expectedPlots;
  
  // Check if all plot numbers from 0 to expectedPlots-1 exist
  const plotNumbers = new Set();
  processedCubes.forEach(cube => {
    if (cube.plotNumber !== undefined) {
      plotNumbers.add(cube.plotNumber);
    }
  });
  
  const missingPlotNumbers = [];
  for (let i = 0; i < expectedPlots; i++) {
    if (!plotNumbers.has(i)) {
      missingPlotNumbers.push(i);
    }
  }
  
  // Check for duplicate plot numbers
  const plotNumberCounts = {};
  processedCubes.forEach(cube => {
    if (cube.plotNumber !== undefined) {
      plotNumberCounts[cube.plotNumber] = (plotNumberCounts[cube.plotNumber] || 0) + 1;
    }
  });
  
  const duplicatePlotNumbers = Object.entries(plotNumberCounts)
    .filter(([_, count]) => count > 1)
    .map(([number, _]) => parseInt(number));
  
  // Get the highest plot number
  const highestPlotNumber = Math.max(...Array.from(plotNumbers));
  
  return {
    totalPlots,
    expectedPlots,
    isCorrect,
    missingPlotNumbers,
    duplicatePlotNumbers,
    highestPlotNumber,
    plotNumbers: Array.from(plotNumbers).sort((a, b) => a - b)
  };
}

/**
 * Checks if a specific plot number exists in the map
 * @param {Array<number>} bitmapData The array of plot sizes
 * @param {number} plotNumber The plot number to check
 * @returns {Object} Information about the plot
 */
export function checkPlotNumber(bitmapData, plotNumber) {
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