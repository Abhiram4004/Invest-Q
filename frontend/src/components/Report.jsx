export default function Report({ data }) {
  if (!data || !data.report) {
    return null;
  }

  const { company, decision, evidence } = data.report;
  const { generatedAt } = data;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-xl mt-8 text-left">
      <div className="border-b border-slate-800 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">
            Analysis Report: {company}
          </h2>
          <p className="text-slate-400 text-sm">
            Generated on: {new Date(generatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-semibold text-slate-200 mb-3 border-b border-slate-800 pb-2">
            AI Decision
          </h3>
          <div className="bg-slate-800/50 p-4 rounded-lg text-slate-200">
            {decision ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                  <span className="text-lg font-bold">
                    Recommendation: <span className={decision.recommendation === 'Invest' ? 'text-green-400' : 'text-red-400'}>{decision.recommendation}</span>
                  </span>
                  <span className="text-lg font-bold">Score: {decision.investmentScore}/100</span>
                </div>
                <p><strong>Executive Summary:</strong> {decision.executiveSummary}</p>
                <div>
                  <strong>Strengths:</strong>
                  <ul className="list-disc pl-5 mt-1 text-slate-300">
                    {decision.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <strong>Risks:</strong>
                  <ul className="list-disc pl-5 mt-1 text-slate-300">
                    {decision.risks?.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
                <p><strong>Why Invest:</strong> {decision.whyInvest}</p>
                <p><strong>Why Not Invest:</strong> {decision.whyNotInvest}</p>
              </div>
            ) : (
              'No decision provided.'
            )}
          </div>
        </section>

        {evidence && (
          <section>
            <h3 className="text-xl font-semibold text-slate-200 mb-3 border-b border-slate-800 pb-2">
              Financial Evidence
            </h3>
            {evidence.financialSummary ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(evidence.financialSummary).slice(0, 8).map(([key, value]) => (
                  <div key={key} className="bg-slate-800 p-3 rounded-lg">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{key}</p>
                    <p className="font-medium text-slate-200">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No financial data available.</p>
            )}
          </section>
        )}

        {evidence && evidence.marketNews && evidence.marketNews.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold text-slate-200 mb-3 border-b border-slate-800 pb-2">
              Recent News Highlights
            </h3>
            <ul className="space-y-3">
              {evidence.marketNews.slice(0, 3).map((news, index) => (
                <li key={index} className="bg-slate-800/30 p-3 rounded-lg">
                  <p className="text-slate-300 text-sm">{news.title || news}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
