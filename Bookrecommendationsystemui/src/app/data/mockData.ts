export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  rating: number;
  coverUrl: string;
  description: string;
  yearPublished: number;
  pageCount: number;
  isbn: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  readingHistory: number[];
  preferences: string[];
}

export const currentUser: User = {
  id: 1,
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
  readingHistory: [1, 3, 5, 7, 9, 11],
  preferences: ["Science Fiction", "Mystery", "Fantasy"]
};

export const books: Book[] = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Fiction",
    rating: 4.5,
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
    yearPublished: 2020,
    pageCount: 304,
    isbn: "978-0525559474"
  },
  {
    id: 2,
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Science Fiction",
    rating: 4.8,
    coverUrl: "https://images.unsplash.com/photo-1614544048536-0d28caf77f41?w=400",
    description: "Ryland Grace is the sole survivor on a desperate, last-chance mission to save both humanity and Earth itself.",
    yearPublished: 2021,
    pageCount: 476,
    isbn: "978-0593135204"
  },
  {
    id: 3,
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    genre: "Historical Fiction",
    rating: 4.6,
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    description: "Aging and reclusive Hollywood movie icon Evelyn Hugo is finally ready to tell the truth about her glamorous and scandalous life.",
    yearPublished: 2017,
    pageCount: 400,
    isbn: "978-1501161933"
  },
  {
    id: 4,
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    genre: "Mystery",
    rating: 4.4,
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
    description: "For years, rumors of the 'Marsh Girl' have haunted Barkley Cove, a quiet town on the North Carolina coast.",
    yearPublished: 2018,
    pageCount: 384,
    isbn: "978-0735219090"
  },
  {
    id: 5,
    title: "The Silent Patient",
    author: "Alex Michaelides",
    genre: "Thriller",
    rating: 4.3,
    coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400",
    description: "Alicia Berenson's life is seemingly perfect. Until one evening when she shoots her husband five times in the face.",
    yearPublished: 2019,
    pageCount: 336,
    isbn: "978-1250301697"
  },
  {
    id: 6,
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self-Help",
    rating: 4.7,
    coverUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400",
    description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones. No matter your goals, Atomic Habits offers a proven framework.",
    yearPublished: 2018,
    pageCount: 320,
    isbn: "978-0735211292"
  },
  {
    id: 7,
    title: "The Invisible Life of Addie LaRue",
    author: "V.E. Schwab",
    genre: "Fantasy",
    rating: 4.5,
    coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
    description: "A Life No One Will Remember. A Story You Will Never Forget. France, 1714: in a moment of desperation, a young woman makes a Faustian bargain.",
    yearPublished: 2020,
    pageCount: 448,
    isbn: "978-0765387561"
  },
  {
    id: 8,
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    rating: 4.6,
    coverUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling this inhospitable world.",
    yearPublished: 1965,
    pageCount: 688,
    isbn: "978-0441172719"
  },
  {
    id: 9,
    title: "Educated",
    author: "Tara Westover",
    genre: "Biography",
    rating: 4.7,
    coverUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400",
    description: "Born to survivalists in the mountains of Idaho, Tara Westover was seventeen the first time she set foot in a classroom.",
    yearPublished: 2018,
    pageCount: 352,
    isbn: "978-0399590504"
  },
  {
    id: 10,
    title: "The Song of Achilles",
    author: "Madeline Miller",
    genre: "Historical Fiction",
    rating: 4.6,
    coverUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    description: "A tale of gods, kings, immortal fame and the human heart, The Song of Achilles is a dazzling literary feat.",
    yearPublished: 2012,
    pageCount: 416,
    isbn: "978-0062060624"
  },
  {
    id: 11,
    title: "Circe",
    author: "Madeline Miller",
    genre: "Fantasy",
    rating: 4.5,
    coverUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400",
    description: "In the house of Helios, god of the sun and mightiest of the Titans, a daughter is born. But Circe is a strange child.",
    yearPublished: 2018,
    pageCount: 400,
    isbn: "978-0316556347"
  },
  {
    id: 12,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    genre: "Business",
    rating: 4.6,
    coverUrl: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400",
    description: "Doing well with money isn't necessarily about what you know. It's about how you behave.",
    yearPublished: 2020,
    pageCount: 256,
    isbn: "978-0857197689"
  }
];

export const getRecommendedBooks = (userId: number): { book: Book; reason: string }[] => {
  return [
    { book: books[1], reason: "Based on your love for science fiction" },
    { book: books[7], reason: "Fans of sci-fi classics will love this" },
    { book: books[6], reason: "Similar themes to your recent reads" },
    { book: books[10], reason: "Popular among readers with your taste" },
    { book: books[2], reason: "Historical fiction you might enjoy" },
    { book: books[4], reason: "Trending in thriller category" }
  ];
};

export const getSimilarBooks = (bookId: number): Book[] => {
  const book = books.find(b => b.id === bookId);
  if (!book) return [];
  return books.filter(b => b.genre === book.genre && b.id !== bookId).slice(0, 4);
};

export const genres = [
  "All",
  "Fiction",
  "Science Fiction",
  "Historical Fiction",
  "Mystery",
  "Thriller",
  "Fantasy",
  "Self-Help",
  "Biography",
  "Business"
];

export const modelMetrics = {
  accuracy: 87.5,
  precision: 84.2,
  recall: 89.3,
  f1Score: 86.7,
  status: "trained",
  lastTrained: "2026-04-05T14:30:00Z",
  trainingDuration: "2h 15m",
  trainRMSE: 0.782,
  testRMSE: 0.824
};

export const modelExperiments = [
  { version: "SVD (default)", factors: 100, rmse: 0.824, date: "2026-04-05" },
  { version: "SVD (50 factors)", factors: 50, rmse: 0.891, date: "2026-03-28" },
  { version: "SVD (100 factors)", factors: 100, rmse: 0.824, date: "2026-04-05" },
  { version: "SVD (150 factors)", factors: 150, rmse: 0.817, date: "2026-04-08" },
  { version: "SVD (200 factors)", factors: 200, rmse: 0.834, date: "2026-04-10" }
];

export const userActivityData = [
  { month: "Oct", users: 245, activeReaders: 198 },
  { month: "Nov", users: 289, activeReaders: 234 },
  { month: "Dec", users: 312, activeReaders: 267 },
  { month: "Jan", users: 356, activeReaders: 298 },
  { month: "Feb", users: 402, activeReaders: 345 },
  { month: "Mar", users: 445, activeReaders: 389 }
];

export const popularBooksData = [
  { title: "Project Hail Mary", reads: 342 },
  { title: "Educated", reads: 298 },
  { title: "Atomic Habits", reads: 276 },
  { title: "The Midnight Library", reads: 265 },
  { title: "Dune", reads: 234 }
];

export const topRatedBooksData = [
  { title: "Project Hail Mary", ratings: 487, avgRating: 4.8 },
  { title: "Educated", ratings: 445, avgRating: 4.7 },
  { title: "Atomic Habits", ratings: 423, avgRating: 4.7 },
  { title: "The Song of Achilles", ratings: 398, avgRating: 4.6 },
  { title: "Dune", ratings: 376, avgRating: 4.6 },
  { title: "The Seven Husbands...", ratings: 354, avgRating: 4.6 },
  { title: "The Psychology of Money", ratings: 332, avgRating: 4.6 },
  { title: "Circe", ratings: 312, avgRating: 4.5 },
  { title: "The Midnight Library", ratings: 298, avgRating: 4.5 },
  { title: "The Invisible Life...", ratings: 276, avgRating: 4.5 }
];
