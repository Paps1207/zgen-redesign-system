# ZGen Design System (Adapted from Cohere)

## 1. Design Principles

*   **Editorial Authority:** Treat every layout like a high-end print journal. Use massive, tight typography and expansive whitespace to signal confidence and restraint.
*   **Controlled Power:** AI is complex, but the interface should feel controlled. Use dark, immersive "product bands" to house technical complexity, while keeping marketing surfaces airy and white.
*   **The "Media-First" Rule:** UI elements (buttons, borders, backgrounds) remain monochrome and flat. All "emotion" and color must be driven by photography, 3D renders, or product mockups.
*   **Functional Density:** Use a "High-Low" density strategy. Marketing sections should breathe with 80px+ gaps, while technical research and data tables should be dense and rule-separated.
*   **Anti-Decorative:** Avoid shadows, blurs, or gradients in the UI. If a design element doesn't serve an information-architecture purpose, remove it.

---

## 2. Color Rules

### **Surface Logic**
| Surface Type | Token | Hex | Usage Rule |
| :--- | :--- | :--- | :--- |
| **Canvas** | `canvas` | `#ffffff` | The default background for editorial and general content. |
| **Product Band** | `deep-green` | `#003c33` | Full-width sections highlighting core AI capabilities. |
| **Security Band** | `dark-navy` | `#071829` | Full-width sections for trust, legal, or financial contexts. |
| **Stone Card** | `soft-stone` | `#eeece7` | Used for subtle container differentiation on white backgrounds. |

### **Action & Semantic Logic**
*   **Primary Action:** Use **Near-Black** (`#17171c`) for pill buttons on light surfaces; use **Canvas White** on dark surfaces.
*   **Taxonomy & Labels:** Use **Coral** (`#ff7759`) exclusively for blog categories, taxonomy outlines, and "new" markers.
*   **Technical Links:** Use **Action Blue** (`#1863dc`) for research links, pagination, and inline text actions.
*   **Rules/Dividers:** Use **Hairline** (`#d9d9dd`) for list separators. Never use heavy borders.

---

## 3. Typography Rules

### **The Type Split**
The system relies on a strict split between **Display** (Brand) and **UI** (Functional) typefaces.

| Role | Font | Size | Leading | Tracking |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | CohereText | 96px | 1.0 | -1.92px |
| **Section Heading** | Unica77 | 48px | 1.2 | -0.48px |
| **Body Large** | Unica77 | 18px | 1.4 | 0 |
| **Body / UI** | Unica77 | 16px | 1.5 | 0 |
| **Mono Label** | CohereMono | 14px | 1.4 | 0.28px |

### **Usage Rules**
*   **Leading:** Display headlines must remain "tight." If the text looks airy, reduce the line-height until it feels carved.
*   **Capitalization:** Use **ALL CAPS** for `CohereMono` labels to denote system status or small category markers.
*   **Weight:** Avoid `Bold`. Use size and color (Ink vs. Muted Slate) to create hierarchy.

---

## 4. Component System

### **Buttons**
*   **Primary Pill:** Always `32px` or `full` radius. Minimum `12px 24px` padding. No shadows.
*   **Secondary Link:** Text-only with a `1px` underline. Used for "Learn More" or "Explore."

### **Cards**
*   **Media Cards (`lg`):** `22px` radius. Used for hero photography and abstract 3D art.
*   **Product/UI Cards (`sm`):** `8px` radius. Used for feature blocks, blog post thumbnails, and code snippets.
*   **Containment:** Prefer "open" layouts. Only use a background-filled card if content needs to be grouped against a contrasting section.

### **Chips & Filters**
*   **Coral Chips:** Large, prominent chips for high-level blog taxonomy.
*   **Outline Pills:** `1px` border, `30px` radius. Used for technical filtering in research tables.

---

## 5. Layout & Spacing

### **The Grid**
*   **Global Margin:** `24px` on mobile, scaling to `64px` or `80px` on desktop.
*   **Standard Columns:** 12-column grid for desktop. Features usually occupy 3-column or 4-column widths.

### **Spacing System**
*   **Section Vertical Spacing:** `80px` is the standard interval between distinct page sections.
*   **Internal Component Spacing:** Multiples of `8px` (e.g., `16px`, `24px`, `32px`).
*   **Micro Spacing:** `2px` or `6px` for labels and icons.

---

## 6. Responsive Behavior

### **1. Breakpoint Strategy**
*   **Desktop (>1440px):** Focus on "Cinematic Depth." Maximize whitespace and use full display typography scales.
*   **Tablet (768px - 1024px):** Focus on "Information Density." Typography scales down by 15-20%. Horizontal margins tighten to 40px.
*   **Mobile (<768px):** Focus on "Utility & Flow." Heroes become center-aligned; all secondary decorative elements are stripped to prioritize lead text.

