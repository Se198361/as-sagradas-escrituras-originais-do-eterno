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

  const books = useLiveQuery(() => db.books.toArray());

  useEffect(() => {
    const init = async () => {
      try {
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
      />
      
      {selectedBook ? (
        <Reader 
          book={selectedBook} 
          onOpenSidebar={() => setIsSidebarOpen(true)} 
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
