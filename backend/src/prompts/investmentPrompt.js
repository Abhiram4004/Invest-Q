const EXPECTED_JSON_SCHEMA = {
  executiveSummary: 'string — concise overview of the investment case based only on provided evidence',
  investmentScore: 'number — integer from 0 to 100 inclusive',
  recommendation: 'string — exactly "Invest" or "Pass"',
  strengths: ['string — key positive factors supported by the evidence'],
  risks: ['string — key risks or concerns supported by the evidence'],
  whyInvest: 'string — rationale for investing, citing only provided evidence',
  whyNotInvest: 'string — rationale for not investing, citing only provided evidence',
};

/**
 * @param {object} reportData Normalized report input from reportBuilder
 * @returns {string}
 */
function buildInvestmentPrompt(reportData) {
  const evidence = JSON.stringify(reportData, null, 2);
  const schema = JSON.stringify(EXPECTED_JSON_SCHEMA, null, 2);

  return `You are a Senior Equity Research Analyst preparing an investment assessment.

Your task is to analyze the company evidence below and produce a structured investment view.

RULES:
- Use ONLY the evidence provided in this prompt.
- Do NOT fabricate facts, metrics, news, dates, prices, or events.
- If information is missing, acknowledge uncertainty in your analysis rather than inventing data.
- Base every conclusion on the supplied financial summary and market news.
- Do not include markdown, commentary, or text outside the JSON object.
- Return valid JSON only.

REQUIRED OUTPUT SCHEMA:
${schema}

FIELD REQUIREMENTS:
- executiveSummary: 2–4 sentences summarizing the investment case from the evidence only.
- investmentScore: integer between 0 and 100.
- recommendation: must be exactly "Invest" or "Pass".
- strengths: array of concise bullet-style strings backed by the evidence.
- risks: array of concise bullet-style strings backed by the evidence.
- whyInvest: explain the primary reasons to invest using only the evidence.
- whyNotInvest: explain the primary reasons to pass using only the evidence.

EVIDENCE:
${evidence}

Respond with a single JSON object matching the required schema.`;
}

module.exports = {
  buildInvestmentPrompt,
};
