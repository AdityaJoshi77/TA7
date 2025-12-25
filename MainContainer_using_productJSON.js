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

function getMainContainerAndMOTarget(candidate, product) {
  if (!(candidate instanceof HTMLElement)) {
    return null;
  }

  const optionLabels = Array.from(candidate.querySelectorAll("label, legend, div"));

  const normalize = (str) => str.toLowerCase().replace(/[:()]/g, "").trim();

  const matches = {};

  for (const optionName of product.options) {
    const match = optionLabels.find((lb) =>
      normalize(lb.textContent).includes(normalize(optionName))
    );

    if (match) {
      matches[optionName] = match;
    }
  }

  // Not all options found → reject candidate
  if (Object.keys(matches).length !== product.options.length) {
    return null;
  }

  // Compute LCA of matched labels
  const labelNodes = Object.values(matches);

  function getAncestors(node) {
    const ancestors = [];
    let current = node;
    while (current && current !== document.body) {
      ancestors.push(current);
      current = current.parentElement;
    }
    return ancestors;
  }

  const ancestorLists = labelNodes.map(getAncestors);

  const variantPickerRoot = ancestorLists[0].find((node) =>
    ancestorLists.every((list) => list.includes(node))
  );

  return {
    mainContainer: candidate,
    variantPicker: variantPickerRoot,
    matchedLabels: matches,
  };
}

function test(productJSON) {
  const anchor = findVariantIdAnchor();
  if (!anchor) {
    return { Result: "[TargetData], No anchor found" };
  }

  const candidates = buildCandidateContainers(anchor);
  if (!candidates || !candidates.length) {
    return { Result: "No candidates found" };
  }

  for (let candidate of candidates) {
    let targetData = getMainContainerAndMOTarget(candidate, productJSON);
    if (targetData) {
      return {
        Result: "Target found",
        Data: targetData,
      };
    }
  }

  return {
    Result: "No targetData found",
    Candidates: candidates,
  };
}

const productJSON = {
  options: ["Color", "Size"],
};

test(productJSON);
