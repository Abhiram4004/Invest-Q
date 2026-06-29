export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-12 h-12 border-4 border-slate-700 border-t-slate-300 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-medium">Analyzing market data...</p>
    </div>
  );
}
