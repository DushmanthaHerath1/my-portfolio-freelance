## Brand & Style
The design system focuses on a professional, technical, yet highly approachable aesthetic tailored for a high-end web developer portfolio. The brand personality is precise, reliable, and contemporary, aiming to evoke a sense of digital craftsmanship and clarity.

The visual style is a refined **Corporate Modernism**—utilizing generous whitespace, a structured grid, and subtle depth. It avoids unnecessary flourishes, ensuring the developer's work remains the primary focus. High-quality typography and soft tactile surfaces create a "client-friendly" environment that signals both technical competence and sophisticated design sensibility.

## Layout & Spacing
The design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

- **Rhythm:** An 8px linear scale is used to define all spacing, ensuring vertical consistency.
- **Containers:** Content is housed within a centered max-width container of 1200px to maintain readability on ultra-wide monitors.
- **Sectioning:** Vertical breathing room is prioritized. Large sections should be separated by 80px to 120px on desktop to allow the user's eye to rest between project showcases.
- **Safe Areas:** On mobile, a 16px horizontal margin is mandatory for all edge-to-edge content.

## Elevation & Depth
This design system uses **Tonal Layering** combined with **Ambient Shadows** to create a structured hierarchy. 

1. **Base (Slate-50):** The bottom-most canvas.
2. **Flat Layer (Border Only):** Subtle elements like input fields or secondary containers use a 1px border (#E2E8F0) without shadows.
3. **Surface Layer (Cards):** Raised elements like Project Cards or Skill Tiles use a white background and a very soft, diffused shadow. 
   - *Shadow spec:* `0px 4px 20px rgba(15, 23, 42, 0.05)`
4. **Hover Layer:** Upon interaction, shadows should expand slightly and gain a small amount of "lift" via a subtle Y-axis shift.
   - *Shadow spec:* `0px 10px 30px rgba(15, 23, 42, 0.08)`

## Components
- **Buttons:**
  - *Primary:* Solid Teal-700 background, White text, 8px radius. Subtle scale-down effect on click.
  - *Secondary:* Transparent background, Slate-200 border, Slate-900 text.
- **Project Cards:** White background, 1px Slate-200 border, soft ambient shadow. Typography within cards should be strictly aligned to the 8px grid.
- **Code Snippets:** Slate-900 background, JetBrains Mono font, syntax highlighting using the Teal and Blue accents.
- **Input Fields:** 8px radius, Slate-200 border. On focus, the border transitions to Teal-700 with a 2px outer glow (ring).
- **Tags/Chips:** Pill-shaped, light Slate-100 background with Slate-600 JetBrains Mono text. No border.
- **Navigation:** Sticky top-bar with a backdrop-blur effect (Glassmorphism) over the Slate-50 background to maintain a sense of depth during scroll.