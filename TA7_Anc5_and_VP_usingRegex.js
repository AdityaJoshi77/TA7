// HELPER:
// Find the theme invariant - input/select with name = id.
// Most shopify themes need an html element which will hold the id of the current variant
// for the add-to-cart / buy form submission.
// If this is found, we proceed ahead, if not, we revert to manual extraction.
function findVariantIdAnchor() {
  const anchors = Array.from(
    document.querySelectorAll('input[name="id"], select[name="id"]')
  );

  if (!anchors.length) {
    console.log("No anchors were found, revert to manual extraction");
    return null;
  }

  const formRegex = /product[-_]*.*[-_]*form/i;

  const anchorInProductForm = anchors.find((el) => {
    const form = el.closest("form");
    if (!form) return false;

    const formId = form.getAttribute("id");
    if (formId && formRegex.test(formId)) return true;

    // fallback: check class list
    return Array.from(form.classList).some((cls) => formRegex.test(cls));
  });

  if (anchorInProductForm) {
    // SUCCESS MESSAGE:
    // console.log({
    //   status: "Anchor Found",
    //   anchor: anchorInProductForm,
    //   parentForm: anchorInProductForm.closest("form"),
    //   formId: anchorInProductForm.closest("form")?.id,
    //   formRegex,
    // });
    return anchorInProductForm;
  }

  const anchorDataForDebugging = anchors.map((anchor) => ({
    anchor,
    parentElement: anchor.parentElement,
    closestForm: anchor.closest("form"),
    closestFormId: anchor.closest("form")?.id,
  }));

  console.log({
    status: "Failed to find anchor",
    data: anchorDataForDebugging,
  });

  return null;
}

// HELPER:
// to get the specified ancestor of variantID anchor which could
// be a potential container of variant picker.
// Unless specified, we get the 4th ancestor of the variantID anchor.
function getParentNode(node, recall = false) {
  let current;
  let candidate;

  if (!recall) {
    // anchor mode
    current = node.parentElement;
    candidate = current;

    let depth = 0;
    const maxDepth = 4;

    while (current && current !== document.body && depth < maxDepth) {
      candidate = current;
      current = current.parentElement;
      depth++;
    }
  } else {
    // incremental mode
    if (!node || node === document.body) return null;
    candidate = node.parentElement;
  }

  // SUCCESS MESSAGE:
  //   console.log({
  //     Status: "Candidate container",
  //     Data: candidate,
  //   });

  return {
    parent: candidate,
    isBodyNext: candidate?.parentElement === document.body,
  };
}

// HELPER:
// we find the element whose tagName, or one of the classes
// matches with phrases like variant-picker, option_selectors, etc.
// most theme would resort to this kind of nomenclature.
function getVariantPickerCandidates(parentNode) {

  // The smaller these two arrays array_A and array_B are, the better.
  // Their lengths are proportional to our dependency on the theme, which we wish to reduce
  const array_A = [
    "variant",
    "variants",
    "swatch",
    "option",
    "options",
    "product",
  ];
  const array_B = [
    "picker",
    "pickers",
    "select",
    "selects",
    "selector",
    "selectors",
    "radio",
    "radios",
    "wrapper",
    "container",
    "option",
    "options",
    "block" // for testing purpose.
  ];

  const regex = new RegExp(
    `(${array_A.join("|")})([-_]+)(${array_B.join("|")})([-_]+[a-z0-9]+)*`,
    "i"
  );

  // const regex = new RegExp(
  //   `^(${array_A.join("|")})([-_]+)(${array_B.join("|")})([-_]+[a-z0-9]+)*$`,
  //   "i"
  // );

  const matchedElements = Array.from(parentNode.querySelectorAll("*")).filter(
    (el) => {
      // reject extremely narrow candidates
      if (
        ["input", "select", "label", "legend", "span", "li", "a"].includes(
          el.tagName.toLowerCase()
        )
      )
        return false;

      // check tag name
      if (regex.test(el.tagName.toLowerCase())) return true;

      // check class names
      return Array.from(el.classList).some((cls) => regex.test(cls));
    }
  );

  if (matchedElements.length) {
    // SUCCESS MESSAGE:
    // console.log({
    //   status: "Found VariantPicker Candidates",
    //   Data: matchedElements,
    // });

    return matchedElements;
  }

  return [];
}

async function getProductData() {
  const productJsonUrl = `${window.location.pathname}.json`;

  const response = await fetch(productJsonUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch product JSON");
  }

  const data = await response.json();
  return data.product;
}

