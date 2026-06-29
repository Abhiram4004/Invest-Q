import { useState } from 'react';

export default function Search({ onSearch, isLoading }) {
  const [company, setCompany] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (company.trim()) {
      onSearch(company.trim());
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Enter company name or ticker (e.g., Apple, TSLA)"
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading || !company.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          Analyze
        </button>
      </form>
    </div>
  );
}
