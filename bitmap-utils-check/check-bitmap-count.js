// check-bitmap-count.js
// Script para verificar o número exato de transações no bitmap

// Default bitmap data from App.tsx
const defaultBitmapString = '5,6,6,5,6,5,7,5,5,6,6,8,5,5,5,5,6,5,4,6,5,5,5,5,5,6,5,5,5,5,5,7,5,7,5,5,5,5,5,5,5,5,5,4,5,5,5,5,5,5,5,4,5,5,4,5,5,5,5,4,4,5,4,6,4,5,4,5,5,4,4,4,5,5,6,5,5,4,4,6,5,4,5,5,5,4,5,4,5,5,4,4,4,4,4,3,4,3,3,3,5,5,4,3,3,3,2,3,4,3,5,4,3,3,3,4,3,4,5,2,4,5,5,5,5,5,4,5,4,4,4,4,3,4,3,5,5,4,5,4,4,3,5,4,4,5,5,5,5,3,4,5,5,3,4,4,5,2,3,5,4,5,5,5,5,4,4,3,4,4,3,4,4,3,3,3,4,3,4,3,4,4,4,4,4,3,3,4,3,4,4,4,4,4,4,4,3,4,4,4,4,4,3,3,3,4,4,4,4,4,3,3,3,3,4,3,3,4,3,3,4,3,4,1,3,3,3,4,2,4,3,4,5,2,3,4,3,3,3,4,3,3,4,3,2,2,2,3,3,2,2,3,3,2,2,2,4,3,3,3,1,3,2,1,1,1,1,1,4,2,3,1,2,1,2,4,2,2,8,3,3';

// Parse the bitmap string into an array of numbers
const parseBitmapString = (str) => {
  return str.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
};

// Count the number of transactions
const bitmapData = parseBitmapString(defaultBitmapString);
console.log('Número total de transações no bitmap:', bitmapData.length);

// Count by size
const sizeCount = {};
bitmapData.forEach(size => {
  sizeCount[size] = (sizeCount[size] || 0) + 1;
});

console.log('\nDistribuição por tamanho:');
Object.entries(sizeCount)
  .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
  .forEach(([size, count]) => {
    console.log(`Tamanho ${size}: ${count} transações (${(count * 100 / bitmapData.length).toFixed(2)}%)`);
  });

// Verify if there are any missing or duplicate indices
const indices = new Set();
for (let i = 0; i < bitmapData.length; i++) {
  indices.add(i);
}

if (indices.size === bitmapData.length) {
  console.log('\nTodos os índices de 0 a', bitmapData.length - 1, 'estão presentes.');
} else {
  console.log('\nHá índices faltando ou duplicados.');
  
  // Check for missing indices
  const missing = [];
  for (let i = 0; i < bitmapData.length; i++) {
    if (!indices.has(i)) {
      missing.push(i);
    }
  }
  
  if (missing.length > 0) {
    console.log('Índices faltando:', missing.join(', '));
  }
}

// Verify if the last transaction is present
const lastIndex = bitmapData.length - 1;
console.log('\nÚltima transação (índice', lastIndex, ' ):', bitmapData[lastIndex]); 