import { useState } from 'react';
import Search from '../components/Search';
import Report from '../components/Report';
import Loading from '../components/Loading';
import { analyzeCompany } from '../services/api';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (company) => {
    setIsLoading(true);
    setError(null);
    setReportData(null);

    try {
      const data = await analyzeCompany(company);
      setReportData(data);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while analyzing the company.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-12 px-4">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-bold tracking-tight text-white mb-4">InvestIQ</h1>
        <p className="text-lg text-slate-400 max-w-xl">
          Powered by AlphaLens AI. Enter a company name or ticker to generate a comprehensive investment research report.
        </p>
      </header>

      <main className="w-full max-w-5xl flex flex-col items-center">
        <Search onSearch={handleSearch} isLoading={isLoading} />
        
        {error && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-800 text-red-200 rounded-lg max-w-xl text-center">
            {error}
          </div>
        )}

        <div className="w-full mt-8 flex justify-center">
          {isLoading && <Loading />}
          {!isLoading && reportData && <Report data={reportData} />}
        </div>
      </main>
    </div>
  );
}