### **2. Layout Transformation Rules**
*   **Grid → Stack:** All 3-column and 4-column grids collapse to a single column at 768px.
*   **Horizontal to Vertical Heroes:** Split-screen heroes (text left/image right) move to a stacked vertical arrangement (text top/image bottom).
*   **Alignment Shift:** Desktop center-aligned content remains centered; desktop left-aligned content shifts to center-aligned on Mobile.

### **3. Component Adaptation Rules**
*   **Buttons:** Increase padding to `16px 32px` on Mobile to ensure a minimum 44px touch target. Primary buttons become full-width on Mobile if they are part of a CTA stack.
*   **Cards:** The `22px` radius on `lg` cards scales down to `16px` on Mobile to prevent the "rounded-square" look from feeling too bubbly on small screens.
*   **Forms:** Multi-column form fields (e.g., First Name/Last Name) must stack vertically on Mobile to maintain input legibility.

### **4. Navigation Behavior**
*   **The Transition:** The 3-zone horizontal nav collapses into a "Mobile Sheet" at 1024px.
*   **Mobile Sheet UI:** Use a full-screen `canvas` white overlay. Links use `Section Heading` typography (48px) to emphasize the editorial look, even in menus.
*   **The Toggle:** A simple 2-line "hamburger" icon, strictly monochrome, placed on the far right.

### **5. Content Priority Rules**
*   **Image Reduction:** Abstract 3D media and secondary photography are hidden on Mobile to reduce scroll depth. Hero photography is retained but scaled.
*   **Typographic Hierarchy:** Hero Display (`96px`) reduces to `48px` or `56px` on Mobile. Leading increases slightly to 1.1 to ensure readability on small displays.
*   **The "Bottom Bar" Rule:** On mobile product pages, the primary CTA (e.g., "Request Demo") may pin to the bottom of the viewport as a fixed near-black bar.

---

## 7. Interaction Patterns

*   **Flat Elevation:** ZGen is a "Flat" system. Do not use Z-index shadows to show depth. Instead, use **Surface Inversion** (moving from a white section to a dark green section).
*   **Hover States:**
    *   **Buttons:** Slight opacity shift or a subtle background color fill.
    *   **Cards:** Subtle lift or border color change to `Action Blue`.
    *   **Links:** Underline thickness transition or color shift.
*   **Loading:** Use skeleton placeholders that match the card radius (`8px` or `22px`) to maintain the layout’s silhouette during data fetches.
*   **Transitions:** All state changes should be `200ms` or `300ms` with a "linear" or "ease-out" curve to feel "mechanical" rather than "bouncy."

---

## 8. Component States

### Empty States
- Use minimal illustration or icon + clear instructional text
- Always include a primary CTA (e.g., “Start Application”)
- Avoid decorative visuals; keep it functional

### Loading States
- Use skeleton loaders matching component shape (cards, text rows)
- Avoid spinners for full-page loads unless necessary

### Error States
- Use `error` color (#b30000) for text and borders
- Place error messages directly below input fields
- Use clear, human-readable language (no system jargon)

### Success States
- Use subtle confirmation (check icon + short message)
- Avoid full-screen interruptions unless critical

---

## 9. Form Design Rules

### Structure
- Group related fields using spacing, not heavy borders
- Use clear section headings for long forms

### Inputs
- Always use visible labels (no placeholder-only inputs)
- Use helper text for complex fields

### Validation
- Real-time validation for critical fields
- Error shown inline, not on submit only

### Interaction
- Use progressive disclosure (show fields only when needed)
- Break long forms into steps where possible

### CTA Logic
- Primary CTA = always visible at end of section
- Disable CTA until required fields are complete

---

## 10. Navigation & Flow Behavior

### Flow Structure
- Multi-step processes must show progress (step indicator or breadcrumb)
- Users should always know “where they are”

### Back Navigation
- Preserve entered data when navigating back
- Avoid resetting flows unnecessarily

### Exit Points
- Allow safe exits with confirmation if data is unsaved

### Role-Based Navigation
- Navigation should adapt based on user role (Student/Admin)
- Avoid exposing irrelevant actions

---

## 11. Data Display Patterns

### Tables
- Use horizontal scroll on smaller screens instead of cramming columns
- Keep headers sticky when scrolling

### Lists
- Use rule-separated rows instead of heavy cards
- Prioritize scannability (title → metadata → action)

### Filters
- Use pill filters for categories
- Collapse into dropdowns on mobile

### Actions
- Row-level actions should be visible but minimal
- Avoid cluttering with too many buttons

---

## 12. Accessibility Basics

- Maintain sufficient color contrast (especially on dark bands)
- Ensure all interactive elements have clear focus states
- Use semantic HTML structure (labels, buttons, headings)
- Ensure touch targets are minimum 44px
