<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# \# InterviewOS – Web App Wireframes (Text-Only)


---

## 1. Landing Page – “InterviewOS Home”

### Layout

- Header (top)
    - Left: [Logo] InterviewOS
    - Right: Links: How it works | Sample report | Login | [Button] Get started free
- Hero section (split left/right)
    - Left:
        - H1: “Never walk into your next interview unsure what went wrong”
        - Subtext: “AI-powered analysis of your real interviews so you know exactly what to improve.”
        - [Primary Button] Analyze my next interview
        - [Text Link] View sample analysis
    - Right:
        - Placeholder box for future screenshot / illustration
- Section: “How it works”
    - 3 horizontal blocks:
        - Block 1: “Record or reconstruct your interview”
        - Block 2: “Get a detailed breakdown of strengths and gaps”
        - Block 3: “Run targeted practice sessions”
- Section: “Who it’s for”
    - Title: “Built for active candidates”
    - Bullets:
        - “Frontend developers”
        - “2–5 years experience”
        - “Interviewing for product companies”
- Footer
    - Links: About | Privacy | Terms | Contact

---

## 2. Auth – Login \& Sign Up

### 2.1 Login Page

- Centered card:
    - Title: “Login”
    - [Input] Email
    - [Input] Password
    - [Button] Login
    - [Text Link] Forgot password?
    - Divider line
    - Small text: “New here?” [Text Link] Create an account


### 2.2 Sign Up Page

- Centered card:
    - Title: “Create your InterviewOS account”
    - [Input] Full name
    - [Input] Email
    - [Input] Password
    - [Checkbox] I agree to the Terms \& Privacy Policy
    - [Button] Create account
    - Small text: “Already have an account?” [Text Link] Login

---

## 3. Onboarding – Role \& Goals

### 3.1 Current Role \& Experience

- Page title: “Tell us about your current role”
- [Dropdown] Your primary role
    - Default: Frontend Engineer
- [Dropdown] Years of experience
    - Options: 0–1, 2–3, 4–5, 6+
- [Optional Input] Current company
- Bottom-right: [Button] Next


### 3.2 Target Role \& Companies

- Page title: “What are you aiming for?”
- [Dropdown] Target level
    - Junior / Mid / Senior / Lead
- [Chip Input] Target companies
    - Placeholder: “Type a company and press enter”
- Bottom:
    - Left: [Text Button] Back
    - Right: [Button] Next


### 3.3 Consent \& Explanation

- Page title: “How InterviewOS works”
- Content box:
    - Bullet list:
        - “We record or reconstruct your interviews.”
        - “We transcribe and analyze your answers.”
        - “You can delete your data anytime.”
- [Checkbox] I understand and consent to my interview data being analyzed for feedback.
- Bottom:
    - Left: [Text Button] Back
    - Right: [Button] Continue

---

## 4. Start – Choose Capture Type

### 4.1 Start Options

- Page title: “Start your first analysis”
- 3 cards in a row (or stacked on mobile):
    - Card 1:
        - Title: “Record a yourself”
        - Description: “Use InterviewOS during your next live interview.”
        - [Button] Set up recording
    - Card 2:
        - Title: “Reconstruct a past interview”
        - Description: “We guide you to recall questions and answers you already had.”
        - [Button] Start reconstruction
    - Card 3:
        - Title: “Take a baseline mock”
        - Description: “Do a short simulated interview to get an initial skill snapshot.”
        - [Button] Start baseline mock

---

## 5. Record Interview Flow (Real Interview)

### 5.1 Record Setup

- Page title: “Set up recording”
- Section: Interview details
    - [Input] Interview name
    - [Input] Company (optional)
    - [Dropdown] Round (Screen / Technical / System Design / Behavioral / Other)
- Section: Recording options
    - [Toggle] Record audio
    - [Toggle] Record screen (optional)
- Info text: “Make sure you have permission to record if required.”
- Bottom:
    - Left: [Text Button] Back
    - Right: [Button] Start recording


### 5.2 Recording In Progress

- Minimal full-width banner:
    - Icon: Red dot
    - Text: “Recording in progress”
    - Timer: 00:14:23
    - [Button] Stop recording
- Optional side note panel:
    - [Textarea] “Notes (optional)” with placeholder: “Round 2 – frontend system design…”


