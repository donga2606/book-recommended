import React from "react";
import { Link, useParams } from "react-router";
import { Star, Calendar, BookOpen, Hash, ArrowLeft } from "lucide-react";
import { books, getSimilarBooks } from "../../data/mockData";
import { Button } from "../../components/ui/button";

export function BookDetail() {
  const { id } = useParams();
  const book = books.find(b => b.id === Number(id));
  const similarBooks = getSimilarBooks(Number(id));

  if (!book) {
    return (
      <div className="p-8">
        <p className="text-slate-600">Book not found</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Book Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="grid md:grid-cols-[300px,1fr] gap-8 p-8">
          {/* Cover Image */}
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Book Info */}
          <div>
            <div className="inline-block bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm mb-4">
              {book.genre}
            </div>
            <h1 className="text-4xl font-semibold text-slate-800 mb-2">
              {book.title}
            </h1>
            <p className="text-xl text-slate-600 mb-6">by {book.author}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-semibold text-slate-800">
                  {book.rating}
                </span>
              </div>
              <span className="text-slate-500">/ 5.0</span>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 text-slate-600">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Published</p>
                  <p className="font-medium">{book.yearPublished}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <BookOpen className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Pages</p>
                  <p className="font-medium">{book.pageCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Hash className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">ISBN</p>
                  <p className="font-medium text-sm">{book.isbn}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">
                Description
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {book.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                Add to Reading List
              </Button>
              <Button variant="outline" className="rounded-xl border-slate-300">
                Mark as Read
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Books */}
      {similarBooks.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">
            Similar Books You Might Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarBooks.map(book => (
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
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-slate-700">
                      {book.rating}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
