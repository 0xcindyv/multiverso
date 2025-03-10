/**
 * Utilitários para importação e exportação de arquivos
 */

/**
 * Exporta dados para um arquivo de texto
 * @param data Dados a serem exportados
 * @param filename Nome do arquivo (sem extensão)
 */
export function exportToFile(data: string, filename: string): void {
  // Criar um blob com os dados
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
  
  // Criar uma URL para o blob
  const url = URL.createObjectURL(blob);
  
  // Criar um elemento de link para download
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.txt`;
  
  // Adicionar o link ao documento
  document.body.appendChild(link);
  
  // Simular um clique no link
  link.click();
  
  // Remover o link do documento
  document.body.removeChild(link);
  
  // Liberar a URL
  URL.revokeObjectURL(url);
}

/**
 * Exporta dados para um arquivo JSON
 * @param data Dados a serem exportados
 * @param filename Nome do arquivo (sem extensão)
 */
export function exportToJson(data: any, filename: string): void {
  // Converter os dados para JSON
  const json = JSON.stringify(data, null, 2);
  
  // Criar um blob com os dados
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  
  // Criar uma URL para o blob
  const url = URL.createObjectURL(blob);
  
  // Criar um elemento de link para download
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  
  // Adicionar o link ao documento
  document.body.appendChild(link);
  
  // Simular um clique no link
  link.click();
  
  // Remover o link do documento
  document.body.removeChild(link);
  
  // Liberar a URL
  URL.revokeObjectURL(url);
}

/**
 * Importa dados de um arquivo de texto
 * @param file Arquivo a ser importado
 * @returns Promise com os dados do arquivo
 */
export function importFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
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