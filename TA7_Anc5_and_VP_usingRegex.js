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

  const productFormRegex = /product[-_]*.*[-_]*form/i;

  const anchorProductForm = anchors.find((el) => {
    const form = el.closest("form");
    if (!form) return false;

    return formMatchesRegex(form, productFormRegex);
  });

  if (anchorProductForm) {
    return anchorProductForm;
  }

  console.log({
    status: "Failed to find variantIdAnchorProductForm",
    data: anchorDataForDebugging,
  });

  return null;
}

// HELPER:
// To find a match for the productFormRegex in the findVariantIdAnchor()
function formMatchesRegex(form, productFormRegex) {
  if (!form || !form.attributes) return false;

  return Array.from(form.attributes).some((attr) => {
    // ignore noisy attributes that are unlikely to encode intent
    if (attr.name === "style") return false;

    return productFormRegex.test(attr.value);
  });
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

function detectOptionValues_2(
  vp_candidate,
  optionCount,
  optionValueRack,
  optionsInJSON
) {
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
    "orig-value",
    "aria-label",
    "aria-valuetext",
    "name",
  ];

  let finalSelectorResult;
  let matchedAttributes = new Set();
  let selectors = new Set();
  let dataValuesMatched = [];

  let optionExtractionKeys = []; // used for final selector extraction if optionCount > 1

  if (optionCount > 1) {
    for (let optionValueIndex in optionValueRack) {
      let optionExtKey = {
        optionAxisIndex: optionValueIndex,
        optionAxis: optionsInJSON[optionValueIndex],
        ov_attribute: [],
        fs_cand: null,
      };

      for (let fs_cand of vp_candidate.option_wrappers) {
        for (let ov_attribute of OPTION_VALUE_ATTRIBUTES) {
          const attributeSelector = `[${ov_attribute}="${CSS.escape(
            optionValueRack[optionValueIndex]
          )}"]`;
          const dataValueFound = fs_cand.querySelector(attributeSelector);
          if (dataValueFound) {
            matchedAttributes.add(ov_attribute);
            selectors.add(dataValueFound);
            dataValuesMatched.push(attributeSelector);
            // break;

            optionExtKey.ov_attribute.push(ov_attribute);
            optionExtKey.fs_cand = fs_cand;
          }
        }

        if (optionExtKey.fs_cand) {
          optionExtractionKeys.push(optionExtKey);
          break;
          // if all the possible attritbute matches for the current option value
          // have been found in the current fs_cand, the same value will not be found
          // in any of the remaining fs_cand, so we can stop further checking here.
        }
      }
    }
  } else {
    let fs_cand = vp_candidate.option_wrappers[0];

    // console.log(fs_cand, optionValueRack);

    for (let optionValue of optionValueRack) {
      for (let ov_attribute of OPTION_VALUE_ATTRIBUTES) {
        const attributeSelector = `[${ov_attribute}="${CSS.escape(
          optionValue
        )}"]`;
        const dataValueFound = fs_cand.querySelector(attributeSelector);
        if (dataValueFound) {
          matchedAttributes.add(ov_attribute);
          selectors.add(dataValueFound);
          dataValuesMatched.push(attributeSelector);
          // break;
        }
      }
    }
  }

  // finalizing the selectorResult for both optionCounts (1 and >1)
  finalSelectorResult = {
    selector_set: Array.from(selectors),
    dataValuesMatched,
    matchedAttributes,
  };

  // testing optionValuesAssortment :
  if (optionCount > 1) {
    if (optionExtractionKeys.length === optionCount) {
      console.log({
        option_extraction_status: "[Success]",
        optionExtractionKeys,
      });

      // call the function to extract and selectors per option Axis if optionCount > 1.
      finalSelectorResult.selector_set =
        normalizeSelectorSetForMultiOptionCount(optionExtractionKeys);
    } else {
      console.log({
        option_extraction_status: "[Failure]",
        optionExtractionKeys,
      });
    }
  }

  if (finalSelectorResult.selector_set.length) {
    return finalSelectorResult;
  }

  // LET US NOW START THE WORK ON OPTION VALUE ARRANGEMENT
  // AS PER FIELDSETS

  return null;
}

