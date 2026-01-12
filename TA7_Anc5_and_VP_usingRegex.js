// HELPER:
// Find the theme invariant - input/select with name = id.
// Most shopify themes need an html element which will hold the id of the current variant
// for the add-to-cart / buy form submission.
// If this is found, we proceed ahead, if not, we revert to manual extraction.
function findAnchorProductForm() {
  const anchors = Array.from(
    document.querySelectorAll('input[name="id"], select[name="id"]')
  );

  if (!anchors.length) {
    console.log("No anchors were found, revert to manual extraction");
    return null;
  }

  const productFormRegex = /product[-_]*.*[-_]*form/i;

  let anchorProductForm = null;

  const validNameIdElement = anchors.find((el) => {
    anchorProductForm = findClosestRegexMatchedAncestor(el, productFormRegex);

    return Boolean(anchorProductForm);
  });

  if (validNameIdElement) {
    return {
      validNameIdElement,
      anchorProductForm,
    };
  }

  console.log({
    status: "Failed to find variantIdAnchorProductForm",
  });

  return null;
}

function findClosestRegexMatchedAncestor(el, productFormRegex) {
  let current = el.parentElement;

  while (current && current !== document.body) {
    if (
      isElementVisible(current) &&
      formMatchesRegex(current, productFormRegex)
    ) {
      return current;
    }
    current = current.parentElement;
  }

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

function isElementVisible(el) {
  const style = getComputedStyle(el);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    parseFloat(style.opacity) > 0 &&
    el.offsetParent !== null &&
    el.getClientRects().length > 0
  );
}

