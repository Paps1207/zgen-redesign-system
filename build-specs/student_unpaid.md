## 1. Feature Overview
*   **Feature Name**: Pre-Payment Discovery Phase (Unpaid Student Archetype)
*   **Primary Goal**: Convert a curious, uncertain prospect into a paying client by providing structured exploration tools, guided counsellor interactions, and progressive value demonstration.
*   **User Type (Archetype)**: Unpaid Student (Top of funnel, Phase 0 - Exploration / Discovery & Decision)
*   **Success Criteria**: 
    *   Conversion Rate: > 15% within 30 days of registration.
    *   Time-to-Conversion: < 14 days.
    *   Engagement: Shortlist size $\ge4$, Consultation Booking Rate > 30%.
    *   Retention: D7 return rate > 50%.

---

## 2. User Goals & Tasks
*   **What the user is trying to achieve**: 
    *   Discover universities and programs matching their profile, budget, and preferences.
    *   Understand eligibility based on GPA, scores, and history.
    *   Compare options side-by-side (fees, location, ranking, intake).
    *   Reduce uncertainty via FAQs and Counsellor interactions.
    *   Assess platform value before committing financially.
*   **Key Actions**: 
    *   Register and verify account (OTP).
    *   Complete a 4-step profile onboarding wizard.
    *   Search, filter, and view detailed university data.
    *   Save up to 20 universities to a personal shortlist.
    *   Add notes to and compare shortlisted universities.
    *   Chat with and book consultation sessions with an assigned Counsellor.
    *   Proceed to payment to unlock full execution-phase services.

---

## 3. End-to-End Flow
1.  **Registration & Onboarding (Flow 1)**: User arrives via landing page, submits email/phone, completes OTP verification, and fills out the 4-step onboarding wizard (Personal Info, Academic Profile, Test Scores, Preferences).
2.  **University Discovery (Flow 2)**: User lands on the Home Dashboard to view a personalized recommendation feed. User can perform free-text or filtered searches and view full university details.
3.  **Shortlist Management (Flow 3)**: User saves universities. User navigates to "My Shortlist" to manage items, add personal notes, and select 2-4 universities for a side-by-side comparison matrix.
4.  **Counsellor Engagement (Flow 4)**: User chats with the auto-assigned Counsellor or books a phone/video session. Post-session, the user receives a curated "Counsellor Suggested" list pushed to their dashboard.
5.  **Conversion Decision (Flow 5)**: Triggered by system nudges or Counsellor links, the user views the "What you unlock" Payment Overview screen. User completes payment via an external gateway. *Decision Point: Success transitions role to `PAID_STUDENT`; Failure returns user to retry.*
6.  **Re-Engagement (Flow 6)**: If inactive, the system triggers Day 3/7/14 email/SMS sequences. If inactive for 90 days, the status becomes `DROPPED`. Upon returning, the user sees a "Welcome Back" screen with progress summaries and deadline alerts.

---

## 4. System Logic & Rules
*   **Conditions (If/Then Conversion Nudges)**:
    *   *If* shortlist reaches 3 items, *then* display milestone banner ("You may be ready to apply").
    *   *If* shortlist reaches 5 items, *then* display prominent banner ("You're ready to apply" with CTA).
    *   *If* 3 platform sessions completed, *then* inject re-engagement nudge into dashboard.
    *   *If* 30 minutes pass after a completed session (`SESSION_HELD`), *then* send automated follow-up email/in-app notification with payment link.
    *   *If* shortlisted university intake deadline is $\le90$ days, *then* show deadline urgency notification.
*   **Validations**:
    *   GPA inputs are automatically normalized to a 4.0 scale.
    *   Field-level validation for valid test score ranges (e.g., blocking an IELTS score of 15).
    *   Maximum 20 items in the Shortlist.
    *   Maximum 4 items selected for the Compare View.
*   **Dependencies**:
    *   Recommendation engine requires completion of Onboarding Step 4 to populate initial cache.
    *   Eligibility indicator requires basic profile vs. program requirements data.
    *   Counsellor assignment requires a `VERIFIED` account status.
*   **Permissions & Restrictions**:
    *   Unpaid students have strictly *read-only* access to university databases, FAQs, and Counsellor-suggested lists.
    *   Execution features (Full application, Document submission, LRT services, Task board, SOP tools) are strictly gated. Clicking them triggers an upgrade CTA.
    *   No visibility into Consultant, Application Associate, or LRT roles.

---

## 5. Screen Inventory
*   **SCR-01**: Landing / Registration Page
*   **SCR-02**: Email / Phone Verification Screen
*   **SCR-03**: Onboarding Wizard (4 Steps)
*   **SCR-04**: Onboarding Completion / Welcome
*   **SCR-05**: Home Dashboard
*   **SCR-06**: University Search & Filter
*   **SCR-07**: University Detail View
*   **SCR-08**: My Shortlist
*   **SCR-09**: University Compare View
*   **SCR-10**: Eligibility Insights Panel
*   **SCR-11**: Application Timeline Preview
*   **SCR-12**: Chat with Counsellor
*   **SCR-13**: Book Consultation Session
*   **SCR-14**: Booking Confirmation Screen
*   **SCR-15**: Counsellor Suggested Section
*   **SCR-16**: Payment Overview / Upgrade Screen
*   **SCR-17**: Payment Success Screen
*   **SCR-18**: Payment Failure Screen
*   **SCR-19**: Re-Engagement Welcome Back Screen
*   **SCR-20**: FAQs & Guides Library

