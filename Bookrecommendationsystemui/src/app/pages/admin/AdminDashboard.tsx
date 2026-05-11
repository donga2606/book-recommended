import React, { useState } from "react";
import { Plus, Pencil, Trash2, Star, TrendingUp, BarChart3 } from "lucide-react";
import { books as initialBooks, Book, topRatedBooksData } from "../../data/mockData";
import { Button } from "../../components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";

export function AdminDashboard() {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    rating: "",
    description: "",
    yearPublished: "",
    pageCount: "",
    isbn: "",
    coverUrl: ""
  });

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      genre: book.genre,
      rating: book.rating.toString(),
      description: book.description,
      yearPublished: book.yearPublished.toString(),
      pageCount: book.pageCount.toString(),
      isbn: book.isbn,
      coverUrl: book.coverUrl
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this book?")) {
      setBooks(books.filter(b => b.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingBook) {
      // Update existing book
      setBooks(books.map(b =>
        b.id === editingBook.id
          ? {
            ...b,
            ...formData,
            rating: parseFloat(formData.rating),
            yearPublished: parseInt(formData.yearPublished),
            pageCount: parseInt(formData.pageCount)
          }
          : b
      ));
    } else {
      // Add new book
      const newBook: Book = {
        id: Math.max(...books.map(b => b.id)) + 1,
        title: formData.title,
        author: formData.author,
        genre: formData.genre,
        rating: parseFloat(formData.rating),
        description: formData.description,
        yearPublished: parseInt(formData.yearPublished),
        pageCount: parseInt(formData.pageCount),
        isbn: formData.isbn,
        coverUrl: formData.coverUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"
      };
      setBooks([...books, newBook]);
    }

    setIsDialogOpen(false);
    setEditingBook(null);
    setFormData({
      title: "",
      author: "",
      genre: "",
      rating: "",
      description: "",
      yearPublished: "",
      pageCount: "",
      isbn: "",
      coverUrl: ""
    });
  };

  const openNewBookDialog = () => {
    setEditingBook(null);
    setFormData({
      title: "",
      author: "",
      genre: "",
      rating: "",
      description: "",
      yearPublished: "",
      pageCount: "",
      isbn: "",
      coverUrl: ""
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600">
            Manage books in the system
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openNewBookDialog}
              className="bg-purple-600 hover:bg-purple-700 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBook ? "Edit Book" : "Add New Book"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    required
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    required
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="year">Year Published</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.yearPublished}
                    onChange={(e) => setFormData({ ...formData, yearPublished: e.target.value })}
                    required
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="pages">Pages</Label>
                  <Input
                    id="pages"
                    type="number"
                    value={formData.pageCount}
                    onChange={(e) => setFormData({ ...formData, pageCount: e.target.value })}
                    required
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    required
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cover">Cover URL</Label>
                <Input
                  id="cover"
                  value={formData.coverUrl}
                  onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                  placeholder="https://..."
                  className="rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 rounded-lg">
                  {editingBook ? "Update Book" : "Add Book"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-1">Total Books</p>
          <p className="text-3xl font-semibold text-slate-800">{books.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-1">Avg Rating</p>
          <p className="text-3xl font-semibold text-slate-800">
            {(books.reduce((sum, b) => sum + b.rating, 0) / books.length).toFixed(1)}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-1">Genres</p>
          <p className="text-3xl font-semibold text-slate-800">
            {new Set(books.map(b => b.genre)).size}
          </p>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top 10 Most Rated Books */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Top 10 Most Rated Books</h3>
              <p className="text-sm text-slate-600">Books with most user ratings</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topRatedBooksData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis
                type="category"
                dataKey="title"
                stroke="#64748b"
                width={120}
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px"
                }}
              />
              <Bar
                dataKey="ratings"
                fill="#8b5cf6"
                radius={[0, 8, 8, 0]}
                name="Number of Ratings"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average Rating per Book */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Average Rating per Book</h3>
              <p className="text-sm text-slate-600">Quality ratings across catalog</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto">
            {topRatedBooksData.map((book, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-xl p-4 border border-slate-100"
              >
                <p className="text-sm text-slate-700 mb-2 line-clamp-1 font-medium">
                  {book.title}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-semibold text-slate-800">
                      {book.avgRating}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {book.ratings} ratings
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Year</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map(book => (
              <TableRow key={book.id}>
                <TableCell className="font-medium">{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>
                  <span className="bg-slate-100 px-2 py-1 rounded-full text-xs">
                    {book.genre}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{book.rating}</span>
                  </div>
                </TableCell>
                <TableCell>{book.yearPublished}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(book)}
                      className="rounded-lg"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(book.id)}
                      className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
