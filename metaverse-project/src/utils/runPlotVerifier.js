// runPlotVerifier.js
// Script to run the plot verification test

// Import the required modules
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2020',
    esModuleInterop: true,
  },
});

// Run the test script
require('./plotVerifierTest.ts'); 