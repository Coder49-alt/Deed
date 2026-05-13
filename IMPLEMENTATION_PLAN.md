# DEED - Complete Implementation Plan

## 1. Project Overview

**DEED: AI Real Estate Compliance Platform**

A SaaS application that helps real estate agents:
- Generate compliant listing descriptions using AI
- Audit existing listings for Fair Housing violations
- Train AI with their unique brand voice
- Automate follow-up email sequences
- Scale marketing without regulatory risk

**Core Value:**
- Prevents $26k+ Fair Housing violations
- Generates content in agent's voice (not robotic)
- Real-time compliance scanning
- Saves 18+ hours/month on compliance review

---

## 2. Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS + custom component library
- **State Management:** Redux Toolkit
- **HTTP Client:** Axios with interceptors
- **UI Components:** Headless UI + Radix UI
- **Build:** Vite
- **Testing:** Vitest + React Testing Library

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** PostgreSQL (with Prisma ORM)
- **Authentication:** JWT + bcrypt
- **LLM Integration:** OpenAI API (GPT-4)
- **File Storage:** AWS S3
- **Task Queue:** Bull (Redis-backed)
- **Testing:** Jest

### Infrastructure
- **Hosting:** AWS (EC2 + RDS) or Vercel + Supabase
- **CDN:** CloudFront
- **Monitoring:** Datadog / New Relic
- **CI/CD:** GitHub Actions
- **Secrets:** AWS Secrets Manager

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
│  Landing → Auth → Dashboard → App Views                      │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────────┐
│                  EXPRESS API GATEWAY                          │
│  Auth Routes │ Audit Routes │ Generation Routes              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼───┐  ┌────▼────┐  ┌───▼──────┐
   │ LLM    │  │Database  │  │  S3      │
   │Service │  │(PostgreSQL) │  Storage  │
   └────────┘  └──────────┘  └──────────┘
        │
   ┌────▼───────────────────────┐
   │  Voice Profile Manager      │
   │  - Parse & extract voice    │
   │  - Create system prompts    │
   │  - Inject into LLM calls    │
   └─────────────────────────────┘
```

---

## 4. Database Schema

### Core Tables

#### `users`
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- name (VARCHAR)
- company (VARCHAR)
- avatar_url (TEXT)
- subscription_id (FK → subscriptions)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `voice_profiles`
```sql
- id (UUID, PK)
- user_id (FK → users)
- name (VARCHAR) - "Professional & Warm", "Luxury Focus", etc.
- tone_matrix (JSONB)
  {
    "professionalism": 0.8,
    "friendliness": 0.7,
    "urgency": 0.5,
    "formality": 0.6
  }
- vocabulary_signature (JSONB)
  {
    "common_phrases": ["stunning views", "move-in ready"],
    "unique_words": ["meticulously", "sanctuary"],
    "avoid_words": []
  }
- style_guidelines (TEXT) - "Detailed & poetic", "Concise & factual", etc.
- compliance_guardrails (JSONB)
  {
    "fair_housing_strict": true,
    "prohibited_terms": ["family-friendly", "disabled accessible"]
  }
- training_samples (TEXT[]) - Array of past listing texts used for training
- status (VARCHAR) - "active", "training", "pending"
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `listings`
```sql
- id (UUID, PK)
- user_id (FK → users)
- address (VARCHAR)
- price (DECIMAL)
- beds (INT)
- baths (INT)
- sqft (INT)
- features (TEXT)
- generated_description (TEXT)
- original_description (TEXT)
- voice_profile_id (FK → voice_profiles)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `audits`
```sql
- id (UUID, PK)
- user_id (FK → users)
- listing_id (FK → listings)
- original_text (TEXT)
- status (VARCHAR) - "passed", "warning", "critical"
- violations (JSONB[])
  [
    {
      "type": "Familial Status",
      "phrase": "perfect for families",
      "severity": "critical",
      "suggestion": "perfect for anyone seeking...",
      "fha_reference": "42 U.S.C. § 3604"
    }
  ]
