const STOPWORDS = new Set([
  "the", "and", "for", "with", "you", "your", "are", "our", "will", "have", "has",
  "this", "that", "from", "who", "what", "all", "can", "not", "but", "about",
  "into", "than", "then", "they", "their", "them", "these", "those", "were",
  "was", "been", "being", "such", "each", "more", "most", "some", "any", "role",
  "job", "work", "working", "team", "years", "year", "experience", "including",
  "etc", "including", "including", "like", "using", "use", "used", "per", "a",
  "an", "in", "on", "of", "to", "as", "is", "it", "we", "or", "be", "at", "by",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

export interface KeywordMatchResult {
  matched: string[];
  missing: string[];
  matchPercent: number;
}

// Extracts likely "keywords" from a job description (words/phrases that
// aren't common stopwords) and checks which ones already appear in the CV
// text. Rough and literal — not semantic matching — but useful as a
// quick sanity check before applying.
export function matchKeywords(jobText: string, cvText: string): KeywordMatchResult {
  const cvTokens = new Set(tokenize(cvText));
  const jobTokens = tokenize(jobText);

  const counts = new Map<string, number>();
  for (const tok of jobTokens) counts.set(tok, (counts.get(tok) ?? 0) + 1);

  // Keep words that appear more than once in the job post, or are
  // capitalized/technical-looking in the original text (rough proxy via
  // length), since those are more likely to be genuine requirements than
  // incidental words.
  const candidates = [...counts.entries()]
    .filter(([, count]) => count >= 2 || jobTokens.length < 30)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 30);

  const matched = candidates.filter((w) => cvTokens.has(w));
  const missing = candidates.filter((w) => !cvTokens.has(w));
  const matchPercent = candidates.length > 0 ? Math.round((matched.length / candidates.length) * 100) : 0;

  return { matched, missing, matchPercent };
}
