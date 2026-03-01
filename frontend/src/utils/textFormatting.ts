// Text formatting utilities for consistent data presentation

/**
 * Converts text to title case (capitalizes first letter of each word)
 * Handles common exceptions like articles, prepositions, and conjunctions
 */
export function toTitleCase(text: string): string {
  if (!text || typeof text !== 'string') return text;

  // Words that should remain lowercase unless they're the first word
  const lowercaseWords = new Set([
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 
    'on', 'or', 'so', 'the', 'to', 'up', 'yet', 'with', 'from', 'into', 'onto', 
    'upon', 'over', 'under', 'above', 'below', 'across', 'through', 'during', 
    'before', 'after', 'until', 'while', 'since'
  ]);

  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Always capitalize the first word
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      
      // Keep certain words lowercase unless they're the first word
      if (lowercaseWords.has(word)) {
        return word;
      }
      
      // Capitalize other words
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Converts text to sentence case (capitalize first letter, rest lowercase, preserve punctuation and spacing)
 */
export function toSentenceCase(text: string): string {
  if (!text || typeof text !== 'string') return text;

  // Trim and ensure first letter is capitalized, rest lowercase, preserve punctuation and spacing
  const trimmed = text.trim();
  if (trimmed.length === 0) return trimmed;

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/**
 * Formats a comma-separated list of tags to title case
 */
export function formatTags(tags: string): string {
  if (!tags || typeof tags !== 'string') return tags;

  return tags
    .split(',')
    .map(tag => toTitleCase(tag.trim()))
    .filter(tag => tag.length > 0)
    .join(', ');
}

/**
 * Formats place names (city, state/region, attraction) with proper capitalization
 */
export function formatPlaceName(name: string): string {
  if (!name || typeof name !== 'string') return name;

  // Handle special cases for place names
  const specialCases = new Map([
    ['usa', 'USA'],
    ['uk', 'UK'],
    ['uae', 'UAE'],
    ['nyc', 'NYC'],
    ['la', 'LA'],
    ['sf', 'SF'],
    ['dc', 'DC'],
    ['st.', 'St.'],
    ['mt.', 'Mt.'],
    ['ft.', 'Ft.'],
    ['dr.', 'Dr.'],
    ['ave.', 'Ave.'],
    ['blvd.', 'Blvd.'],
    ['rd.', 'Rd.'],
    ['st', 'St'],
    ['mt', 'Mt'],
    ['ft', 'Ft']
  ]);

  let formatted = toTitleCase(name);

  // Apply special cases
  specialCases.forEach((replacement, pattern) => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
    formatted = formatted.replace(regex, replacement);
  });

  return formatted;
}

/**
 * Formats sentence-based fields with proper sentence case (capitalize first letter, rest lowercase, preserve punctuation and spacing)
 */
export function formatSentenceField(text: string): string {
  if (!text || typeof text !== 'string') return text;

  return toSentenceCase(text);
}

/**
 * Formats notes text with proper paragraph formatting
 */
export function formatNotes(notes: string): string {
  if (!notes || typeof notes !== 'string') return notes;

  return notes
    .split('\n')
    .map(paragraph => {
      const trimmed = paragraph.trim();
      if (trimmed.length === 0) return trimmed;
      
      // Apply sentence case to each paragraph
      return toSentenceCase(trimmed);
    })
    .join('\n');
}

/**
 * Formats "best time to visit" text with consistent formatting
 */
export function formatBestTimeToVisit(text: string): string {
  if (!text || typeof text !== 'string') return text;

  // Handle month names and ranges
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  let formatted = text.trim();

  // Replace month abbreviations and ensure proper capitalization
  monthNames.forEach(month => {
    const abbrev = month.substring(0, 3);
    const regex = new RegExp(`\\b${abbrev}\\.?\\b`, 'gi');
    formatted = formatted.replace(regex, month);
  });

  // Handle common patterns
  formatted = formatted
    .replace(/\b(to|through|thru|-)\b/gi, ' to ')
    .replace(/\s+/g, ' ')
    .trim();

  return toTitleCase(formatted);
}

/**
 * Comprehensive formatting function for place data
 */
export function formatPlaceData(place: any): any {
  if (!place || typeof place !== 'object') return place;

  return {
    ...place,
    // Format location fields
    city: formatPlaceName(place.city || ''),
    stateRegion: formatPlaceName(place.stateRegion || ''),
    country: place.country || '', // Country is handled by country mapping system
    
    // Format tags with title case
    tags: Array.isArray(place.tags) 
      ? place.tags.map((tag: string) => toTitleCase(tag?.trim() || '')).filter((tag: string) => tag.length > 0)
      : [],
    
    // Format quick facts with sentence case
    quickFacts: {
      bestKnownFor: formatSentenceField(place.quickFacts?.bestKnownFor || ''),
      hiddenGem: formatSentenceField(place.quickFacts?.hiddenGem || ''),
      localTip: formatSentenceField(place.quickFacts?.localTip || ''),
    },
    
    // Format other text fields
    notes: formatNotes(place.notes || ''),
    bestTimeToVisit: formatBestTimeToVisit(place.bestTimeToVisit || ''),
  };
}

/**
 * Format tags array for display
 */
export function formatTagsArray(tags: string[]): string[] {
  if (!Array.isArray(tags)) return [];
  
  return tags
    .map(tag => toTitleCase(tag?.trim() || ''))
    .filter(tag => tag.length > 0);
}

/**
 * Parse and format comma-separated tags string into array
 */
export function parseAndFormatTags(tagsString: string): string[] {
  if (!tagsString || typeof tagsString !== 'string') return [];

  return tagsString
    .split(',')
    .map(tag => toTitleCase(tag.trim()))
    .filter(tag => tag.length > 0);
}
