import { useState, useEffect } from 'react';
import { SavedBitmap, getSavedBitmapConfigs, deleteBitmapConfig, formatDate } from '../utils/storage';

interface SavedConfigsProps {
  onLoadConfig: (config: SavedBitmap) => void;
  currentBitmapString: string;
  onSaveConfig: (name: string) => void;
}

export default function SavedConfigs({ onLoadConfig, currentBitmapString, onSaveConfig }: SavedConfigsProps) {
  // Estado para armazenar as configurações salvas
  const [savedConfigs, setSavedConfigs] = useState<SavedBitmap[]>([]);
  // Estado para armazenar o nome da nova configuração
  const [newConfigName, setNewConfigName] = useState<string>('');
  // Estado para controlar a exibição do formulário de salvamento
  const [showSaveForm, setShowSaveForm] = useState<boolean>(false);

  // Carregar as configurações salvas ao montar o componente
  useEffect(() => {
    loadSavedConfigs();
  }, []);

  // Função para carregar as configurações salvas
  const loadSavedConfigs = () => {
    const configs = getSavedBitmapConfigs();
    setSavedConfigs(configs);
  };

  // Função para lidar com a exclusão de uma configuração
  const handleDeleteConfig = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que o clique propague para o item pai
    
    if (window.confirm('Tem certeza que deseja excluir esta configuração?')) {
      const success = deleteBitmapConfig(id);
      
      if (success) {
        // Recarregar as configurações após a exclusão
        loadSavedConfigs();
      } else {
        alert('Erro ao excluir a configuração. Tente novamente.');
      }
    }
  };

  // Função para lidar com o carregamento de uma configuração
  const handleLoadConfig = (config: SavedBitmap) => {
    onLoadConfig(config);
  };

  // Função para lidar com o salvamento de uma nova configuração
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newConfigName.trim()) {
      alert('Por favor, insira um nome para a configuração.');
      return;
    }
    
    // Chamar a função de salvamento passada como prop
    onSaveConfig(newConfigName);
    
    // Limpar o formulário
    setNewConfigName('');
    setShowSaveForm(false);
    
    // Recarregar as configurações
    loadSavedConfigs();
  };

  return (
    <div className="saved-configs">
      <div className="saved-configs-header">
        <h3>Configurações Salvas</h3>
        <button 
          className="toggle-save-form-button"
          onClick={() => setShowSaveForm(!showSaveForm)}
        >
          {showSaveForm ? 'Cancelar' : 'Salvar Atual'}
        </button>
      </div>
      
      {showSaveForm && (
        <form onSubmit={handleSaveConfig} className="save-config-form">
          <div className="form-group">
            <label htmlFor="config-name">Nome da Configuração:</label>
            <input
              type="text"
              id="config-name"
              value={newConfigName}
              onChange={(e) => setNewConfigName(e.target.value)}
              placeholder="Ex: Meu Espaço no Metaverso"
              required
            />
          </div>
          <button type="submit" className="save-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" />
            </svg>
            Salvar Configuração
          </button>
        </form>
      )}
      
      {savedConfigs.length === 0 ? (
        <p className="no-configs-message">Nenhuma configuração salva ainda.</p>
      ) : (
        <ul className="saved-configs-list">
          {savedConfigs.map((config) => (
            <li 
              key={config.id} 
              className="saved-config-item"
              onClick={() => handleLoadConfig(config)}
            >
              <div className="config-info">
                <h4>{config.name}</h4>
                <p className="config-date">{formatDate(config.createdAt)}</p>
              </div>
              <div className="config-actions">
                <button 
                  className="delete-config-button"
                  onClick={(e) => handleDeleteConfig(config.id, e)}
                  title="Excluir configuração"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 