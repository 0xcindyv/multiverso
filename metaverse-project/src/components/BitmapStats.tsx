import { useMemo } from 'react';
import { BitmapStats, calculateBitmapStats, formatNumber, calculatePercentage } from '../utils/bitmapStats';

interface BitmapStatsProps {
  bitmapData: number[];
  dimensions?: { width: number; height: number };
}

export default function BitmapStatsComponent({ bitmapData, dimensions }: BitmapStatsProps) {
  // Calcular estatísticas do bitmap
  const stats: BitmapStats = useMemo(() => {
    return calculateBitmapStats(bitmapData, dimensions);
  }, [bitmapData, dimensions]);

  // Obter os tamanhos únicos ordenados para exibir a distribuição
  const uniqueSizes = useMemo(() => {
    return Object.keys(stats.sizeDistribution)
      .map(size => parseInt(size))
      .sort((a, b) => b - a); // Ordenar do maior para o menor
  }, [stats.sizeDistribution]);

  // Calcular a cor para a barra de distribuição
  const getBarColor = (size: number): string => {
    // Escala de cores baseada no tamanho relativo
    const ratio = (size - stats.minSize) / (stats.maxSize - stats.minSize || 1);
    
    // Cores do menor para o maior: azul -> verde -> amarelo -> vermelho
    if (ratio < 0.25) return '#64B5F6'; // Azul
    if (ratio < 0.5) return '#81C784';  // Verde
    if (ratio < 0.75) return '#FFD54F'; // Amarelo
    return '#E57373';                   // Vermelho
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