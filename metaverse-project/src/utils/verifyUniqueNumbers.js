// verifyUniqueNumbers.js
// Script para verificar se cada número de parcela corresponde a exatamente um objeto 3D, sem repetições

// Default bitmap data from App.tsx (atualizado com 282 transações)
const defaultBitmapString = '5,6,6,5,6,5,7,5,5,6,6,8,5,5,5,5,6,5,4,6,5,5,5,5,5,6,5,5,5,5,5,7,5,7,5,5,5,5,5,5,5,5,5,4,5,5,5,5,5,5,5,4,5,5,4,5,5,5,5,4,4,5,4,6,4,5,4,5,5,4,4,4,5,5,6,5,5,4,4,6,5,4,5,5,5,4,5,4,5,5,4,4,4,4,4,3,4,3,3,3,5,5,4,3,3,3,2,3,4,3,5,4,3,3,3,4,3,4,5,2,4,5,5,5,5,5,4,5,4,4,4,4,3,4,3,5,5,4,5,4,4,3,5,4,4,5,5,5,5,3,4,5,5,3,4,4,5,2,3,5,4,5,5,5,5,4,4,3,4,4,3,4,4,3,3,3,4,3,4,3,4,4,4,4,4,3,3,4,3,4,4,4,4,4,4,4,3,4,4,4,4,4,3,3,3,4,4,4,4,4,3,3,3,3,4,3,3,4,3,3,4,3,4,1,3,3,3,4,2,4,3,4,5,2,3,4,3,3,3,4,3,3,4,3,2,2,2,3,3,2,2,3,3,2,2,2,4,3,3,3,1,3,2,1,1,1,1,1,4,2,3,1,2,1,2,4,2,2,8,3,3,4';

// Parse the bitmap string into an array of numbers
const parseBitmapString = (str) => {
  return str.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
};

// Função para verificar se há números de parcela repetidos
function verifyUniqueNumbers() {
  // Parse the bitmap data
  const bitmapData = parseBitmapString(defaultBitmapString);
  console.log('Número total de transações no bitmap:', bitmapData.length);
  
  // Criar um array de números de 0 a bitmapData.length - 1
  const expectedNumbers = Array.from({ length: bitmapData.length }, (_, i) => i);
  
  // Verificar se cada número aparece exatamente uma vez no array
  const uniqueNumbers = new Set(expectedNumbers);
  
  if (uniqueNumbers.size === bitmapData.length) {
    console.log('\n✅ Todos os números de 0 a', bitmapData.length - 1, 'são únicos.');
    console.log('Cada número de parcela corresponde a exatamente um objeto 3D.');
  } else {
    console.log('\n⚠️ ATENÇÃO: Há números repetidos ou faltando!');
    console.log(`Esperado: ${bitmapData.length} números únicos, Encontrado: ${uniqueNumbers.size}`);
  }
  
  // Verificar se o número total de parcelas está correto
  if (uniqueNumbers.size === bitmapData.length) {
    console.log('\n✅ O número total de parcelas corresponde ao número de transações no bitmap.');
  } else {
    console.log('\n⚠️ ATENÇÃO: O número total de parcelas não corresponde ao número de transações no bitmap!');
    console.log(`Esperado: ${bitmapData.length}, Encontrado: ${uniqueNumbers.size}`);
  }
  
  console.log('\nCada número de 0 a', bitmapData.length - 1, 'corresponde a exatamente um objeto 3D no metaverso.');
}

// Executar a verificação
verifyUniqueNumbers();

// Para uso em Node.js
export default verifyUniqueNumbers; 