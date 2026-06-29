const { analyzeCompany } = require('../services/investmentAnalysisService');

function validateAnalyzeInput(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, message: 'Request body must be a JSON object' };
  }

  if (typeof body.company !== 'string') {
    return { valid: false, message: 'company is required and must be a string' };
  }

  const company = body.company.trim();

  if (!company) {
    return { valid: false, message: 'company cannot be empty' };
  }

  return { valid: true, company };
}

function getErrorStatus(error) {
  switch (error.code) {
    case 'INVALID_INPUT':
      return 400;
    case 'TICKER_NOT_FOUND':
    case 'DATA_NOT_FOUND':
      return 404;
    case 'MISSING_API_KEY':
      return 503;
    default:
      return 500;
  }
}

async function analyze(req, res) {
  const validation = validateAnalyzeInput(req.body);

  if (!validation.valid) {
    return res.status(400).json({ error: validation.message });
  }

  const { company } = validation;

  try {
    const analysis = await analyzeCompany(company);

    return res.status(200).json({
      success: true,
      generatedAt: analysis.generatedAt,
      report: analysis.report,
    });
  } catch (error) {
    const status = getErrorStatus(error);
    
    console.error("====== API REQUEST ERROR ======");
    console.error(`Status Code: ${status}`);
    console.error(`Message: ${error.message}`);
    if (error.cause) {
      console.error(`Cause:`, error.cause);
    } else {
      console.error(error);
    }
    console.error("===============================");

    return res.status(status).json({
      error: error.message || 'Failed to analyze company',
    });
  }
}

module.exports = {
  analyze,
};
