/**
 * Utilitário para gerenciar parâmetros de URL
 */

/**
 * Obtém um parâmetro da URL atual
 * @param name Nome do parâmetro
 * @returns Valor do parâmetro ou null se não existir
 */
export function getUrlParam(name: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Define um parâmetro na URL atual sem recarregar a página
 * @param name Nome do parâmetro
 * @param value Valor do parâmetro
 */
export function setUrlParam(name: string, value: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.history.pushState({}, '', url.toString());
}

/**
 * Remove um parâmetro da URL atual sem recarregar a página
 * @param name Nome do parâmetro
 */
export function removeUrlParam(name: string): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(name);
  window.history.pushState({}, '', url.toString());
}

/**
 * Cria uma URL compartilhável com os dados do bitmap
 * @param bitmapString String de dados do bitmap
 * @returns URL compartilhável
 */
export function createShareableUrl(bitmapString: string): string {
  const url = new URL(window.location.href);
  // Limpar qualquer parâmetro existente
  url.search = '';
  // Adicionar o parâmetro de dados
  url.searchParams.set('data', encodeURIComponent(bitmapString));
  return url.toString();
}

/**
 * Verifica se a URL atual contém parâmetros de compartilhamento
 * @returns true se a URL contém parâmetros de compartilhamento
 */
export function hasShareParams(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has('data');
}

/**
 * Limpa todos os parâmetros da URL atual sem recarregar a página
 */
export function clearUrlParams(): void {
  window.history.pushState({}, '', window.location.pathname);
} 