// HELPER:
// Look for the presence of nodes whose textContent matches with the optionNames
// productJSON. a mainContainerCandidate which has all the matching nodes is eligible to the'
// MVP.
function findVariantPickerWithOptionLabels(
  mainContainerCandidate,
  optionNamesInJSON
) {
  const optionSet = new Set(optionNamesInJSON.map((o) => o.toLowerCase()));

  const matchedOptionNames = new Set();

  Array.from(mainContainerCandidate.querySelectorAll("*")).forEach((el) => {
    const text = el.textContent?.toLowerCase().trim();
    if (!text) return;

    for (const option of optionSet) {
      if (text === option || text.startsWith(option + ":")) {
        matchedOptionNames.add(option);
        break;
      }
    }
  });

  if (matchedOptionNames.size === 0) return null;

  // Exactly one option axis → wrapper
  if (matchedOptionNames.size === 1) return -1;

  // All option axes accounted for → picker
  if (matchedOptionNames.size === optionSet.size) {
    return mainContainerCandidate;
  }

  return null;
}

function findLowestCommonAncestor(nodes, maxDepth = 8) {
  // if (!nodes || nodes.length < 2) return null;

  // Build ancestor chains for each node
  const ancestorChains = nodes.map((node) => {
    const chain = [];
    let current = node;
    let depth = 0;

    while (current && current !== document.body && depth < maxDepth) {
      chain.push(current);
      current = current.parentElement;
      depth++;
    }
    return chain;
  });

  // Find the first ancestor common to all chains
  for (const ancestor of ancestorChains[0]) {
    if (ancestorChains.every((chain) => chain.includes(ancestor))) {
      return ancestor;
    }
  }

  return null;
}

function isValidVariantPicker(candidate, expectedOptionCount) {
  if (!candidate) return false;

  const radioGroups = new Set(
    [...candidate.querySelectorAll('input[type="radio"]')]
      .map((r) => r.name)
      .filter(Boolean)
  );

  const selectCount = candidate.querySelectorAll("select").length;

  const axisCount = radioGroups.size + selectCount;

  return axisCount >= expectedOptionCount;
}

async function test() {
  const anchor = findVariantIdAnchor();
  if (!anchor) {
    const statusObject = {
      status: "[TA7] Failed",
      cause: "variantID anchor not found",
    };
    console.log(statusObject);
    return statusObject;
  }

  // GET PRODUCT DATA
  const product = await getProductData();
  const optionNames = product.options.map((option) =>
    option.name.toLowerCase()
  );

  // Find a stable parent, 
  // and look for eligible variant picker candidates in that parent
  let candidateObject = getParentNode(anchor, false);
  let parentFoundInAnchorMode = true;
  let variantPickerCandidates = getVariantPickerCandidates(
    candidateObject.parent
  );

  // if variant picker candidates are not found in the current parentNode
  // look for the same in a higher parentNode.
  while (
    candidateObject &&
    !variantPickerCandidates.length &&
    !candidateObject.isBodyNext
  ) {
    parentFoundInAnchorMode = false;
    candidateObject = getParentNode(candidateObject.parent, true);
    variantPickerCandidates = getVariantPickerCandidates(
      candidateObject.parent
    );
  }

  // Failure to find the variant picker candidates
  // INFERENCE : The current theme violates our fundamental assumptions
  if (!variantPickerCandidates.length) {
    console.log({
      status: "No variant picker found",
      cause: candidateObject.isBodyNext ? "Body hit" : "Recheck Anchor",
      anchor,
      parent: candidateObject.parent,
    });
    return [];
  }

  // look for the labels for the option-wrappers in the variantPickerCandidates.
  let finalVariantPicker = null;
  let fieldSets = [];
  for (let variantPicker of variantPickerCandidates) {
    let testCandidate = findVariantPickerWithOptionLabels(
      variantPicker,
      optionNames
    );

    if (testCandidate) {
      if (testCandidate === -1) fieldSets.push(variantPicker);
      else {
        finalVariantPicker = testCandidate;
        // break; // Do not break at this point. 
        // The lower most testCandidate that contains both option wrapper labels 
        // will become the finalVariantPicker. 
      }
    }
  }

  // let LCA = null;
  // if (fieldSets.length === optionNames.length) {
  //   console.log("LCA detection was called");
  //   const derivedPicker = findLowestCommonAncestor(fieldSets);
  //   LCA = derivedPicker;
  //   if (isValidVariantPicker(derivedPicker, optionNames.length)) {
  //     finalVariantPicker = derivedPicker;
  //   }

  //   finalVariantPicker = derivedPicker;
  // }

  const targetData = {
    // For Debugging purposes:
    // anchor,
    // productForm: anchor.parentElement,

    // main TargetData:
    // LCA,
    fieldSets,
    parentNode: candidateObject.parent,
    parentFoundInAnchorMode: parentFoundInAnchorMode,
    mainContainerCandidates: variantPickerCandidates,
    // selectedMainContainer: finalVariantPicker || variantPickerCandidates[0],
    finalVariantPicker,
  };

  //   SUCCESS MESSAGE
  //   console.log({
  //     status: "[TA7] Passed",
  //     data: targetData,
  //   });

  return targetData;
}

test();
