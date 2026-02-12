

# Emotion Insight Journal — Implementation Plan

## Overview
A calming, modern journaling app that simulates AI-powered emotion analysis, helping users understand their emotional patterns over time. The app acts as a safe emotional companion with a soft, supportive UI.

---

## Page 1: Journal Entry Page (Home)
- Soft lavender/blue gradient background with calming aesthetics
- Auto-filled current date display
- Large text area for writing diary entries
- **"Analyze My Emotions"** button with smooth loading animation
- Fully mobile responsive layout
- Daily affirmation displayed at the top (rotating quotes)

## Page 2: Emotion Analysis Results
After submitting a journal entry, users see a beautifully designed results card showing:
- **Primary Emotion** with emoji representation (😊😢😡😨😲❤️😐😰)
- **Confidence Score** (0–100%) with visual progress bar
- **Sentiment Type** (Positive / Negative / Neutral / Mixed)
- **Top 3 Emotional Keywords** highlighted as badges
- **Emotional Intensity** (Low / Medium / High) with color indicator
- **AI Insight** — a short 2–3 line empathetic explanation
- **Personalized Suggestions** — contextual, supportive recommendations based on the detected emotion (breathing exercises, gratitude prompts, self-care tips, etc.)
- **Safety Layer** — if concerning language is detected, a gentle supportive message is shown encouraging the user to reach out to a trusted person or seek professional help, in a calm and caring tone

## Page 3: Emotional History Dashboard
- List of past journal entries with date and emotion tag/emoji
- **Weekly Dominant Emotion** summary card
- **Emotion Distribution Chart** (bar or pie chart using Recharts)
- **Emotional Stability Score** — calculated from emotion variance over time
- **Streak Tracker** — shows consecutive journaling days

## Emotion Simulation Engine (Frontend Logic)
- Keyword-based emotion classification that simulates a pretrained NLP model's output
- Structured internal response format matching the 8 emotion classes (happy, sad, angry, fear, surprise, love, neutral, anxious)
- Confidence scores, sentiment mapping, and keyword extraction all computed client-side
- Weighted keyword dictionaries for realistic classification results

## Additional Features
- **Dark mode toggle** in the header/navigation
- **Export journal as PDF** button on the dashboard
- **Streak tracker** visual on the dashboard
- **Daily affirmation generator** on the home page

## Data Storage
- Journal entries and analysis results stored in browser **localStorage** for privacy-first design (no backend needed initially)
- All data stays on the user's device

## Design System
- Soft calming color palette (lavender, light blue, warm neutrals)
- Rounded modern cards with subtle shadows
- Smooth animations for page transitions and loading states
- Emoji representations for each emotion class
- Empathetic, non-judgmental, supportive tone throughout all copy

