import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Star, TrendingUp, BarChart3 } from "lucide-react";
import type { Book } from "../../lib/booksApi";
import { Button } from "../../components/ui/button";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import {
  createAdminBook,
  deleteAdminBook,
  listAdminBooks,
  listAdminTopRatedBooks,
  updateAdminBook,
} from "../../lib/adminApi";

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 25;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  const {
    data: booksPage,
    isLoading: isBooksLoading,
    isError: isBooksError,
  } = useQuery({
    queryKey: ["admin-books", currentPage, searchQuery],
    queryFn: () =>
      listAdminBooks({
        page: currentPage,
        pageSize,
        q: searchQuery.trim() || undefined,
      }),
    placeholderData: (previousData) => previousData,
  });
  const books = booksPage?.items ?? [];
  const totalBooks = booksPage?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalBooks / pageSize));
  const pageStart = Math.max(1, currentPage - 2);
  const pageEnd = Math.min(totalPages, pageStart + 4);
  const pageNumbers = Array.from({ length: pageEnd - pageStart + 1 }, (_, index) => pageStart + index);
  const { data: topRatedBooksData = [] } = useQuery({
    queryKey: ["admin-top-rated-books"],
    queryFn: () => listAdminTopRatedBooks(10),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      genre: "",
      rating: "",
      description: "",
      yearPublished: "",
      pageCount: "",
      isbn: "",
      coverUrl: "",
    });
  };

  const createMutation = useMutation({
    mutationFn: createAdminBook,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-top-rated-books"] });
      setIsDialogOpen(false);
      resetForm();
      setErrorMessage(null);
    },
    onError: (error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create book");
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateAdminBook>[1] }) =>
      updateAdminBook(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-top-rated-books"] });
      setIsDialogOpen(false);
      setEditingBook(null);
      resetForm();
      setErrorMessage(null);
    },
    onError: (error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update book");
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAdminBook,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-top-rated-books"] });
      setErrorMessage(null);
    },
    onError: (error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete book");
    },
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
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      author: formData.author,
      genre: formData.genre,
      rating: Number(formData.rating),
      description: formData.description,
      year_published: Number(formData.yearPublished),
      page_count: Number(formData.pageCount),
      isbn: formData.isbn,
      cover_url: formData.coverUrl || "https://via.placeholder.com/300x450?text=Book",
    };

    if (editingBook) {
      updateMutation.mutate({ id: editingBook.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openNewBookDialog = () => {
    setEditingBook(null);
    resetForm();
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
      {errorMessage && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {errorMessage}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-1">Total Books</p>
          <p className="text-3xl font-semibold text-slate-800">{totalBooks}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-1">Avg Rating (Current Page)</p>
          <p className="text-3xl font-semibold text-slate-800">
            {books.length > 0 ? (books.reduce((sum, b) => sum + b.rating, 0) / books.length).toFixed(1) : "0.0"}
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
        {/* Popularity vs Quality */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Popularity vs Rating</h3>
              <p className="text-sm text-slate-600">Ratings count against average rating</p>
            </div>
          </div>
          <div className="mt-2">
            <ResponsiveContainer width="100%" height={340}>
              <ScatterChart
                margin={{ top: 12, right: 16, left: 16, bottom: 8 }}
              >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  dataKey="ratingsCount"
                  name="Ratings Count"
                  stroke="#64748b"
                />
              <YAxis
                  type="number"
                  dataKey="avgRating"
                  name="Average Rating"
                  domain={[0, 5]}
                  stroke="#64748b"
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value: number, name: string) => [
                    typeof value === "number" ? value.toFixed(2) : value,
                    name,
                  ]}
                  labelFormatter={(_, payload) =>
                    payload && payload[0] ? String(payload[0].payload.title) : ""
                  }
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Scatter data={topRatedBooksData} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
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
                        {book.avgRating.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                      {book.ratingsCount} ratings
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search title or author..."
            className="max-w-md"
          />
          <p className="text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </p>
        </div>
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
            {isBooksLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500">
                  Loading books...
                </TableCell>
              </TableRow>
            )}
            {isBooksError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-red-600">
                  Failed to load books from backend.
                </TableCell>
              </TableRow>
            )}
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
        {!isBooksError && totalBooks > 0 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((page) => Math.max(1, page - 1));
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {pageNumbers.map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((page) => Math.min(totalPages, page + 1));
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
