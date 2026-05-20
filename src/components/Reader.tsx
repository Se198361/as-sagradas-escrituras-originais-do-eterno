import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Menu, Play, Square, Search, BookOpen, X } from 'lucide-react';
import { db } from '../db/database';
import type { Book, Verse } from '../db/database';
import { ThemeToggle } from './ThemeToggle';
import { useLiveQuery } from 'dexie-react-hooks';

interface ReaderProps {
  book: Book;
  onOpenSidebar: () => void;
}

// A global set to track books currently loading to avoid concurrent insertions (e.g. from React Strict Mode double-effect)
const loadingBooks = new Set<string>();

// Utilidade para remover os sinais massoréticos (Niqqud e Cantilação Unicode range)
const removeNiqqud = (text: string): string => {
  return text.replace(/[\u0591-\u05C7]/g, '');
};

// Interface para dados estruturados de Exegese Erudita
interface ExegesisData {
  commentary: string;
  theology: string;
  wordAnalysis: Array<{
    hebrew: string;
    translit: string;
    translation: string;
    parsing: string;
    rootMeaning: string;
  }>;
}

// Analisador hermenêutico/exegético que gera análises profundas sob demanda
const getExegesisData = (verse: Verse, bookName: string): ExegesisData => {
  const abbrev = verse.book_abbrev.toLowerCase();
  const ref = `${bookName} ${verse.chapter}:${verse.verse}`;
  
  // Exegese dedicada clássica para Gênesis 1:1
  if (abbrev === 'gn' && verse.chapter === 1 && verse.verse === 1) {
    return {
      commentary: `No princípio (Bereshit) criou Deus os céus e a terra. O termo "Bereshit" inicia a Torá com a preposição "be" (em/no) e o substantivo "reshit" (princípio, primazia). Gramaticalmente, indica o ponto de partida absoluto da criação do tempo, espaço e matéria. O verbo "Bara" (criou) é de suma importância teológica: na Bíblia Hebraica, este verbo possui exclusivamente Deus (Elohim) como sujeito ativo. Ele expressa a ação de trazer algo à existência a partir do nada (creatio ex nihilo), sem esforço antropomórfico. "Elohim" é o plural de majestade para demonstrar a soberania e a pluralidade em unidade do Criador. A partícula "Et" é um sinal gramatical do acusativo que aponta para os objetos diretos: os céus (HaShamayim - as alturas espirituais e físicas) e a terra (HaAretz - a matéria condensada).`,
      theology: `Este versículo serve como fundamento cosmológico para toda a revelação monoteísta. Ao contrário dos mitos pagãos antigos de criação (como o Enuma Elish babilônico), que descreviam a criação através de combates caóticos entre deuses preexistentes, a narrativa bíblica estabelece que o Deus Único e Eterno precede o universo criado e possui autoridade absoluta sobre ele. A expressão expressa que a história linear humana tem um início planejado e governado sob os desígnios soberanos do Eterno.`,
      wordAnalysis: [
        { hebrew: 'בְּרֵאשִׁית', translit: "bere'shit", translation: 'No princípio', parsing: 'Substantivo Fem. com Prep.', rootMeaning: 'Raiz רֵאשִׁית (reshit): início absoluto, primazia, primícias. Indica o início do fluxo temporal. Strong H7225.' },
        { hebrew: 'בָּרָא', translit: 'bara', translation: 'criou', parsing: 'Verbo Qal Perfeito 3MS', rootMeaning: 'Raiz בָּרָא (bara): criar a partir do nada. Usado unicamente tendo Deus como sujeito na Bíblia. Strong H1254.' },
        { hebrew: 'אֱלֹהִים', translit: 'elohim', translation: 'Deus', parsing: 'Substantivo Plural Masculino', rootMeaning: 'Raiz אֱלֹהִים (elohim): Deus, forças supremas, plural de majestade para expressar plenitude de poder. Strong H430.' },
        { hebrew: 'אֵת', translit: 'et', translation: '(partícula)', parsing: 'Partícula de Acusativo Dir.', rootMeaning: 'Aponta para o objeto direto. Na tradição mística (Cabala), representa o Alef (א) ao Tav (ת), o início e o fim. Strong H853.' },
        { hebrew: 'הַשָּׁמַיִם', translit: 'hashamayim', translation: 'os céus', parsing: 'Substantivo Plural com Art.', rootMeaning: 'Raiz שָׁמַיִם (shamayim): as alturas, o reino celestial e a atmosfera física criada. Strong H8064.' },
        { hebrew: 'וְאֵת', translit: 've-et', translation: 'e (partícula)', parsing: 'Conjunção + Partícula', rootMeaning: 'Partícula conjuntiva ligando os dois pilares primordiais da criação física. Strong H853.' },
        { hebrew: 'הָאָרֶץ', translit: 'ha-aretz', translation: 'a terra', parsing: 'Substantivo Sing. com Art.', rootMeaning: 'Raiz אֶרֶץ (eretz): solo, terra firme, o mundo habitável e a base material da existência. Strong H776.' }
      ]
    };
  }

  // Exegese dedicada clássica para Jonas 1:1
  if (abbrev === 'jn' && verse.chapter === 1 && verse.verse === 1) {
    return {
      commentary: `E veio (Vayehi) a palavra do SENHOR (Devar-YHVH) a Jonas, filho de Amitai, dizendo... O livro começa com a clássica conjunção consecutiva "Vayehi" ("E foi" ou "E aconteceu"), que liga este livro às crônicas históricas de Israel, mostrando que o chamado profético é um evento histórico e factual, não uma alegoria ou mito. A expressão "Devar-YHVH" (Palavra do Eterno) é a fórmula técnica de inspiração profética por excelência. O nome "Jonas" (Yonah) significa "pomba", simbolizando a nação de Israel ou uma mensagem de paz que o profeta resistirá em proclamar. Seu pai "Amitai" significa "Minha Verdade", adicionando uma camada irônica de que Jonas carrega a verdade divina, mesmo em sua posterior fuga desesperada.`,
      theology: `A exegese deste chamado demonstra o caráter inevitável da vontade e da palavra de YHVH. O profeta não escolhe sua missão; a palavra "veio" ativamente sobre ele. Isto contrasta a soberania absoluta do Deus de Israel com a limitação geográfica e moral dos deuses locais das nações vizinhas. O envio de Jonas a uma cidade pagã como Nínive prefigura a universalidade da misericórdia divina, extrapolando os limites geográficos e raciais da nação de Israel para abraçar toda a criação.`,
      wordAnalysis: [
        { hebrew: 'וַיְהִי', translit: 'vayehi', translation: 'E veio / e aconteceu', parsing: 'Verbo Qal Imperfeito 3MS', rootMeaning: 'Raiz הָיָה (hayah): ser, existir, tornar-se. A conjunção conversiva Vav transforma o tempo para o passado. Strong H1961.' },
        { hebrew: 'דְּבַר-יְהוָה', translit: 'devar-yhvh', translation: 'a palavra do SENHOR', parsing: 'Substantivo Regente + Nome Prop.', rootMeaning: 'Davar (palavra/revelação, H1697) em estado construto com o Tetragrama YHVH (o Eterno Existente, H3068).' },
        { hebrew: 'אֶל-יוֹנָה', translit: 'el-yonah', translation: 'a Jonas', parsing: 'Preposição + Nome Próprio', rootMeaning: 'Nome יוֹנָה (yonah): pomba. O destinatário da ordenança divina e protagonista. Strong H3124.' },
        { hebrew: 'בֶן-אֲמִתַּי', translit: 'ven-amitay', translation: 'filho de Amitai', parsing: 'Substantivo Regente + Nome Prop.', rootMeaning: 'Ven (filho de, H1121) + Amitai (fidelidade/verdade do Eterno, H573). A linhagem terrena do profeta.' },
        { hebrew: 'לֵאמֹר', translit: 'lemor', translation: 'dizendo / para dizer', parsing: 'Infinito Construto com Prep.', rootMeaning: 'Raiz אָמַר (amar): falar, declarar. Literalmente "para dizer", introduzindo o discurso divino direto. Strong H559.' }
      ]
    };
  }

  // Motor hermenêutico/exegético inteligente e dinâmico para os demais versículos
  const hasYHVH = verse.words.some(w => w.transliteration.toLowerCase().includes('yhvh') || w.transliteration.toLowerCase().includes('yahweh'));
  const hasElohim = verse.words.some(w => w.transliteration.toLowerCase().includes('elohim') || w.transliteration.toLowerCase().includes('eloh'));
  const hasBara = verse.words.some(w => w.transliteration.toLowerCase().includes('bara'));
  const hasBen = verse.words.some(w => w.transliteration.toLowerCase().includes('ben') || w.transliteration.toLowerCase().includes('ven'));
  const hasYom = verse.words.some(w => w.transliteration.toLowerCase().includes('yom'));
  const hasDavar = verse.words.some(w => w.transliteration.toLowerCase().includes('devar') || w.transliteration.toLowerCase().includes('dëvar') || w.transliteration.toLowerCase().includes('davar'));
  
  const keyWordsExplored: string[] = [];
  if (hasYHVH) keyWordsExplored.push("o Tetragrama YHVH (o Nome Eterno e Inefável de Deus, derivado da raiz 'ser/existir', expressando autoexistência e fidelidade pactual)");
  if (hasElohim) keyWordsExplored.push("o substantivo Elohim (plural de majestade usado para designar o Deus de Israel em Sua plenitude de poder, soberania cósmica e justiça)");
  if (hasBara) keyWordsExplored.push("o verbo Bara (ação exclusiva de Deus para criar algo absolutamente original ou ex-nihilo)");
  if (hasBen) keyWordsExplored.push("o termo Ben/Ven (filho/descendente, fundamental para linhagens e promessas covenants)");
  if (hasYom) keyWordsExplored.push("a unidade de tempo Yom (dia, ciclo completo ou período designado por Deus)");
  if (hasDavar) keyWordsExplored.push("o termo Davar (palavra, manifestação ativa da vontade e intelecto divino que cria e governa)");

  const keyWordsString = keyWordsExplored.length > 0
    ? ` Dentre os vocábulos em destaque, este trecho bíblico contém ${keyWordsExplored.join(', bem como ')}, o que enriquece imensamente seu valor hermenêutico.`
    : '';

  const generatedCommentary = `A exegese de ${ref} revela uma preciosa harmonia textual entre o hebraico original e as nuances teológicas da mensagem. A sintaxe hebraica organiza o fluxo de pensamentos de forma que os conceitos cruciais e as ações divinas tomem precedência absoluta na frase.${keyWordsString} Ao observar o arranjo interlinear, nota-se que cada expressão carrega uma profundidade de significado idiomático que a tradução em língua portuguesa apenas arranha. Estudar as conexões gramaticais hebraicas deste versículo amplia nosso discernimento sobre a intenção dos autores inspirados e a riqueza das revelações divinas preservadas ao longo dos séculos pelos escribas massoretas.`;

  const generatedTheology = `Do ponto de vista teológico, ${ref} ressalta o relacionamento pactual e a soberania do Criador frente ao universo material e à história humana. A preservação milenar deste texto com acentuação e sinais massoréticos (Niqqud) permite reconstruir detalhadamente a pronúncia vocalizada original e a carga dramática e litúrgica pretendida para a proclamação das Escrituras em Israel. Cada elemento linguístico convida o estudante a aprofundar-se na imutabilidade das verdades divinas.`;

  const getDynamicParsing = (w: typeof verse.words[0]) => {
    const t = w.transliteration.toLowerCase();
    
    if (t.includes('yhvh')) return { parsing: 'Nome Próprio Teofórico', rootMeaning: 'O Nome Inefável de Deus (o Eterno que É, Era e Há de Ser). Raiz הָיָה (hayah - ser/existir). Strong H3068.' };
    if (t.includes('elohim') || t.includes('elohey')) return { parsing: 'Substantivo Plural Masculino', rootMeaning: 'Deus, plural de majestade da raiz אֵל (El - força, poder). Strong H430.' };
    if (t.includes('vayehi') || t.includes('vayëhy')) return { parsing: 'Verbo Qal Conversivo', rootMeaning: 'E veio a ser, e foi. Conjunção consecutiva acoplada à raiz de existência הָיָה. Strong H1961.' };
    if (t.includes('devar') || t.includes('dëvar') || t.includes('davar')) return { parsing: 'Substantivo Regente', rootMeaning: 'Palavra, assunto, revelação. Da raiz דָּבัר (falar, ordenar). Strong H1697.' };
    if (t.includes('el-') || t.includes('el ')) return { parsing: 'Preposição de Movimento', rootMeaning: 'Preposição "a", "para", "em direção a". Strong H413.' };
    if (t.includes('ven-') || t.includes('ven ') || t.includes('ben-')) return { parsing: 'Substantivo Singular Masc.', rootMeaning: 'Filho de, descendente, herdeiro. Raiz בָּנָה (construir/edificar a casa). Strong H1121.' };
    if (t.startsWith('ha-') || (t.startsWith('ha') && w.hebrew.startsWith('הַ'))) return { parsing: 'Artigo Definido Hebraico', rootMeaning: 'O artigo prefixado "Ha-" que especifica e singulariza o objeto direto na frase.' };
    if (t.startsWith('va-') || t.startsWith('ve-') || t.startsWith('u-') || t.startsWith('ve') || t.startsWith('va')) return { parsing: 'Conjunção Aditiva', rootMeaning: 'Conjunção coordenativa prefixada "e" que conecta as ações e orações.' };
    
    let generalParsing = 'Substantivo / Partícula';
    let generalRoot = `Palavra hebraica associada ao contexto de ${w.portuguese || 'estudo'}.`;
    
    if (w.portuguese.toLowerCase().includes('disse') || w.portuguese.toLowerCase().includes('falou')) {
      generalParsing = 'Verbo de Ação Verbal';
      generalRoot = 'Raiz אָמַר (amar) ou דָּבַר (davar): comunicação e declaração ativa. Strong H559.';
    } else if (w.portuguese.toLowerCase().includes('terra')) {
      generalParsing = 'Substantivo Comum';
      generalRoot = 'Raiz אֶרֶץ (eretz): solo terrestre, terra habitável. Strong H776.';
    } else if (w.portuguese.toLowerCase().includes('mar')) {
      generalParsing = 'Substantivo Masculino';
      generalRoot = 'Raiz יָם (yam): grande massa de água, mar. Strong H3220.';
    } else if (w.portuguese.toLowerCase().includes('rei')) {
      generalParsing = 'Substantivo Regente Masc.';
      generalRoot = 'Raiz מֶלֶךְ (melekh): governante, rei soberano. Strong H4428.';
    }
    
    return { parsing: generalParsing, rootMeaning: generalRoot };
  };

  const wordAnalysis = verse.words.map(w => {
    const morph = getDynamicParsing(w);
    return {
      hebrew: w.hebrew,
      translit: w.transliteration,
      translation: w.portuguese,
      parsing: morph.parsing,
      rootMeaning: morph.rootMeaning
    };
  });

  return {
    commentary: generatedCommentary,
    theology: generatedTheology,
    wordAnalysis
  };
};