### 5.3 Review Recording

- Page title: “Review your recording”
- Summary box:
    - Duration
    - Interview name
- [Button] Play preview (simple audio player)
- [Button] Confirm \& analyze
- [Text Button] Discard and re-record

---

## 6. Interview Reconstruction Flow (No Recording)

### 6.1 Reconstruction Intro

- Page title: “Reconstruct your interview”
- Text block:
    - Short explanation of the process and what’s needed.
- [Button] Start reconstruction
- [Text Button] Back


### 6.2 Interview Metadata

- Page title: “About this interview”
- [Input] Interview name
- [Input] Company (optional)
- [Dropdown] Round
- [Dropdown] Interview type (Technical / System design / Behavioral / Mixed)
- Bottom:
    - Left: [Text Button] Back
    - Right: [Button] Next


### 6.3 Question Capture (Wizard, repeated per question)

- Progress indicator: “Question 1 of N”
- Section: Question
    - [Textarea] “What did they ask?”
    - [Optional Button] Record voice instead
- Section: Your answer
    - [Textarea] “What did you answer?”
    - [Optional Button] Record voice instead
- Section: Follow-ups
    - [Textarea] “Any follow-up questions or clarifications?”
- Section: Confidence
    - Label: “How confident did you feel?”
    - [Slider] 0–10
- Bottom:
    - Left: [Text Button] Add later / Skip
    - Middle: [Text Button] Add another question
    - Right: [Button] Next


### 6.4 Review \& Confirm

- Page title: “Review reconstructed interview”
- List of question blocks:
    - Q1 row: question text + [Link] Edit
    - Q2 row: ...
- [Button] Looks good, analyze
- [Text Button] Go back and edit

---

## 7. Analysis In Progress

### 7.1 Processing Screen

- Page title: “Analyzing your interview”
- Progress steps displayed horizontally:
    - Step 1 (highlighted): Transcribing \& segmenting
    - Step 2: Extracting signals
    - Step 3: Scoring performance
    - Step 4: Generating feedback
- Loader / progress animation
- Side panel: “While you wait” with 1–2 educational blurbs:
    - Example card: “What is tradeoff awareness? Short explanation…”

---

## 8. Interview Overview \& Scorecard

### 8.1 Interview Summary Screen

- Header
    - Left: Interview name
    - Right: [Button] Back to dashboard
- Top section: Overview card
    - Company | Role | Round | Date
    - Short summary sentence: “You’re currently performing at a strong mid-level frontend engineer.”
    - Overall score visualization: e.g., large numeric score or badge
- Middle section: Skill metrics grid
    - Grid or horizontal cards:
        - Communication clarity – score – arrow (trend vs previous)
        - Structural thinking – score
        - Technical depth – score
        - Tradeoff awareness – score
        - Quantification \& impact – score
        - Follow-up handling – score
        - Seniority alignment – score
        - Confidence signal strength – score
    - Each card clickable → metric detail
- Bottom section: Highlights \& actions
    - Left card: “Top strengths”
        - Bullet 1
        - Bullet 2
    - Right card: “Key improvement areas”
        - Bullet 1 with “View examples” link
        - Bullet 2 with “Practice this” link

---

## 9. Metric Detail \& Transcript

### 9.1 Metric Detail Page

- Breadcrumb: Dashboard > [Interview name] > [Metric name]
- Title: e.g., “Tradeoff awareness”
- Top:
    - Big score
    - Short definition of the metric
- Section: Observations
    - “You rarely compared alternative approaches when asked architecture questions.”
    - “You accepted constraints without probing deeper.”
- Section: Examples
    - List of 2–3 transcript snippets with labels:
        - “Missed opportunity”
        - “Strong example”
    - Each snippet: short text + [Button] View in transcript
- Section: Suggested practice
    - Bullets of exercises or upcoming simulations: “Practice a system design question focusing on tradeoffs.”


### 9.2 Transcript View

- Two-column layout:
    - Left: Transcript
        - Segmented by questions:
            - “Q1 – Interviewer”
                - Text
            - “You”
                - Text, with highlight colors indicating strong/weak parts
        - [Filters] at top: All | Strengths | Weaknesses | Opportunities
    - Right: Context panel
        - Current metric selected
        - Explanation and key tips
