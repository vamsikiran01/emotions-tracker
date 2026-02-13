

# Fix Input Validation and Update PWA Icon

## Issue 1: Meaningless Text Passes Validation

The current validation only checks if words contain vowels, which lets gibberish like "Jao w8w nhb wh aia" through because words like "Jao" and "aia" technically contain vowels.

### Improved Validation Strategy

Update `isValidEntry` in `src/pages/Index.tsx` with stricter checks:

- **Minimum word length**: Require at least 3 words (keep existing)
- **Minimum entry length**: Require at least 15 characters total
- **Vowel-consonant pattern check**: Real words typically have a mix of vowels and consonants in natural patterns. Reject words that are just random characters
- **Dictionary-like heuristic**: Check that words follow common English letter patterns (no excessive consecutive consonants like "nhb", "w8w")
- **Reject words with numbers mixed in** (like "w8w")
- **Require a higher threshold**: At least 60% of words must pass the meaningful check
- **Average word length check**: Reject entries where average word length is suspiciously short (under 2 chars)

```typescript
const isValidEntry = (input: string): boolean => {
  const trimmed = input.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 3) return false;
  if (trimmed.length < 15) return false;

  const isMeaningfulWord = (word: string): boolean => {
    if (word.length < 2) return false;
    // Reject words with numbers
    if (/\d/.test(word)) return false;
    // Must contain at least one vowel
    if (!/[aeiou]/i.test(word)) return false;
    // Reject excessive consecutive consonants (3+)
    if (/[^aeiou\s]{4,}/i.test(word)) return false;
    return true;
  };

  const meaningfulWords = words.filter(isMeaningfulWord);
  return meaningfulWords.length >= words.length * 0.6;
};
```

## Issue 2: PWA Home Screen Icon

Generate a new `public/icon-192x192.png` with:

- A brain icon with heartbeat/pulse lines running through the middle
- Light blue / sky blue background
- No text -- just the icon
- Clean, modern, minimalist design

### Technical Steps

1. **Edit** `src/pages/Index.tsx` -- update the `isValidEntry` function with stricter validation
2. **Generate** a new `public/icon-192x192.png` -- brain with pulse lines on sky blue background, no text