- compliance_score (FLOAT) - 0-100
- suggested_text (TEXT)
- audit_timestamp (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### `voice_training_samples`
```sql
- id (UUID, PK)
- user_id (FK → users)
- profile_id (FK → voice_profiles)
- sample_text (TEXT) - Pasted or extracted from file
- source_type (VARCHAR) - "paste", "file_upload"
- processed (BOOLEAN)
- created_at (TIMESTAMP)
```

#### `follow_up_sequences`
```sql
- id (UUID, PK)
- user_id (FK → users)
- lead_id (VARCHAR) - External CRM ID
- lead_name (VARCHAR)
- lead_type (VARCHAR) - "brokerage_owner", "agent", "investor"
- stage (VARCHAR) - "warm_consideration", "objection", "demo_ready"
- voice_profile_id (FK → voice_profiles)
- current_step (INT) - 1-6
- emails (JSONB[]) - Array of generated email objects
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `compliance_library_entries`
```sql
- id (UUID, PK)
- category (VARCHAR) - "familial_status", "race", "disability", etc.
- violation_type (VARCHAR)
- description (TEXT)
- prohibited_phrases (TEXT[])
- safe_alternatives (TEXT[])
- fha_reference (VARCHAR)
- resources (JSONB) - Links to FHA guidelines
- created_at (TIMESTAMP)
```

#### `subscriptions`
```sql
- id (UUID, PK)
- user_id (FK → users)
- plan_type (VARCHAR) - "free", "pro", "agency"
- status (VARCHAR) - "active", "canceled", "past_due"
- stripe_customer_id (VARCHAR)
- current_period_start (TIMESTAMP)
- current_period_end (TIMESTAMP)
- cancel_at_period_end (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `usage_tracking`
```sql
- id (UUID, PK)
- user_id (FK → users)
- listing_scans (INT)
- listings_generated (INT)
- audits_run (INT)
- follow_ups_sent (INT)
- period_start (TIMESTAMP)
- period_end (TIMESTAMP)
```

#### `audit_history` (Full audit logs)
```sql
- id (UUID, PK)
- user_id (FK → users)
- audit_id (FK → audits)
- action (VARCHAR) - "scan", "fix_applied", "export"
- details (JSONB)
- ip_address (VARCHAR)
- timestamp (TIMESTAMP)
```

---

## 5. API Endpoints (50+)

### Authentication
```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/google-callback
POST   /api/auth/password-reset
```

### Voice Training
```
POST   /api/voice/profiles
GET    /api/voice/profiles
GET    /api/voice/profiles/:id
PUT    /api/voice/profiles/:id
DELETE /api/voice/profiles/:id
POST   /api/voice/profiles/:id/samples       # Add paste/file sample
POST   /api/voice/profiles/:id/generate-profile # Trigger AI analysis
GET    /api/voice/profiles/:id/status        # Check training progress
```

### Listings & Generation
```
POST   /api/listings
GET    /api/listings
GET    /api/listings/:id
PUT    /api/listings/:id
DELETE /api/listings/:id
POST   /api/listings/:id/generate            # Generate with voice profile
POST   /api/listings/:id/audit               # Run compliance scan
PUT    /api/listings/:id/description         # Update description
POST   /api/listings/:id/export-pdf          # Export audit report
```

### Audits
```
GET    /api/audits
GET    /api/audits/:id
POST   /api/audits/batch-scan                # Scan multiple listings
GET    /api/audits/dashboard-stats           # Get dashboard data
POST   /api/audits/export-csv                # Export audit history
```

### Follow-Up Engine
```
POST   /api/followups/sequences              # Create sequence
GET    /api/followups/sequences
GET    /api/followups/sequences/:id
POST   /api/followups/sequences/:id/step-:n/generate-email
POST   /api/followups/sequences/:id/step-:n/send
PUT    /api/followups/sequences/:id/step     # Move to next step
GET    /api/followups/analytics              # Get sequence stats
```

### Compliance Library
```
GET    /api/library                          # Get all entries
GET    /api/library/:category                # By category
GET    /api/library/search?q=term
```

### Subscriptions & Billing
```
GET    /api/subscriptions/current
POST   /api/subscriptions/upgrade
POST   /api/subscriptions/cancel
POST   /api/subscriptions/webhook            # Stripe webhook
GET    /api/subscriptions/invoices
POST   /api/subscriptions/invoices/:id/download
```

### Settings
```
GET    /api/settings/profile
PUT    /api/settings/profile
POST   /api/settings/password-change
PUT    /api/settings/preferences
POST   /api/settings/2fa-enable
POST   /api/settings/2fa-verify
```

### Admin (future)
```
GET    /api/admin/users
GET    /api/admin/analytics
POST   /api/admin/reports
```

---

## 6. Core Features Implementation

### ✅ Feature 1: Authentication & Onboarding
- **Email/Password signup with validation**
- Google OAuth integration
- Email verification
- Password reset flow
- Terms & data privacy acceptance

### ✅ Feature 2: Brand Voice Training
**NOT COMPULSORY FILE UPLOAD** - Users have two options:

**Option A: Paste Listing Descriptions**
1. User navigates to Voice Training section
2. Enters a textarea with 3-5 past listing descriptions
3. Clicks "Submit Sample"
4. Backend extracts:
   - Tone indicators (professional, friendly, urgent, formal)
   - Vocabulary patterns (common phrases, unique words)
   - Style characteristics (detailed vs. concise, emotional tone)
5. Creates a **voice profile** JSON object
6. Stores in `voice_profiles` table
7. Status transitions to "active"

**Option B: File Upload (Optional)**
- Users can drag-drop PDF/DOCX files instead
- Backend extracts text from files
- Same processing as pasted text

**Voice Profile Structure:**
```json
{
  "id": "vp-123",
  "name": "Professional & Warm",
  "tone_matrix": {
    "professionalism": 0.85,
    "friendliness": 0.75,
    "urgency": 0.3,
    "formality": 0.65
  },
  "vocabulary_signature": {
    "common_phrases": ["stunning views", "move-in ready", "sophisticated finishes"],
    "adjectives": ["elegant", "meticulously", "inviting"],
    "avoid_phrases": []
  },
  "style": "Detailed & poetic but grounded",
  "training_samples": ["Sample text 1...", "Sample text 2..."]
}
```

**LLM Integration:**
Every generation call includes system prompt:
```javascript
const systemPrompt = `
You are writing a real estate listing in the voice of "${profile.name}".

TONE: Professionalism ${profile.tone_matrix.professionalism}/1, 
      Friendliness ${profile.tone_matrix.friendliness}/1

VOCABULARY: Commonly use phrases like: ${profile.vocabulary_signature.common_phrases.join(", ")}

STYLE: ${profile.style}

CRITICAL CONSTRAINTS - ZERO VIOLATIONS:
- NEVER mention family status, children, disabled people, elderly, newlyweds
- NEVER describe neighborhood by race, ethnicity, national origin, religion
- NEVER steer buyers toward/away from areas based on protected class
- NEVER use age/sex targeting language
- NEVER imply steering based on ability or disability

Generate a compelling listing description...
`
```

### ✅ Feature 3: Listing Generator
1. User enters property details (address, price, beds, baths, features)
2. Selects active voice profile
3. Clicks "Generate Description"
4. API calls OpenAI with voice system prompt
5. Returns compliant listing copy in user's voice
6. User can edit, enhance, or regenerate
7. Optionally export as PDF or copy to clipboard

### ✅ Feature 4: Real-Time Compliance Auditing
1. User submits listing text (new or existing)
2. Backend sends to OpenAI with compliance prompt
3. AI identifies violations with:
   - Violation type (familial status, steering, etc.)
   - Exact phrase & location
   - FHA reference code
   - Safe alternative
   - Severity score
4. Returns audit report with pass/warning/critical status
5. Displays violations with highlighted text
6. Suggests corrections

### ✅ Feature 5: Audit History & Dashboard
- Search/filter audits by address, date, status
- Export audit history as CSV
- Dashboard stats: portfolio health %, active alerts, scans run, time saved
- Recent audits list

### ✅ Feature 6: Follow-Up Email Engine
1. User creates lead/prospect sequence
2. Selects voice profile + lead context
3. AI generates 6-step email sequence
4. Each email shown with compliance score (98%+)
5. User can edit emails before sending
6. Tracks open rates, reply rates, conversions
7. Multi-step automation with delays

### ✅ Feature 7: Compliance Library
- Educational reference on Fair Housing rules
- Categories: Familial Status, Race/National Origin, Disability, Religion, Age/Sex, Steering
- Prohibited terms + safe alternatives
- FHA guideline links
- Searchable

### ✅ Feature 8: Subscription & Billing
- Stripe integration
- Free tier: 10 scans/month
- Pro ($29/mo): Unlimited scans + voice training
- Agency (Custom): White-label + analytics
- Invoice history & PDF download
- Usage tracking & reset dates

### ✅ Feature 9: Settings & Account Management
- Profile editing (name, email, company)
- Default compliance preferences
- Notification settings
- 2FA setup
- Integration connectors (future: MLS, CRM)
- Security settings

### ✅ Feature 10: Admin Dashboard (Future)
- User analytics
- Revenue metrics
- Top violations reported
- Compliance trend analysis

### ✅ Feature 11: User Experience
- Smooth page transitions
- Toast notifications
- Loading states & spinners
- Modal dialogs for confirmations
- Responsive design (mobile-first)

---

## 7. Voice Training Flow (Detailed)

### User Journey:
```
Voice Training Page
    ↓
Two Options:
    A) Paste Listings → Textarea → Submit
    B) Upload Files → Drag & Drop → Process
    ↓
Backend Processing:
    - Extract text from files (if uploaded)
    - Analyze tone, vocabulary, style
    - Create voice profile JSON
    ↓
Progress Indicators:
    ✓ Baseline Establishing
    ✓ Compliance Alignment
    ○ Persona Calibration (pending more samples)
    ↓
Status Display:
    - Training progress %
    - Last updated timestamp
    - Active profile badge
    ↓
Ready for Generation:
    - Profile becomes injectable into LLM
    - All future generations use this voice
```

### Backend Processing:
```javascript
// POST /api/voice/profiles/:id/samples
{
  sample_type: "paste", // or "file_upload"
  sample_text: "Gorgeous mid-century home with stunning views...",
  auto_analyze: true
}

// Response triggers:
// 1. Extract tone indicators
// 2. Build vocabulary matrix
// 3. Identify style characteristics
// 4. Generate system prompt template
// 5. Store in voice_profiles table
```

---

## 8. Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup & repo structure
- [ ] Database schema & Prisma setup
- [ ] Basic Express API scaffold
- [ ] User authentication (JWT, bcrypt)
- [ ] React frontend boilerplate

### Phase 2: Voice Training (Weeks 3-4)
- [ ] Voice profile schema & models
- [ ] Paste listing form + file upload
- [ ] Voice analysis AI logic
- [ ] System prompt template generation
- [ ] Voice profile storage & retrieval

### Phase 3: Core Generation (Weeks 5-6)
- [ ] OpenAI API integration
- [ ] Listing generator form
- [ ] Voice-injected generation (system prompt)
- [ ] Real-time compliance audit
- [ ] Audit report display

### Phase 4: Features & UX (Weeks 7-8)
- [ ] Audit history & filtering
- [ ] Follow-up email engine
- [ ] Compliance library
- [ ] Dashboard & analytics
- [ ] Settings & preferences

### Phase 5: Monetization & Polish (Weeks 9-10)
- [ ] Stripe subscription integration
- [ ] Usage tracking & limits
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Security audit & deployment

---

## 9. File Structure

```
deed/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Signup.tsx
│   │   │   └── App/
│   │   │       ├── Dashboard.tsx
│   │   │       ├── VoiceTraining.tsx
│   │   │       ├── ListingGenerator.tsx
│   │   │       ├── AuditHistory.tsx
│   │   │       ├── FollowUpEngine.tsx
│   │   │       ├── ComplianceLibrary.tsx
│   │   │       ├── Subscription.tsx
│   │   │       └── Settings.tsx
│   │   ├── components/
│   │   │   ├── Navigation/
│   │   │   ├── Auth/
│   │   │   ├── Forms/
│   │   │   ├── Modals/
│   │   │   └── ui/
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useAudits.ts
│   │   │   └── useVoiceProfile.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── auth.ts
│   │   ├── store/
│   │   │   ├── authSlice.ts
│   │   │   ├── auditSlice.ts
│   │   │   └── store.ts
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── voice.ts
│   │   │   ├── listings.ts
│   │   │   ├── audits.ts
│   │   │   ├── followups.ts
│   │   │   ├── subscriptions.ts
│   │   │   └── settings.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── voiceController.ts
│   │   │   ├── listingController.ts
│   │   │   └── auditController.ts
│   │   ├── services/
│   │   │   ├── llmService.ts (OpenAI)
│   │   │   ├── voiceService.ts (Analysis)
│   │   │   ├── complianceService.ts
│   │   │   └── stripeService.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   ├── models/
│   │   │   └── (Prisma-generated)
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   └── validators.ts
│   │   ├── prompts/
│   │   │   ├── systemPrompts.ts
│   │   │   └── voicePrompts.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 10. Security & Compliance

### Authentication & Authorization
- JWT tokens (httpOnly cookies)
- bcrypt password hashing (rounds: 12)
- OAuth 2.0 (Google)
- Rate limiting (100 req/min per IP)
- CORS configuration

### Data Protection
- HTTPS/TLS encryption
- Database encryption at rest (AWS RDS)
- PII hashing in logs
- GDPR compliance (data export, deletion)
- SOC 2 audit trail

### LLM Safety
- Input sanitization
- Output validation
- Compliance keyword blocklist
- Fair Housing violation detection
- Audit logging of all generations

### Compliance Guardrails
- Zero Fair Housing violations in output
- Automatic flagging of risky phrases
- Compliance score calculation
- Regular audits of generated content
- Legal disclaimer in UI

---

## 11. Success Metrics & Analytics

### User Engagement
- Daily active users (DAU)
- Weekly active users (WAU)
- Listings generated per user
- Voice profiles created
- Audit reports run

### Compliance Impact
- Violations caught by platform
- User compliance improvement %
- Time saved per user (hours)
- Cost avoidance (FHA fine prevention)

### Business Metrics
- Monthly recurring revenue (MRR)
- Churn rate
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- Free → Pro conversion rate

### Technical Metrics
- API response time (< 200ms)
- LLM generation time (< 30s)
- Uptime (99.9%)
- Error rate (< 0.5%)
- Database query efficiency

---

## 12. Deployment Strategy

### Development
- Local development with Docker
- Environment variables (.env)
- Mock API responses

### Staging
- Vercel/Netlify for frontend
- Heroku/AWS for backend
- Test database (PostgreSQL)
- Staging Stripe account

### Production
- AWS EC2 + RDS (or Vercel + Supabase)
- CDN for static assets (CloudFront)
- Automated backups (daily)
- Monitoring (Datadog)
- Error tracking (Sentry)
- CI/CD pipeline (GitHub Actions)

### Environment Variables
```
DATABASE_URL
JWT_SECRET
OPENAI_API_KEY
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
GOOGLE_OAUTH_ID
GOOGLE_OAUTH_SECRET
```

---

## Summary

This is a comprehensive, production-ready implementation plan for DEED. The platform focuses on:

1. **Voice-driven generation** - Users' unique voice injected into AI outputs
2. **Compliance first** - Zero Fair Housing violations through prompt engineering
3. **Ease of use** - Simple UI flow with optional file uploads
4. **Scalability** - Designed for growth from solo agents to agencies
5. **Revenue** - Freemium model ($0 → $29/mo → custom)

Ready to build! 🚀
