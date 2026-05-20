import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Menu, Play, Square } from 'lucide-react';
import { db } from '../db/database';
import type { Book } from '../db/database';
import { ThemeToggle } from './ThemeToggle';
import { useLiveQuery } from 'dexie-react-hooks';

interface ReaderProps {
  book: Book;
  onOpenSidebar: () => void;
}

// A global set to track books currently loading to avoid concurrent insertions (e.g. from React Strict Mode double-effect)
const loadingBooks = new Set<string>();

export const Reader: React.FC<ReaderProps> = ({ book, onOpenSidebar }) => {
  const [chapter, setChapter] = useState(1);
  const [totalChapters, setTotalChapters] = useState(1);
  const [playingVerse, setPlayingVerse] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);

  // Reset chapter when book changes and load book dynamically if not cached
  useEffect(() => {
    setChapter(1);
    
    const loadBook = async () => {
      // If this book is already being loaded in a parallel thread, wait for it
      if (loadingBooks.has(book.abbrev)) {
        for (let i = 0; i < 20; i++) { // Wait up to 3 seconds (20 * 150ms)
          await new Promise(resolve => setTimeout(resolve, 150));
          if (!loadingBooks.has(book.abbrev)) break;
        }
        // After waiting, verify if the book is now loaded in IndexedDB
        const cachedVerses = await db.verses.where('book_abbrev').equals(book.abbrev).toArray();
        if (cachedVerses.length > 0) {
          const chapters = new Set(cachedVerses.map(v => v.chapter));
          setTotalChapters(chapters.size || 1);
          return;
        }
      }

      loadingBooks.add(book.abbrev);
      setIsFetching(true);
      setDownloadProgress(null);
      try {
        // 1. Check if we already have verses for this book in IndexedDB
        let existingVersesCount = await db.verses.where('book_abbrev').equals(book.abbrev).count();
        
        // Self-healing: Check for duplicate verses (e.g., if total cached verses > unique chapter:verse keys)
        if (existingVersesCount > 0) {
          const cachedVerses = await db.verses.where('book_abbrev').equals(book.abbrev).toArray();
          const uniqueKeys = new Set(cachedVerses.map(v => `${v.chapter}:${v.verse}`));
          
          if (cachedVerses.length > uniqueKeys.size) {
            console.warn(`Deteção de duplicados para ${book.name}. Limpando banco local e reimportando...`);
            await db.verses.where('book_abbrev').equals(book.abbrev).delete();
            existingVersesCount = 0;
          }
        }
        
        if (existingVersesCount === 0) {
          // 2. Fetch from the local dynamic endpoint
          setDownloadProgress('Baixando texto...');
          const response = await fetch(`/db/${book.abbrev}.json`);
          if (!response.ok) {
            throw new Error(`Failed to fetch book data: ${response.statusText}`);
          }
          
          setDownloadProgress('Processando dados...');
          const versesData = await response.json();
          
          setDownloadProgress('Salvando offline...');
          // bulkAdd is extremely fast in IndexedDB
          await db.verses.bulkAdd(versesData);
          console.log(`Successfully cached ${versesData.length} verses of ${book.name} offline!`);
        }
        
        // 3. Load from IndexedDB to compute chapters
        const cachedVerses = await db.verses.where('book_abbrev').equals(book.abbrev).toArray();
        const chapters = new Set(cachedVerses.map(v => v.chapter));
        setTotalChapters(chapters.size || 1);
      } catch (error) {
        console.error(`Failed to load book ${book.name}:`, error);
      } finally {
        loadingBooks.delete(book.abbrev);
        setIsFetching(false);
        setDownloadProgress(null);
      }
    };
    
    loadBook();
  }, [book]);

  const verses = useLiveQuery(
    () => db.verses.where({ book_abbrev: book.abbrev, chapter }).toArray(),
    [book.abbrev, chapter]
  );


  const prevChapter = () => {
    if (chapter > 1) setChapter(c => c - 1);
    window.speechSynthesis.cancel();
  };

  const nextChapter = () => {
    if (chapter < totalChapters) setChapter(c => c + 1);
    window.speechSynthesis.cancel();
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChapter(Number(e.target.value));
    window.speechSynthesis.cancel();
  };

  const playAudio = (verseId: number, words: {hebrew: string, transliteration: string}[]) => {
    if (playingVerse === verseId) {
      window.speechSynthesis.cancel();
      setPlayingVerse(null);
      return;
    }

    window.speechSynthesis.cancel();
    setPlayingVerse(verseId);

    // Lê a transliteração em vez do hebraico, pois garante que funcione em qualquer dispositivo
    const textToSpeak = words
      .map(w => w.transliteration.toLowerCase())
      .join(' ')
      // Algumas substituições básicas para o TTS ler melhor a fonética
      .replace(/ë/g, 'e')
      .replace(/å/g, 'a')
      .replace(/sh/g, 'ch');
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.6; // Reduzido de 0.85 para 0.6 para ser mais lento e compreensível
    utterance.pitch = 0.7; // Tom mais grave para simular um senhor
    
    const voices = window.speechSynthesis.getVoices();
    // Tenta encontrar uma voz masculina em português (ex: Daniel no Windows/Edge)
    let selectedVoice = voices.find(v => 
      v.lang.includes('pt-BR') && 
      (v.name.includes('Daniel') || v.name.includes('Antonio') || v.name.includes('Male'))
    );
    
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.includes('pt-BR'));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => setPlayingVerse(null);
    utterance.onerror = () => setPlayingVerse(null);

    window.speechSynthesis.speak(utterance);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  // Filtra versículos duplicados pelo número do versículo para garantia absoluta de exibição limpa
  const uniqueVerses = verses
    ? Array.from(new Map(verses.map(v => [v.verse, v])).values()).sort((a, b) => a.verse - b.verse)
    : [];

  return (
    <div className="reader-container">
      <header className="reader-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn-icon" onClick={onOpenSidebar} style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}>
            <Menu size={20} />
          </button>
          <h2 className="book-title">{book.name}</h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="chapter-selector">
            <button className="btn-icon" onClick={prevChapter} disabled={chapter <= 1}>
              <ChevronLeft size={20} />
            </button>
            
            <select 
              className="chapter-select" 
              value={chapter} 
              onChange={handleChapterChange}
              title="Selecione o capítulo"
            >
              {Array.from({ length: totalChapters }, (_, i) => i + 1).map(c => (
                <option key={c} value={c}>Capítulo {c}</option>
              ))}
            </select>
            
            <button className="btn-icon" onClick={nextChapter} disabled={chapter >= totalChapters}>
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)', margin: '0 0.5rem' }} />
          <ThemeToggle />
        </div>
      </header>

      <main className="reader-content">
        <div className="text-container">
          {isFetching || !verses ? (
            <div className="loading-container" style={{ height: '50vh', gap: '1.5rem', background: 'transparent' }}>
              <div className="spinner"></div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '1.1rem' }}>
                  {downloadProgress ? `Preparando o livro de ${book.name}` : 'Carregando versículos...'}
                </p>
                {downloadProgress && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    {downloadProgress} • Acesso offline ativado
                  </p>
                )}
              </div>
            </div>
          ) : uniqueVerses.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum versículo encontrado.</p>
          ) : (
            uniqueVerses.map(v => (
              <div key={v.id} className="verse-container">
                <div className="verse-header">
                  <span className="verse-number">{chapter}.{v.verse}</span>
                  <p className="verse-text-pt">{v.text_pt}</p>
                  <button 
                    className="btn-play" 
                    onClick={() => playAudio(v.id!, v.words)}
                    title="Ouvir em Hebraico"
                  >
                    {playingVerse === v.id ? <Square size={16} /> : <Play size={16} fill="currentColor" />}
                  </button>
                </div>
                
                <div className="interlinear-row">
                  {v.words.map((word, idx) => (
                    <div key={idx} className="word-block">
                      <span className="word-hebrew">{word.hebrew}</span>
                      <span className="word-transliteration">{word.transliteration}</span>
                      <span className="word-portuguese">{word.portuguese}</span>
                      <span className="word-number">{word.number}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};