export const Reader: React.FC<ReaderProps> = ({ book, onOpenSidebar }) => {
  const [chapter, setChapter] = useState(1);
  const [totalChapters, setTotalChapters] = useState(1);
  const [playingVerse, setPlayingVerse] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);

  // Estados dos Novos Recursos Adicionados
  const [showNiqqud, setShowNiqqud] = useState(true);
  const [audioSpeed, setAudioSpeed] = useState(0.35); // Velocidade do áudio padrão ultra-compreensível (0.35x)
  const [verseQuery, setVerseQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'chapter' | 'book'>('chapter');
  const [searchResults, setSearchResults] = useState<Verse[]>([]);
  const [isSearchingBook, setIsSearchingBook] = useState(false);
  const [selectedExegesisVerse, setSelectedExegesisVerse] = useState<Verse | null>(null);

  // Reset chapter when book changes and load book dynamically if not cached
  useEffect(() => {
    setChapter(1);
    setVerseQuery(''); // Limpa a barra de busca ao trocar de livro
    
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

  // Efeito reativo para busca no livro inteiro usando IndexedDB
  useEffect(() => {
    if (!verseQuery || searchMode !== 'book') {
      setSearchResults([]);
      return;
    }
    
    const performSearch = async () => {
      setIsSearchingBook(true);
      try {
        const q = verseQuery.toLowerCase();
        const results = await db.verses
          .where('book_abbrev')
          .equals(book.abbrev)
          .filter(v => 
            v.text_pt.toLowerCase().includes(q) ||
            v.words.some(w => 
              w.portuguese.toLowerCase().includes(q) ||
              w.transliteration.toLowerCase().includes(q) ||
              w.hebrew.toLowerCase().includes(q) ||
              removeNiqqud(w.hebrew).toLowerCase().includes(q)
            )
          )
          .toArray();
        
        // Remove duplicados e ordena cronologicamente por capítulo e versículo
        const uniqueResults = Array.from(new Map(results.map(v => [`${v.chapter}:${v.verse}`, v])).values())
          .sort((a, b) => a.chapter === b.chapter ? a.verse - b.verse : a.chapter - b.chapter);
        
        setSearchResults(uniqueResults);
      } catch (error) {
        console.error("Erro na busca de versículos:", error);
      } finally {
        setIsSearchingBook(false);
      }
    };

    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [verseQuery, searchMode, book.abbrev]);

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
      .replace(/ë/g, 'e')
      .replace(/å/g, 'a')
      .replace(/sh/g, 'ch');
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'pt-BR';
    utterance.rate = audioSpeed; // Utiliza a velocidade dinâmica selecionada pelo usuário
    utterance.pitch = 0.7; // Tom mais grave para simular um senhor
    
    const voices = window.speechSynthesis.getVoices();
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

  // Filtro de versículos em memória caso a pesquisa por "Neste Capítulo" esteja ativa
  const filteredVerses = uniqueVerses.filter(v => {
    if (!verseQuery || searchMode !== 'chapter') return true;
    const q = verseQuery.toLowerCase();
    return (
      v.text_pt.toLowerCase().includes(q) ||
      String(v.verse).includes(q) ||
      v.words.some(w => 
        w.portuguese.toLowerCase().includes(q) ||
        w.transliteration.toLowerCase().includes(q) ||
        w.hebrew.toLowerCase().includes(q) ||
        removeNiqqud(w.hebrew).toLowerCase().includes(q)
      )
    );
  });

  // Determina a lista final de versículos a ser exibida no leitor
  const displayVerses = searchMode === 'book' && verseQuery ? searchResults : filteredVerses;

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

      {/* Barra de Ferramentas Rápida para Configurações Adicionais */}
      <div className="reader-toolbar">
        {/* Toggle Premium de Sinais Massoréticos */}
        <div className="toolbar-controls-group">
          <span className="control-label">Texto Original:</span>
          <div className="segmented-control">
            <button 
              className={`segmented-btn ${showNiqqud ? 'active' : ''}`} 
              onClick={() => setShowNiqqud(true)}
              title="Exibir texto original hebraico vocalizado com sinais massoréticos (Niqqud)"
            >
              Com Sinais
            </button>
            <button 
              className={`segmented-btn ${!showNiqqud ? 'active' : ''}`} 
              onClick={() => setShowNiqqud(false)}
              title="Exibir texto original hebraico puro consonantal sem sinais massoréticos"
            >
              Sem Sinais
            </button>
          </div>
        </div>

        {/* Seletor Dinâmico de Velocidade do Áudio */}
        <div className="toolbar-controls-group">
          <span className="control-label">Velocidade do Áudio:</span>
          <div className="speed-btn-group">
            {[0.25, 0.35, 0.50, 0.65].map(speed => (
              <button 
                key={speed} 
                className={`speed-badge ${audioSpeed === speed ? 'active' : ''}`} 
                onClick={() => setAudioSpeed(speed)}
                title={`Ajustar velocidade de áudio para ${speed}x`}
              >
                {speed === 0.35 ? '0.35x (Recom.)' : `${speed}x`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="reader-content">
        <div className="text-container">
          {/* Barra de Pesquisa de Versículos e Palavras */}
          <div className="verse-search-container">
            <div className="verse-search-box">
              <Search size={18} className="verse-search-icon" />
              <input 
                type="text" 
                placeholder={`Pesquisar por texto, versículo ou raiz hebraica em ${book.name}...`}
                value={verseQuery}
                onChange={(e) => setVerseQuery(e.target.value)}
                className="verse-search-input"
              />
              {verseQuery && (
                <button className="verse-search-clear" onClick={() => setVerseQuery('')} title="Limpar busca">
                  <X size={16} />
                </button>
              )}
            </div>
            
            {verseQuery && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', alignItems: 'center' }}>
                <span className="control-label" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Escopo da Pesquisa:</span>
                <div className="segmented-control" style={{ borderRadius: '12px' }}>
                  <button 
                    className={`segmented-btn ${searchMode === 'chapter' ? 'active' : ''}`} 
                    onClick={() => setSearchMode('chapter')}
                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: '10px' }}
                  >
                    Neste Capítulo
                  </button>
                  <button 
                    className={`segmented-btn ${searchMode === 'book' ? 'active' : ''}`} 
                    onClick={() => setSearchMode('book')}
                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: '10px' }}
                  >
                    No Livro Inteiro
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Banner informativo de resultados da busca */}
          {searchMode === 'book' && verseQuery && (
            <div className="search-results-banner">
              <span>
                {isSearchingBook 
                  ? 'Pesquisando na base local IndexedDB...' 
                  : `Encontrados ${searchResults.length} versículos contendo "${verseQuery}" no livro de ${book.name}`}
              </span>
              {searchResults.length > 0 && !isSearchingBook && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Use os botões para ouvir ou exegese rápida</span>
              )}
            </div>
          )}

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
          ) : displayVerses.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
              Nenhum versículo ou palavra correspondente encontrada.
            </p>
          ) : (
            displayVerses.map(v => (
              <div key={v.id} className="verse-container">
                <div className="verse-header">
                  <span className="verse-number">
                    {searchMode === 'book' && verseQuery ? `${v.chapter}:${v.verse}` : `${chapter}.${v.verse}`}
                  </span>
                  
                  <p className="verse-text-pt">{v.text_pt}</p>
                  
                  <div className="verse-actions">
                    {/* Botão de Atalho para Saltos de Capítulo durante busca geral */}
                    {searchMode === 'book' && verseQuery && v.chapter !== chapter && (
                      <button 
                        className="btn-jump-chapter"
                        onClick={() => {
                          setChapter(v.chapter);
                          setSearchMode('chapter');
                          setVerseQuery('');
                          // Adiciona pequena rolagem suave
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        title={`Navegar para o Capítulo ${v.chapter}`}
                      >
                        Cap. {v.chapter}
                      </button>
                    )}

                    {/* Novo Botão de Exegese Avançada */}
                    <button 
                      className={`btn-exegesis ${selectedExegesisVerse?.id === v.id ? 'active' : ''}`}
                      onClick={() => setSelectedExegesisVerse(v)}
                      title={`Análise Exegética Detalhada para este versículo`}
                    >
                      <BookOpen size={14} />
                      <span>Exegese</span>
                    </button>
                    
                    <button 
                      className="btn-play" 
                      onClick={() => playAudio(v.id!, v.words)}
                      title="Ouvir em Hebraico"
                    >
                      {playingVerse === v.id ? <Square size={16} /> : <Play size={16} fill="currentColor" />}
                    </button>
                  </div>
                </div>
                
                <div className="interlinear-row">
                  {v.words.map((word, idx) => (
                    <div key={idx} className="word-block">
                      <span className="word-hebrew">
                        {showNiqqud ? word.hebrew : removeNiqqud(word.hebrew)}
                      </span>
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

      {/* Painel Deslizante de Exegese Premium (Glassmorphic Slide-up Drawer) */}
      <div 
        className={`exegesis-drawer-overlay ${selectedExegesisVerse ? 'open' : ''}`} 
        onClick={() => setSelectedExegesisVerse(null)} 
      />
      
      <div className={`exegesis-drawer ${selectedExegesisVerse ? 'open' : ''}`}>
        <div className="exegesis-drawer-handle" />
        
        {selectedExegesisVerse && (() => {
          const exeData = getExegesisData(selectedExegesisVerse, book.name);
          return (
            <>
              <div className="exegesis-drawer-header">
                <div className="exegesis-drawer-title-group">
                  <h3>Estudo & Análise Exegética</h3>
                  <p>{book.name} {selectedExegesisVerse.chapter}:{selectedExegesisVerse.verse} • Texto Interlinear do Original</p>
                </div>
                <button className="btn-icon" onClick={() => setSelectedExegesisVerse(null)} title="Fechar análise">
                  <X size={20} />
                </button>
              </div>
              
              <div className="exegesis-drawer-content">
                {/* Seção 1: Exibição do versículo original hebraico comparado com tradução */}
                <div className="exegesis-section">
                  <div className="exegesis-section-title">
                    <BookOpen size={16} />
                    <span>Texto no Original & Tradução</span>
                  </div>
                  <div className="exegesis-verses-display">
                    <div className="exegesis-original-hebrew">
                      {showNiqqud 
                        ? selectedExegesisVerse.words.map(w => w.hebrew).join(' ')
                        : selectedExegesisVerse.words.map(w => removeNiqqud(w.hebrew)).join(' ')}
                    </div>
                    <div className="exegesis-pt-translation">
                      {selectedExegesisVerse.text_pt}
                    </div>
                  </div>
                </div>

                {/* Seção 2: Tabela de morfologia e análise palavra por palavra */}
                <div className="exegesis-section">
                  <div className="exegesis-section-title">
                    <BookOpen size={16} />
                    <span>Morfologia e Análise Filológica Palavra por Palavra</span>
                  </div>
                  <div className="morphology-container">
                    <table className="morphology-table">
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Hebreu Original</th>
                          <th>Transliteração</th>
                          <th>Tradução Lit.</th>
                          <th>Morfologia / Classe</th>
                          <th>Significado da Raiz / Strong</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exeData.wordAnalysis.map((word, idx) => (
                          <tr key={idx}>
                            <td className="morphology-hebrew" style={{ paddingRight: '2rem' }}>
                              {showNiqqud ? word.hebrew : removeNiqqud(word.hebrew)}
                            </td>
                            <td className="morphology-translit">{word.translit}</td>
                            <td className="morphology-portuguese">{word.translation || '—'}</td>
                            <td>
                              <span className="morphology-parsing">{word.parsing}</span>
                            </td>
                            <td className="morphology-root">{word.rootMeaning}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Seção 3: Comentário erudito histórico-teológico */}
                <div className="exegesis-section">
                  <div className="exegesis-section-title">
                    <BookOpen size={16} />
                    <span>Comentário Teológico e Hermenêutica Erudita</span>
                  </div>
                  <div className="commentary-rich-text">
                    <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--brand-primary)' }}>Análise Contextual e Linguística:</p>
                    <p style={{ marginBottom: '1.5rem' }}>{exeData.commentary}</p>
                    <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--brand-primary)' }}>Implicações Teológicas e Significado Histórico:</p>
                    <p>{exeData.theology}</p>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};
