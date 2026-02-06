"use client";

import { useTranslations } from 'next-intl';
import { LayoutGrid, List, ChevronDown, Search, X, Filter } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { Category } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import ShopSidebar from './ShopSidebar';

interface Props {
  categories: Category[];
}

export default function ShopToolbar({ categories }: Props) {
  const t = useTranslations('Shop');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const currentSort = searchParams.get('sort') || 'default';
  const currentView = searchParams.get('view') || 'grid'; 
  const currentSearch = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  // Scroll kilidi
  useEffect(() => {
    if (isMobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileFiltersOpen]);

  const sortOptions = [
    { name: t('sortDefault'), value: 'default' },
    { name: t('sortPriceAsc'), value: 'price_asc' },
    { name: t('sortPriceDesc'), value: 'price_desc' },
    { name: t('sortNameAsc'), value: 'name_asc' },
    { name: t('sortNameDesc'), value: 'name_desc' },
    { name: t('sortNewest'), value: 'newest' },
  ];

  const activeSort = sortOptions.find(o => o.value === currentSort) || sortOptions[0];

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value !== 'default') {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key === 'sort' || key === 'search') {
      params.set('page', '1');
    }
    
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const handleSearch = useDebouncedCallback((value: string) => {
    updateParam('search', value.trim() === '' ? null : value);
  }, 500);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    handleSearch(val);
  };

  const clearSearch = () => {
    setSearchTerm('');
    updateParam('search', null);
  };

  return (
    <>
      {/* TOOLBAR CONTAINER */}
      <div className="bg-dark-800 rounded-2xl p-4 border border-dark-700 mb-8 z-30 lg:sticky lg:top-20 shadow-xl shadow-black/10">
        
        {/* Bütün elementlər bir sətirdə */}
        <div className="flex flex-col lg:flex-row items-center gap-3">

          {/* Axtarış */}
          <div className="relative w-full lg:flex-1 group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder={t('searchPlaceholder') || "Axtarış..."}
              className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
              value={searchTerm}
              onChange={onSearchChange}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter, Sort və View - bir sətirdə */}
          <div className="flex items-center gap-2 w-full lg:w-auto">

            {/* Filter Düyməsi (Yalnız Mobile) */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-dark-700 text-white rounded-xl text-sm font-medium hover:bg-dark-600 transition-colors border border-dark-600"
            >
              <Filter size={18} className="text-primary shrink-0" />
              <span>{t('filters')}</span>
            </button>

            {/* Sort Dropdown */}
            <Menu as="div" className="relative flex-1 lg:flex-none">
              <Menu.Button className="w-full lg:w-auto flex items-center justify-between gap-2 text-sm text-white hover:text-primary transition-colors px-3 py-2.5 rounded-xl hover:bg-dark-700 bg-dark-900 border border-dark-600">
                <span className="flex items-center gap-2 overflow-hidden">
                   <span className="text-gray-400 lg:inline hidden whitespace-nowrap">{t('sortBy')}:</span>
                   <span className="font-medium truncate block">{activeSort.name}</span>
                </span>
                <ChevronDown size={16} className="shrink-0 text-gray-500" />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-dark-800 border border-dark-700 rounded-xl shadow-xl focus:outline-none z-50 overflow-hidden">
                  <div className="p-1">
                    {sortOptions.map((option) => (
                      <Menu.Item key={option.value}>
                        {({ active }) => (
                          <button
                            onClick={() => updateParam('sort', option.value)}
                            className={`
                              w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                              ${active ? 'bg-primary/10 text-primary' : 'text-gray-300 hover:bg-dark-700'}
                              ${currentSort === option.value ? 'text-primary font-medium' : ''}
                            `}
                          >
                            {option.name}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            {/* View Toggle (Yalnız Desktop) */}
            <div className="hidden lg:flex items-center bg-dark-900 rounded-lg p-1 border border-dark-600 h-[42px] shrink-0">
              <button
                onClick={() => updateParam('view', 'grid')}
                className={`p-1.5 rounded-md transition-all h-full flex items-center justify-center ${currentView === 'grid' ? 'bg-dark-700 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => updateParam('view', 'list')}
                className={`p-1.5 rounded-md transition-all h-full flex items-center justify-center ${currentView === 'list' ? 'bg-dark-700 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}
              >
                <List size={18} />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      <Transition show={isMobileFiltersOpen} as={Fragment}>
        <div className="relative z-50 lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
                onClick={() => setIsMobileFiltersOpen(false)}
            />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="transform transition ease-in-out duration-300"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <div className="fixed inset-x-0 bottom-0 top-[60px] flex flex-col bg-dark-800 rounded-t-3xl overflow-hidden shadow-2xl border-t border-dark-700">
               <ShopSidebar 
                  categories={categories} 
                  onClose={() => setIsMobileFiltersOpen(false)} 
               />
            </div>
          </Transition.Child>
        </div>
      </Transition>
    </>
  );
}