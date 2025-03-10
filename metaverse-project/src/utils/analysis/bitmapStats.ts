/**
 * Bitmap statistics calculation utilities
 */

/**
 * Interface to represent bitmap statistics
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
 * Calculates statistics about the bitmap data
 * @param bitmapData Array of numbers representing block sizes
 * @param dimensions Layout dimensions (optional)
 * @returns Bitmap statistics
 */
export function calculateBitmapStats(
  bitmapData: number[],
  dimensions?: { width: number; height: number }
): BitmapStats {
  // If there's no data, return empty statistics
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

  // Calculate basic statistics
  const totalBlocks = bitmapData.length;
  const totalArea = bitmapData.reduce((sum, size) => sum + size * size, 0);
  const averageSize = parseFloat((bitmapData.reduce((sum, size) => sum + size, 0) / totalBlocks).toFixed(2));
  const minSize = Math.min(...bitmapData);
  const maxSize = Math.max(...bitmapData);

  // Calculate size distribution
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