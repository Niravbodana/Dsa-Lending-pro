# NeerCred Brand Assets

Original NeerCred logo system — growth-bar mark with trust arc (not derived from any third-party logo).

## Files

| File | Use |
|------|-----|
| `neercred-icon.svg` | Favicon, app icon, avatars |
| `neercred-horizontal.svg` | Light backgrounds (marketing) |
| `neercred-stacked.svg` | Dark backgrounds, splash screens |
| `neercred-full.svg` | Navbar, hero, wide headers |

## PNG export

SVG sources are production-ready for web. To generate PNG:

```bash
# macOS with ImageMagick
magick -background none -resize 512x512 neercred-icon.svg neercred-icon.png
magick -background none -resize 1200x400 neercred-horizontal.svg neercred-horizontal.png
```

## React component

```tsx
import { PremiumLogo } from "@/components/premium/brand/PremiumLogo";

<PremiumLogo variant="horizontal" height={48} />
```
