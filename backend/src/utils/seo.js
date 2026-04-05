/**
 * SEO Analysis Utility
 * Calculates an SEO score for generated blog content.
 */

/**
 * Analyze blog content and return an SEO score (0-100) with details.
 */
function calculateSeoScore({ title, metaDescription, content, keyword }) {
  const scores = [];
  const details = [];

  // 1. Title checks (max 20 points)
  let titleScore = 0;
  if (title) {
    if (title.length >= 30 && title.length <= 70) {
      titleScore += 10;
      details.push({ check: "Title length", status: "pass", message: `${title.length} chars (ideal: 30-70)` });
    } else {
      titleScore += 4;
      details.push({ check: "Title length", status: "warn", message: `${title.length} chars (ideal: 30-70)` });
    }
    if (title.toLowerCase().includes(keyword.toLowerCase())) {
      titleScore += 10;
      details.push({ check: "Keyword in title", status: "pass", message: "Keyword found in title" });
    } else {
      details.push({ check: "Keyword in title", status: "fail", message: "Keyword not found in title" });
    }
  }
  scores.push(titleScore);

  // 2. Meta description checks (max 15 points)
  let metaScore = 0;
  if (metaDescription) {
    if (metaDescription.length >= 120 && metaDescription.length <= 160) {
      metaScore += 8;
      details.push({ check: "Meta description length", status: "pass", message: `${metaDescription.length} chars (ideal: 120-160)` });
    } else if (metaDescription.length >= 80) {
      metaScore += 5;
      details.push({ check: "Meta description length", status: "warn", message: `${metaDescription.length} chars (ideal: 120-160)` });
    } else {
      details.push({ check: "Meta description length", status: "fail", message: `${metaDescription.length} chars (too short)` });
    }
    if (metaDescription.toLowerCase().includes(keyword.toLowerCase())) {
      metaScore += 7;
      details.push({ check: "Keyword in meta", status: "pass", message: "Keyword found in meta description" });
    } else {
      details.push({ check: "Keyword in meta", status: "fail", message: "Keyword not in meta description" });
    }
  }
  scores.push(metaScore);

  // 3. Content structure checks (max 25 points)
  let structureScore = 0;
  const h2Count = (content.match(/<h2/gi) || []).length;
  const h3Count = (content.match(/<h3/gi) || []).length;
  const pCount = (content.match(/<p/gi) || []).length;
  const listCount = (content.match(/<ul|<ol/gi) || []).length;

  if (h2Count >= 3) {
    structureScore += 8;
    details.push({ check: "H2 headings", status: "pass", message: `${h2Count} headings found` });
  } else if (h2Count >= 1) {
    structureScore += 4;
    details.push({ check: "H2 headings", status: "warn", message: `${h2Count} headings (recommend 3+)` });
  } else {
    details.push({ check: "H2 headings", status: "fail", message: "No H2 headings found" });
  }

  if (h3Count >= 2) {
    structureScore += 5;
    details.push({ check: "H3 subheadings", status: "pass", message: `${h3Count} subheadings found` });
  } else {
    structureScore += 2;
    details.push({ check: "H3 subheadings", status: "warn", message: `${h3Count} subheadings (recommend 2+)` });
  }

  if (listCount >= 1) {
    structureScore += 5;
    details.push({ check: "Lists", status: "pass", message: `${listCount} list(s) found` });
  } else {
    details.push({ check: "Lists", status: "warn", message: "No lists found" });
  }

  if (pCount >= 5) {
    structureScore += 7;
    details.push({ check: "Paragraphs", status: "pass", message: `${pCount} paragraphs` });
  } else {
    structureScore += 3;
    details.push({ check: "Paragraphs", status: "warn", message: `${pCount} paragraphs (recommend 5+)` });
  }
  scores.push(structureScore);

  // 4. Content length checks (max 20 points)
  let lengthScore = 0;
  const wordCount = content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  if (wordCount >= 800 && wordCount <= 2000) {
    lengthScore += 20;
    details.push({ check: "Word count", status: "pass", message: `${wordCount} words (ideal: 800-2000)` });
  } else if (wordCount >= 500) {
    lengthScore += 12;
    details.push({ check: "Word count", status: "warn", message: `${wordCount} words (ideal: 800-2000)` });
  } else {
    lengthScore += 5;
    details.push({ check: "Word count", status: "fail", message: `${wordCount} words (too short)` });
  }
  scores.push(lengthScore);

  // 5. Keyword density checks (max 20 points)
  let keywordScore = 0;
  const plainText = content.replace(/<[^>]*>/g, " ").toLowerCase();
  const keywordLower = keyword.toLowerCase();
  const keywordOccurrences = plainText.split(keywordLower).length - 1;
  const density = ((keywordOccurrences / wordCount) * 100).toFixed(1);

  if (density >= 0.5 && density <= 3.0) {
    keywordScore += 20;
    details.push({ check: "Keyword density", status: "pass", message: `${density}% (ideal: 0.5-3%)` });
  } else if (density > 0) {
    keywordScore += 10;
    details.push({ check: "Keyword density", status: "warn", message: `${density}% (ideal: 0.5-3%)` });
  } else {
    details.push({ check: "Keyword density", status: "fail", message: "Keyword not found in content" });
  }
  scores.push(keywordScore);

  const totalScore = scores.reduce((a, b) => a + b, 0);

  let grade;
  if (totalScore >= 85) grade = "A";
  else if (totalScore >= 70) grade = "B";
  else if (totalScore >= 55) grade = "C";
  else if (totalScore >= 40) grade = "D";
  else grade = "F";

  return {
    score: totalScore,
    grade,
    wordCount,
    keywordDensity: parseFloat(density),
    details,
  };
}

module.exports = { calculateSeoScore };
