import { useRef, useState } from 'react';
import { exportToFile, exportToJson, importFromFile } from '../utils/fileUtils';
import { parseBitmapString } from '../utils/common';

interface FileOperationsProps {
  bitmapString: string;
  onImport: (data: string) => void;
}

export default function FileOperations({ bitmapString, onImport }: FileOperationsProps) {
  // Reference for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  // State to control error/success messages
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Function to show messages
  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  // Function to export data as text file
  const handleExportTxt = () => {
    try {
      exportToFile(bitmapString, 'bitmap-data');
      showMessage('Dados exportados com sucesso!', 'success');
    } catch (error) {
      showMessage('Erro ao exportar os dados. Tente novamente.', 'error');
      console.error('Erro ao exportar dados:', error);
    }
  };

  // Function to export data as JSON file
  const handleExportJson = () => {
    try {
      // Convert bitmap string to array of numbers using common utility
      const bitmapData = parseBitmapString(bitmapString);
      
      // Create object with data
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

  // Function to open file selection dialog
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Function to process imported file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    try {
      // Check file type
      if (file.name.endsWith('.json')) {
        // Import as JSON
        const data = await importFromFile(file);
        
        try {
          // Try to analyze JSON
          const jsonData = JSON.parse(data);
          
          // Check if JSON has expected format
          if (jsonData.bitmap && Array.isArray(jsonData.bitmap)) {
            // Convert array of numbers to string
            const bitmapString = jsonData.bitmap.join(',');
            onImport(bitmapString);
            showMessage('Dados importados com sucesso!', 'success');
          } else {
            showMessage('Invalid JSON format.', 'error');
          }
        } catch (error) {
          showMessage('Error analyzing JSON file.', 'error');
        }
      } else {
        // Import as text
        const data = await importFromFile(file);
        onImport(data);
        showMessage('Dados importados com sucesso!', 'success');
      }
    } catch (error) {
      showMessage('Error importing file. Try again.', 'error');
      console.error('Error importing file:', error);
    }
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt,.json"
        style={{ display: 'none' }}
      />
      
      {/* Error/success message */}
      {message && (
        <div className={`file-message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
} 