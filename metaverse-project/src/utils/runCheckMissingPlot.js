// runCheckMissingPlot.js
// Script para executar o checkMissingPlot.js

// Registrar o ts-node
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
  },
});

// Executar o script
require('./checkMissingPlot.js'); 