// HELPER:
// to get the specified ancestor of variantID anchorProductForm which could
// be a potential container of variant picker.
// Unless specified, we get the 4th ancestor of the variantID anchorProductForm.
function getParentNodeForVPCSearch(node, recall = false) {
  let current;
  let candidate;

  if (!recall) {
    // anchorProductForm mode
    current = node.parentElement;
    candidate = current;

    maxDepth = 4;
    let depth = 0;

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
function getRegexMatchingVariantPickerCandidates(parentNode, productJSON) {
  const array_A = [
    "variant",
    "variants",
    "swatch",
    "option",
    "options",
    "product",
    "selector",
    "productform", // testing
    "globo",
  ];
  const array_B = [
    "variant",
    "variants",
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
    "swatch",
    "swatches",
    "update", // for testing purpose
    "block", // for testing purpose.
    "form", // for testing purpose.
    "list", // for testing purpose.
  ];

  // The smaller these two arrays array_A and array_B are, the better.
  // Their lengths are proportional to our dependency on the theme, which we wish to reduce

  // ORIGIANL:
  // const regex = new RegExp(
  //   `(${array_A.join("|")})([-_]+)(${array_B.join("|")})([-_]+[a-z0-9]+)*`,
  //   "i"
  // );

  // TESTING :
  const regex = new RegExp(
    `(${array_A.join("|")})(?:[-_]*)(?:${array_B.join("|")})(?:[a-z0-9]*)`,
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

function getVariantPickersHavingValidStructure(
  variantPickerCandidates,
  optionCount // getVariantPickersHavingValidStructure
) {
  const potentialVariantPickers = variantPickerCandidates.reduce(
    (acc, vp_candidate) => {
      // THIS PART NEEDS A MORE SOLID FIX:
      // IT WILL FAIL FOR SOME CASES WHERE optionCountINJson === 1

      // CURRENT LOGIC :
      // If the vp_candidate.children !== optionCountInJSON.length
      // check for vp_candidate.descendencts.length === optionCountInJSON.length.
      // if the descendent check also failed, rely on the heuristic : children in vpc === optionCountInJSON

      // PRODUCTION :
      let option_wrappers = Array.from(vp_candidate.children).filter((child) =>
        variantPickerCandidates.includes(child)
      );
      if (option_wrappers.length === optionCount) {
        acc.push({ vp_candidate, option_wrappers });

        // debug log
        console.log({
          structure_validity_confimation: "Sturcture Validiy at Children Level",
          vp_candidate,
        });

        return acc;
      }

      option_wrappers = Array.from(vp_candidate.querySelectorAll("*")).filter(
        (child) => variantPickerCandidates.includes(child)
      );

      if (option_wrappers.length === optionCount) {
        acc.push({ vp_candidate, option_wrappers });

        // debug log
        console.log({
          structure_validity_confimation:
            "Sturcture Validiy at Descendents Level",
          vp_candidate,
        });

        return acc;
      } else if (
        Array.from(vp_candidate.children).length === optionCount
      ) {
        acc.push({
          vp_candidate,
          option_wrappers: Array.from(vp_candidate.children),
        });

        // debug log
        console.log({
          structure_validity_confimation:
            "Sturcture Validiy assumed since optionCount === vpc.children",
          vp_candidate,
        });
      }

      return acc;
    },
    []
  );

  return potentialVariantPickers;
}

function getCorrectVariantPickerWithSelectors(
  vp_candidate,
  optionCount,
  optionValueRack,
  optionsInJSON
) {
  // THE VERY FIRST CHECK :
  // Are the option wrappers in the variant picker in hand :
  // visually present
  // 1:1 mapped with the option axes.

  let vp_validation_data = isValidVariantPicker(
    vp_candidate,
    optionCount,
    optionValueRack,
    optionsInJSON
  ); // the vp_validation_data is the set of selector yielding ova per VISIBLE fs_cand

  if (!vp_validation_data) return null;

  console.log({
    vp_validation_data,
  });

  let { optionExtractionKeys, dataValuesMatched, matchedAttributes } =
    generateOptionExtractionKeys(
      vp_candidate,
      optionCount,
      optionValueRack,
      optionsInJSON,
      vp_validation_data
    );

  let finalSelectorResult = {
    dataValuesMatched,
    matchedAttributes,
  };

  // testing optionValuesAssortment :
  let optionExtKeyGenSuccess = false;
  if (optionCount > 1) {
    optionExtKeyGenSuccess =
      optionExtractionKeys.length ===
      vp_validation_data.visually_present_fs_cand_indices.length;
  } else {
    optionExtKeyGenSuccess = optionExtractionKeys.length === 1;
  }

  if (optionExtKeyGenSuccess) {
    console.log({
      option_extraction_status: "[Success]",
      optionExtractionKeys,
    });

    // QUESTION TO ADDRESS : How would you know that which selector is correct ?
    // The parent wrapper of the correct selector set will be visually present.

    // call the function to extract selectors per option Axis per ov_attribute if optionCount > 1.
    finalSelectorResult.selector_set =
      // normalizeSelectorSetForMultiOptionCount_filtered(optionExtractionKeys);
      normalizeSelectorSetForMultiOptionCount_filtered_and_deduplicated(
        optionExtractionKeys,
        optionCount
      );

    //
    finalSelectorResult.selector_data = extractFinalSelectors(
      finalSelectorResult.selector_set
    );
  } else {
    console.log({
      option_extraction_status: "[Failure]",
      optionExtractionKeys,
    });
    return null;
  }

  if (finalSelectorResult.selector_set.length) {
    return finalSelectorResult;
  }

  return null;
}

function generateOptionExtractionKeys(
  vp_candidate,
  optionCount,
  optionValueRack,
  optionsInJSON,
  vp_validation_data
) {
  let matchedAttributes = new Set();
  let selectors = new Set();
  let dataValuesMatched = new Set();
  let optionExtractionKeys = []; // used for selector assortment as per data-* value

  if (optionCount > 1) {
    let reducedOptionValueRack = vp_validation_data.fieldSetMap.filter(
      (index) => index !== -1
    );

    console.log({ optionValueRack });

    // for (let optionValueIndex in optionValueRack)
    for (let optionValueIndex of reducedOptionValueRack) {
      let optionExtKey = {
        optionAxis: optionsInJSON[optionValueIndex],
        ov_attribute: [],
        fs_cand: null,
      };

      let visually_present_fieldsets =
        vp_validation_data.visually_present_fs_cand_indices;
      for (let fs_cand_index of visually_present_fieldsets) {
        let fs_cand = vp_candidate.option_wrappers[fs_cand_index];
        let matching_ova_inFsCand =
          vp_validation_data.selector_yielding_ova_perFsCand[fs_cand_index];
        for (let ov_attribute of matching_ova_inFsCand) {
          const attributeSelector = `[${ov_attribute}="${CSS.escape(
            optionValueRack[optionValueIndex]
          )}"]`;
          const dataValueFound = fs_cand.querySelector(attributeSelector);
          if (dataValueFound) {
            matchedAttributes.add(ov_attribute);
            selectors.add(dataValueFound);
            dataValuesMatched.add(attributeSelector);
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
    let fs_cand = vp_validation_data.fieldSet;
    let optionExtKey = {
      optionAxis: optionValueRack,
      ov_attribute: [],
      fs_cand: null,
    };
    let matching_ova_inFsCand =
      vp_validation_data.selector_yielding_ova_perFsCand[0];

    for (let ov_attribute of matching_ova_inFsCand) {
      for (let optionValue of optionValueRack) {
        const attributeSelector = `[${ov_attribute}="${CSS.escape(
          optionValue
        )}"]`;
        const dataValueFound = fs_cand.querySelector(attributeSelector);
        if (dataValueFound) {
          matchedAttributes.add(ov_attribute);
          selectors.add(dataValueFound);
          dataValuesMatched.add(attributeSelector);
          // break;
          optionExtKey.fs_cand = fs_cand;
          optionExtKey.ov_attribute.push(ov_attribute);
        }
      }
    }
    if (optionExtKey.fs_cand) optionExtractionKeys.push(optionExtKey);
  }

  // finalizing the selectorResult for both optionCounts (1 and >1)
  let optionExtractionKeyData = {
    optionExtractionKeys,
    dataValuesMatched,
    matchedAttributes,
  };

  return optionExtractionKeyData;
}

function normalizeSelectorSetForMultiOptionCount_filtered_and_deduplicated(
  optionExtractionKeys,
  optionCount
) {
  let optionExtKeyCount = optionExtractionKeys.length;

  let finalSelectorSet = optionExtractionKeys.map((optionExtKey) => {
    let ov_attribute_array = Array.from(optionExtKey.ov_attribute);
    let fs_cand = optionExtKey.fs_cand;

    // Step 1: collect all selector sets per ov_attribute
    let rawSelectorSets = [];

    for (let ov_attribute of ov_attribute_array) {
      let selectorSet = new Set();

      let optionValuesInAxis =
        optionExtKeyCount > 1
          ? optionExtKey.optionAxis.values
          : optionCount > 1
          ? optionExtKey.optionAxis.values
          : optionExtKey.optionAxis;

      for (let optionValue of optionValuesInAxis) {
        const attributeSelector = `[${ov_attribute}="${CSS.escape(
          optionValue
        )}"]`;

        let el = fs_cand.querySelector(attributeSelector);
        if (el) selectorSet.add(el);
      }

      if (selectorSet.size) {
        rawSelectorSets.push({
          ov_attribute,
          selectors: selectorSet,
        });
      }
    }

    // Step 2: deduplicate by selector-set identity
    let dedupedResult = {};

    for (let i = 0; i < rawSelectorSets.length; i++) {
      let { ov_attribute, selectors } = rawSelectorSets[i];

      let isDuplicate = false;

      for (let existingAttr in dedupedResult) {
        let existingSet = dedupedResult[existingAttr];

        if (
          selectors.size === existingSet.length &&
          [...selectors].every((el) => existingSet.includes(el))
        ) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        dedupedResult[ov_attribute] = Array.from(selectors);
      }
    }

    return dedupedResult;
  });

  return finalSelectorSet;
}

// HELPER:
// Checks the selectors' validity :
function extractFinalSelectors(selector_set) {
  let extractedSelectorData = [];

  for (const optionAxisObject of selector_set) {
    const entries = Object.entries(optionAxisObject);

    // Fast path: only one candidate → accept without testing
    if (entries.length === 1) {
      const [[attribute_name, selectors]] = entries;
      extractedSelectorData.push({ attribute_name, selectors });
      continue;
    }

    // Slow path: ambiguity → test behaviorally
    for (const [ov_attribute, selectors] of entries) {
      let isSelectorVisible = false;
      isSelectorVisible = selectors.some((selector) =>
        isElementVisible(selector)
      );

      if (isSelectorVisible) {
        extractedSelectorData.push({
          attribute_name: ov_attribute,
          selectors,
        });
        break;
      }
    }
  }

  return extractedSelectorData;
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

function isValidVariantPicker(
  vp_candidate,
  optionCount,
  optionValuesRack,
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
    // "name",
  ];

  // execution check :
  console.log({
    "In isValidVariantPicker": true,
  });

  // check 1 : if none of the fs_cand in the vpc are visually present, return null
  // WHY NOT ENFORCE THE VISIBILITY OF ALL THE FS_CANDs ?
  // Sometimes, the secondary option axes are hidden by the theme if they have only one option value.

  // PRODUCTION :
  const visually_present_fs_cand_indices = vp_candidate.option_wrappers.reduce(
    (acc, fs_cand, index) => {
      const style = getComputedStyle(fs_cand);

      const isVisible =
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        parseFloat(style.opacity) > 0 &&
        fs_cand.offsetParent !== null &&
        fs_cand.getClientRects().length > 0;

      if (isVisible) acc.push(index);
      return acc;
    },
    []
  );

  if (visually_present_fs_cand_indices.length === 0) return null;

  // check 2 : the visually present fs_cand set and optionAxes have a 1:1 mapping

  // ov_attribute filteration :
  // check which ov_attribute are found in each fs_cand (even if visually hidden), remove needless combos
  let ov_attributes_filtered_per_fsCand = vp_candidate.option_wrappers.map(
    (fs_cand) => {
      let matched_ova = OPTION_VALUE_ATTRIBUTES.filter((ova) =>
        fs_cand.querySelector(`[${ova}]`)
      );
      return matched_ova;
    }
  );
  console.log({
    ov_attributes_filtered_per_fsCand,
  });

  let selector_yielding_ova_perFsCand = [];

  // IF optionCount === 1, you don't need to have 1:1 mapping with optionAxes
  // check : 1. the option_wrapper of the vp_candidate must be visible.
  // check : 2. You must have some ov_attributes in the fs_cand that give selectors for option values.
  if (optionCount === 1) {
    let selectorYieldingOVAList = ov_attributes_filtered_per_fsCand[0].filter(
      (ova) => {
        let attributeSelector = `[${ova}="${CSS.escape(optionValuesRack[0])}"]`;
        let fs_cand = vp_candidate.option_wrappers[0];
        return fs_cand.querySelector(attributeSelector);
      }
    );

    if (selectorYieldingOVAList.length > 0) {
      selector_yielding_ova_perFsCand.push(selectorYieldingOVAList);
      console.log({
        selector_yielding_ova_perFsCand,
      });
      return {
        selector_yielding_ova_perFsCand,
        fieldSet: vp_candidate.option_wrappers[0],
      };
    } else {
      return false;
    }
  }

  let fieldSetMap = new Array(optionCount).fill(-1);
  let fs_candidates = vp_candidate.option_wrappers; // we need to confirm 1:1 mapping only for the visually present fs_cands
  for (let fs_cand_index of visually_present_fs_cand_indices) {
    for (
      let optionAxisIndex = 0;
      optionAxisIndex < optionValuesRack.length;
      optionAxisIndex++
    ) {
      let selectorYieldingOVAList = ov_attributes_filtered_per_fsCand[
        fs_cand_index
      ].filter((ova) => {
        let attributeSelector = `[${ova}="${CSS.escape(
          optionValuesRack[optionAxisIndex]
        )}"]`;
        let fs_cand = fs_candidates[fs_cand_index];
        return fs_cand.querySelector(attributeSelector);
      });

      if (selectorYieldingOVAList.length > 0) {
        if (fieldSetMap[fs_cand_index] === -1) {
          fieldSetMap[fs_cand_index] = optionAxisIndex;
          selector_yielding_ova_perFsCand.push(selectorYieldingOVAList);
        } else {
          console.log({
            "isValidVariantPicker()": "1:1 mapping failed",
            fs_cand: fs_candidates[fs_cand_index],
          });
          return false;
        }
      }
    }
  }

  // return true;
  if (fieldSetMap.some((value) => value !== -1)) {
    console.log({
      selector_yielding_ova_perFsCand,
    });
    return {
      selector_yielding_ova_perFsCand,
      visually_present_fs_cand_indices,
      fieldSetMap,
    };
  }

  console.log({
    "inValidVariantPicker()":
      "No fs_cand is 1:1 mapped with option Axes in the current VPC",
  });

  return null;
}

async function test() {
  let targetData = {
    A__finalVariantPicker: null, //finalVariantPickerTest,
    B__validStructureVPC: null, //validStructuredVPC,
    C__regexMatchingVPCs: null, // regexMatchingVPC,
    D__parentNodeForVPCSearch: null, // {
    //  searchNode : candidateObject.parent,
    //  parentFoundInAnchorMode
    // }
    E__anchorData: null, //{
    //   nameIdElement: anchorProductFormData.validNameIdElement,
    //   anchorProductForm,
    // },
  };

  const anchorProductFormData = findAnchorProductForm();

  // Failure to find the anchorProductForm
  // INFERENCE: Our fundamental assumptions are violated by the theme. (Absolute Failure)
  if (!anchorProductFormData) {
    const statusObject = {
      status: "[TA7] Failed",
      cause: "variantID anchorForm not found",
    };
    console.log(statusObject);
    return targetData;
  }

  const anchorProductForm = anchorProductFormData.anchorProductForm;
  targetData.E__anchorData = {
    nameIdElement: anchorProductFormData.validNameIdElement,
    anchorProductForm,
  };

  // GET PRODUCT DATA
  const product = await getProductData();
  const optionNames = product.options.map((option) =>
    option.name.toLowerCase()
  );

  // Find a stable parent,
  // and look for regex-matching variant picker candidates in that parent
  let candidateObject = getParentNodeForVPCSearch(anchorProductForm, false);
  let parentFoundInAnchorMode = true;
  let regexMatchingVPC = getRegexMatchingVariantPickerCandidates(
    candidateObject.parent,
    product
  );

  // if variant picker candidates are not found in the current parentNode
  // look for the same in a higher parentNode.
  while (
    candidateObject &&
    !regexMatchingVPC.length &&
    !candidateObject.isBodyNext
  ) {
    parentFoundInAnchorMode = false;
    candidateObject = getParentNodeForVPCSearch(candidateObject.parent, true);
    regexMatchingVPC = getRegexMatchingVariantPickerCandidates(
      candidateObject.parent
    );
  }

  targetData.D__parentNodeForVPCSearch = {
    searchNode: candidateObject.parent,
    parentFoundInAnchorMode,
  };

  // Failure to find the variant picker candidates
  // INFERENCE : The variant picker regex might be insufficient
  if (!regexMatchingVPC.length) {
    console.log({
      status: "[TA7 failed] : No DOM node matched with variant picker regex",
    });
    return targetData;
  }

  targetData.C__regexMatchingVPCs = regexMatchingVPC;

  let validStructuredVPC = getVariantPickersHavingValidStructure(
    regexMatchingVPC,
    optionNames.length
  );

  if (!validStructuredVPC.length) {
    console.log({
      status: "[TA7 failed] : No regex matching VPC is structurally valid",
    });
    return targetData;
  }

  targetData.B__validStructureVPC = validStructuredVPC;

  let finalVariantPicker = null;
  let newOptionValueRack =
    product.options.length > 1
      ? product.options.map((option) => option.values[0])
      : product.options[0].values;

  for (const item of validStructuredVPC) {
    const finalSelectorResult = getCorrectVariantPickerWithSelectors(
      item,
      product.options.length,
      newOptionValueRack,
      product.options
    );

    if (finalSelectorResult) {
      item.selectors = finalSelectorResult.selector_data;
      item.selectorMetaData = {
        dataValuesMatched: finalSelectorResult.dataValuesMatched,
        matchedAttributes: finalSelectorResult.matchedAttributes,
        selector_set: finalSelectorResult.selector_set,
      };
      finalVariantPicker = item;
      break;
    }
  }

  // At this very juncture, the final variant picker, the fieldsets, the selectors
  // are supposed to be detected

  // For cross-checking
  // REMOVE WHEN READY FOR PRODUCTION.
  if (window.CAMOUFLAGEE && finalVariantPicker)
    finalVariantPicker.camouflage_selectors =
      window.CAMOUFLAGEE.items[0].selectors;

  if (finalVariantPicker) {
    finalVariantPicker = {
      a__vp_candidate: finalVariantPicker.vp_candidate,
      b__option_wrappers: finalVariantPicker.option_wrappers,
      c__selectors: finalVariantPicker.selectors,
      d__selector_meta_data: finalVariantPicker.selectorMetaData,
      e__camouflage_selectors:
        finalVariantPicker.camouflage_selectors ||
        "Camouflage not installed on store",
    };
    targetData.A__finalVariantPicker = finalVariantPicker;
  }

  if (targetData.A__finalVariantPicker) {
    return {
      "[TA7 VERDICT]": "Success",
      Variant_Picker: targetData.A__finalVariantPicker,
    };
  }

  return {
    "[TA7 VERDICT]": "Failure",
    targetData,
  };
}

await test();

// 1. [DONE] : place the selectors in their corresponding option-wrappers,
// 2. [DONE] : Filter out the correct selectors if there are strays in the selectors list.
// 3. Also, instead of option values, variantIds are used in the data-* values of the selectors. How would you tackle that issue ? https://innovadiscgolfcanada.ca/products/wombat3-proto-glow-champion
// 4. 3rd Party Variant Pickers

// CHECK THIS FIRST : https://evercraftatelier.com/products/wifey-est-couple-personalized-custom-unisex-sweatshirt-with-design-on-sleeve-gift-for-husband-wife-anniversary?variant=52663926522219
// our variant picker regex is failing

// THEN CHECK THIS : https://truekit.eu/products/true-kit-discovery
// here our logic of vpc as fieldsets and direct children of vpc is failing.
// [RESOLVED] :  Now checking all the descendants of the vp_candidate instead on only immediate children.

// [DONE] : Optimization in isVariantPickerValid() (Very important)
// [REQUIRED] : Enhance variant picker regex
// [REQUIRED] : Mutation-Observer requirement.
// [REQUIRED] : If you get two selector set such that both of them are visible, which would we select.
//      eg : https://evercraftatelier.com/products/wifey-est-couple-personalized-custom-unisex-sweatshirt-with-design-on-sleeve-gift-for-husband-wife-anniversary?variant=52663929012587
// [OPTIONAL] : 3rd Party Variant-pickers
