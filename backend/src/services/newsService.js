/**
 * @param {string} company
 * @returns {Promise<object>}
 */
async function getNews(company) {
  return {
    company,
    news: null,
  };
}

module.exports = {
  getNews,
};