function normalizeSelectorSetForMultiOptionCount(optionExtractionKeys) {
  let finalSelectorSet = optionExtractionKeys.map((optionExtKey) => {
    let ov_attribute_array = Array.from(optionExtKey.ov_attribute);
    let selectorArrayPerOptionAxis = new Set();
    let fs_cand = optionExtKey.fs_cand;

    for (let ov_attribute of ov_attribute_array) {
      for (let optionValue of optionExtKey.optionAxis.values) {
        const attributeSelector = `[${ov_attribute}="${CSS.escape(
          optionValue
        )}"]`;
        let selector = fs_cand.querySelector(attributeSelector);
        if (selector) selectorArrayPerOptionAxis.add(selector);
      }
    }

    return Array.from(selectorArrayPerOptionAxis);
  });

  return finalSelectorSet;
}

// HELPER:
// Normalization of data-* attribute values
function normalizeValue(value) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD") // handle accents
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-") // spaces, symbols → hyphen
    .replace(/^-+|-+$/g, "");
}

async function test() {
  const anchor = findVariantIdAnchor();

  // Failure to find the anchor
  // INFERENCE: Our fundamental assumptions are violated by the theme. (Absolute Failure)
  if (!anchor) {
    const statusObject = {
      status: "[TA7] Failed",
      cause: "variantID anchorForm not found",
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
      status: "[TA7 failed] : No variant picker found",
      cause: candidateObject.isBodyNext ? "Body hit" : "Fault in Anchor",
      anchor,
      parent: candidateObject.parent,
    });
    return [];
  }

  let variantPickerData,
    targetData,
    finalVariantPickerTest = null;

  variantPickerData = findVariantPickerBasedOnOptionAxes(
    variantPickerCandidates,
    optionNames
  );

  let newOptionValueRack =
    product.options.length > 1
      ? product.options.map((option) => option.values[0])
      : product.options[0].values;

  finalVariantPickerTest = variantPickerData.find((item) => {
    let finalSelectorResult = detectOptionValues_2(
      item,
      product.options.length,
      newOptionValueRack,
      product.options
    );
    if (finalSelectorResult) {
      item.selectorData = finalSelectorResult;
      return true;
    }

    return false;
  });

  // For cross-checking
  if (window.CAMOUFLAGEE && finalVariantPickerTest)
    finalVariantPickerTest.camouflage_selectors =
      window.CAMOUFLAGEE.items[0].selectors;

  if (finalVariantPickerTest) {
    finalVariantPickerTest = {
      a__vp_candidate: finalVariantPickerTest.vp_candidate,
      b__option_wrappers: finalVariantPickerTest.option_wrappers,
      c__selectors: finalVariantPickerTest.selectorData,
      d__camouflage_selectors: finalVariantPickerTest.camouflage_selectors,
    };
  }

  targetData = {
    A__finalVariantPicker: finalVariantPickerTest,
    B__mainTargetData: variantPickerData,
    C__precursorData: {
      parentNode: candidateObject.parent,
      parentFoundInAnchorMode: parentFoundInAnchorMode,
      mainContainerCandidates: variantPickerCandidates,
    },

    D__anchorData: {
      anchor: anchor,
      productForm: anchor.parentElement,
    },
  };
  return targetData;
}

await test();

// The detectOptionValues_2 has only confirmed the correctness of the variant-picker
// we now need another function to
// 1. [DONE] : place the selectors in their corresponding option-wrappers,
// 2. Filter out the correct selectors if there are strays in the selectors list.
// 3. Also, instead of option values, variantIds are used in the data-* values of the     selectors. How would you tackle that issue ?
// QUESTION TO ADDRESS : How would you know that which selector is correct ?
