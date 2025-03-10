import { useRef, useState } from 'react';
import { exportToFile, exportToJson, importFromFile } from '../utils/fileUtils';

interface FileOperationsProps {
  bitmapString: string;
  onImport: (data: string) => void;
}

export default function FileOperations({ bitmapString, onImport }: FileOperationsProps) {
  // Referência para o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Estado para controlar mensagens de erro/sucesso
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Função para exportar os dados como arquivo de texto
  const handleExportTxt = () => {
    try {
      exportToFile(bitmapString, 'bitmap-data');
      showMessage('Dados exportados com sucesso!', 'success');
    } catch (error) {
      showMessage('Erro ao exportar os dados. Tente novamente.', 'error');
      console.error('Erro ao exportar dados:', error);
    }
  };

  // Função para exportar os dados como arquivo JSON
  const handleExportJson = () => {
    try {
      // Converter a string de bitmap para um array de números
      const bitmapData = bitmapString.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
      
      // Criar um objeto com os dados
      const data = {
        bitmap: bitmapData,
        createdAt: new Date().toISOString(),
        format: 'bitmap-metaverse-viewer'
      };
      
      exportToJson(data, 'bitmap-data');
      showMessage('Dados exportados com sucesso!', 'success');
    } catch (error) {
      showMessage('Erro ao exportar os dados. Tente novamente.', 'error');
      console.error('Erro ao exportar dados:', error);
    }
  };

  // Função para abrir o diálogo de seleção de arquivo
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Função para processar o arquivo importado
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    try {
      // Verificar o tipo de arquivo
      if (file.name.endsWith('.json')) {
        // Importar como JSON
        const data = await importFromFile(file);
        
        try {
          // Tentar analisar o JSON
          const jsonData = JSON.parse(data);
          
          // Verificar se o JSON tem o formato esperado
          if (jsonData.bitmap && Array.isArray(jsonData.bitmap)) {
            // Converter o array de números para uma string
            const bitmapString = jsonData.bitmap.join(',');
            onImport(bitmapString);
            showMessage('Dados importados com sucesso!', 'success');
          } else {
            showMessage('Formato de arquivo JSON inválido.', 'error');
          }
        } catch (error) {
          showMessage('Erro ao analisar o arquivo JSON.', 'error');
        }
      } else {
        // Importar como texto
        const data = await importFromFile(file);
        onImport(data);
        showMessage('Dados importados com sucesso!', 'success');
      }
    } catch (error) {
      showMessage('Erro ao importar o arquivo. Tente novamente.', 'error');
      console.error('Erro ao importar arquivo:', error);
    }
    
    // Limpar o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Função para exibir mensagens temporárias
  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    
    // Limpar a mensagem após 3 segundos
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  return (
    <div className="file-operations">
      <h3>Importar/Exportar</h3>
      
      <div className="file-operations-buttons">
        <button 
          onClick={handleImportClick}
          className="import-button"
          title="Importar dados de um arquivo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" />
          </svg>
          Importar
        </button>
        
        <div className="export-dropdown">
          <button 
            className="export-button"
            title="Exportar dados para um arquivo"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" fill="currentColor" />
            </svg>
            Exportar
          </button>
          
          <div className="export-dropdown-content">
            <button onClick={handleExportTxt}>Texto (.txt)</button>
            <button onClick={handleExportJson}>JSON (.json)</button>
          </div>
        </div>
      </div>
      
      {/* Input de arquivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt,.json"
        style={{ display: 'none' }}
      />
      
      {/* Mensagem de erro/sucesso */}
      {message && (
        <div className={`file-message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
} 