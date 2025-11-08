# NeuroCanvas Design Guidelines

## Design Approach

**Reference-Based Approach** drawing from:
- **Calm/Headspace**: Mindful, soothing interface with generous breathing room
- **Notion**: Clean creative workspace with intuitive navigation
- **Spotify**: Emotion-driven UI with dynamic visual feedback
- **Instagram**: Community-focused card layouts and content sharing

**Core Principle**: Create an emotionally intelligent interface that feels therapeutic, not clinical. The design must be adaptable enough to support multiple mood-based color palettes while maintaining structural consistency.

---

## Typography

**Font Stack** (via Google Fonts):
- **Primary**: Inter (400, 500, 600, 700) - for UI, navigation, body text
- **Display**: Poppins (600, 700) - for headlines, emotional prompts

**Hierarchy**:
- **Hero Headlines**: Poppins 700, text-5xl lg:text-7xl
- **Section Titles**: Poppins 600, text-3xl lg:text-4xl
- **Feature Headers**: Inter 600, text-xl lg:text-2xl
- **Body Text**: Inter 400, text-base lg:text-lg
- **UI Labels**: Inter 500, text-sm
- **Micro Copy**: Inter 400, text-xs

---

## Layout System

**Spacing Primitives**: Tailwind units of **4, 6, 8, 12, 16, 20**
- Component padding: p-6, p-8
- Section spacing: py-12, py-16, py-20
- Card gaps: gap-6, gap-8
- Margins: m-4, m-6, m-8

**Containers**:
- Max-width sections: max-w-7xl mx-auto
- Content areas: max-w-6xl
- Reading content: max-w-prose

**Grid Systems**:
- Feature grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Community cards: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
- Dashboard widgets: grid-cols-1 lg:grid-cols-2

---

## Component Library

### Navigation Bar
- **Position**: Sticky top, backdrop-blur-md with subtle transparency
- **Height**: h-16 lg:h-20
- **Logo**: Left-aligned with icon + "NeuroCanvas" wordmark
- **Menu Items**: Creative Canvas | Journal | Weekly Mood | Community | Discover Hobbies
- **Right Side**: User avatar + notification bell
- **Mobile**: Hamburger menu with slide-in drawer

### Mood Detection Landing
- **Hero Section**: Full-height (min-h-screen) centered layout
- **Camera/Mic Preview**: Large circular frame (w-64 h-64 lg:w-80 lg:h-80) with soft glow effect
- **Permission Cards**: Two side-by-side cards explaining camera and microphone usage
- **Privacy Statement**: Small text below with lock icon
- **CTA Button**: Large, prominent "Begin Mood Analysis" with pulse animation

### Creative Canvas Workspace
- **Split Layout**: 60/40 split - left side for creation tools, right sidebar for AI suggestions
- **Floating Toolbar**: Persistent bottom toolbar with mode switchers (Music | Art | Poetry)
- **Mood Indicator**: Subtle mood badge in top-right showing current detected state
- **AI Companion Widget**: Bottom-right floating card with AI persona avatar and suggestions

### Community Feed
- **Masonry Grid**: Pinterest-style layout for creative works
- **Card Design**: 
  - Image/artwork preview
  - Creator avatar + name
  - Mood tag badge
  - Like + comment counts
  - Hover: Soft lift effect with shadow

### Weekly Mood Overview Dashboard
- **Chart Section**: Large emotion timeline graph spanning full width
- **Mood Breakdown**: 4-column grid showing mood distribution percentages
- **Activity Cards**: 3-column grid of creative activities linked to moods
- **Insights Panel**: AI-generated insights in card format

### Discover Hobbies
- **Filter Bar**: Indoor/Outdoor toggle + mood-based filters
- **Hobby Cards**: 3-column grid layout
  - Hobby illustration/icon
  - Title + brief description
  - Difficulty level indicator
  - "Try with AI" button
- **Recommended Section**: Highlighted row based on current mood

---

## Adaptive Theming System

**Base Structure** (constant across moods):
- All components maintain consistent borders, spacing, shadows
- Typography hierarchy stays identical
- Layout structure remains fixed

**Mood-Driven Variables** (dynamic):
Each mood triggers a coordinated palette shift affecting:
- Background gradients
- Card backgrounds
- Button treatments
- Border accents
- Glow effects on interactive elements

**Transition Behavior**:
- Smooth 500ms transitions between mood states
- Avoid jarring shifts - use CSS transitions on all theme-dependent properties

---

## Key UI Patterns

### Permission Request Cards
- Soft rounded corners (rounded-2xl)
- Icon at top (camera/microphone)
- Headline + explanation text
- "Allow Access" button per card
- Subtle border with glow on focus

### Mood Analysis States
- **Analyzing**: Animated concentric circles around camera preview
- **Detected**: Smooth reveal of mood label with icon
- **Confidence Meter**: Horizontal bar showing analysis certainty

### AI Co-Creation Panel
- **Header**: AI persona name + avatar
- **Suggestions Area**: Scrollable list of creative prompts
- **Accept/Regenerate**: Action buttons below each suggestion
- **Mood Context**: Small badge showing which mood inspired the suggestion

### Guardian Alert System (Admin View)
- Dashboard widget showing alert history
- Gentle notification styling (not alarming)
- Message preview cards with timestamp

---

## Iconography

**Library**: Heroicons (via CDN)
- Mood icons: Face smile, face frown, sparkles, heart, bolt
- Features: Microphone, camera, musical note, paint brush, document text
- Navigation: Home, book-open, chart-bar, user-group, lightbulb
- Actions: Plus, chevron-right, x-mark, check

---

## Images

**Hero Section** (Mood Detection Landing):
- Large background image showing diverse people creating art in calming environment
- Overlay: Gradient overlay (dark to transparent) for text legibility
- Placement: Full-bleed background with centered content

**Community Cards**:
- User-generated creative works (art, poetry screenshots, music visualizations)
- Aspect ratio: 4:3 or 1:1 depending on content type

**Hobby Discovery**:
- Illustrative images representing each hobby (painting, journaling, music)
- Style: Soft, inviting photography with shallow depth of field

**Blurred Backgrounds**: All buttons placed over hero images use backdrop-blur-md with semi-transparent backgrounds

---

## Animation Principles

**Use Sparingly**:
- Mood detection: Pulse animation on analyzing state
- Mood transition: Gentle fade between color palettes
- Navigation: Smooth slide-in for mobile menu
- Cards: Subtle lift on hover (translate-y-1)

**Avoid**: Complex scroll-triggered animations, distracting background effects