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

  return {
    parent: candidate,
    isBodyNext: candidate?.parentElement === document.body,
  };
}

// HELPER:
// we find the element whose tagName, or one of the classes
// matches with phrases like variant-picker, option_selectors, etc.
// most theme would resort to this kind of nomenclature.
function getVariantPickerCandidates(parentNode, productJSON) {
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
    "block", // for testing purpose.
  ];

  // The smaller these two arrays array_A and array_B are, the better.
  // Their lengths are proportional to our dependency on the theme, which we wish to reduce

  const regex = new RegExp(
    `(${array_A.join("|")})([-_]+)(${array_B.join("|")})([-_]+[a-z0-9]+)*`,
    "i"
  );

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

  if (matchedElements.length) return matchedElements;

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

  // All option axes accounted for → picker
  if (matchedOptionNames.size === optionSet.size) {
    return mainContainerCandidate;
  }

  // Exactly one option axis → wrapper
  if (matchedOptionNames.size === 1) return -1;

  if (matchedOptionNames.size === 0) return null;

  return null;
}

function findMVPRecursively(variantPickerHook, optionNamesInJSON) {
  let hookChildren = Array.from(variantPickerHook.children);
  let newHook = null;
  for (let childNode of hookChildren) {
    let testCandidate = findVariantPickerWithOptionLabels(
      childNode,
      optionNamesInJSON
    );
    if (testCandidate && testCandidate !== -1) {
      newHook = childNode;
      break;
    }
  }

  if (!newHook) return variantPickerHook;

  return findMVPRecursively(newHook, optionNamesInJSON);
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
    candidateObject.parent,
    product
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
  // INFERENCE : The current theme totally violates our fundamental assumptions
  if (!variantPickerCandidates.length) {
    console.log({
      status: "No variant picker found",
      cause: candidateObject.isBodyNext ? "Body hit" : "Recheck Anchor",
      anchor,
      parent: candidateObject.parent,
    });
    return [];
  }

  // find the VARIANT PICKER HOOK
  // It is the first node where all the option-wrapper labels are found
  // The search for the MVP will now be done in this hook node.
  let countCandidatesChecked = 0;
  let variantPickerHook;
  for (let vp_candidate of variantPickerCandidates) {
    let testCandidate = findVariantPickerWithOptionLabels(
      vp_candidate,
      optionNames
    );

    countCandidatesChecked++; // for debugging purposes.

    // Once a valid vp_candidate is found
    // Begin to look for the MVP inside it, rather than using the VPC list.
    if (testCandidate && testCandidate !== -1) {
      variantPickerHook = testCandidate;
      break;
    }
  }

  let finalVariantPicker = findMVPRecursively(variantPickerHook, optionNames);
  let fieldSets = Array.from(finalVariantPicker.children).filter(
    (fieldSet_candidate) => {
      let testFieldSet = findVariantPickerWithOptionLabels(
        fieldSet_candidate,
        optionNames
      );
      if (testFieldSet === -1) return true;
    }
  );
  let finalVariantPickerFound = false;

  const targetData = {
    // For Debugging purposes:
    // anchor,
    // productForm: anchor.parentElement,

    // Precursor Data
    // parentNode: candidateObject.parent,
    // parentFoundInAnchorMode: parentFoundInAnchorMode,
    // mainContainerCandidates: variantPickerCandidates,
    // variantPickerCandidatesChecked: countCandidatesChecked,
    // selectedMainContainer: finalVariantPicker || variantPickerCandidates[0],

    // Main Target Data:
    VariantPicker: finalVariantPicker,
    Fieldsets: fieldSets,
  };

  return targetData;
}

test();
