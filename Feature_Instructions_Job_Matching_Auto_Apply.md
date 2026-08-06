# Implementation Instructions: AI Job Matching & Automated Application Dispatch

**Target project:** AI Resume Builder
**Stack:** Angular 22 (frontend) · Spring Boot 3 / Java 21 (backend) · PostgreSQL 17 · JWT auth · Gemini/OpenAI via existing AI Gateway
**Audience:** AI coding agent (Antigravity) — implement this feature directly in the existing codebase.

---

## 0. Objective 

Add a new capability to the existing AI Resume Builder application: **AI-driven job matching with user-instructed automated application dispatch.**

The system should:
1. Parse a target job description (pasted text, uploaded file, or a listing pulled from a connected job board).
2. Match it against a candidate's resume using semantic similarity + rule-based filters.
3. Present a ranked, scored shortlist of matching roles/companies to the user.
4. **Only after the user explicitly instructs it to proceed**, tailor the resume/cover note per role and send the application — via job-board API where available, otherwise via a generated email sent to the specific job role's contact address.
5. Track the status of every dispatched application.

Do not build a fully autonomous "auto-fire" mode. Every send must be traceable to an explicit user instruction.

---

## 1. Scope of This Change

**Build:**
- Job description parsing service (uses existing AI Gateway).
- Candidate–job semantic matching engine.
- Company/job-board contact directory.
- Review-and-instruct UI flow (user must confirm before any send).
- Dispatch service supporting two channels: job-board API and email.
- Application status tracking (dashboard + underlying log table).

**Do not build in this pass:**
- Fully autonomous background auto-apply without user confirmation.
- Multi-seat/recruiter accounts.
- Billing/monetization changes.
- Native mobile apps.

---

## 2. Backend Changes (Spring Boot)

### 2.1 New domain entities / tables
Add the following, following the project's existing Controller-Service-Repository-Entity pattern and Flyway migration conventions:

| Table | Purpose |
| :--- | :--- |
| `job_listings` | Parsed job descriptions/listings with extracted structured requirements (skills, seniority, domain, location, keywords). Nullable source-board reference for manually pasted listings. |
| `job_matches` | Match score between a `resume` and a `job_listing`, plus a breakdown of which criteria contributed to the score. |
| `companies` | Company/recruiter directory: name, contact endpoint type (`API` or `EMAIL`), contact address/endpoint, source/verification metadata. |
| `job_applications` | Central automation record. Columns: `id, resume_id, resume_version_id, job_listing_id, company_id, match_score, dispatch_channel (api\|email), tailored_content_snapshot, status, submitted_at, last_status_update_at, error_message`. |
| `application_status_logs` | Append-only event history per application (`queued → sent → delivered → viewed → responded → rejected`), each row timestamped. |
| `dispatch_instructions` | Immutable record of the user's explicit confirmation event that authorized a batch/individual send. Store `user_id`, timestamp, and which `job_applications` rows it authorized. This is the audit trail — never allow a send to occur without a corresponding row here. |

Use `pgvector` (or equivalent) on `job_listings`/resume embeddings for similarity search if not already available in the stack; add the extension via Flyway migration.

### 2.2 New services
- **`JobDescriptionParserService`** — calls the AI Gateway to convert raw job description text into structured requirements (skills, seniority, domain, location, keywords). Cache/store the result on `job_listings`.
- **`MatchingService`** — computes embedding similarity between resume sections and parsed job requirements, blends with rule-based filters (location, seniority, salary band, work mode from user preferences), and writes ranked results to `job_matches`.
- **`DispatchService`** — given a confirmed `dispatch_instructions` entry, tailors resume/cover content per target role (via AI Gateway) and sends via:
  - **Job-board API adapter** (per-board implementation behind a common interface, e.g. `JobBoardClient`), or
  - **Email dispatch client** (transactional email provider) — generate a role-specific email body and subject, and send to the company/recruiter contact address stored on `companies`.
  - On completion, write a row to `job_applications` and `application_status_logs`.
