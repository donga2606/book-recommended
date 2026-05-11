import { BookMarked, Settings, Star } from "lucide-react";
import React from "react";
import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import { books, currentUser } from "../../data/mockData";

export function Profile() {
  const readBooks = books.filter(book =>
    currentUser.readingHistory.includes(book.id)
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-800 mb-2">
          My Profile
        </h1>
        <p className="text-slate-600">
          Manage your reading preferences and history
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400" />
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-1">
                {currentUser.name}
              </h2>
              <p className="text-slate-600 mb-3">{currentUser.email}</p>
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-slate-600">
                  {readBooks.length} books read
                </span>
              </div>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl border-slate-300">
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Reading Preferences */}
        <div>
          <h3 className="font-semibold text-slate-800 mb-3">
            Reading Preferences
          </h3>
          <div className="flex flex-wrap gap-2">
            {currentUser.preferences.map(pref => (
              <span
                key={pref}
                className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm"
              >
                {pref}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Reading History */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">
          Reading History
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {readBooks.map(book => (
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-slate-700">
                      {book.rating}
                    </span>
                  </div>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Completed
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
