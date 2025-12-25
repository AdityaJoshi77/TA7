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
  const formRegex = /^product[-_]+form/i;

  const anchorInForm = anchors.find((el) => {
    const form = el.closest("form");
    return form && formRegex.test(form.id);
  });

  console.log({
    Status: "Anchor Found",
    Data: anchorInForm || anchors[0],
  });
  return anchorInForm || anchors[0];
}

// STEP 2: Build the array of candidates which can possible hold the variant picker.
function getCandidateContainer(maxDepth = 4) {
  const anchor = findVariantIdAnchor();
  if (!anchor) return null;

  let current = anchor.parentElement;
  let depth = 0;
  let candidate = current;

  while (current && current !== document.body && depth < maxDepth) {
    candidate = current;
    current = current.parentElement;
    depth++;
  }

  console.log({
    Status: "Candidate container",
    Data: candidate,
  });

  return candidate;
}

getCandidateContainer();
