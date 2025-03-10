/**
 * Interface para representar estatísticas do bitmap
 */
export interface BitmapStats {
  totalBlocks: number;
  totalArea: number;
  averageSize: number;
  minSize: number;
  maxSize: number;
  sizeDistribution: Record<number, number>;
  dimensions: {
    width: number;
    height: number;
  };
}

/**
 * Calcula estatísticas sobre os dados do bitmap
 * @param bitmapData Array de números representando os tamanhos dos blocos
 * @param dimensions Dimensões do layout (opcional)
 * @returns Estatísticas do bitmap
 */
export function calculateBitmapStats(
  bitmapData: number[],
  dimensions?: { width: number; height: number }
): BitmapStats {
  // Se não houver dados, retornar estatísticas vazias
  if (!bitmapData || bitmapData.length === 0) {
    return {
      totalBlocks: 0,
      totalArea: 0,
      averageSize: 0,
      minSize: 0,
      maxSize: 0,
      sizeDistribution: {},
      dimensions: { width: 0, height: 0 }
    };
  }

  // Calcular estatísticas básicas
  const totalBlocks = bitmapData.length;
  const totalArea = bitmapData.reduce((sum, size) => sum + size * size, 0);
  const averageSize = parseFloat((bitmapData.reduce((sum, size) => sum + size, 0) / totalBlocks).toFixed(2));
  const minSize = Math.min(...bitmapData);
  const maxSize = Math.max(...bitmapData);

  // Calcular a distribuição de tamanhos
  const sizeDistribution: Record<number, number> = {};
  bitmapData.forEach(size => {
    sizeDistribution[size] = (sizeDistribution[size] || 0) + 1;
  });

  return {
    totalBlocks,
    totalArea,
    averageSize,
    minSize,
    maxSize,
    sizeDistribution,
    dimensions: dimensions || { width: 0, height: 0 }
  };
}

/**
 * Formata um número para exibição
 * @param num Número a ser formatado
 * @returns Número formatado como string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Calcula a porcentagem de um valor em relação a um total
 * @param value Valor
 * @param total Total
 * @returns Porcentagem formatada como string
 */
export function calculatePercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
} 