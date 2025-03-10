// plotVerifier.ts
// Utility to verify all plots in the metaverse map

import MondrianLayout from './MondrianLayout';

/**
 * Verifies if all plots in the map are correctly numbered from 0 to the total number of plots - 1
 * @param bitmapData The array of plot sizes
 * @returns An object with verification results
 */
export function verifyPlots(bitmapData: number[]) {
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
  const processedCubes: any[] = [];
  
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
  const grid: number[][] = Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(-1));
  
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
  const plotNumberMap: Record<number, number> = {};
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
  
  // Verify if all plots were assigned a number
  const assignedIndices = Object.keys(plotNumberMap).length;
  
  // If we're missing plots, try to identify which ones weren't assigned
  if (assignedIndices < bitmapData.length) {
    // Find which indices weren't assigned a plot number
    for (let i = 0; i < processedCubes.length; i++) {
      if (plotNumberMap[i] === undefined) {
        // Assign a number to this missing plot
        plotNumberMap[i] = plotNumber++;
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
  const plotNumbers = new Set<number>();
  processedCubes.forEach(cube => {
    if (cube.plotNumber !== undefined) {
      plotNumbers.add(cube.plotNumber);
    }
  });
  
  const missingPlotNumbers: number[] = [];
  for (let i = 0; i < expectedPlots; i++) {
    if (!plotNumbers.has(i)) {
      missingPlotNumbers.push(i);
    }
  }
  
  // Check for duplicate plot numbers
  const plotNumberCounts: Record<number, number> = {};
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