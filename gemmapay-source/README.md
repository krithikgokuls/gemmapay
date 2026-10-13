# GemmaPay 💼⚡
### Privacy-First Side-Hustle Invoicing & Personalized Client Follow-Up Studio

[![Google Gemma 2](https://img.shields.io/badge/Powered%20By-Google%20Gemma%202-emerald.svg)](https://ai.google.dev/gemma)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Privacy Guarantee](https://img.shields.io/badge/Privacy-Zero%20Data%20Retention-teal.svg)](#privacy--gemma-open-weight-architecture)

> **Live Demo**: [GemmaPay Web App](https://ais-pre-wqw35rwcvdjmbf3uaw7uqf-239371853037.asia-southeast1.run.app)  
> Built for the Google AI Studio & Gemma Open-Weight Hackathon.

---

## 🚀 Overview

Freelancers and side-hustlers waste an average of 4–6 hours every month chasing unpaid invoices and drafting manual client updates. At the same time, commercial invoicing SaaS tools (FreshBooks, HoneyBook, QuickBooks) charge $200–$400+ per year in recurring subscriptions and log private financial details to closed cloud databases.

**GemmaPay** is an open-weight AI studio built to solve this problem:
1. **Automated Client Invoice Generator**: Turns rough, messy work notes into structured, professional invoices with automated tax, discounts, deposits, and payment QR codes.
2. **Personalized Service Follow-Up & Retainer Engine**: Generates relationship-preserving, high-converting follow-up sequences across 7 critical client stages (including post-project reviews and monthly retainer upselling).
3. **Zero-Retention Financial Privacy**: Powered by Google Gemma open-weight models (`gemma-2-27b-it` / `gemma-2-9b-it`) with zero cloud data retention, an integrated PII scrubber, and local Ollama compatibility.
4. **Side-Hustle Income & Profit Dashboard**: Real-time monthly target tracking, true effective hourly yield calculation, and AI pricing package recommendations.

---

## ✨ Key Features

- **Smart Work-Note Parser**: Type or paste raw project scopes or chat snippets, and Gemma extracts client details, line items, hours, and rates into a clean draft.
- **Printable & PDF-Ready Invoices**: 4 design themes (Modern Emerald, Executive Navy, Minimal Mono, Studio Amber) with built-in print-to-PDF styles and dynamic QR codes for Stripe, PayPal, Venmo, and wire payments.
- **7-Stage Client Follow-Up Hub**:
  - *Gentle Heads-Up* (3 days before due date)
  - *Due Today Notice* (polite payment link reminder)
  - *Polite Overdue Nudge* (3–7 days late; relationship-preserving check-in)
  - *Urgent Escalation* (14+ days overdue; contract terms and late policies)
  - *Milestone Delivery Sign-off* (deliverables approval & balance release)
  - *Gratitude & Testimonial Request* (thank you message + review request)
  - *Side-Hustle Retainer Pitch* (turn 1-time gigs into recurring $500–$1,500/mo retainers)
- **Multi-Channel Delivery**: Instant 1-click `mailto:` email launcher and quick SMS/WhatsApp/Slack copy snippets.
- **Live Client PII Scrubber**: Automatically detects and redacts credit cards, SSNs, and personal bank accounts before sharing.
- **Offline & Localhost Ready**: Fully compatible with local Ollama (`ollama run gemma2:2b` or `ollama run gemma2:9b`).

---

## 🛠️ Tech Stack

- **AI Model**: Google Gemma 2 Open-Weight Models (`gemma-2-27b-it`, `gemma-2-9b-it`) via `@google/genai` SDK
- **Backend**: Node.js, Express, TypeScript, Server-side proxy routing
- **Frontend**: React 19, Tailwind CSS, Lucide Icons, Canvas QR Code generation (`qrcode`)
- **Data Storage**: Client-side `localStorage` (100% private; no remote database storing your client rates or banking info)

---

## 🏃 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/krithikgokuls/gemmapay.git
cd gemmapay
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
PORT=3000
```

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Privacy & Gemma Open-Weight Architecture

| Feature | Closed SaaS (HoneyBook / FreshBooks) | GemmaPay (Open-Weight Gemma) |
|---|---|---|
| **Annual Software Cost** | $228 – $348 / year | **$0.00 / year** |
| **Data Training Retention** | Often logs client data to train models | **Zero data retention guarantee** |
| **Offline Execution** | Requires constant internet & cloud login | **Compatible with local Ollama** |
| **Data Sovereignty** | Stored on proprietary cloud databases | **100% saved in your local browser** |

---

## 📄 License

Apache License 2.0. Open-source and free for all freelancers and small businesses.
