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
    "selector",
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
    "form", // for testing purpose.
    "list", // for testing purpose.
  ];

  // The smaller these two arrays array_A and array_B are, the better.
  // Their lengths are proportional to our dependency on the theme, which we wish to reduce

  // DEBUGGING:
  const regex = new RegExp(
    `(${array_A.join("|")})([-_]+)(${array_B.join("|")})([-_]+[a-z0-9]+)*`,
    "i"
  );

  // PRODUCTION :
  // const regex = new RegExp(
  //   `(${array_A.join("|")})([-_]+)(${array_B.join("|")})([-_]+[a-z0-9]+)*`,
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

  if (matchedElements.length) return matchedElements;

  return [];
}

async function getProductData(ta7_debug = false) {
  const productJsonUrl = `${window.location.pathname}.json`;

  const response = await fetch(productJsonUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch product JSON");
  }

  const data = await response.json();

  if (ta7_debug) {
    console.log({
      optionNamesInJSON: data.product.options.map((option) => option.name),
    });
  }

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
      if (
        text === option ||
        text.startsWith(option + ":") ||
        text.split(" ")[0] === option
      ) {
        matchedOptionNames.add(option);
        break;
      }
    }
  });

  // checking the optionNames in JSON and as matched in the candidate "größe"
  // console.log({
  //   vp_candidate: mainContainerCandidate,
  //   optionSet,
  //   matchedOptionNames,
  // });

  return matchedOptionNames.size;
}

function findMVPRecursively(variantPickerHook, optionNamesInJSON) {
  if (!variantPickerHook) {
    console.log("Variant Picker Hook is undefined", variantPickerHook);
    return null;
  }

  let hookChildren = Array.from(variantPickerHook.children);
  let newHook = null;
  for (let childNode of hookChildren) {
    let matchedOptionCount = findVariantPickerWithOptionLabels(
      childNode,
      optionNamesInJSON
    );
    if (matchedOptionCount === optionNamesInJSON.length) {
      newHook = childNode;

      console.log({
        variantPickerHook: variantPickerHook,
        successor: newHook,
      });

      break;
    }
  }

  if (!newHook)
    return optionNamesInJSON.length > 1
      ? variantPickerHook
      : variantPickerHook.parentElement;

  return findMVPRecursively(newHook, optionNamesInJSON);
}

function findVariantPickerBasedOnOptionAxes(
  variantPickerCandidates,
  optionNamesInJSON
) {
  const potentialVariantPickers = variantPickerCandidates.reduce(
    (acc, vp_candidate) => {
      const option_wrappers = Array.from(vp_candidate.children).filter(
        (child) => variantPickerCandidates.includes(child)
      );

      if (option_wrappers.length === optionNamesInJSON.length) {
        acc.push({ vp_candidate, option_wrappers });
      }

      return acc;
    },
    []
  );

  return potentialVariantPickers;
}

function findVariatPickersBasedOnOptionNamesInJSON(
  variantPickerCandidates,
  optionNames
) {
  // find the VARIANT PICKER HOOK
  // It is the first node where all the option-wrapper labels are found
  // The search for the MVP will now be done in this hook node.
  let countCandidatesChecked = 0;
  let variantPickerHook = variantPickerCandidates.length
    ? variantPickerCandidates.find((vp_candidate) => {
        const matchedOptionCount = findVariantPickerWithOptionLabels(
          vp_candidate,
          optionNames
        );
        return matchedOptionCount === optionNames.length;
      })
    : -1;

  if (variantPickerHook === -1) {
    console.log("The variantPickerCandidates are not populated yet");
    return null;
  }

  let finalVariantPicker,
    fieldSets = [];

  if (variantPickerHook) {
    finalVariantPicker = findMVPRecursively(variantPickerHook, optionNames);
    fieldSets = Array.from(finalVariantPicker.children).filter(
      (fieldSet_candidate) => {
        let matchedOptionCount = findVariantPickerWithOptionLabels(
          fieldSet_candidate,
          optionNames
        );
        if (matchedOptionCount === 1) return true;
      }
    );
  }

  const variantPickerData = {
    VariantPicker: finalVariantPicker,
    Fieldsets: fieldSets,
  };

  return variantPickerData;
}

function detectOptionValues(vp_candidate, sampleOptionValue) {
  const OPTION_VALUE_ATTRIBUTES = [
    // Tier 1 — high-confidence, canonical
    "value",
    "data-option-value",
    "data-option-value-id",
    "data-option-id",
    "data-value",
    "data-value-id",
    "data-variant-id",
    "data-variant",
    "data-selected-value",

    // Tier 2 — handles / normalized keys
    "data-value-handle",
    "data-option-handle",
    "data-handle",
    "data-option-key",
    "data-key",

    // Tier 3 — generic but meaningful
    "data-option",
    "data-option-index",
    "data-index",
    "data-name",
    "data-current-value",

    // Tier 4 — accessibility / framework-driven
    "aria-label",
    "aria-valuetext",
    "name",
  ];

  for (let fs_cand of vp_candidate.option_wrappers) {
    for (let ov_attribute of OPTION_VALUE_ATTRIBUTES) {
      const selector = `[${ov_attribute}="${CSS.escape(sampleOptionValue)}"]`;
      const dataValueFound = fs_cand.querySelector(selector);

      if (dataValueFound) return true; // the fieldset had some element that had the sampleOptionValue supplied, our variantPicker.
    }
  }

  return false; // no fieldset candidate in the vp_candidate has any attribute holding the sampleOptionValue, not our variantPicker
}

async function test(useOptionNames = true) {
  const anchor = findVariantIdAnchor();

  // Failure to find the anchor
  // INFERENCE: Our fundamental assumptions are violated by the theme. (Absolute Failure)
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
  // INFERENCE : The variant picker regex might be insufficient
  if (!variantPickerCandidates.length) {
    console.log({
      status: "No variant picker found",
      cause: candidateObject.isBodyNext ? "Body hit" : "Recheck Anchor",
      anchor,
      parent: candidateObject.parent,
    });
    return [];
  }

  let variantPickerData, targetData, finalVariantPickerTest = null;
  if (useOptionNames)
    variantPickerData = findVariatPickersBasedOnOptionNamesInJSON(
      variantPickerCandidates,
      optionNames
    );
  else {
    variantPickerData = findVariantPickerBasedOnOptionAxes(
      variantPickerCandidates,
      optionNames
    );

    let optionValueRacks = product.options.map(option => option.values);

    finalVariantPickerTest = variantPickerData.find((item) => detectOptionValues(item, optionValueRacks[0][0]));
  }

  targetData = {
    A__finalVariantPicker : finalVariantPickerTest,
    A__mainTargetData: variantPickerData,
    B__precursorData: {
      parentNode: candidateObject.parent,
      parentFoundInAnchorMode: parentFoundInAnchorMode,
      mainContainerCandidates: variantPickerCandidates,
      // variantPickerCandidatesChecked: countCandidatesChecked,
    },

    C__anchorData: {
      anchor: anchor,
      productForm: anchor.parentElement,
    },
  };
  return targetData;
}

await test(false);

// what happens when option names in the productJSON and those on the DOM are
// in different languages.
