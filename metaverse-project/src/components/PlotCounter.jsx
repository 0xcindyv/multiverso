// PlotCounter.jsx
// Component to count and display the plots in the MetaverseViewer

import { useState, useEffect } from 'react';
import MondrianLayout from '../utils/MondrianLayout';
import { useLanguage } from '../utils/languageContext';

export default function PlotCounter({ bitmapData }) {
  const { t } = useLanguage();
  const [plotInfo, setPlotInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [missingPlotNumbers, setMissingPlotNumbers] = useState([]);

  useEffect(() => {
    if (!bitmapData || bitmapData.length === 0) return;

    setIsLoading(true);

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
    
    // Verify if all plots were assigned a number
    const assignedIndices = Object.keys(plotNumberMap).length;
    console.log(`Total plots in bitmapData: ${bitmapData.length}`);
    console.log(`Total plots assigned a number: ${assignedIndices}`);
    console.log(`Total processed cubes: ${processedCubes.length}`);
    console.log(`Total slots from MondrianLayout: ${mondrian.slots.length}`);
    
    // If we're missing plots, try to identify which ones weren't assigned
    if (assignedIndices < bitmapData.length) {
      console.log("Missing plots detected. Checking which indices weren't assigned...");
      
      // Find which indices weren't assigned a plot number
      const missingIndices = [];
      for (let i = 0; i < processedCubes.length; i++) {
        if (plotNumberMap[i] === undefined) {
          missingIndices.push(i);
          // Assign a number to this missing plot
          plotNumberMap[i] = plotNumber++;
          console.log(`Assigned number ${plotNumberMap[i]} to previously missing plot at index ${i}`);
          
          // Log information about the missing plot
          const cube = processedCubes[i];
          console.log(`Missing plot at index ${i}:`, {
            position: cube.position,
            size: cube.size
          });
        }
      }
      
      if (missingIndices.length > 0) {
        console.log(`Found ${missingIndices.length} missing indices: ${missingIndices.join(', ')}`);
      }
    }
    
    // Assign plot numbers based on the mapping
    processedCubes.forEach((cube, index) => {
      cube.plotNumber = plotNumberMap[index] !== undefined ? plotNumberMap[index] : index;
    });
    
    // Check if all plot numbers from 0 to expectedPlots-1 exist
    const plotNumbers = new Set();
    processedCubes.forEach(cube => {
      if (cube.plotNumber !== undefined) {
        plotNumbers.add(cube.plotNumber);
      }
    });
    
    const missing = [];
    for (let i = 0; i < bitmapData.length; i++) {
      if (!plotNumbers.has(i)) {
        missing.push(i);
      }
    }
    
    setMissingPlotNumbers(missing);
    
    // Count plots by size
    const plotsBySize = {};
    bitmapData.forEach(size => {
      plotsBySize[size] = (plotsBySize[size] || 0) + 1;
    });
    
    setPlotInfo({
      totalPlots: plotNumber,
      expectedPlots: bitmapData.length,
      plotsBySize,
      highestPlotNumber: Math.max(...Array.from(plotNumbers)),
      totalInputPlots: bitmapData.length
    });
    
    setIsLoading(false);
  }, [bitmapData]);

  if (isLoading) {
    return <div>Loading plot information...</div>;
  }

  if (!plotInfo) {
    return <div>No plot information available.</div>;
  }

  return (
    <div style={{ 
      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
      color: 'white', 
      padding: '20px', 
      borderRadius: '10px',
      maxWidth: '500px',
      margin: '20px auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', marginTop: 0 }}>Plot Analysis</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ marginBottom: '5px' }}>Plot Counts:</h3>
        <p>Total plots generated: {plotInfo.totalPlots}</p>
        <p>Expected plots: {plotInfo.expectedPlots}</p>
        <p>Total plots in input data: {plotInfo.totalInputPlots}</p>
        <p>Highest plot number: {plotInfo.highestPlotNumber}</p>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ marginBottom: '5px' }}>Plots by Size:</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {Object.entries(plotInfo.plotsBySize)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .map(([size, count]) => (
              <li key={size}>
                Size {size}: {count} plots ({(count * 100 / plotInfo.totalInputPlots).toFixed(2)}%)
              </li>
            ))}
        </ul>
      </div>
      
      {missingPlotNumbers.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '5px', color: 'orange' }}>Missing Plot Numbers:</h3>
          <p>The following plot numbers are missing: {missingPlotNumbers.join(', ')}</p>
        </div>
      )}
      
      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9em', opacity: 0.7 }}>
        {plotInfo.totalPlots === plotInfo.expectedPlots 
          ? `✅ All plots are correctly numbered from 0 to ${plotInfo.expectedPlots - 1}.` 
          : "⚠️ There is a discrepancy in the plot numbering."}
      </div>
    </div>
  );
} 