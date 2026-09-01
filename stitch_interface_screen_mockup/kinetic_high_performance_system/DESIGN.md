---
name: Kinetic High-Performance System
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c6c9ab'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#909378'
  outline-variant: '#454932'
  surface-tint: '#b8d300'
  primary: '#ffffff'
  on-primary: '#2c3400'
  primary-container: '#d2f000'
  on-primary-container: '#5d6b00'
  inverse-primary: '#576500'
  secondary: '#ffb3b6'
  on-secondary: '#68001a'
  secondary-container: '#c7003a'
  on-secondary-container: '#ffd7d7'
  tertiary: '#ffffff'
  on-tertiary: '#303030'
  tertiary-container: '#e5e2e1'
  on-tertiary-container: '#656464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d2f000'
  primary-fixed-dim: '#b8d300'
  on-primary-fixed: '#191e00'
  on-primary-fixed-variant: '#414c00'
  secondary-fixed: '#ffdada'
  secondary-fixed-dim: '#ffb3b6'
  on-secondary-fixed: '#40000c'
  on-secondary-fixed-variant: '#920028'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.1'
  headline-lg:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.2'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
  stat-lg:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '800'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 20px
  lg: 32px
  gutter: 16px
  margin-mobile: 20px
---

## Brand & Style

The design system embodies a high-octane, performance-driven aesthetic tailored for athletes and fitness enthusiasts. The personality is aggressive, technical, and motivating, utilizing a **High-Contrast / Bold** style with a "Dark Mode" foundation.

The visual language draws inspiration from industrial gym equipment and sports performance telemetry. It relies on deep blacks to create infinite depth, allowing neon accents to pop with functional urgency. Key attributes include heavy typography for motivation, semi-transparent overlays for data-over-imagery, and vibrant status indicators that demand immediate attention.

## Colors

The palette is anchored by "Electric Lime" (#DFFF00), used exclusively for primary actions and positive progress states. This is contrasted against "Absolute Black" (#000000) backgrounds and "Deep Carbon" (#1A1A1A) for surface containers.

- **Primary (Electric Lime):** High-visibility action color, completion states, and primary brand touchpoints.
- **Secondary (Pulse Red):** Critical alerts, health metrics (BPM), and secondary progress bars to differentiate data types.
- **Surface:** A tiered gray system (Carbon, Onyx, Graphite) to create hierarchy without the use of light colors.
- **Text:** Pure white for headlines to ensure maximum readability against dark backgrounds, with muted grays for metadata.

## Typography

The typography strategy uses **Montserrat** for high-impact headlines and statistics, evoking strength and stability. All major headlines must be **uppercase** to maintain the aggressive, sports-journalism feel.

**Inter** provides clean, utilitarian legibility for body descriptions and instructional text. **JetBrains Mono** is introduced for labels and technical data (like timestamps or specific weights), giving the app a "tracker" or "dashboard" feel. 

For mobile, headlines scale down by approximately 20% to ensure impact without crowding the smaller viewport.

## Layout & Spacing

This design system utilizes a **Fluid Grid** with condensed margins to maximize content density. On mobile, a 20px side margin is standard, while internal card components use a strict 4px-base spacing system (8, 12, 16, 20).

Layouts are vertically stacked, emphasizing a "scrollable dashboard" experience. Components like "Daily Fuel Tracker" utilize a 2-column grid within the main container. Elements should feel tightly packed but organized, mirroring the structured nature of a workout program.

## Elevation & Depth

Depth is achieved through **Tonal Layers** rather than traditional shadows.
- **Level 0 (Background):** Pure #000000.
- **Level 1 (Cards):** #1A1A1A with a 1px subtle border (#222222).
- **Level 2 (Active States):** Semi-transparent overlays (e.g., 20% opacity white) used on top of workout imagery to ensure text legibility.

**Glassmorphism** is applied sparingly to navigation bars and floating action buttons using a 20px backdrop-blur to maintain context of the content underneath while providing a clear interactive surface.

## Shapes

The design system utilizes **Rounded** (Level 2) geometry. Standard cards and containers use a 16px (1rem) radius. Smaller elements like progress pills and "Today's Target" tags use a fully pill-shaped (rounded-full) treatment to contrast against the structural rigidity of the larger cards. This mix of structured cards and organic "pill" shapes creates a balance between technical precision and human-centric design.

## Components

### Buttons
- **Primary:** Electric Lime background, black text, bold uppercase. Full width for mobile actions.
- **Ghost:** Transparent background with 1px Lime or White border, used for secondary actions like "View All."

### Progress Rings & Bars
- **Rings:** Use a thick stroke (4px-8px) for the active value in Electric Lime. The "track" should be a dark gray (e.g., #222222).
- **Status Bars:** Thin (4px) horizontal bars. Use secondary colors (Red/Pink) for nutrition or alternate metrics to avoid visual monotony.

### Workout Cards
- Large-format containers with full-bleed background images. 
- Apply a black gradient overlay (bottom-to-top) or a 40% black tint to ensure typography is accessible.

### Status Pills
- Small, uppercase labels with a semi-transparent background (e.g., 20% Red for "Today's Target").
- Positioned in the top-left or top-right of cards as metadata tags.

### Navigation Bar
- A floating container with a blurred background effect. Active icons should be housed within a "squircle" container with a subtle Electric Lime glow or border.