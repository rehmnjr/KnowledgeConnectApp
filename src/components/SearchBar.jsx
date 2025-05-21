import React, { useState } from 'react';
import { Search, CalendarDays, X } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    term: '',
    date: '',
    category: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const clearSearch = () => {
    setSearchParams({
      term: '',
      date: '',
      category: ''
    });
    onSearch({
      term: '',
      date: '',
      category: ''
    });
  };

  const categories = [
    'All Categories',
    'Mathematics',
    'Physics',
    'Computer Science',
    'Literature',
    'History',
    'Biology',
    'Chemistry',
    'Languages',
    'Art'
  ];

  return (
    <div className="glass-panel p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="term"
              value={searchParams.term}
              onChange={handleChange}
              placeholder="Search by topic, title, or keyword..."
              className="w-full pl-10 pr-10 py-2 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-purple"
            />
            {searchParams.term && (
              <button
                type="button"
                onClick={() => setSearchParams(prev => ({ ...prev, term: '' }))}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden btn-secondary py-2"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          <div className={`flex flex-col md:flex-row gap-3 ${showFilters ? 'flex' : 'hidden md:flex'}`}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <CalendarDays className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="date"
                name="date"
                value={searchParams.date}
                onChange={handleChange}
                className="w-full pl-10 py-2 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-purple"
              />
            </div>

            <select
              name="category"
              value={searchParams.category}
              onChange={handleChange}
              className="py-2 px-4 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-purple"
            >
              {categories.map((category, index) => (
                <option key={index} value={category === 'All Categories' ? '' : category}>
                  {category}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="btn-primary py-2"
            >
              Search
            </button>

            {(searchParams.term || searchParams.date || searchParams.category) && (
              <button
                type="button"
                onClick={clearSearch}
                className="btn-secondary py-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
