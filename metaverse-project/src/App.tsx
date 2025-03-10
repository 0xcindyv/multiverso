import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'
// @ts-ignore
import MetaverseViewer from './components/MetaverseViewer'
// @ts-ignore
import PlotCounter from './components/PlotCounter'
import FileOperations from './components/FileOperations'
import { saveBitmapConfig, SavedBitmap } from './utils/storage'
import { getUrlParam, hasShareParams } from './utils/urlParams'
import { LanguageProvider } from './utils/languageContext'

function App() {
  // State to store the bitmap data
  const [bitmapData, setBitmapData] = useState<number[]>([]);
  // State to store the raw bitmap string for display/editing
  const [bitmapString, setBitmapString] = useState<string>('');
  // State to track loading status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State to store the exported image
  const [exportedImage, setExportedImage] = useState<string | null>(null);
  // State to track if the data was loaded from URL
  const [loadedFromUrl, setLoadedFromUrl] = useState<boolean>(false);
  // State to store the layout dimensions
  const [layoutDimensions, setLayoutDimensions] = useState<{ width: number; height: number } | undefined>(undefined);
  // State to control which panel is currently visible
  const [activePanel, setActivePanel] = useState<string | null>(null);
  // State to control whether to show the plot counter
  const [showPlotCounter, setShowPlotCounter] = useState<boolean>(false);

  // Default bitmap data from the user's input
  const defaultBitmapString = '5,6,6,5,6,5,7,5,5,6,6,8,5,5,5,5,6,5,4,6,5,5,5,5,5,6,5,5,5,5,5,7,5,7,5,5,5,5,5,5,5,5,5,4,5,5,5,5,5,5,5,4,5,5,4,5,5,5,5,4,4,5,4,6,4,5,4,5,5,4,4,4,5,5,6,5,5,4,4,6,5,4,5,5,5,4,5,4,5,5,4,4,4,4,4,3,4,3,3,3,5,5,4,3,3,3,2,3,4,3,5,4,3,3,3,4,3,4,5,2,4,5,5,5,5,5,4,5,4,4,4,4,3,4,3,5,5,4,5,4,4,3,5,4,4,5,5,5,5,3,4,5,5,3,4,4,5,2,3,5,4,5,5,5,5,4,4,3,4,4,3,4,4,3,3,3,4,3,4,3,4,4,4,4,4,3,3,4,3,4,4,4,4,4,4,4,3,4,4,4,4,4,3,3,3,4,4,4,4,4,3,3,3,3,4,3,3,4,3,3,4,3,4,1,3,3,3,4,2,4,3,4,5,2,3,4,3,3,3,4,3,3,4,3,2,2,2,3,3,2,2,3,3,2,2,2,4,3,3,3,1,3,2,1,1,1,1,1,4,2,3,1,2,1,2,4,2,2,8,3,3,4';

  // Refs for panels
  const inputPanelRef = useRef<HTMLDivElement>(null);
  const exportedImagePanelRef = useRef<HTMLDivElement>(null);

  // Check for URL parameters on component mount
  useEffect(() => {
    // Check if there are share parameters in the URL
    if (hasShareParams()) {
      const dataParam = getUrlParam('data');
      
      if (dataParam) {
        try {
          const decodedData = decodeURIComponent(dataParam);
          setBitmapString(decodedData);
          setBitmapData(parseBitmapString(decodedData));
          setLoadedFromUrl(true);
        } catch (error) {
          console.error('Error parsing URL data parameter:', error);
          // Fallback to default data
          setBitmapString(defaultBitmapString);
          setBitmapData(parseBitmapString(defaultBitmapString));
        }
      }
    } else {
      // No URL parameters, use default data
      setBitmapString(defaultBitmapString);
      setBitmapData(parseBitmapString(defaultBitmapString));
    }
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activePanel === 'input' && inputPanelRef.current && !inputPanelRef.current.contains(event.target as Node)) {
        setActivePanel(null);
      } else if (activePanel === 'exportedImage' && exportedImagePanelRef.current && !exportedImagePanelRef.current.contains(event.target as Node)) {
        setActivePanel(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePanel]);

  // Parse the bitmap string into an array of numbers
  const parseBitmapString = (str: string): number[] => {
    return str.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
  };

  // Handle bitmap string changes
  const handleBitmapStringChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBitmapString(e.target.value);
  };

  // Update the bitmap data when the user submits the form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Parse the bitmap string and update the state
    const newBitmapData = parseBitmapString(bitmapString);
    setBitmapData(newBitmapData);
    
    // Save the configuration if it's not loaded from URL
    if (!loadedFromUrl) {
      saveBitmapConfig(
        `Configuração ${new Date().toLocaleString()}`,
        bitmapString
      );
    }
    
    setTimeout(() => {
      setIsLoading(false);
      setActivePanel(null);
    }, 500);
  };

  // Handle exporting the image
  const handleExportImage = useCallback((imageUrl: string) => {
    setExportedImage(imageUrl);
    setActivePanel('exportedImage');
  }, []);

  // Handle downloading the exported image
  const handleDownloadImage = useCallback(() => {
    if (exportedImage) {
      const link = document.createElement('a');
      link.href = exportedImage;
      link.download = `bitmap-3d-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [exportedImage]);

  // Handle clearing the exported image
  const handleClearExportedImage = useCallback(() => {
    setExportedImage(null);
    setActivePanel(null);
  }, []);

  // Handle layout dimensions update
  const handleLayoutDimensionsUpdate = useCallback((dimensions: { width: number; height: number }) => {
    setLayoutDimensions(dimensions);
  }, []);

  // Handle file import
  const handleFileImport = useCallback((data: string) => {
    setBitmapString(data);
    setBitmapData(parseBitmapString(data));
    setExportedImage(null);
    setLoadedFromUrl(false);
    setActivePanel(null);
  }, []);

  // Toggle panel visibility
  const togglePanel = (panelName: string) => {
    setActivePanel(activePanel === panelName ? null : panelName);
  };

  // Toggle plot counter visibility
  const togglePlotCounter = () => {
    setShowPlotCounter(!showPlotCounter);
  };

  return (
    <LanguageProvider>
      <div className="fullscreen-app">
        <main className="fullscreen-main">
          {/* Visualizador 3D em tela cheia */}
          <div className="fullscreen-viewer">
            <MetaverseViewer 
              bitmapData={bitmapData} 
              onExportImage={handleExportImage}
              onLayoutDimensionsUpdate={handleLayoutDimensionsUpdate}
            />
          </div>

          {/* Barra de controle flutuante */}
          <div className="floating-controls">
            {/* Botão de verificar parcelas removido */}
          </div>

          {/* Plot Counter */}
          {showPlotCounter && (
            <div className="floating-panel plot-counter-panel">
              <button 
                className="close-button" 
                onClick={togglePlotCounter}
                title="Fechar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor" />
                </svg>
              </button>
              <PlotCounter bitmapData={bitmapData} />
            </div>
          )}

          {/* Painéis flutuantes */}
          {activePanel === 'input' && (
            <div className="floating-panel input-panel" ref={inputPanelRef}>
              <h2>Dados do Bitmap</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="bitmap-input">Insira os valores do bitmap separados por vírgula:</label>
                  <textarea
                    id="bitmap-input"
                    value={bitmapString}
                    onChange={handleBitmapStringChange}
                    rows={5}
                    placeholder="Exemplo: 5,5,4,3,2,1"
                    readOnly={loadedFromUrl}
                  />
                </div>
                <button type="submit" disabled={isLoading || loadedFromUrl}>
                  {isLoading ? 'Processando...' : 'Visualizar em 3D'}
                </button>
              </form>
              
              <FileOperations 
                bitmapString={bitmapString}
                onImport={handleFileImport}
              />
            </div>
          )}
          
          {activePanel === 'exportedImage' && exportedImage && (
            <div className="floating-panel exported-image-panel" ref={exportedImagePanelRef}>
              <h3>Imagem Exportada</h3>
              <div className="exported-image">
                <img src={exportedImage} alt="Visualização 3D exportada" />
                <div className="exported-image-actions">
                  <button onClick={handleDownloadImage} className="download-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" />
                    </svg>
                    Baixar
                  </button>
                  <button onClick={handleClearExportedImage} className="clear-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor" />
                    </svg>
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="minimal-footer">
          <p>203779.bitmap Multiverso Community</p>
        </footer>
      </div>
    </LanguageProvider>
  )
}

export default App
