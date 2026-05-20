import { Book as BookIcon, X } from 'lucide-react';
import type { Book } from '../db/database';

const bookEmojis: Record<string, string> = {
  gn: '🌱', // Gênesis
  ex: '🌊', // Êxodo
  lv: '🛐', // Levítico
  nm: '⛺', // Números
  dt: '📜', // Deuteronômio
  js: '⚔️', // Josué
  jz: '⚖️', // Juízes
  rt: '🌾', // Rute
  '1sm': '👑', // 1º Samuel
  '2sm': '🏰', // 2º Samuel
  '1rs': '🏛️', // 1º Reis
  '2rs': '🔥', // 2º Reis
  '1cr': '📂', // 1º Crônicas
  '2cr': '⛪', // 2º Crônicas
  ed: '✍️', // Esdras
  ne: '🧱', // Neemias
  et: '👑', // Ester
  jó: '🌪️', // Jó
  sl: '🎵', // Salmos
  pv: '💡', // Provérbios
  ec: '⏳', // Eclesiastes
  ct: '🌹', // Cantares
  is: '🌅', // Isaías
  jr: '🏺', // Jeremias
  lm: '🌧️', // Lamentações
  ez: '🎡', // Ezequiel
  dn: '🦁', // Daniel
  os: '💍', // Oseias
  jl: '🦗', // Joel
  am: '🐂', // Amós
  ob: '🏔️', // Obadias
  jn: '🐳', // Jonas
  mq: '🚶‍♂️', // Miqueias
  na: '⛈️', // Naum
  hc: '🏰', // Habacuque
  sf: '☀️', // Sofonias
  ag: '🏠', // Ageu
  zc: '🕯️', // Zacarias
  ml: '🌅', // Malaquias
  mt: '🪙', // Mateus
  mc: '🏃‍♂️', // Marcos
  lc: '🩺', // Lucas
  jo: '🦅', // João
  at: '🔥', // Atos
  rm: '✝️', // Romanos
  '1co': '🫀', // 1ª Coríntios
  '2co': '🏺', // 2ª Coríntios
  gl: '🕊️', // Gálatas
  ef: '🛡️', // Efésios
  fp: '😊', // Filipenses
  cl: '🪴', // Colossenses
  '1ts': '☁️', // 1ª Tessalonicenses
  '2ts': '⏳', // 2ª Tessalonicenses
  '1tm': '🕯️', // 1ª Timóteo
  '2tm': '📖', // 2ª Timóteo
  tt: '⚓', // Tito
  fm: '🤝', // Filemom
  hb: '⚓', // Hebreus
  tg: '🛠️', // Tiago
  '1pe': '🔥', // 1ª Pedro
  '2pe': '🌟', // 2ª Pedro
  '1jo': '🫀', // 1ª João
  '2jo': '✉️', // 2ª João
  '3jo': '🤝', // 3ª João
  jd: '🛡️', // Judas
  ap: '👑'  // Apocalipse
};

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="bible-icon-container">
              <BookIcon size={20} color="white" />
            </div>
            <h1 className="sidebar-title">AS ESCRITURAS SAGRADAS ORIGINAIS DO ETERNO</h1>
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
                  <span className="book-icon-badge">
                    {bookEmojis[book.abbrev] || '📖'}
                  </span>
                  <span className="book-name-text">{book.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};