- **`ApplicationStatusService`** — exposes read APIs for the tracking dashboard; handles inbound status updates (e.g., webhook from a job board, or manual "mark as responded" from the user).

### 2.3 New REST endpoints (indicative — align naming with existing API conventions)
- `POST /api/job-listings/parse` — parse a pasted/uploaded job description.
- `GET /api/resumes/{resumeId}/matches` — return ranked shortlist for a resume against stored/connected listings.
- `POST /api/applications/dispatch` — **requires an explicit `confirm: true` flag and authenticated user context**; creates the `dispatch_instructions` row, then triggers `DispatchService` for the specified `job_match` id(s).
- `GET /api/applications` — list applications with status, channel, match score, company, timestamps.
- `GET /api/applications/{id}/logs` — status history for one application.

### 2.4 Guardrails to implement (non-negotiable)
- No code path may call `DispatchService.send(...)` without a preceding, persisted `dispatch_instructions` row tied to the authenticated user and the specific application(s) being sent.
- Rate-limit the dispatch endpoint per user (configurable; default suggestion: reasonable cap per hour/day) to prevent accidental bulk-sends and to respect job-board API limits.
- Show the exact tailored content that will be sent back to the caller in the parse/preview response *before* dispatch, so the frontend can render it for review.
- Log every send (success or failure) with enough detail to reconstruct what was sent, to whom, and when.

---

## 3. Frontend Changes (Angular)

### 3.1 New screens/components
- **Job Match Review screen**: input for pasting/uploading a job description or selecting a connected job board search; displays the ranked shortlist with match scores and a breakdown of matching/missing criteria per role.
- **Per-role preview & confirm**: shows the AI-tailored resume snapshot / email draft for a selected match; requires an explicit user action (button: "Send Application") before calling the dispatch endpoint. Support both single-role confirm and multi-select batch confirm.
- **Application Tracker dashboard**: table/list view of `job_applications` with status badges, channel icon (API/email), match score, company, and timestamps; detail view shows the `application_status_logs` timeline.

### 3.2 State/UX requirements
- Never call the dispatch endpoint automatically on page load, on a timer, or as a side effect of matching — it must originate from a direct user click.
- Clearly label which channel (API vs. email) will be used for each application before the user confirms.
- Surface dispatch failures (e.g., bad contact address, API error) in the tracker with the stored `error_message`.

---

## 4. AI Gateway Usage

Reuse the existing provider-agnostic AI Gateway (Gemini/OpenAI) for:
- Structuring raw job description text into requirements JSON.
- Generating the tailored resume snapshot / cover note per matched role.
- Do not introduce a second, parallel AI integration path — route all new AI calls through the existing gateway abstraction.

---

## 5. Security Requirements

- All new endpoints require JWT authentication and must scope data access to the authenticated user's own resumes/applications (mirror existing repository-level scoping pattern).
- `companies` contact data is used only within the candidate-initiated dispatch flow — do not expose it for bulk export or unrelated use.
- Add audit logging for: job description parses, match computations, dispatch instructions, and every send attempt.
- Add input validation and output encoding consistent with existing controllers to prevent injection via pasted job description text or company data.

---

## 6. Acceptance Criteria

- [ ] User can paste or upload a job description and receive a structured parse.
- [ ] User can see a ranked shortlist of matches with scores and criteria breakdown for a given resume.
- [ ] No application is ever sent without an explicit, logged user confirmation (`dispatch_instructions` row exists for every `job_applications` row with status beyond `queued`).
- [ ] Dispatch supports both job-board API submission and direct email submission to a role-specific contact address.
- [ ] Application Tracker correctly reflects status transitions and displays full history per application.
- [ ] All new tables, services, and endpoints follow the existing project conventions (Flyway migrations, Controller-Service-Repository-Entity, DTO/MapStruct mapping, JWT-scoped access).
