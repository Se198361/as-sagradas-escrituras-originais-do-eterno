import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Reader } from './components/Reader';
import { db } from './db/database';
import { seedDatabase } from './db/seed';
import { useLiveQuery } from 'dexie-react-hooks';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isJudaicMode, setIsJudaicMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('bible_judaic_mode');
    return saved !== null ? saved === 'true' : true; // Default to true as requested by user
  });

  const books = useLiveQuery(() => db.books.toArray());

  useEffect(() => {
    localStorage.setItem('bible_judaic_mode', String(isJudaicMode));
  }, [isJudaicMode]);

  useEffect(() => {
    const init = async () => {
      try {
        // Limpa cache de versículos local uma única vez para carregar os carimbos de tempo de áudio
        if (!localStorage.getItem('bible_db_audio_v7')) {
          console.log('Limpando cache do IndexedDB para carregar os novos carimbos de tempo de áudio...');
          await db.verses.clear();
          localStorage.setItem('bible_db_audio_v7', 'true');
        }
        await seedDatabase();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    init();

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (books && books.length > 0 && selectedBookId === null) {
      // Find Gênesis (id 1) or first book
      const firstBook = books.find(b => b.order === 1) || books[0];
      if (firstBook && firstBook.id) {
        setSelectedBookId(firstBook.id);
      }
    }
  }, [books, selectedBookId]);

  if (isInitializing || !books) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)' }}>Preparando As Sagradas Escrituras...</p>
      </div>
    );
  }

  const selectedBook = books.find(b => b.id === selectedBookId);

  return (
    <div className="app-container">
      <Sidebar 
        books={books} 
        selectedBookId={selectedBookId} 
        onSelectBook={setSelectedBookId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isJudaicMode={isJudaicMode}
      />
      
      {selectedBook ? (
        <Reader 
          book={selectedBook} 
          onOpenSidebar={() => setIsSidebarOpen(true)} 
          isJudaicMode={isJudaicMode}
          onToggleJudaicMode={() => setIsJudaicMode(!isJudaicMode)}
        />
      ) : (
        <div className="loading-container">
          <p>Selecione um livro para começar a ler.</p>
        </div>
      )}
    </div>
  );
}

export default App;
