import { db } from './database';
import type { Book } from './database';

export const seedDatabase = async () => {
  try {
    const booksCount = await db.books.count();
    
    if (booksCount === 0) {
      console.log('Database empty, fetching books list...');
      const response = await fetch('db/books.json');
      if (!response.ok) {
        throw new Error('Failed to fetch books.json');
      }
      
      const booksToInsert: Book[] = await response.json();
      await db.books.bulkAdd(booksToInsert);
      console.log('Books seeded successfully!');
    } else {
      console.log('Books already seeded.');
    }
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
};

