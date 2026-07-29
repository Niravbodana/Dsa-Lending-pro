# NeerCred Logo Kit

All logos are **transparent SVG** — no white/dark box. Scale to any size.

| File | Use case |
|------|----------|
| `neercred-horizontal.svg` | Header, navbar (icon + text, one line) |
| `neercred-horizontal-light.svg` | Footer, dark backgrounds |
| `neercred-icon.svg` | Favicon, app icon, avatars |
| `neercred-wordmark.svg` | Text only, tight spaces |
| `neercred-wordmark-light.svg` | Wordmark on dark bg |
| `neercred-stacked.svg` | Splash, login, centered layouts |
| `neercred-wide.svg` | Hero banners, email headers |

## React usage

```tsx
<NeerCredLogo variant="header" />      // navbar
<NeerCredLogo variant="icon" size={40} />
<NeerCredLogo variant="wordmark" />
<NeerCredLogo variant="stacked" size={160} />
<NeerCredLogo variant="wide" size={96} />
<NeerCredLogo dark />                  // footer / dark pages
```

## Tagline

**DREAM BIG. BORROW SMART.**