---

## 6. Screen-Level Specifications

### SCR-01: Landing / Registration Page
*   **Purpose**: Convert visitor to registered user.
*   **User Actions**: Submit form, OAuth login, existing login.
*   **UI Elements**: Hero section, Trust indicators, Email/phone input, Password creation, OAuth buttons (Google/Apple), T&C checkbox.
*   **Component Types**: Standard Web Form, SSO Buttons, Hero Banner.
*   **States**: Empty, Validation Error (inline).
*   **Transitions**: Submit -> SCR-02.

### SCR-02: Email / Phone Verification Screen
*   **Purpose**: Confirm identity and activate account.
*   **User Actions**: Verify OTP, Resend OTP, Change contact method.
*   **UI Elements**: 6-digit input, Countdown timer (60s), Resend link.
*   **Component Types**: OTP Input Field, Countdown Timer Text.
*   **States**: Waiting, Expired, Invalid (error text).
*   **Transitions**: Success -> SCR-03.

### SCR-03: Onboarding Wizard (4 Steps)
*   **Purpose**: Progressive profile capture to drive recommendations.
*   **User Actions**: Input data, Next, Save & Continue, Skip step.
*   **UI Elements**: Progress bar, Skip option, Personal info fields (text/dropdown), Academic fields (GPA/Scale selector), Test score selector, Preferences (multi-select).
*   **Component Types**: Stepper, Select Menus, Multi-Select Chips, Number Inputs.
*   **States**: Partial (with quality impact warning), Loading (step 4 engine process).
*   **Transitions**: Step 4 complete -> SCR-05.

### SCR-05: Home Dashboard
*   **Purpose**: Primary workspace showing recommendations, nudges, and counsellor access.
*   **User Actions**: Save university, View details, Message counsellor, Click nudge CTAs.
*   **UI Elements**: Profile completeness bar, Counsellor snippet (name, photo, last message), University Cards (data + eligibility badge), Feature Teaser Cards, Nudge Banners.
*   **Component Types**: Feed Layout, Data Cards, Avatar, Alert Banners.
*   **States**: Loading (Personalizing...), Empty (No recommendations yet), Full Feed.
*   **Transitions**: Card click -> SCR-07; Message click -> SCR-12.

### SCR-06: University Search & Filter
*   **Purpose**: Full search interface.
*   **User Actions**: Text search, Apply filters, Change sort, Save to shortlist.
*   **UI Elements**: Search bar, Collapsible filter panel (Country, Fee slider, Intake, Program, Ranking), Sort control, Results count, Pagination.
*   **Component Types**: Search Bar, Range Sliders, Checkbox Groups, Data Grid/List.
*   **States**: Empty (No query), Results loaded, No matches found.
*   **Transitions**: Result click -> SCR-07.

### SCR-07: University Detail View
*   **Purpose**: Full university profile data.
*   **User Actions**: Read tabs, Save to shortlist, Add to compare.
*   **UI Elements**: Header (Ranking/Overview), Tabs (Programs, Requirements, Fees, Deadlines, Location), Eligibility Indicator (H/M/L), Sticky Save CTA bar.
*   **Component Types**: Tabbed Container, Hero Header, Sticky Bottom Nav/Action Bar, Status Badges.
*   **States**: Skeleton loader, Missing Data (e.g., "Complete profile to see eligibility").
*   **Transitions**: Save -> Updates Shortlist state. Add Compare -> SCR-09.

### SCR-08: My Shortlist
*   **Purpose**: View, annotate, and select items for comparison.
*   **User Actions**: Remove/Reorder self-items, Add notes, Select for compare.
*   **UI Elements**: Self-Saved list, Counsellor Suggested list (read-only), Notes text area, Compare checkboxes, Item count tracker ($X/20$).
*   **Component Types**: Draggable List, Text Area, Checkboxes.
*   **States**: Empty, Full ($20/20$), Counsellor list empty (placeholder).
*   **Transitions**: Compare click -> SCR-09.

### SCR-09: University Compare View
*   **Purpose**: Side-by-side evaluation matrix.
*   **User Actions**: View comparison, Save items, Remove from compare.
*   **UI Elements**: 12-attribute rows, Column headers (Flags/Names), Highlighting for "best value", Save buttons per column.
*   **Component Types**: Data Table / Matrix, sticky headers.
*   **States**: 1 selected (disabled state), Loaded (2-4 items), Missing Data ("N/A").
*   **Transitions**: Back -> SCR-08.

