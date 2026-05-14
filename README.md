# 🛡️ DEED — AI Real Estate Compliance

**AI-powered writing + compliance for real estate agents.**

DEED helps real estate professionals generate compliant listing descriptions and follow-up communications while maintaining their unique brand voice and avoiding Fair Housing Act violations.

---

## 🎯 Features

### Core
- **Listing Generator** — AI-written descriptions that match your voice
- **Compliance Audits** — Real-time Fair Housing scanning
- **Voice Training** — Custom brand voice profiles from past listings
- **Follow-Up Engine** — AI-generated B2B email sequences

### Advanced
- **Compliance Library** — Fair Housing reference guide
- **Audit History** — Track all generated content
- **Subscription Management** — Plans and billing
- **Settings** — Preferences and integrations

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Coder49-alt/Deed.git
   cd Deed
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Set up database**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` — Create account
- `POST /api/auth/login` — Sign in
- `GET /api/auth/verify` — Verify token

### Listings
- `POST /api/listings/generate` — Generate description
- `GET /api/listings` — Get user listings
- `PUT /api/listings/:id` — Update listing

### Voice
- `POST /api/voice/train` — Train voice profile
- `GET /api/voice/profile` — Get profile
- `GET /api/voice/status` — Training status

### Audits
- `POST /api/audits` — Run audit
- `GET /api/audits` — Get audit history
- `GET /api/audits/:id` — Get audit detail

### Follow-ups
- `POST /api/followups/generate-email` — Generate email
- `POST /api/followups/sequence` — Create sequence
- `GET /api/followups/sequences` — Get sequences

---

## 🎙️ Voice Training System

Users can optionally train DEED to write in their unique voice:

1. **Paste or upload** 3-5 past listing descriptions
2. **AI extracts** tone, vocabulary, and style
3. **Creates profile** with:
   - Professionalism & friendliness levels
   - Common phrases and vocabulary
   - Writing style guidelines
4. **All generation** uses this profile automatically

---

## 🛡️ Fair Housing Compliance

DEED enforces Fair Housing Act compliance by:

- **Scanning** for prohibited terms and steering language
- **Suggesting** compliant alternatives
- **Blocking** generation of discriminatory content
- **Training** users on best practices

### Prohibited Categories
- Familial Status
- Race & National Origin
- Disability
- Religion
- Age & Sex
- Steering Risk Phrases

---

## 📦 Tech Stack

**Frontend**
- HTML5 / CSS3 / Vanilla JavaScript
- Responsive design

**Backend**
- Node.js + Express
- PostgreSQL + Prisma ORM
- OpenAI GPT-4 API
- JWT authentication

---

## 📄 License

MIT License

---

**DEED — Close more. Worry less. Sound like yourself.** 🎙️
