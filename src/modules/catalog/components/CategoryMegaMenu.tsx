import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ChevronRight, BookOpen } from 'lucide-react';
import { useCategoryTreeQuery } from '../hooks/useCatalogQueries';
import { CategoryNode } from '../types/catalog.types';

export const CategoryMegaMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryNode | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: categories = [] } = useCategoryTreeQuery();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!activeCategory && categories.length > 0) {
            setActiveCategory(categories[0]);
          }
        }}
        className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <Menu className="w-4 h-4" />
        <span>Danh mục sách</span>
      </button>

      {isOpen && categories.length > 0 && (
        <div className="absolute left-0 top-11 z-50 flex rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden min-w-[500px] max-w-[700px] animate-in fade-in duration-150">
          {/* Level 1 List */}
          <div className="w-56 border-r border-slate-100 bg-slate-50/70 p-2 space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onMouseEnter={() => setActiveCategory(cat)}
                onClick={() => {
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                  activeCategory?.id === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{cat.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
              </button>
            ))}
          </div>

          {/* Level 2 & 3 Content */}
          <div className="flex-1 p-4 bg-white overflow-y-auto max-h-[400px]">
            {activeCategory && (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h4 className="text-sm font-bold text-slate-900">{activeCategory.name}</h4>
                  <Link
                    to={`/books?categoryId=${activeCategory.id}`}
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Xem tất cả &rarr;
                  </Link>
                </div>

                {activeCategory.children && activeCategory.children.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {activeCategory.children.map((subCat) => (
                      <div key={subCat.id} className="space-y-1.5">
                        <Link
                          to={`/books?categoryId=${subCat.id}`}
                          onClick={() => setIsOpen(false)}
                          className="text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors block"
                        >
                          {subCat.name}
                        </Link>
                        {subCat.children && subCat.children.length > 0 && (
                          <div className="space-y-1 pl-2 border-l border-slate-100">
                            {subCat.children.map((leafCat) => (
                              <Link
                                key={leafCat.id}
                                to={`/books?categoryId=${leafCat.id}`}
                                onClick={() => setIsOpen(false)}
                                className="text-2xs text-slate-500 hover:text-blue-600 hover:underline block truncate"
                              >
                                {leafCat.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Không có danh mục con</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

