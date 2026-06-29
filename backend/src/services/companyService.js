/**
 * @param {string} company
 * @returns {Promise<object>}
 */
async function getCompanyProfile(company) {
  return {
    company,
    profile: null,
  };
}

module.exports = {
  getCompanyProfile,
};
