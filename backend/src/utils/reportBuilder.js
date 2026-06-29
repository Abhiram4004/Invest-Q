function omitEmptyValues(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'object' && item !== null ? omitEmptyValues(item) : item))
      .filter((item) => item != null);
  }

  if (typeof value !== 'object' || value === null) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => entryValue != null)
      .map(([key, entryValue]) => [
        key,
        typeof entryValue === 'object' ? omitEmptyValues(entryValue) : entryValue,
      ]),
  );
}

function buildFinancialSummary(financialData) {
  const {
    symbol,
    marketCap,
    currentPrice,
    peRatio,
    eps,
    industry,
    sector,
    fiftyTwoWeekHigh,
    fiftyTwoWeekLow,
  } = financialData || {};

  return omitEmptyValues({
    symbol,
    marketCap,
    currentPrice,
    peRatio,
    eps,
    industry,
    sector,
    fiftyTwoWeekHigh,
    fiftyTwoWeekLow,
  });
}

function buildMarketNewsArticles(marketNews) {
  const articles = marketNews?.articles || [];

  return articles
    .map(({ title, description }) => omitEmptyValues({ title, description }))
    .filter((article) => Object.keys(article).length > 0);
}

/**
 * @param {object} financialData Output from financialDataService
 * @param {object} marketNews Output from marketNewsService
 * @returns {object}
 */
function buildInvestmentReportInput(financialData, marketNews) {
  const company = financialData?.companyName || marketNews?.companyName;

  return omitEmptyValues({
    company,
    financialSummary: buildFinancialSummary(financialData),
    marketNews: buildMarketNewsArticles(marketNews),
  });
}

module.exports = {
  buildInvestmentReportInput,
};
