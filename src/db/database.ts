import Dexie from 'dexie';
import type { Table } from 'dexie';

export interface Book {
  id?: number;
  name: string;
  abbrev: string;
  category: string;
  testament: string;
  order: number;
}

export interface InterlinearWord {
  hebrew: string;
  transliteration: string;
  portuguese: string;
  number: string;
}

export interface Verse {
  id?: number;
  book_abbrev: string;
  chapter: number;
  verse: number;
  text_pt: string; // The full text in Portuguese (for the top line)
  words: InterlinearWord[]; // The interlinear breakdown
  audio_start?: number;
  audio_end?: number;
}

export class BibleDatabase extends Dexie {
  books!: Table<Book>;
  verses!: Table<Verse>;

  constructor() {
    super('BibleDB');
    // Version 2: changed verses structure
    this.version(2).stores({
      books: '++id, name, abbrev, category, testament, order',
      verses: '++id, book_abbrev, chapter, verse, [book_abbrev+chapter]'
    });
  }
}

export const db = new BibleDatabase();
