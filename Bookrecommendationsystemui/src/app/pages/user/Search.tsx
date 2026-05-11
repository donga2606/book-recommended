import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Search as SearchIcon, Star, SlidersHorizontal } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { listBooks, listGenres } from "../../lib/booksApi";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const PAGE_SIZE = 20;

export function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [minRating, setMinRating] = useState("0");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: genres = ["All"] } = useQuery({
    queryKey: ["genres"],
    queryFn: listGenres,
  });
  const { data, isLoading, isError } = useQuery({
    queryKey: ["books", searchQuery, selectedGenre, minRating, currentPage],
    queryFn: () =>
      listBooks({
        q: searchQuery.trim() || undefined,
        genre: selectedGenre,
        minRating: Number(minRating),
        page: currentPage,
        pageSize: PAGE_SIZE,
      }),
    placeholderData: (previousData) => previousData,
  });
  const filteredBooks = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const pageStart = Math.max(1, currentPage - 2);
  const pageEnd = Math.min(totalPages, pageStart + 4);
  const pageNumbers = Array.from({ length: pageEnd - pageStart + 1 }, (_, index) => pageStart + index);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-800 mb-2">
          Search Books
        </h1>
        <p className="text-slate-600">
          Discover your next favorite book
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-12 rounded-xl border-slate-200"
            />
          </div>

          {/* Genre Filter */}
          <Select
            value={selectedGenre}
            onValueChange={(value) => {
              setSelectedGenre(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-48 h-12 rounded-xl border-slate-200">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              {genres.map(genre => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Rating Filter */}
          <Select
            value={minRating}
            onValueChange={(value) => {
              setMinRating(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-48 h-12 rounded-xl border-slate-200">
              <SelectValue placeholder="Min Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any Rating</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="4.5">4.5+ Stars</SelectItem>
            </SelectContent>
          </Select>

          <Button className="h-12 px-6 rounded-xl bg-purple-600 hover:bg-purple-700">
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-slate-600">
          Found {data?.total ?? 0} {(data?.total ?? 0) === 1 ? "book" : "books"}
        </p>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading && <p className="text-slate-600">Loading books...</p>}
        {isError && (
          <p className="text-red-600">
            Failed to load books from backend. Make sure backend is running.
          </p>
        )}
        {filteredBooks.map(book => (
          <Link
            key={book.id}
            to={`/book/${book.id}`}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-slate-200"
          >
            <div className="aspect-[3/4] overflow-hidden bg-slate-100">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-800 mb-1 line-clamp-1">
                {book.title}
              </h3>
              <p className="text-sm text-slate-600 mb-2">{book.author}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-slate-700">
                    {book.rating}
                  </span>
                </div>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  {book.genre}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {!isError && (data?.total ?? 0) > 0 && (
        <div className="mt-8 space-y-2">
          <p className="text-sm text-slate-600 text-center">
            Page {currentPage} of {totalPages}
          </p>
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
  );
}
