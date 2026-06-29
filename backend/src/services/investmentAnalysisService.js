const { getFinancialData } = require('./financialDataService');
const { getMarketNews } = require('./marketNewsService');
const { generateInvestmentDecision } = require('./aiDecisionService');
const { buildInvestmentReportInput } = require('../utils/reportBuilder');

class InvestmentAnalysisServiceError extends Error {
  constructor(message, { code, cause } = {}) {
    super(message);
    this.name = 'InvestmentAnalysisServiceError';
    this.code = code;
    if (cause) {
      this.cause = cause;
    }
  }
}

function validateCompanyName(companyName) {
  if (typeof companyName !== 'string' || !companyName.trim()) {
    throw new InvestmentAnalysisServiceError('companyName is required and must be a non-empty string', {
      code: 'INVALID_INPUT',
    });
  }

  return companyName.trim();
}

/**
 * @param {string} companyName
 * @returns {Promise<object>}
 */
async function analyzeCompany(companyName) {
  const company = validateCompanyName(companyName);
  const generatedAt = new Date().toISOString();

  const [financialData, marketNews] = await Promise.all([
    getFinancialData(company),
    getMarketNews(company),
  ]);

  const reportData = buildInvestmentReportInput(financialData, marketNews);
  const decision = await generateInvestmentDecision(reportData);

  return {
    generatedAt,
    report: {
      company: reportData.company || company,
      evidence: reportData,
      decision,
    },
  };
}

module.exports = {
  analyzeCompany,
  InvestmentAnalysisServiceError,
};
