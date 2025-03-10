import { useState, useEffect } from 'react';
import { createShareableUrl } from '../utils/urlParams';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bitmapString: string;
  imageUrl?: string | null;
}

export default function ShareDialog({ isOpen, onClose, bitmapString, imageUrl }: ShareDialogProps) {
  // Estado para armazenar a URL compartilhável
  const [shareUrl, setShareUrl] = useState<string>('');
  // Estado para controlar a mensagem de cópia
  const [copyMessage, setCopyMessage] = useState<string>('');

  // Gerar a URL compartilhável quando o diálogo for aberto
  useEffect(() => {
    if (isOpen) {
      // Criar uma URL compartilhável usando o utilitário
      const url = createShareableUrl(bitmapString);
      setShareUrl(url);
      setCopyMessage('');
    }
  }, [isOpen, bitmapString]);

  // Função para copiar a URL para a área de transferência
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopyMessage('URL copiada para a área de transferência!');
        setTimeout(() => setCopyMessage(''), 3000);
      })
      .catch(err => {
        console.error('Erro ao copiar URL:', err);
        setCopyMessage('Erro ao copiar URL. Tente novamente.');
      });
  };

  // Função para compartilhar no Twitter
  const handleShareTwitter = () => {
    const text = 'Confira meu espaço no metaverso criado com o Bitmap Metaverse Viewer!';
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  // Função para compartilhar no Facebook
  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  // Função para compartilhar no WhatsApp
  const handleShareWhatsApp = () => {
    const text = 'Confira meu espaço no metaverso criado com o Bitmap Metaverse Viewer!';
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
    window.open(url, '_blank');
  };

  // Se o diálogo não estiver aberto, não renderizar nada
  if (!isOpen) return null;

  return (
    <div className="share-dialog-overlay">
      <div className="share-dialog">
        <div className="share-dialog-header">
          <h3>Compartilhar Visualização</h3>
          <button className="close-button" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor" />
            </svg>
          </button>
        </div>
        
        <div className="share-dialog-content">
          {imageUrl && (
            <div className="share-preview">
              <img src={imageUrl} alt="Visualização 3D" />
            </div>
          )}
          
          <div className="share-url-container">
            <h4>Link para compartilhar:</h4>
            <div className="share-url-input">
              <input type="text" value={shareUrl} readOnly />
              <button onClick={handleCopyUrl}>Copiar</button>
            </div>
            {copyMessage && <p className="copy-message">{copyMessage}</p>}
          </div>
          
          <div className="share-social">
            <h4>Compartilhar nas redes sociais:</h4>
            <div className="social-buttons">
              <button className="social-button twitter" onClick={handleShareTwitter}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" fill="currentColor" />
                </svg>
                Twitter
              </button>
              <button className="social-button facebook" onClick={handleShareFacebook}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8.61v-6.97h-2.34V11.3h2.34V9.39c0-2.31 1.41-3.57 3.47-3.57 1.01 0 1.86.07 2.11.1v2.43h-1.45c-1.14 0-1.36.54-1.36 1.33v1.62h2.77l-.36 2.73h-2.41V21H20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z" fill="currentColor" />
                </svg>
                Facebook
              </button>
              <button className="social-button whatsapp" onClick={handleShareWhatsApp}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.47c.15 0 .36-.06.55.45l.69 1.87c.06.13.1.28.01.44l-.27.41-.39.42c-.12.12-.26.25-.12.5.12.26.62 1.09 1.32 1.78.91.88 1.71 1.17 1.95 1.3.24.14.39.12.54-.04l.81-.94c.19-.25.35-.19.58-.11l1.67.88M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65A9.969 9.969 0 0 1 2 12 10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.96A7.95 7.95 0 0 0 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8z" fill="currentColor" />
                </svg>
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 