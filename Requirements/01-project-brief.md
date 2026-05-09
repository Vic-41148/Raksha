# Raksha — Project Brief

> "It doesn't show you the weather. It tells you what to do."

## What It Is

A mobile-first web app that gives families **one daily safety decision** based on hyperlocal flood/heat/storm risk for their location and family profile.

Not a weather app. Not a dashboard. One card. One answer.

## The Problem

During flood/storm seasons, people check 3 apps, get conflicting data, and still guess. The gap isn't access to weather data — it's the last step: *what do I actually do?*

## The Solution

Every morning:

> ⚠️ **Stay home today.** Heavy rainfall + high flood risk detected near your area. Keep emergency contacts ready.

One notification. One decision. No map to interpret.

## Real-Person Test

| Question | Answer |
|---|---|
| Real person? | Urban caregiver/parent in flood-prone region |
| Real Tuesday? | Opens it every morning like an alarm |
| After the demo? | Daily habit — replaces 3-app guessing routine |
| Why not IMD / Google? | They give data. Nobody gives **decisions**. |

## Geography

Global, not India-only.

- City + country input at onboarding — user sets their location
- OpenWeatherMap + Open-Elevation both have global coverage
- Risk model is location-agnostic
- Pitch angle: *"Built in Delhi, designed for Manila, Dhaka, Lagos, Jakarta."*

## Track Coverage

| Track | How |
|---|---|
| 🌧️ Weather Intelligence | Hyperlocal risk scoring per coordinates |
| 🚨 Disaster Response | Actionable alert with helpline link |
| 📡 Offline & Rural | Graceful offline fallback (last known data) |
| 🤖 AI & Data Innovation | Groq converts ML score → one sentence |

## Judging Angles

| Criteria | Our angle |
|---|---|
| Innovation 25% | Decision output, not data. Profile-aware thresholds. Nobody does this framing. |
| Impact 25% | Open + close with the human story. Real cities, real families. |
| Technical 20% | Full pipeline: API → elevation → ML → LLM → card. Not one API call. |
| Design 15% | One screen, three colors, demoed on real phone. Radical simplicity = intentional. |
| Presentation 15% | Story first, tech second. Same closing line every time. |
