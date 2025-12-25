// STEP 1: Find the theme invariant - input/select with name = id.
function findVariantIdAnchor() {
  // Most shopify themes need an html element which will hold the id of the current variant
  // for the add-to-cart / buy form submission.
  // If this is found, we proceed ahead, if not, we revert to manual extraction.

  const anchors = Array.from(
    document.querySelectorAll('input[name="id"], select[name="id"]')
  );

  if (!anchors.length) {
    console.log("No anchors were found, revert to manual extraction");
    return null;
  }

  // Prefer anchors inside a form
  const anchorInForm = anchors.find((el) => el.closest("form"));
  console.log({
    Status: "Anchor Found",
    Data: anchorInForm || anchors[0],
  });
  return anchorInForm || anchors[0];
}

// STEP 2: Build the array of candidates which can possible hold the variant picker.
function buildCandidateContainers(anchor, maxDepth = 8) {
  if (!anchor) return [];

  const candidates = [];
  let current = anchor.parentElement;
  let depth = 0;

  while (current && current !== document.body && depth < maxDepth) {
    candidates.push(current);

    // Hard stop at form — usually the best stable scope
    // if (current.tagName === 'FORM') break;

    current = current.parentElement;
    depth++;
  }

  console.log({
    Status: "Candidates Array data",
    Data: candidates,
  });

  return candidates;
}

// STEP 3 : Score the candidates

// helper functions :

// Helper: Generate a readable selector for a DOM node
// This is only for debugging / output, not for logic.
function getElementSelector(el) {
  if (!el || el.nodeType !== 1) return "";

  // Prefer ID if present
  if (typeof el.id === "string" && el.id.trim() !== "") {
    return `#${CSS.escape(el.id)}`;
  }

  const parts = [];
  let current = el;

  while (current && current !== document.body) {
    let part = current.tagName.toLowerCase();

    // Add all classes
    if (current.classList && current.classList.length > 0) {
      part += Array.from(current.classList)
        .map(cls => `.${CSS.escape(cls)}`)
        .join("");
    }

    const parent = current.parentElement;

    // Add nth-of-type ONLY if needed
    if (parent) {
      const sameTypeSiblings = Array.from(parent.children).filter(
        sib =>
          sib.tagName === current.tagName &&
          sib.className === current.className
      );

      if (sameTypeSiblings.length > 1) {
        const index = sameTypeSiblings.indexOf(current) + 1;
        part += `:nth-of-type(${index})`;
      }
    }

    parts.unshift(part);
    current = parent;
  }

  return parts.join(" > ");
}


// Helper: Detect option-like groups (very conservative)
// At this stage we only detect repeated structural blocks, not exact fields.
function findOptionGroups(container) {
  if (!container) return [];

  const children = Array.from(container.children);

  // Group children by tag name (fieldset/div/ul etc.)
  const groupsByTag = children.reduce((acc, el) => {
    const tag = el.tagName;
    acc[tag] = acc[tag] || [];
    acc[tag].push(el);
    return acc;
  }, {});

  // Return only groups that repeat
  return Object.values(groupsByTag)
    .filter((group) => group.length > 1)
    .flat();
}

// Helper: Check structural repetition quality
function hasClearRepetition(optionGroups) {
  if (!optionGroups || optionGroups.length < 2) return false;

  const tag = optionGroups[0].tagName;
  return optionGroups.every((el) => el.tagName === tag);
}

// Helper: Match product option names with DOM labels
// This is validation only, never discovery.
function matchOptionLabels(container, optionNames) {
  if (!container || !optionNames || !optionNames.length) return 0;

  const textNodes = Array.from(
    container.querySelectorAll("legend, label, span, div, h3, h4")
  ).map((el) => el.textContent.toLowerCase().trim());

  let matches = 0;

  optionNames.forEach((optionName) => {
    const normalized = optionName.toLowerCase();
    if (textNodes.some((text) => text.includes(normalized))) {
      matches++;
    }
  });

  return matches;
}

// CORE SCORING FUNCTION (corrected with scope-tightness penalty)
function scoreCandidate(candidate, anchor, product, depthIndex, maxDepth) {
  let score = 0;

  function proximityWeight(index, maxDepth) {
    const min = 0.4; // never drop to zero
    const weight = 1 - index / maxDepth;
    return Math.max(weight, min);
  }

  // ---------------------------------
  // 1. Variant ID proximity (DEPTH-AWARE)
  // ---------------------------------
  if (candidate.contains(anchor)) {
    const proximityBase = 0.3;
    const proximityFactor = proximityWeight(depthIndex, maxDepth);
    score += proximityBase * proximityFactor;
  }

  // ---------------------------------
  // 2. Option group count alignment
  // ---------------------------------
  const expectedOptionCount = product.options.length;
  const optionGroups = findOptionGroups(candidate);

  if (optionGroups.length === expectedOptionCount) {
    score += 0.25;
  } 
  else if (Math.abs(optionGroups.length - expectedOptionCount) === 1) {
    score += 0.1;
  }
//   else{
//     score -= 0.3;
//   }

  // ---------------------------------
  // 3. Structural repetition
  // ---------------------------------
  if (hasClearRepetition(optionGroups)) {
    score += 0.2;
  } else if (optionGroups.length > 0) {
    score += 0.1;
  }

  // ---------------------------------
  // 4. Product JSON label validation
  // ---------------------------------
  const matchedLabels = matchOptionLabels(candidate, product.options);
  if (matchedLabels === product.options.length) {
    score += 0.15;
  } else if (matchedLabels > 0) {
    score += 0.08;
  }

  // ---------------------------------
  // 5. Commerce context proximity
  // ---------------------------------
  if (candidate.closest("form")) {
    score += 0.1;
  }

  // ---------------------------------
  // 6. Scope tightness penalty (kept)
  // ---------------------------------
  let penalty = 0;

  if (
    candidate.querySelector(
      'media-gallery, slider-component, [class*="media"], [class*="gallery"]'
    )
  ) {
    penalty += 0.15;
  }

  if (candidate.querySelectorAll("img").length > 3) {
    penalty += 0.1;
  }

  score = Math.round(Math.max(score - penalty, 0) * 1000) / 1000;
  return Math.min(score, 1);
}

// FINAL SCORING TESTER :
function scoreCandidates(product) {
  const anchor = findVariantIdAnchor();
  if (!anchor) return [];

  const candidates = buildCandidateContainers(anchor);
  const maxDepth = candidates.length - 1;

  // sort the candidates in the descending order of scores.
  return candidates
    .map((candidate, index) => ({
      selector: getElementSelector(candidate),
      score: scoreCandidate(candidate, anchor, product, index, maxDepth),
    }))
    .sort((a, b) => b.score - a.score);
}

const product = {
  options: ["Color", "Size"],
};

scoreCandidates(product);