- Floating button: “Back to overview”

---

## 10. Dashboard – “My InterviewOS”

### 10.1 Main Dashboard

- Header: “Welcome back, [Name]”
- Top section: Performance trend
    - Line graph placeholder: Overall score vs interview date
    - Small indicators for last 3 interviews
- Section: Skill snapshot
    - Small radar or horizontal bar placeholder for core metrics
    - Legend listing metrics with mini icons
- Section: Recent interviews
    - List:
        - Row: Interview name | Date | Company | Overall score | Badge (“Weak closing”, “Shallow system design”, etc.)
        - [Link] View analysis
- Section: Recommended next steps
    - Card 1: “Your biggest opportunity: Quantification \& impact” [Button] Start focused practice
    - Card 2: “Simulated interview: Frontend system design (state management \& scalability)” [Button] Start simulation

---

## 11. Gap Analyzer

### 11.1 Gap Analysis Page

- Title: “Patterns across your interviews”
- Section: Summary
    - Text: “We analyzed your last X interviews.”
- Section: Recurring weaknesses (list of pattern cards)
    - Pattern card:
        - Title: e.g., “Missing quantification”
        - Description: “In 4 of your last 5 interviews, impact numbers were vague or missing.”
        - Severity label: Low / Medium / High
        - Impact label: “High impact on offer probability”
        - [Button] Create practice plan
- Section: Recurring strengths
    - Pattern card:
        - “Strong structural thinking in system design questions”
        - Short description

---

## 12. Roadmap

### 12.1 Roadmap Page

- Title: “Your improvement roadmap”
- Section: Timeline (4–6 weeks, horizontal or vertical)
    - Week 1–2:
        - Theme: “Quantification \& impact stories”
        - Items:
            - “Practice 3 metrics-focused behavioral questions”
            - “Run 1 simulation focusing on impact storytelling”
    - Week 3–4:
        - Theme: “System design depth \& tradeoffs”
        - Items:
            - “Answer 2 system design prompts with explicit tradeoff discussion”
            - “Run 1 simulation on frontend architecture”
- Section: Progress
    - Checklist-style view:
        - [Checkbox] Task title – status
    - Text: “You completed 3/5 tasks this week.”

---

## 13. Simulation Flow (Adaptive Practice)

### 13.1 Simulation Selection

- Page title: “Targeted simulations”
- Tabs:
    - Recommended for you
    - Browse all
- “Recommended for you” section:
    - Card:
        - Title: “Frontend system design – focus: state management \& scalability”
        - Labels: Difficulty (Medium), Duration (30 min)
        - [Button] Start simulation


### 13.2 Simulation Session

- Layout:
    - Center question area:
        - Question text
        - Timer: 05:00
        - [Button] Start recording answer
        - [Button] Stop / Next question
    - Small sidebar:
        - “Tip for this question” text


### 13.3 Simulation Debrief

- Title: “Simulation results”
- Top: Overall simulation score, short summary
- Middle: Same metric cards as real interview
- Bottom:
    - [Button] Save best answers to library
    - [Button] View detailed analysis

---

design like a wireframe screen. screen 1 WF-01 like in this format

