# Raksha — UI Spec

## Layout — One Screen Only
┌─────────────────────────┐
│  📍 [City, Country]     │
│  Tuesday 7:14 AM        │
│                         │
│  ┌───────────────────┐  │
│  │  ⚠️  STAY HOME    │  │  ← 80px card, full width
│  │  HIGH FLOOD RISK  │  │    Red bg, white text
│  └───────────────────┘  │
│                         │
│  Heavy rainfall + low   │
│  elevation detected.    │
│  Keep family home today.│
│                         │
│  [ Why? ↓ ]             │  ← Expandable, NOT default open
│                         │
│  🟢 Safe   📞 Helpline  │
└─────────────────────────┘

## Three States — Build All on Day 1

| State | Implementation |
|---|---|
| Loading | Skeleton card + "Checking your area…" |
| Success | Risk card (green / yellow / red) |
| Error | "Showing last known data." **Never blank.** |

## Color System

| Risk | Tailwind | Copy |
|---|---|---|
| SAFE | `bg-green-600` | "Looks clear today" |
| CAUTION | `bg-yellow-500` | "Be prepared" |
| DANGER | `bg-red-600` | "Stay home today" |

Three colors only. Nothing else in the app.

## Mobile Rules — Non-Negotiable

- Touch targets min `min-h-[48px]` on all buttons
- No hover-only features — everything tappable
- Design canvas: 390px — test nothing wider first
- `overflow-x-hidden` on root
- White text on all risk colors — check in direct sunlight
- Test on M52 every day, not DevTools

## The Demo Device Decision

**Demo from the M52. Not the laptop. Not a browser window.**

Handing a phone to the camera = real product signal. localhost = hackathon project signal.