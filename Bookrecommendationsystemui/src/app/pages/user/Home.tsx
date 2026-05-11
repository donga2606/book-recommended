import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Star, Sparkles } from "lucide-react";
import { listRecommendedBooks } from "../../lib/booksApi";

export function Home() {
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const [hoveredStars, setHoveredStars] = useState<Record<number, number>>({});
  const { data: recommendations = [], isLoading, isError } = useQuery({
    queryKey: ["home-recommendations"],
    queryFn: () => listRecommendedBooks(6),
  });

  const handleRating = (bookId: number, rating: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUserRatings({ ...userRatings, [bookId]: rating });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-semibold text-slate-800">
            Recommended for You
          </h1>
          <Sparkles className="w-6 h-6 text-purple-500" />
        </div>
        <p className="text-slate-600">
          Personalized picks based on your reading history and preferences
        </p>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && <p className="text-slate-600">Loading recommendations...</p>}
        {isError && (
          <p className="text-red-600">
            Failed to load recommendations from backend. Make sure backend is running.
          </p>
        )}
        {recommendations.map(({ book, reason, predictedRating }) => (
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
            <div className="p-5">
              <h3 className="font-semibold text-slate-800 mb-1 line-clamp-1">
                {book.title}
              </h3>
              <p className="text-sm text-slate-600 mb-3">{book.author}</p>

              {/* Predicted Rating */}
              <div className="mb-3 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Predicted rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-slate-700">
                      {typeof predictedRating === "number" ? predictedRating.toFixed(2) : book.rating}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Rating Input */}
              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-2">Rate this book</p>
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.preventDefault()}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={(e) => handleRating(book.id, star, e)}
                      onMouseEnter={() => setHoveredStars({ ...hoveredStars, [book.id]: star })}
                      onMouseLeave={() => {
                        const newHovered = { ...hoveredStars };
                        delete newHovered[book.id];
                        setHoveredStars(newHovered);
                      }}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${star <= (hoveredStars[book.id] || userRatings[book.id] || 0)
                          ? "fill-purple-500 text-purple-500"
                          : "text-slate-300"
                          }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Why Recommended */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <p className="text-xs text-purple-700">
                  <span className="font-medium">Why recommended:</span> {reason}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
