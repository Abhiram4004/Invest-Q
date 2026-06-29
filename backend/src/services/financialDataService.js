const YahooFinance = require('yahoo-finance2').default;

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const TICKER_PATTERN = /^[A-Z][A-Z0-9.-]{0,9}$/;

class FinancialDataServiceError extends Error {
  constructor(message, { code, cause } = {}) {
    super(message);
    this.name = 'FinancialDataServiceError';
    this.code = code;
    if (cause) {
      this.cause = cause;
    }
  }
}

function validateCompanyName(companyName) {
  if (typeof companyName !== 'string' || !companyName.trim()) {
    throw new FinancialDataServiceError('companyName is required and must be a non-empty string', {
      code: 'INVALID_INPUT',
    });
  }

  return companyName.trim();
}

function looksLikeTicker(value) {
  const trimmed = value.trim();

  if (/\s/.test(trimmed)) {
    return false;
  }

  // Lowercase letters indicate a company name, not a ticker symbol.
  if (/[a-z]/.test(trimmed)) {
    return false;
  }

  return TICKER_PATTERN.test(trimmed);
}

async function resolveTicker(companyName) {
  if (looksLikeTicker(companyName)) {
    return companyName.toUpperCase();
  }

  try {
    const searchResults = await yahooFinance.search(companyName, { quotesCount: 10 });
    const quotes = searchResults.quotes || [];

    const equityMatch = quotes.find(
      (quote) => quote.symbol && quote.quoteType === 'EQUITY',
    );

    if (equityMatch?.symbol) {
      return equityMatch.symbol;
    }

    const fallbackMatch = quotes.find((quote) => quote.symbol);

    if (fallbackMatch?.symbol) {
      return fallbackMatch.symbol;
    }

    throw new FinancialDataServiceError(`No ticker found for company: ${companyName}`, {
      code: 'TICKER_NOT_FOUND',
    });
  } catch (error) {
    if (error instanceof FinancialDataServiceError) {
      throw error;
    }

    throw new FinancialDataServiceError(`Failed to resolve ticker for company: ${companyName}`, {
      code: 'TICKER_RESOLUTION_FAILED',
      cause: error,
    });
  }
}

function mapQuoteSummaryToFinancialData(quoteSummary) {
  const { price, summaryDetail, summaryProfile, defaultKeyStatistics } = quoteSummary;

  return {
    companyName: price?.longName || price?.shortName || null,
    symbol: price?.symbol || null,
    marketCap: summaryDetail?.marketCap ?? price?.marketCap ?? null,
    currentPrice: price?.regularMarketPrice ?? null,
    peRatio: summaryDetail?.trailingPE ?? null,
    eps: defaultKeyStatistics?.trailingEps ?? null,
    industry: summaryProfile?.industry ?? summaryProfile?.industryDisp ?? null,
    sector: summaryProfile?.sector ?? summaryProfile?.sectorDisp ?? null,
    fiftyTwoWeekHigh: summaryDetail?.fiftyTwoWeekHigh ?? null,
    fiftyTwoWeekLow: summaryDetail?.fiftyTwoWeekLow ?? null,
  };
}

/**
 * @param {string} companyName Company name or ticker symbol
 * @returns {Promise<object>}
 */
async function getFinancialData(companyName) {
  const normalizedCompanyName = validateCompanyName(companyName);

  try {
    const ticker = await resolveTicker(normalizedCompanyName);

    const quoteSummary = await yahooFinance.quoteSummary(ticker, {
      modules: ['price', 'summaryDetail', 'summaryProfile', 'defaultKeyStatistics'],
    });

    if (!quoteSummary?.price?.symbol) {
      throw new FinancialDataServiceError(`No financial data found for: ${normalizedCompanyName}`, {
        code: 'DATA_NOT_FOUND',
      });
    }

    return mapQuoteSummaryToFinancialData(quoteSummary);
  } catch (error) {
    if (error instanceof FinancialDataServiceError) {
      throw error;
    }

    throw new FinancialDataServiceError(
      `Failed to fetch financial data for: ${normalizedCompanyName}`,
      {
        code: 'FETCH_FAILED',
        cause: error,
      },
    );
  }
}

module.exports = {
  getFinancialData,
  FinancialDataServiceError,
};
