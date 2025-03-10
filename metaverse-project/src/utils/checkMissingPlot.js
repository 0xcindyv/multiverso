// checkMissingPlot.js
// Script para verificar por que o plot 281 não está sendo reconhecido

const MondrianLayout = require('../utils/MondrianLayout').default;

// Default bitmap data from App.tsx
const defaultBitmapString = '5,6,6,5,6,5,7,5,5,6,6,8,5,5,5,5,6,5,4,6,5,5,5,5,5,6,5,5,5,5,5,7,5,7,5,5,5,5,5,5,5,5,5,4,5,5,5,5,5,5,5,4,5,5,4,5,5,5,5,4,4,5,4,6,4,5,4,5,5,4,4,4,5,5,6,5,5,4,4,6,5,4,5,5,5,4,5,4,5,5,4,4,4,4,4,3,4,3,3,3,5,5,4,3,3,3,2,3,4,3,5,4,3,3,3,4,3,4,5,2,4,5,5,5,5,5,4,5,4,4,4,4,3,4,3,5,5,4,5,4,4,3,5,4,4,5,5,5,5,3,4,5,5,3,4,4,5,2,3,5,4,5,5,5,5,4,4,3,4,4,3,4,4,3,3,3,4,3,4,3,4,4,4,4,4,3,3,4,3,4,4,4,4,4,4,4,3,4,4,4,4,4,3,3,3,4,4,4,4,4,3,3,3,3,4,3,3,4,3,3,4,3,4,1,3,3,3,4,2,4,3,4,5,2,3,4,3,3,3,4,3,3,4,3,2,2,2,3,3,2,2,3,3,2,2,2,4,3,3,3,1,3,2,1,1,1,1,1,4,2,3,1,2,1,2,4,2,2,8,3,3';

// Parse the bitmap string into an array of numbers
const parseBitmapString = (str) => {
  return str.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
};

// Função para verificar o problema
function checkMissingPlot() {
  // Parse the bitmap data
  const bitmapData = parseBitmapString(defaultBitmapString);
  console.log('Número total de transações no bitmap:', bitmapData.length);
  
  // Generate the layout using MondrianLayout
  const mondrian = new MondrianLayout(bitmapData);
  console.log('Número de slots gerados pelo MondrianLayout:', mondrian.slots.length);
  
  // Apply the same scale factor as in MetaverseViewer
  const scaleFactor = 20;
  const size = mondrian.getSize();
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
  
  console.log('Número de cubos processados:', processedCubes.length);
  
  // Create a grid to properly sort plots
  // First, determine the grid dimensions
  const gridWidth = Math.ceil(scaledSize.width);
  const gridHeight = Math.ceil(scaledSize.height);
  
  console.log('Dimensões da grade:', gridWidth, 'x', gridHeight);
  
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
  
  console.log('Número de plots numerados:', plotNumber);
  
  // Verificar quais índices não foram atribuídos
  const assignedIndices = Object.keys(plotNumberMap).length;
  console.log('Número de índices atribuídos:', assignedIndices);
  
  if (assignedIndices < processedCubes.length) {
    console.log('Há índices que não foram atribuídos a nenhum número de plot.');
    
    // Encontrar quais índices não foram atribuídos
    const missingIndices = [];
    for (let i = 0; i < processedCubes.length; i++) {
      if (plotNumberMap[i] === undefined) {
        missingIndices.push(i);
        
        // Informações sobre o cubo não atribuído
        const cube = processedCubes[i];
        console.log(`Cubo não atribuído ${i}:`, {
          position: cube.position,
          size: cube.size
        });
      }
    }
    
    if (missingIndices.length > 0) {
      console.log('Índices não atribuídos:', missingIndices.join(', '));
    }
  }
  
  // Verificar se todos os números de plot de 0 a expectedPlots-1 existem
  const plotNumbers = new Set();
  processedCubes.forEach((cube, index) => {
    const plotNum = plotNumberMap[index] !== undefined ? plotNumberMap[index] : index;
    plotNumbers.add(plotNum);
  });
  
  const missing = [];
  for (let i = 0; i < bitmapData.length; i++) {
    if (!plotNumbers.has(i)) {
      missing.push(i);
    }
  }
  
  if (missing.length > 0) {
    console.log('Números de plot faltando:', missing.join(', '));
  } else {
    console.log('Todos os números de plot estão presentes.');
  }
}

// Executar a verificação
checkMissingPlot();

module.exports = { checkMissingPlot }; 