### SCR-12: Chat with Counsellor
*   **Purpose**: Threaded messaging.
*   **User Actions**: Send message, Click links/templates.
*   **UI Elements**: Thread, Input field, Quick templates, Response time SLA indicator, System messages (inline alerts).
*   **Component Types**: Chat UI (Bubbles, Input field, Header).
*   **States**: Empty (Suggested templates), Awaiting Response.
*   **Transitions**: Click payment link -> SCR-16.

### SCR-13: Book Consultation Session
*   **Purpose**: Schedule video/phone call.
*   **User Actions**: Select slot, Choose type (Phone/Video), Confirm.
*   **UI Elements**: Counsellor bio, Calendar grid, Radio buttons, Summary.
*   **Component Types**: Date/Time Picker Grid, Radio Group.
*   **States**: Loaded, No slots available.
*   **Transitions**: Confirm -> SCR-14.

### SCR-16: Payment Overview / Upgrade Screen
*   **Purpose**: Value clarity before payment.
*   **User Actions**: Proceed to Payment.
*   **UI Elements**: "What you unlock" checklist, Price/Terms, Counsellor quote snippet, FAQs.
*   **Component Types**: Pricing Card, Accordion (FAQs).
*   **Transitions**: Proceed -> External Gateway.

### SCR-17 & SCR-18: Payment Success & Failure
*   **Purpose**: Post-payment resolution.
*   **UI Elements (Success)**: Welcome text, Timeline steps ("What happens next"), Go to Dashboard CTA.
*   **UI Elements (Failure)**: Reason snippet, Try Again CTA, Contact Support/Counsellor.
*   **Transitions**: Success -> Paid Dashboard (ends Unpaid flow). Failure -> Retry Gateway or SCR-12.

---

## 7. Data & Object Mapping (OOUX)
*   **User_Account / Student_Profile**: `student_id` (UUID), `status` (UNVERIFIED, VERIFIED, PAID, DROPPED), `role` (UNPAID_STUDENT, PAID_STUDENT), `utm_source`.
*   **Academic_Profile**: `degree_level`, `gpa_raw`, `gpa_normalised`, `institution_name`.
*   **Test_Scores**: `test_type` (IELTS, GRE, etc.), `score`, `sub_scores` (JSON).
*   **Student_Preferences**: `preferred_countries`, `budget_min_usd`, `target_intake`.
*   **Student_Shortlist**: `university_id`, `source` (SELF, COUNSELLOR_SUGGESTED), `notes` (text).
*   **Counsellor_Chat & Interactions**: `direction` (IN/OUT), `status` (SCHEDULED, HELD), `duration_minutes`.
*   **Behaviour_Events (Log)**: `PAGE_VIEW`, `UNIVERSITY_VIEW`, `COMPARE_VIEW`, `PAYMENT_CTA_VIEWED`.

---

## 8. Edge Cases & Failure Scenarios
*   **Incomplete Data**: Users browsing with < 40% profile completion see inline prompts to finish, but are not hard-blocked from exploring.
*   **Invalid Inputs**: Implausible test scores (e.g., IELTS 15) or GPAs trigger immediate field-level validation errors.
*   **System/Service Failures**: 
    *   Recommendation engine fails: Fallback UI shows "Personalizing..." while retrying in background.
    *   Counsellor unavailable: If > 4-hour SLA breach, auto-assign backup counsellor from pool.
*   **User Drop-Offs**: 
    *   Exiting mid-onboarding auto-saves data; user resumes from the exact step upon return.
    *   90 days of inactivity updates status to `DROPPED` (data is retained and restored if they log back in).
*   **Payment Failures**: User remains `UNPAID_STUDENT`, Counsellor is alerted, and user is routed to SCR-18 with a "Try Again" option.

---

## 9. Responsive Behavior (Feature-Specific)
*   **Layout Changes**:
    *   **Compare Matrix (SCR-09)**: Desktop displays side-by-side columns. On mobile, this must transition to a horizontally scrolling container with sticky leftmost attribute headers to maintain readability.
    *   **Search & Filter (SCR-06)**: Sidebar filters on desktop collapse into a bottom-sheet modal or full-screen overlay on mobile devices.
*   **Priority Shifts**:
    *   Sticky "Save" and "Compare" CTA bars on mobile to ensure primary conversion actions remain visible during long scrolls on University Detail pages (SCR-07).

---

## 10. Open Questions / Assumptions
*   **UI/Design System Component Library**: Assumes standard implementation of Material, Ant, or Tailwind UI components (e.g., specific grid vs list view toggles for search).
*   **Payment Gateway Provider**: Assumed webhook integration (Stripe/PayPal equivalent) handling the actual transaction outside the platform before bouncing back to SCR-17/18.
*   **CMS Architecture**: Assumes FAQs (SCR-20) and generic Application Timelines (SCR-11) are driven by an external headless CMS rather than hardcoded logic.
*   **Chat Infrastructure**: Assumes WebSockets or long-polling for real-time `counsellor_chat` delivery and read receipts (SCR-12).
