# Frame in Goa

A web tool for Hacker House Goa 2026 — upload a photo, get back a branded HH Goa 2026 graphic in seconds, ready to download and share on X.

Two formats:

- **PFP Frame** — wraps your photo in a circular HH Goa frame, ready as an X profile picture.
- **Builder ID Card** — your photo + name + stack/role + a generated "builder title", laid out like an event badge.

No login, no signup gate. Upload → drag to reframe → fill in a couple of fields → download or share.

## Features

- Drag-to-reframe, pinch-to-zoom photo cropper — handles portrait, landscape, and off-center photos without requiring a pre-crop
- HEIC/HEIF support (auto-converted client-side) alongside JPG/PNG
- Instant canvas-based rendering, no server round-trip
- Download as PNG, or share straight to X with a pre-filled caption and `#FrameInGoa`
- Mobile-friendly, with a sticky download/share bar on small screens

## Development

Requires Node.js and npm.

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

Builds a deployable output for Vercel (Nitro's `vercel` preset).
