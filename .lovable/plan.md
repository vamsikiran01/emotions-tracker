

# Fix Emotion Detection for Poetic/Metaphorical Pain Entries

## Problem
The input "I wrote letters with my blood but still get scolded for the grammar" is being classified as **Happy** (fallback) because words like "blood", "scolded", and "grammar" are missing from the keyword maps. The broken heart emoji is also ignored.

## Changes

### `src/lib/emotionEngine.ts`

**1. Add missing keywords to the `sad` category:**
- High weight (1.0): `blood`, `scolded`, `unappreciated`, `ignored`, `rejected`, `criticized`, `unloved`, `unseen`, `unheard`, `worthless`, `invisible`, `forgotten`
- Medium weight (0.6): `no one cares`, `doesn't matter`, `not enough`, `never enough`, `taken for granted`, `wasted effort`

**2. Add missing keywords to the `angry` category:**
- Medium weight (0.6): `scolded`, `criticized`, `mocked`, `ridiculed`, `dismissed`

**3. Add broken heart emoji and other emotional symbols detection:**
- Before tokenizing, check for emotional symbols/emojis like `💔`, `😢`, `😭`, `💀` and boost the corresponding emotion score (sad +2 for 💔)

This will ensure the entry correctly classifies as **Sad** with relevant keywords like "blood", "scolded" detected.

