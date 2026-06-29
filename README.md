# InvestIQ

InvestIQ is an AI-powered investment research platform designed to provide comprehensive, data-driven financial analysis. Leveraging Yahoo Finance for real-time market data and Google's Gemini AI, InvestIQ evaluates a company's financial health, recent market news, and overall market sentiment to generate actionable investment decisions.

## 🚀 Features

- **Real-Time Financial Data Retrieval**: Fetches the latest stock prices, market cap, P/E ratios, EPS, and 52-week highs/lows using Yahoo Finance.
- **Market News Integration**: Pulls the most recent and relevant news articles related to the queried company to gauge public sentiment and potential market impacts.
- **AI-Powered Analysis**: Utilizes Google's Gemini AI to synthesize financial data and news into a concise executive summary, including:
  - An overall Investment Score (0-100)
  - Clear "Invest" or "Pass" recommendation
  - Key Strengths and Risks
  - Detailed rationale for the decision
- **Fault-Tolerant AI Engine**: Features built-in exponential backoff and automatic retries to gracefully handle upstream AI API rate limits and demand spikes.
- **Modern UI**: Built with React, Vite, and Tailwind CSS for a sleek, dark-themed, and responsive user experience.

## 🛠️ Technology Stack

**Frontend:**
- React (v19)
- Vite
- Tailwind CSS

**Backend:**
- Node.js & Express.js
- `@google/genai` (Gemini API Integration)
- `yahoo-finance2` (Financial Data)
- `axios` (News API requests)

## 📦 Project Structure

```text
InvestIQ/
├── frontend/   # React + Vite + Tailwind CSS Application
└── backend/    # Node.js + Express REST API Server
```

## ⚙️ Prerequisites

- Node.js (v18+ recommended)
- npm
- Google Gemini API Key
- NewsAPI Key

## 🚦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Abhiram4004/Invest-Q.git
cd Invest-Q
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and add your API keys:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
NEWS_API_KEY=your_news_api_key_here
```

Start the backend development server:
```bash
npm run dev
```
*The API will run on http://localhost:3000.*

### 3. Frontend Setup

In a new terminal window, navigate to the frontend directory:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```
*The UI will be accessible at http://localhost:5173.*

## 📄 License

Private — all rights reserved.
