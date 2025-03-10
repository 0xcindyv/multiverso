import { useMemo } from 'react';
import { 
  calculateBitmapStats, 
  formatNumber, 
  calculatePercentage 
} from '../utils/analysis';
import type { BitmapStats } from '../utils/analysis';
import { SIZE_COLORS } from '../utils/constants';

interface BitmapStatsProps {
  bitmapData: number[];
  dimensions?: { width: number; height: number };
}

export default function BitmapStatsComponent({ bitmapData, dimensions }: BitmapStatsProps) {
  // Calculate bitmap statistics
  const stats: BitmapStats = useMemo(() => {
    return calculateBitmapStats(bitmapData, dimensions);
  }, [bitmapData, dimensions]);

  // Get unique sizes sorted to display distribution
  const uniqueSizes = useMemo(() => {
    return Object.keys(stats.sizeDistribution)
      .map(size => parseInt(size))
      .sort((a, b) => b - a); // Sort from largest to smallest
  }, [stats.sizeDistribution]);

  // Calculate color for distribution bar
  const getBarColor = (size: number): string => {
    // Use predefined colors from constants if available
    if (SIZE_COLORS[size as keyof typeof SIZE_COLORS]) {
      return SIZE_COLORS[size as keyof typeof SIZE_COLORS];
    }
    
    // Fallback to color scale based on relative size
    const ratio = (size - stats.minSize) / (stats.maxSize - stats.minSize || 1);
    
    // Colors from smallest to largest: blue -> green -> yellow -> red
    if (ratio < 0.25) return '#64B5F6'; // Blue
    if (ratio < 0.5) return '#81C784';  // Green
    if (ratio < 0.75) return '#FFD54F'; // Yellow
    return '#E57373';                   // Red
  };

  return (
    <div className="bitmap-stats">
      <h3>Estatísticas do Bitmap</h3>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{formatNumber(stats.totalBlocks)}</div>
          <div className="stat-label">Blocos</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{formatNumber(stats.totalArea)}</div>
          <div className="stat-label">Área Total</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{stats.averageSize}</div>
          <div className="stat-label">Tamanho Médio</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{stats.minSize} - {stats.maxSize}</div>
          <div className="stat-label">Intervalo de Tamanhos</div>
        </div>
      </div>
      
      {dimensions && dimensions.width > 0 && (
        <div className="dimensions-info">
          <p>Dimensões do Layout: {dimensions.width} x {dimensions.height}</p>
        </div>
      )}
      
      <div className="size-distribution">
        <h4>Distribuição de Tamanhos</h4>
        
        <div className="distribution-chart">
          {uniqueSizes.map(size => (
            <div key={size} className="distribution-item">
              <div className="size-label">Tamanho {size}</div>
              <div className="distribution-bar-container">
                <div 
                  className="distribution-bar" 
                  style={{ 
                    width: calculatePercentage(stats.sizeDistribution[size], stats.totalBlocks),
                    backgroundColor: getBarColor(size)
                  }}
                ></div>
                <span className="distribution-value">
                  {stats.sizeDistribution[size]} ({calculatePercentage(stats.sizeDistribution[size], stats.totalBlocks)})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 