import { useState } from 'react';
import { X, Search } from 'lucide-react';
import type { Book } from '../db/database';
import { getJudaicBookName, getJudaicCategory } from '../utils/judaicTranslator';

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
  isJudaicMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  books, 
  selectedBookId, 
  onSelectBook,
  isOpen,
  onClose,
  isJudaicMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar os livros com base no termo de busca (nome, abreviação ou categoria)
  const filteredBooks = books.filter(book => {
    const judaicName = getJudaicBookName(book.abbrev, book.name, isJudaicMode);
    const judaicCategory = getJudaicCategory(book.category, isJudaicMode);
    return (
      book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      judaicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.abbrev.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      judaicCategory.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Agrupar livros filtrados por categoria, mantendo a ordem correta
  const categories = filteredBooks.reduce((acc, book) => {
    const displayCategory = getJudaicCategory(book.category, isJudaicMode);
    if (!acc[displayCategory]) {
      acc[displayCategory] = [];
    }
    acc[displayCategory].push(book);
    return acc;
  }, {} as Record<string, Book[]>);

  // Ordem canônica esperada das categorias (mapeada para os dois modos)
  const categoryOrder = isJudaicMode ? [
    'Torá (A Lei)',
    'Nevi\'im Rishonim (Profetas Anteriores / Históricos)',
    'Ketuvim (Escritos / Poéticos)',
    'Nevi\'im Acharonim (Profetas Posteriores Maiores)',
    'Nerei Asar (Os Doze Profetas Menores)',
    'Besorot (Evangelhos)',
    'Histórico (Atos)',
    'Cartas de Sha\'ul (Paulo)',
    'Cartas Gerais',
    'Chazon (Revelação)'
  ] : [
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
            <img 
              src="/bible_cover.png" 
              alt="Bíblia" 
              className="bible-cover-image"
            />
            <h1 className="sidebar-title">
              {isJudaicMode ? 'BÍBLIA JUDAICA COMPLETA' : 'AS ESCRITURAS SAGRADAS ORIGINAIS DO ETERNO'}
            </h1>
          </div>
          {/* Mostra botão fechar apenas em telas pequenas */}
          <button className="btn-icon" onClick={onClose} style={{ display: window.innerWidth > 768 ? 'none' : 'flex' }}>
            <X size={20} />
          </button>
        </div>

        {/* Barra de Pesquisa de Livros */}
        <div className="sidebar-search-container">
          <div className="sidebar-search-wrapper">
            <Search size={16} className="sidebar-search-icon" />
            <input 
              type="text" 
              placeholder={isJudaicMode ? "Pesquisar livro (ex: Bereshit)..." : "Pesquisar livro..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sidebar-search-input"
            />
            {searchQuery && (
              <button className="sidebar-search-clear" onClick={() => setSearchQuery('')} title="Limpar busca">
                <X size={14} />
              </button>
            )}
          </div>
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
                  <span className="book-name-text">
                    {getJudaicBookName(book.abbrev, book.name, isJudaicMode)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};
