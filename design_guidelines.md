# NeuroCanvas Design Guidelines

## Design Approach

**Reference-Based Approach** blending:
- **Notion**: Clean creative workspace with breathing room
- **Calm/Headspace**: Soothing, therapeutic interface
- **Apple HIG**: Minimal precision with subtle depth
- **Linear**: Modern typography and refined spacing

**Core Principle**: Emotionally intelligent interface that feels therapeutic, not clinical. Minimal yet expressive with adaptive mood-driven color shifts.

---

## Color System

**Base Neutrals** (constant structure):
- **Background**: Off-white (#FAFAF9)
- **Surface**: Blush beige (#F5F1ED)
- **Text Primary**: Charcoal (#2D2D2D)
- **Text Secondary**: Muted gray (#6B6B6B)
- **Borders**: Pastel blue-gray (#E0E4E8)
- **Accents**: Muted lavender (#D4C5E0)

**Mood-Shifting Accents** (dynamic):
- **Happy**: Warm peach (#FFB494) - buttons, highlights, glows
- **Calm**: Cool blue (#A8C7E7) - backgrounds, accents
- **Creative**: Lavender (#C5A3D9) - borders, interactive elements
- **Neutral**: Soft sage (#D4DDD4) - default state

**Glassmorphism Treatment**:
- Background: Semi-transparent with backdrop-blur-lg
- Borders: 1px solid with 20% white overlay
- Shadows: Soft, layered (0 4px 24px rgba(0,0,0,0.06))

---

## Typography

**Font Stack** (Google Fonts):
- **Headings**: Poppins (600, 700) / Inter (600, 700)
- **Body**: Nunito (400, 600) / Outfit (400, 500)

**Hierarchy**:
- **Hero**: Poppins 700, text-6xl lg:text-8xl
- **Sections**: Poppins 600, text-4xl lg:text-5xl
- **Feature Headers**: Inter 600, text-2xl lg:text-3xl
- **Body**: Nunito 400, text-base lg:text-lg, leading-relaxed
- **UI Labels**: Outfit 500, text-sm
- **Micro**: Outfit 400, text-xs

---

## Layout System

**Spacing**: Tailwind units **4, 6, 8, 12, 16, 20, 24**
- Sections: py-20 lg:py-32
- Cards: p-8 lg:p-12
- Gaps: gap-8 lg:gap-12
- Generous margins for breathing room

**Containers**:
- Max-width: max-w-7xl
- Content: max-w-6xl
- Text: max-w-prose

**Grids**:
- Features: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-8
- Dashboard: grid-cols-1 lg:grid-cols-2, gap-12

---

## Component Library

### Navigation
- Sticky top with glassmorphism (backdrop-blur-lg, bg-white/70)
- Height: h-20
- Logo left, menu center, user avatar right
- Smooth underline on hover (transition-all duration-300)

### Hero Section (Mood Detection Landing)
- Full viewport (min-h-screen)
- Large background image: Serene person creating art in natural light, soft focus
- Gradient overlay: Linear from charcoal/40 to transparent
- Centered content with camera preview (circular, w-80 h-80)
- Buttons with backdrop-blur-md, rounded-full, px-8 py-4
- Glow effect on hover using mood accent colors

### Creative Canvas Workspace
- Split: 65% canvas, 35% AI sidebar
- Glassmorphic toolbar (bottom-fixed, backdrop-blur-lg)
- Floating mood indicator (top-right, subtle badge with icon)
- AI panel: Soft shadow, rounded-3xl, p-8

### Community Feed
- Masonry grid (3 columns on lg)
- Cards: rounded-2xl, overflow-hidden, shadow-lg
- Image preview (aspect-ratio 4:3 or 1:1)
- Hover: Subtle lift (translate-y-2), shadow increase
- User avatar overlay (bottom-left)

### Weekly Mood Dashboard
- Emotion timeline: Full-width chart with gradient fills
- Mood breakdown: 4-column grid, percentage cards with icons
- Insights panel: Glassmorphic cards with AI-generated text

### Discover Hobbies
- Filter bar: Pill-shaped toggles with mood accents
- Hobby cards: 3-column grid
  - Illustration/photo (aspect-ratio 16:9)
  - Title (Poppins 600)
  - Description (Nunito 400, 2 lines)
  - Difficulty badge + "Try Now" button

---

## Images

**Hero Background**: Calming image of diverse person journaling/painting in soft natural light, shallow depth of field, warm tones. Full-bleed with centered overlay content.

**Community Cards**: User-generated creative works - abstract art, poetry screenshots, music waveforms. Varied aspect ratios.

**Hobby Discovery**: Illustrative lifestyle photography - hands painting, journaling close-ups, music creation. Soft focus, inviting aesthetic.

**Creative Canvas**: Subtle textured background pattern (very light, non-distracting).

---

## UI Patterns

### Buttons
- Rounded-full, px-8 py-4
- Primary: Mood accent color with glow (shadow-[0_0_20px_rgba(accent,0.3)])
- On images: backdrop-blur-md with bg-white/20
- Hover: Glow intensifies, slight scale (scale-105)

### Cards
- rounded-2xl to rounded-3xl
- Glassmorphic: backdrop-blur-lg, bg-white/60, border-white/40
- Shadow: shadow-lg (0 10px 40px rgba(0,0,0,0.08))

### Mood Transitions
- 400ms ease-in-out for all mood color shifts
- Affects: backgrounds, borders, glows, accents

### Permission Modals
- Centered modal with glassmorphism
- Camera/mic icons (Heroicons)
- Clear explanation text (Nunito)
- Allow buttons with current mood glow

---

## Iconography

**Library**: Heroicons (outline + solid)
- Moods: FaceSmileIcon, HeartIcon, SparklesIcon, BoltIcon
- Features: MicrophoneIcon, CameraIcon, MusicalNoteIcon, PaintBrushIcon
- UI: HomeIcon, BookOpenIcon, ChartBarIcon, UsersIcon, LightBulbIcon

---

## Animation Principles

**Minimal, Purposeful**:
- Mood detection: Gentle pulse (2s infinite) on analyzing state
- Color transitions: 400ms ease between mood palettes
- Card hovers: Lift + shadow (200ms)
- Navigation: Slide-in mobile menu (300ms)
- Button glows: Fade in/out (250ms)

**Avoid**: Scroll-triggered effects, background animations, excessive motion