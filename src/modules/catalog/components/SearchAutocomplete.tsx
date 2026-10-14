import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { catalogApi } from '../api/catalogApi';
import { BookSuggestionDto } from '../types/catalog.types';
import { formatVND } from '@/core/utils/currency';

export const SearchAutocomplete: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<BookSuggestionDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  // 300ms Debounce search suggestions
  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await catalogApi.getBookSuggestions(query);
        setSuggestions(results);
        setIsOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Dismiss dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectBook = (id: number) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/books/${id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    navigate(`/books?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Tìm sách theo tên, tác giả, ISBN..."
          className="w-full h-10 pl-10 pr-10 rounded-full border border-slate-300 bg-slate-50 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
          aria-label="Tìm kiếm sách"
        />
        <div className="absolute left-3 text-slate-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        {isLoading && (
          <div className="absolute right-3 text-slate-400 pointer-events-none">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-12 z-50 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in duration-150">
          <p className="px-3 py-1.5 text-2xs font-bold uppercase tracking-wider text-slate-400">
            Gợi ý tìm kiếm ({suggestions.length})
          </p>
          <div className="space-y-1">
            {suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectBook(item.id)}
                className="w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <img
                  src={item.primaryImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                  alt={item.title}
                  className="w-9 h-12 object-cover rounded-sm bg-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-slate-800 truncate">{item.title}</h5>
                  <p className="text-2xs text-slate-500 truncate">{item.authorName}</p>
                </div>
                <div className="text-xs font-bold text-blue-600 shrink-0">
                  {formatVND(item.salePrice)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
