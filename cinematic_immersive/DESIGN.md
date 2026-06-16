---
name: Cinematic Immersive
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e9bcb6'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#af8782'
  outline-variant: '#5e3f3b'
  surface-tint: '#ffb4aa'
  primary: '#ffb4aa'
  on-primary: '#690003'
  primary-container: '#e50914'
  on-primary-container: '#fff7f6'
  inverse-primary: '#c0000c'
  secondary: '#adc6ff'
  on-secondary: '#002e69'
  secondary-container: '#4b8eff'
  on-secondary-container: '#00285c'
  tertiary: '#c8c6c5'
  on-tertiary: '#303030'
  tertiary-container: '#737272'
  on-tertiary-container: '#fbf8f8'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad5'
  primary-fixed-dim: '#ffb4aa'
  on-primary-fixed: '#410001'
  on-primary-fixed-variant: '#930007'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a41'
  on-secondary-fixed-variant: '#004493'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 72px
    fontWeight: '800'
    lineHeight: 84px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
  headline-md:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
  body-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 28px
  label-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  safe-margin-x: 80px
  safe-margin-y: 60px
  gutter: 24px
  card-gap: 32px
  sidebar-width-collapsed: 100px
  sidebar-width-expanded: 320px
---

## Brand & Style
The design system is engineered for a premium, lean-back television experience. It prioritizes high-impact visuals, cinematic scale, and an interface that recedes to let content lead. The style combines **Minimalism** with **Glassmorphism** to create a sense of depth and focus, essential for 10-foot UI environments. The emotional response is one of excitement and ease, evoking the feeling of a private home theater. High-contrast focus states ensure that navigation remains intuitive and accessible from a distance, while smooth transitions between states reinforce a high-end feel.

## Colors
The palette is built on a "Deep Charcoal" foundation to ensure maximum OLED black performance and minimize eye strain in dark rooms. 

- **Backgrounds**: The base layer uses `#121212`. Overlays and containers use `#1E1E1E` to provide subtle separation.
- **Accents**: The primary accent is a vibrant "Cinema Red" (`#E50914`) used for branding and critical actions. An "Electric Blue" (`#007AFF`) is reserved for secondary functional highlights and specific focus indicators.
- **Text**: Pure White (`#FFFFFF`) is used for active titles. High-legibility "Cool Gray" (`#B3B3B3`) is used for secondary metadata and inactive states to reduce visual noise.

## Typography
The typography system uses **Inter** for its exceptional legibility and modern, neutral character. In a TV context, size is functional:
- **Scalability**: All sizes are optimized for a 1080p canvas. Nothing falls below 14px to ensure legibility from 10 feet away.
- **Weight**: Bold weights are used for titles and focused items to ensure they "pop" against dark backgrounds.
- **Scanning**: Headlines use tight letter spacing for a cinematic look, while labels use increased letter spacing to prevent character blurring on lower-quality panels.

## Layout & Spacing
The layout follows a **Fixed Grid** model optimized for 1920x1080.
- **Safe Areas**: Strict 80px horizontal and 60px vertical margins are maintained to account for overscan on older TV panels.
- **Sidebar**: A persistent left-hand navigation rail. It expands from a 100px icon-only view to a 320px full menu on focus.
- **Content Rows**: A standard 6-column horizontal scroll for "Poster" cards and a 4-column grid for "Wide" backdrop cards.
- **Rhythm**: Spacing is based on an 8px scale. Large gaps (32px+) are used between sections to prevent the UI from feeling cluttered.

## Elevation & Depth
Depth is created through **Tonal Layers** and **Glassmorphism** rather than traditional drop shadows, which can look muddy on TVs.
- **Base Level**: `#121212` (Main background).
- **Surface Level**: `#1E1E1E` (Cards, sidebar background).
- **Glass Overlays**: For the video player controls and modal windows, use a `backdrop-filter: blur(20px)` with a 40% opaque black tint.
- **Focus Depth**: When an element is focused, it should scale (1.05x) and receive a high-intensity outer glow using the primary accent color to simulate light emission.

## Shapes
The design system utilizes **Rounded** geometry (`0.5rem` base) to soften the "digital" feel of the grid. 
- **Cards**: Use the `rounded-lg` (1rem) setting to create a friendly, modern aesthetic.
- **Selection Borders**: Focus rings must follow the border-radius of the parent element precisely.
- **Progress Bars**: Use fully rounded (pill-shaped) caps for seek bars and volume indicators.

## Components
- **Focus States**: This is the most critical component behavior. Focused elements must scale by 5-10% and receive a 4px solid border of Primary Red or a vibrant Glow.
- **Cards**:
    - *Poster*: 2:3 aspect ratio for movies.
    - *Backdrop*: 16:9 aspect ratio for episodes or live TV. 
    - Text metadata (Title, Year) appears below the card, only visible or highlighted when the card is focused.
- **Sidebar**: Uses high-contrast icons (24pt). Active routes are marked with a vertical Primary Red line on the left edge.
- **Buttons**: Large (64px height), rounded, with clearly defined icons and labels. The "Default" state is semi-transparent; "Focus" state is solid white with dark text.
- **Video Player**: A bottom-aligned overlay with a large play/pause button, a progress bar spanning the width of the safe area, and clear "Next Episode" or "Channel List" shortcuts.
- **Channel List**: A vertical list with high-density rows, featuring channel logos and a "Now Playing" progress line at the bottom of each row.