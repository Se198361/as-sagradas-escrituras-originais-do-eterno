import { Book as BookIcon, X } from 'lucide-react';
import type { Book } from '../db/database';

interface SidebarProps {
  books: Book[];
  selectedBookId: number | null;
  onSelectBook: (id: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  books, 
  selectedBookId, 
  onSelectBook,
  isOpen,
  onClose
}) => {
  // Agrupar livros por categoria, mantendo a ordem correta
  const categories = books.reduce((acc, book) => {
    if (!acc[book.category]) {
      acc[book.category] = [];
    }
    acc[book.category].push(book);
    return acc;
  }, {} as Record<string, Book[]>);

  // Ordem canônica esperada das categorias
  const categoryOrder = [
    'A Lei (Torá)',
    'Históricos',
    'Poéticos',
    'Profetas Maiores',
    'Profetas Menores',
    'Evangelhos',
    'Histórico',
    'Epístolas Paulinas',
    'Epístolas Gerais',
    'Profético',
    'Outros'
  ];

  const sortedCategories = Object.keys(categories).sort((a, b) => {
    let indexA = categoryOrder.indexOf(a);
    let indexB = categoryOrder.indexOf(b);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    return indexA - indexB;
  });

  return (
    <>
      <div className={`overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookIcon size={24} color="var(--brand-primary)" />
            <h1 className="sidebar-title">Escrituras</h1>
          </div>
          {/* Mostra botão fechar apenas em telas pequenas */}
          <button className="btn-icon" onClick={onClose} style={{ display: window.innerWidth > 768 ? 'none' : 'flex' }}>
            <X size={20} />
          </button>
        </div>
        
        <div className="sidebar-content">
          {sortedCategories.map(category => (
            <div key={category}>
              <div className="category-header">{category}</div>
              {categories[category]
                .sort((a, b) => a.order - b.order)
                .map(book => (
                <div 
                  key={book.id} 
                  className={`book-item ${selectedBookId === book.id ? 'active' : ''}`}
                  onClick={() => {
                    onSelectBook(book.id!);
                    if (window.innerWidth <= 768) onClose();
                  }}
                >
                  {book.name}
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};
