/**
 * File import/export utilities
 */

/**
 * Exports data to a text file
 * @param data Data to be exported
 * @param filename Filename (without extension)
 */
export function exportToFile(data: string, filename: string): void {
  // Create a blob with the data
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element for download
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.txt`;
  
  // Add the link to the document
  document.body.appendChild(link);
  
  // Simulate a click on the link
  link.click();
  
  // Remove the link from the document
  document.body.removeChild(link);
  
  // Release the URL
  URL.revokeObjectURL(url);
}

/**
 * Exports data to a JSON file
 * @param data Data to be exported
 * @param filename Filename (without extension)
 */
export function exportToJson(data: any, filename: string): void {
  // Convert data to JSON
  const json = JSON.stringify(data, null, 2);
  
  // Create a blob with the data
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element for download
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  
  // Add the link to the document
  document.body.appendChild(link);
  
  // Simulate a click on the link
  link.click();
  
  // Remove the link from the document
  document.body.removeChild(link);
  
  // Release the URL
  URL.revokeObjectURL(url);
}

/**
 * Imports data from a file
 * @param file File to import
 * @returns Promise with the file contents as string
 */
export function importFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        resolve(event.target.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Importa dados de um arquivo JSON
 * @param file Arquivo a ser importado
 * @returns Promise com os dados do arquivo
 */
export function importFromJson<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        try {
          const data = JSON.parse(event.target.result as string) as T;
          resolve(data);
        } catch (error) {
          reject(new Error('Erro ao analisar o arquivo JSON'));
        }
      } else {
        reject(new Error('Erro ao ler o arquivo'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };
    
    reader.readAsText(file);
  });
} 