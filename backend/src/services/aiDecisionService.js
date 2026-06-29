const { GoogleGenAI } = require('@google/genai');
const { buildInvestmentPrompt } = require('../prompts/investmentPrompt');

const MODEL = 'gemini-2.5-flash';
const VALID_RECOMMENDATIONS = new Set(['Invest', 'Pass']);
const REQUIRED_FIELDS = [
  'executiveSummary',
  'investmentScore',
  'recommendation',
  'strengths',
  'risks',
  'whyInvest',
  'whyNotInvest',
];

class AiDecisionServiceError extends Error {
  constructor(message, { code, cause } = {}) {
    super(message);
    this.name = 'AiDecisionServiceError';
    this.code = code;
    if (cause) {
      this.cause = cause;
    }
  }
}

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw new AiDecisionServiceError('GEMINI_API_KEY is not configured', {
      code: 'MISSING_API_KEY',
    });
  }

  return apiKey.trim();
}

function stripMarkdownCodeFences(rawText) {
  const trimmed = rawText.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  return trimmed;
}

function parseJsonResponse(rawText) {
  const cleanedText = stripMarkdownCodeFences(rawText);

  try {
    const parsed = JSON.parse(cleanedText);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new AiDecisionServiceError('Gemini response must be a JSON object', {
        code: 'INVALID_JSON',
      });
    }

    return parsed;
  } catch (error) {
    if (error instanceof AiDecisionServiceError) {
      throw error;
    }

    throw new AiDecisionServiceError('Gemini response is not valid JSON', {
      code: 'INVALID_JSON',
      cause: error,
    });
  }
}

function assertStringField(value, fieldName) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AiDecisionServiceError(`${fieldName} must be a non-empty string`, {
      code: 'INVALID_SCHEMA',
    });
  }
}

function assertStringArrayField(value, fieldName) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new AiDecisionServiceError(`${fieldName} must be an array of strings`, {
      code: 'INVALID_SCHEMA',
    });
  }
}

function validateInvestmentDecision(decision) {
  for (const field of REQUIRED_FIELDS) {
    if (!(field in decision)) {
      throw new AiDecisionServiceError(`Missing required field: ${field}`, {
        code: 'INVALID_SCHEMA',
      });
    }
  }

  assertStringField(decision.executiveSummary, 'executiveSummary');
  assertStringArrayField(decision.strengths, 'strengths');
  assertStringArrayField(decision.risks, 'risks');
  assertStringField(decision.whyInvest, 'whyInvest');
  assertStringField(decision.whyNotInvest, 'whyNotInvest');

  if (
    typeof decision.investmentScore !== 'number'
    || !Number.isInteger(decision.investmentScore)
    || decision.investmentScore < 0
    || decision.investmentScore > 100
  ) {
    throw new AiDecisionServiceError('investmentScore must be an integer between 0 and 100', {
      code: 'INVALID_SCHEMA',
    });
  }

  if (!VALID_RECOMMENDATIONS.has(decision.recommendation)) {
    throw new AiDecisionServiceError('recommendation must be exactly "Invest" or "Pass"', {
      code: 'INVALID_SCHEMA',
    });
  }

  return {
    executiveSummary: decision.executiveSummary.trim(),
    investmentScore: decision.investmentScore,
    recommendation: decision.recommendation,
    strengths: decision.strengths.map((item) => item.trim()).filter(Boolean),
    risks: decision.risks.map((item) => item.trim()).filter(Boolean),
    whyInvest: decision.whyInvest.trim(),
    whyNotInvest: decision.whyNotInvest.trim(),
  };
}

/**
 * @param {object} reportData Normalized report input from reportBuilder
 * @returns {Promise<object>}
 */
async function generateInvestmentDecision(reportData) {
  if (!reportData || typeof reportData !== 'object' || Array.isArray(reportData)) {
    throw new AiDecisionServiceError('reportData must be a valid object', {
      code: 'INVALID_INPUT',
    });
  }

  const apiKey = getGeminiApiKey();
  const prompt = buildInvestmentPrompt(reportData);

  let rawText;
  let attempt = 0;
  const maxAttempts = 4;

  while (attempt < maxAttempts) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
      });

      rawText = response.text;

      if (!rawText || !rawText.trim()) {
        throw new AiDecisionServiceError('Gemini returned an empty response', {
          code: 'GEMINI_API_FAILURE',
        });
      }
      break; // Success, exit retry loop
    } catch (error) {
      attempt++;
      let errorMessage = error.message || "Gemini API request failed";
      let isRetryable = false;

      try {
        const parsedError = JSON.parse(errorMessage);
        if (parsedError && parsedError.error) {
          if (parsedError.error.message) {
            errorMessage = parsedError.error.message;
          }
          if (parsedError.error.code === 503 || parsedError.error.code === 429 || parsedError.error.code >= 500) {
            isRetryable = true;
          }
        }
      } catch (e) {
        // Ignored: errorMessage is not JSON
        if (errorMessage.includes("503") || errorMessage.includes("429") || errorMessage.includes("high demand") || errorMessage.includes("quota")) {
          isRetryable = true;
        }
      }

      if (attempt >= maxAttempts || !isRetryable) {
        console.error("===== GEMINI ERROR =====");
        console.error(error);
        console.error("========================");

        if (error instanceof AiDecisionServiceError) {
          throw error;
        }

        throw new AiDecisionServiceError(
          errorMessage,
          {
            code: "GEMINI_API_FAILURE",
            cause: error,
          }
        );
      }
      
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Gemini API overloaded. Retrying attempt ${attempt} in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }

  const parsedDecision = parseJsonResponse(rawText);
  return validateInvestmentDecision(parsedDecision);
}

module.exports = {
  generateInvestmentDecision,
  AiDecisionServiceError,
};
