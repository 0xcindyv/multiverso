/**
 * Interface para representar uma configuração de bitmap salva
 */
export interface SavedBitmap {
  id: string;
  name: string;
  data: string; // Dados do bitmap como string separada por vírgulas
  createdAt: number;
}

/**
 * Chave usada para armazenar as configurações no localStorage
 */
const STORAGE_KEY = 'bitmap_metaverse_saved_configs';

/**
 * Salva uma nova configuração de bitmap no localStorage
 * @param name Nome da configuração
 * @param data Dados do bitmap como string separada por vírgulas
 * @returns A configuração salva
 */
export function saveBitmapConfig(name: string, data: string): SavedBitmap {
  // Gerar um ID único baseado no timestamp
  const id = `bitmap_${Date.now()}`;
  
  // Criar o objeto de configuração
  const config: SavedBitmap = {
    id,
    name,
    data,
    createdAt: Date.now()
  };
  
  // Obter as configurações existentes
  const existingConfigs = getSavedBitmapConfigs();
  
  // Adicionar a nova configuração
  const updatedConfigs = [...existingConfigs, config];
  
  // Salvar no localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfigs));
  
  return config;
}

/**
 * Obtém todas as configurações de bitmap salvas
 * @returns Array de configurações salvas
 */
export function getSavedBitmapConfigs(): SavedBitmap[] {
  try {
    // Obter as configurações do localStorage
    const configsJson = localStorage.getItem(STORAGE_KEY);
    
    // Se não houver configurações, retornar um array vazio
    if (!configsJson) {
      return [];
    }
    
    // Converter o JSON para um array de configurações
    const configs = JSON.parse(configsJson) as SavedBitmap[];
    
    // Ordenar por data de criação (mais recente primeiro)
    return configs.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Erro ao obter configurações salvas:', error);
    return [];
  }
}

/**
 * Exclui uma configuração de bitmap pelo ID
 * @param id ID da configuração a ser excluída
 * @returns true se a configuração foi excluída com sucesso, false caso contrário
 */
export function deleteBitmapConfig(id: string): boolean {
  try {
    // Obter as configurações existentes
    const existingConfigs = getSavedBitmapConfigs();
    
    // Filtrar a configuração a ser excluída
    const updatedConfigs = existingConfigs.filter(config => config.id !== id);
    
    // Se o número de configurações não mudou, a configuração não foi encontrada
    if (updatedConfigs.length === existingConfigs.length) {
      return false;
    }
    
    // Salvar as configurações atualizadas no localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfigs));
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir configuração:', error);
    return false;
  }
}

/**
 * Formata uma data de timestamp para uma string legível
 * @param timestamp Timestamp em milissegundos
 * @returns String formatada da data
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
} 