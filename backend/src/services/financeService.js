/**
 * @param {string} company
 * @returns {Promise<object>}
 */
async function getFinancials(company) {
  return {
    company,
    financials: null,
  };
}

module.exports = {
  getFinancials,
};
