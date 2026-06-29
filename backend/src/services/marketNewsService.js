const axios = require('axios');

const NEWS_API_BASE_URL = 'https://newsapi.org/v2/everything';
const MAX_ARTICLES = 10;

class MarketNewsServiceError extends Error {
  constructor(message, { code, cause } = {}) {
    super(message);
    this.name = 'MarketNewsServiceError';
    this.code = code;
    if (cause) {
      this.cause = cause;
    }
  }
}

function validateCompanyName(companyName) {
  if (typeof companyName !== 'string' || !companyName.trim()) {
    throw new MarketNewsServiceError('companyName is required and must be a non-empty string', {
      code: 'INVALID_INPUT',
    });
  }

  return companyName.trim();
}

function getNewsApiKey() {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw new MarketNewsServiceError('NEWS_API_KEY is not configured', {
      code: 'MISSING_API_KEY',
    });
  }

  return apiKey.trim();
}

function mapArticle(article) {
  return {
    title: article.title ?? null,
    source: article.source?.name ?? null,
    publishedAt: article.publishedAt ?? null,
    url: article.url ?? null,
    description: article.description ?? null,
  };
}

function isValidArticle(article) {
  return Boolean(article.title && article.url);
}

/**
 * @param {string} companyName
 * @returns {Promise<object>}
 */
async function getMarketNews(companyName) {
  const normalizedCompanyName = validateCompanyName(companyName);
  const apiKey = getNewsApiKey();

  try {
    const response = await axios.get(NEWS_API_BASE_URL, {
      params: {
        q: normalizedCompanyName,
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: MAX_ARTICLES,
      },
      headers: {
        'X-Api-Key': apiKey,
      },
      timeout: 10000,
    });

    const { status, message, articles = [] } = response.data;

    if (status !== 'ok') {
      throw new MarketNewsServiceError(message || 'NewsAPI request failed', {
        code: 'API_ERROR',
      });
    }

    const mappedArticles = articles
      .filter(isValidArticle)
      .slice(0, MAX_ARTICLES)
      .map(mapArticle);

    if (mappedArticles.length === 0) {
      throw new MarketNewsServiceError(
        `No relevant articles found for: ${normalizedCompanyName}`,
        { code: 'DATA_NOT_FOUND' },
      );
    }

    return {
      companyName: normalizedCompanyName,
      count: mappedArticles.length,
      articles: mappedArticles,
    };
  } catch (error) {
    if (error instanceof MarketNewsServiceError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      const apiMessage = error.response?.data?.message;
      const statusCode = error.response?.status;

      throw new MarketNewsServiceError(
        apiMessage || `NewsAPI request failed with status ${statusCode || 'unknown'}`,
        {
          code: statusCode === 401 ? 'INVALID_API_KEY' : 'FETCH_FAILED',
          cause: error,
        },
      );
    }

    throw new MarketNewsServiceError(
      `Failed to fetch market news for: ${normalizedCompanyName}`,
      {
        code: 'FETCH_FAILED',
        cause: error,
      },
    );
  }
}

module.exports = {
  getMarketNews,
  MarketNewsServiceError,
};