```markdown
# InterviewOS – Web App Wireframes (Screen-by-Screen)

---

## WF-01 – Landing Page “InterviewOS Home”

**Purpose:** Explain value and drive signups.

**Layout**

- Header (top)
  - Left: [Logo] InterviewOS
  - Right: Navigation
    - Link: How it works
    - Link: Sample report
    - Link: Login
    - [Primary Button] Get started free

- Hero (two-column)
  - Left:
    - H1: “Never walk into your next interview unsure what went wrong”
    - Subtext: “AI-powered analysis of your real interviews so you know exactly what to improve.”
    - [Primary Button] Analyze my next interview
    - [Secondary Text Link] View sample analysis
  - Right:
    - [Placeholder box] Area for future product screenshot / illustration

- Section: How it works
  - Title: “How it works”
  - 3 equal-width blocks:
    - Block 1
      - Label: “Record or reconstruct your interview”
    - Block 2
      - Label: “Get a detailed breakdown of strengths and gaps”
    - Block 3
      - Label: “Run targeted practice sessions”

- Section: Who it’s for
  - Title: “Built for active candidates”
  - Bullets:
    - “Frontend developers”
    - “2–5 years experience”
    - “Interviewing for product companies”

- Footer
  - Horizontal list of links:
    - About | Privacy | Terms | Contact

---

## WF-02 – Login

**Purpose:** Let existing users sign in.

- Centered card on neutral background
  - Title: “Login”
  - [Input] Email
  - [Input] Password
  - [Primary Button] Login
  - [Text Link] Forgot password?
  - Divider line
  - Small text row:
    - Text: “New here?”
    - [Inline Text Link] Create an account

---

## WF-03 – Sign Up

**Purpose:** Create a new account.

- Centered card
  - Title: “Create your InterviewOS account”
  - [Input] Full name
  - [Input] Email
  - [Input] Password
  - [Checkbox] “I agree to the Terms & Privacy Policy”
  - [Primary Button] Create account
  - Small text row:
    - Text: “Already have an account?”
    - [Inline Text Link] Login

---

## WF-04 – Onboarding: Current Role & Experience

**Purpose:** Capture current role context.

- Page title (top left): “Tell us about your current role”
- Form area
  - [Dropdown] Your primary role
    - Default: Frontend Engineer
  - [Dropdown] Years of experience
    - Options: 0–1, 2–3, 4–5, 6+
  - [Optional Input] Current company
- Bottom-right:
  - [Primary Button] Next

---

## WF-05 – Onboarding: Target Role & Companies

**Purpose:** Capture goals and targets.

- Page title: “What are you aiming for?”
- Form area
  - [Dropdown] Target level
    - Junior / Mid / Senior / Lead
  - [Chip Input] Target companies
    - Placeholder text: “Type a company and press enter”
- Bottom bar
  - Left: [Text Button] Back
  - Right: [Primary Button] Next

---

## WF-06 – Onboarding: Consent & Explanation

**Purpose:** Explain analysis and get consent.

- Page title: “How InterviewOS works”
- Content box
  - Bulleted list:
    - “We record or reconstruct your interviews.”
    - “We transcribe and analyze your answers.”
    - “You can delete your data anytime.”
- Below content:
  - [Checkbox] “I understand and consent to my interview data being analyzed for feedback.”
- Bottom bar
  - Left: [Text Button] Back
  - Right: [Primary Button] Continue

---

## WF-07 – Start: Choose Capture Type

**Purpose:** First-time entry into capture flow.

- Page title: “Start your first analysis”
- Layout: 3 cards in a row (stacked on mobile)

  - Card 1 – Record a real interview
    - Title: “Record a real interview”
    - Description: “Use InterviewOS during your next live interview.”
    - [Primary Button] Set up recording

  - Card 2 – Reconstruct a past interview
    - Title: “Reconstruct a past interview”
    - Description: “We guide you to recall questions and answers you already had.”
    - [Primary Button] Start reconstruction

  - Card 3 – Baseline mock
    - Title: “Take a baseline mock”
    - Description: “Do a short simulated interview to get an initial skill snapshot.”
    - [Primary Button] Start baseline mock

---

## WF-08 – Record Setup (Real Interview)

**Purpose:** Configure recording and context.

- Page title: “Set up recording”
- Section: Interview details
  - [Input] Interview name
  - [Input] Company (optional)
  - [Dropdown] Round
    - Options: Screen / Technical / System Design / Behavioral / Other
- Section: Recording options
  - [Toggle] Record audio
  - [Toggle] Record screen (optional)
- Info text (small): “Make sure you have permission to record if required.”
- Bottom bar
  - Left: [Text Button] Back
  - Right: [Primary Button] Start recording

---

## WF-09 – Recording In Progress

**Purpose:** Simple, low-distraction recording UI.

- Top fixed banner (full width)
  - Icon: Red dot
  - Text: “Recording in progress”
  - Timer: 00:14:23
  - [Button] Stop recording
- Optional side note panel (right or bottom)
  - Label: “Notes (optional)”
  - [Textarea] Placeholder: “Round 2 – frontend system design…”

---

## WF-10 – Review Recording

**Purpose:** Confirm recording before analysis.

- Page title: “Review your recording”
- Summary box
  - Label: “Duration” – value
  - Label: “Interview name” – value
- Audio preview area
  - [Audio Player] Play / pause / scrub
- Action buttons (horizontal)
  - [Primary Button] Confirm & analyze
  - [Secondary Text Button] Discard and re-record

---

## WF-11 – Reconstruction Intro (No Recording)

**Purpose:** Explain reconstruction flow.

- Page title: “Reconstruct your interview”
- Text block:
  - Short paragraph: what reconstruction is and why it’s useful.
- Bottom buttons (centered)
  - [Primary Button] Start reconstruction
  - [Secondary Text Button] Back

---

## WF-12 – Reconstruction: Interview Metadata

**Purpose:** Capture context before questions.

- Page title: “About this interview”
- Form
  - [Input] Interview name
  - [Input] Company (optional)
  - [Dropdown] Round
  - [Dropdown] Interview type
    - Technical / System design / Behavioral / Mixed
- Bottom bar
  - Left: [Text Button] Back
  - Right: [Primary Button] Next

---

## WF-13 – Reconstruction: Question Capture (Step)

**Purpose:** Capture each Q&A block.

- Top: Progress indicator
  - Text: “Question 1 of N”
- Section: Question
  - Label: “What did they ask?”
  - [Textarea]
  - [Small Button] Record voice instead
- Section: Your answer
  - Label: “What did you answer?”
  - [Textarea]
  - [Small Button] Record voice instead
- Section: Follow-ups
  - Label: “Any follow-up questions or clarifications?”
  - [Textarea]
- Section: Confidence
  - Label: “How confident did you feel?”
  - [Slider] 0–10 with numeric value
- Bottom actions
  - Left: [Text Button] Add later / Skip
  - Center: [Text Button] Add another question
  - Right: [Primary Button] Next

---

## WF-14 – Reconstruction: Review & Confirm

**Purpose:** Final check before analysis.

- Page title: “Review reconstructed interview”
- List of question blocks
  - Each row:
    - “Q1 – [truncated question text…]”
    - [Text Link] Edit
- At bottom:
  - [Primary Button] Looks good, analyze
  - [Secondary Text Button] Go back and edit

---

## WF-15 – Analysis In Progress

**Purpose:** Show analysis pipeline and reduce anxiety.

- Page title: “Analyzing your interview”
- Horizontal progress steps
  - Step 1: Transcribing & segmenting (highlighted)
  - Step 2: Extracting signals
  - Step 3: Scoring performance
  - Step 4: Generating feedback
- Center:
  - Loader / animation
- Side panel:
  - Title: “While you wait”
  - Card example:
    - Subtitle: “What is tradeoff awareness?”
    - Short description

---

## WF-16 – Interview Overview & Scorecard

**Purpose:** High-level feedback for one interview.

- Header bar
  - Left: Interview name
  - Right: [Button] Back to dashboard

- Top section: Overview card
  - Row of key info:
    - Company | Role | Round | Date
  - Summary text:
    - “You’re currently performing at a strong mid-level frontend engineer.”
  - Overall score visualization:
    - Large numeric score or badge

- Middle section: Skill metrics grid
  - 2–3 columns of cards:
    - Card layout:
      - Metric name (e.g., “Communication clarity”)
      - Score (number or bar)
      - Small trend icon (up/down/flat)
  - Metrics:
    - Communication clarity
    - Structural thinking
    - Technical depth
    - Tradeoff awareness
    - Quantification & impact
    - Follow-up handling
    - Seniority alignment
    - Confidence signal strength
  - Each card:
    - [Clickable area] → Metric detail page

- Bottom section: Highlights & Actions
  - Left card: “Top strengths”
    - 2–3 bullet points
  - Right card: “Key improvement areas”
    - 2–3 bullet points
    - Each bullet with:
      - [Text Link] View examples
      - [Text Link] Practice this

---

## WF-17 – Metric Detail

**Purpose:** Deep dive on a single metric.

- Breadcrumb row:
  - “Dashboard > [Interview name] > [Metric name]”
- Title: e.g., “Tradeoff awareness”
- Top section:
  - Large score
  - Short definition text
- Section: Observations
  - Bullet list of 2–4 specific observations
- Section: Examples
  - For each example:
    - Short transcript snippet (1–2 lines)
    - Label: “Missed opportunity” or “Strong example”
    - [Small Button] View in transcript
- Section: Suggested practice
  - Bullet list of exercises, e.g.:
    - “Practice a system design question focusing on tradeoffs.”

---

## WF-18 – Transcript View

**Purpose:** Full annotated transcript.

- Two-column layout

  - Left column: Transcript
    - Header controls:
      - Filter chips: All | Strengths | Weaknesses | Opportunities
    - List of blocks:
      - “Q1 – Interviewer”
        - Text block
      - “You”
        - Text block with color highlights for strong/weak segments

  - Right column: Context panel
    - Current metric selected
    - Short explanation
    - Key tips

- Persistent floating button:
  - [Button] Back to overview

---

## WF-19 – Dashboard “My InterviewOS”

**Purpose:** Home screen for returning users.

- Header:
  - Title: “Welcome back, [Name]”

- Top section: Performance trend
  - Line graph placeholder:
    - X-axis: Interview dates
    - Y-axis: Overall score
  - Markers for last 3 interviews

- Section: Skill snapshot
  - Radar chart or horizontal bar placeholder
  - Legend listing metrics and colors

- Section: Recent interviews
  - Table-like list:
    - Columns:
      - Interview name
      - Date
      - Company
      - Overall score
      - Badge (e.g., “Weak closing”, “Shallow system design”)
      - [Text Link] View analysis

- Section: Recommended next steps
  - Card 1:
    - Title: “Your biggest opportunity: Quantification & impact”
    - [Primary Button] Start focused practice
  - Card 2:
    - Title: “Simulated interview: Frontend system design (state management & scalability)”
    - [Primary Button] Start simulation

---

## WF-20 – Gap Analyzer

**Purpose:** Show cross-interview patterns.

- Page title: “Patterns across your interviews”
- Summary section:
  - Text: “We analyzed your last X interviews.”
- Section: Recurring weaknesses
  - List of pattern cards:
    - Card:
      - Title: “Missing quantification”
      - Description: “In 4 of your last 5 interviews, impact numbers were vague or missing.”
      - Labels:
        - Severity: Low / Medium / High
        - Impact: e.g., “High impact on offer probability”
      - [Primary Button] Create practice plan

- Section: Recurring strengths
  - List of pattern cards:
    - Card:
      - Title: “Strong structural thinking in system design questions”
      - Short description

---

## WF-21 – Roadmap

**Purpose:** Turn insights into a concrete plan.

- Page title: “Your improvement roadmap”
- Section: Timeline (4–6 weeks)
  - Week 1–2 block:
    - Theme: “Quantification & impact stories”
    - Items:
      - [Checkbox] Practice 3 metrics-focused behavioral questions
      - [Checkbox] Run 1 simulation focusing on impact storytelling
  - Week 3–4 block:
    - Theme: “System design depth & tradeoffs”
    - Items:
      - [Checkbox] Answer 2 system design prompts with explicit tradeoff discussion
      - [Checkbox] Run 1 simulation on frontend architecture

- Section: Progress
  - Text: “You completed 3/5 tasks this week.”
  - Visual: simple progress bar

---

## WF-22 – Simulation Selection

**Purpose:** Choose an adaptive practice session.

- Page title: “Targeted simulations”
- Tabs:
  - “Recommended for you”
  - “Browse all”
- “Recommended for you” tab:
  - List of cards:
    - Card:
      - Title: “Frontend system design – focus: state management & scalability”
      - Meta row:
        - Difficulty: Medium
        - Duration: 30 min
      - [Primary Button] Start simulation

---

## WF-23 – Simulation Session

**Purpose:** Run a guided mock.

- Layout: Single-column

- Center area:
  - Question text
  - Timer: 05:00
  - [Primary Button] Start recording answer
  - [Secondary Button] Stop / Next question

- Right or bottom sidebar:
  - Title: “Tip for this question”
  - Short helpful hint

---

## WF-24 – Simulation Debrief

**Purpose:** Feedback after simulation.

- Page title: “Simulation results”
- Top summary:
  - Overall simulation score
  - Short summary sentence
- Middle section:
  - Metric cards (same style as WF-16)
- Bottom actions:
  - [Primary Button] Save best answers to library
  - [Secondary Button] View detailed analysis

---
```

<span style="display:none">[^1]</span>

<div align="center">⁂</div>

[^1]: Interview-OS.docx

