// HELPER:
// Find the theme invariant - input/select with name = id.
// Most shopify themes need an html element which will hold the id of the current variant
// for the add-to-cart / buy form submission.
// If this is found, we proceed ahead, if not, we revert to manual extraction.
function findAnchorProductForm() {
  /** DESCRIPTION:
   * Attempts to locate the product form that controls variant selection.
   *
   * WHY THIS EXISTS:
   * Most Shopify themes submit variant changes via an element named "id".
   * This function finds that anchor and walks upward to identify the
   * enclosing product form using regex heuristics.
   *
   * RETURNS:
   * - validNameIdElement: the actual input/select[name="id"]
   * - anchorProductForm: closest visible ancestor matching product form intent
   * - nameIdAnchors: all discovered variant ID anchors
   *
   * FAILURE MODE:
   * Returns null anchorProductForm when themes violate assumptions.
   */

  const anchors = Array.from(
    document.querySelectorAll('input[name="id"], select[name="id"]')
  );

  if (!anchors.length) {
    console.log("No anchors were found, revert to manual extraction");
    return {
      validNameIdElement: null,
      anchorProductForm: null,
      nameIdAnchors: [],
    };
  }

  const productFormRegex = /product[-_]*.*[-_]*form/i;

  let anchorProductForm = null;

  const validNameIdElement = anchors.find((el) => {
    anchorProductForm = findClosestRegexMatchedAncestor(el, productFormRegex);

    return Boolean(anchorProductForm);
  });

  return {
    validNameIdElement,
    anchorProductForm,
    nameIdAnchors: anchors,
  };
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

// HELPER :
// To check the visibilty of the element in question.
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
function getParentNodeForVPCSearch(
  node,
  specifiedDepth = null,
  recall = false
) {
  let current;
  let candidate;

  if (!recall) {
    // anchorProductForm mode
    current = node.parentElement;
    candidate = current;

    let maxDepth = specifiedDepth || 4;
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

function getCorrectVariantPickerWithSelectors(
  vp_candidate,
  optionCount,
  optionValueRack,
  optionsInJSON,
  vp_validation_data
) {
  let optionExtractionKeys = generateOptionExtractionKeys(
    vp_candidate,
    optionCount,
    optionValueRack,
    optionsInJSON,
    vp_validation_data
  );

  let finalSelectorResult = {};

  // verifying option extraction key generation
  let optionExtKeyGenSuccess = false;
  if (optionCount > 1) {
    optionExtKeyGenSuccess =
      optionExtractionKeys.length === vp_candidate.option_wrappers.length;
  } else {
    optionExtKeyGenSuccess = optionExtractionKeys.length === 1;
  }

  if (!optionExtKeyGenSuccess) {
    console.warn({
      option_extraction_status: "[Failure]",
      optionExtractionKeys,
    });
    return null;
  }

  // call the function to extract selectors per option Axis per ov_attribute
  finalSelectorResult.selector_set =
    normalizeSelectorSetForMultiOptionCount_filtered_and_deduplicated(
      optionExtractionKeys,
      optionCount
    );

  // at this point, if you get multiple set of selectors, they are
  // bound to be encoded by different ov_attribute.

  // get the final set of selectors from the selector_set
  finalSelectorResult.selector_data = extractFinalSelectors(
    finalSelectorResult.selector_set
  );

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
  let optionExtractionKeys = []; // used for selector assortment as per data-* value

  if (optionCount > 1) {
    let reducedOptionValueRackIndices = vp_validation_data.fieldSetMap.filter(
      (index) => index !== -1
    );

    // for (let optionValueIndex in optionValueRack)
    for (let optionValueIndex of reducedOptionValueRackIndices) {
      let optionExtKey = {
        optionAxis: optionsInJSON[optionValueIndex],
        ov_attribute: [],
        fs_cand: null,
      };

      for (let fs_cand_index in vp_candidate.option_wrappers) {
        let fs_cand = vp_candidate.option_wrappers[fs_cand_index];

        let matching_ova_inFsCand =
          vp_validation_data.selector_yielding_ova_perFsCand[fs_cand_index];

        for (let ov_attribute of matching_ova_inFsCand) {
          const attributeSelector = `[${ov_attribute}="${CSS.escape(
            optionValueRack[optionValueIndex]
          )}"]`;
          const dataValueFound = fs_cand.querySelector(attributeSelector);
          if (dataValueFound) {
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
          optionExtKey.fs_cand = fs_cand;
          optionExtKey.ov_attribute.push(ov_attribute);
        }
      }
    }
    if (optionExtKey.fs_cand) optionExtractionKeys.push(optionExtKey);
  }
  return optionExtractionKeys;
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
  /** DESCRIPTION:
   * Resolves the final selector set for each option axis.
   *
   * STRATEGY:
   * - If only one candidate → accept immediately
   * - If multiple candidates:
   *   • Prefer visible selector sets
   *   • Break ties via semantic tag priority
   *
   * WHY TAG PRIORITY EXISTS:
   * Inputs/options/buttons encode stronger user intent
   * than generic containers like div or li.
   */

  let extractedSelectorData = [];

  for (const optionAxisObject of selector_set) {
    const entries = Object.entries(optionAxisObject);

    // phase 1: only one candidate → accept without testing
    if (entries.length === 1) {
      const [[attribute_name, selectors]] = entries;
      extractedSelectorData.push({
        value_attribute: attribute_name,
        selectors,
      });
      continue;
    }

    // phase 2: multiple candidates → test visibility
    let isSelectorSetVisible = false;
    let finalSelectorSet = null;
    let visibleSelectorSet = [];
    let invisibleSelectorSet = [];

    for (const [ov_attribute, selectors] of entries) {
      isSelectorSetVisible = selectors.some(
        (selector) => isElementVisible(selector.parentElement)
        // We check the parent element's visibility to account for cases
        // where the selector itself might be hidden but its parent is visible.
      );

      if (isSelectorSetVisible) {
        visibleSelectorSet.push({ ov_attribute, selectors });
      } else {
        invisibleSelectorSet.push({ ov_attribute, selectors });
      }
    }

    // phase 2.1 : you have visible selector sets, choose from these only
    // if there are multiplse visible selector sets, choose the best one
    if (visibleSelectorSet.length) {
      if (visibleSelectorSet.length === 1) {
        finalSelectorSet = visibleSelectorSet[0];
      } else {
        finalSelectorSet = returnBestSelectorSet(visibleSelectorSet);
      }
    }
    // phase 2.2 : all selector sets are invisible, choose the best one
    else {
      finalSelectorSet = returnBestSelectorSet(invisibleSelectorSet);
    }

    finalSelectorSet = {
      value_attribute: finalSelectorSet.ov_attribute,
      selectors: finalSelectorSet.selectors,
    };

    extractedSelectorData.push(finalSelectorSet);
  }

  return extractedSelectorData;
}

function returnBestSelectorSet(selectorSetArray) {
  /** DESCRIPTION:
   * If you get multiple selector sets for an option axis,
   * this function selects the best one based on tag priority.
   *
   * STRATEGY:
   * - Define a priority list of HTML tags
   * - Evaluate each selector set's representative tag
   * - Select the set with the highest priority tag
   *
   * WHY THIS MATTERS:
   * Some themes use multiple hidden elements
   * to encode the same option values.
   * This heuristic helps pick the most semantically relevant one.
   *
   **/
  let selectorPriorityList_flat = [
    "input",
    "option",
    "button",
    "a",
    "li",
    "div",
    "label",
  ];

  let selectorCandidatesList = selectorSetArray.map((selectorSet, index) => {
    return {
      selectorRep: selectorSet.selectors[0].tagName.toLowerCase(),
      inSelSetIndex: index,
      selProListIndex: -1,
    };
  });

  // get the priority level of each selector set.
  for (let selectorCandidate of selectorCandidatesList) {
    let selectorRep = selectorCandidate.selectorRep;
    selectorCandidate.selProListIndex = selectorPriorityList_flat.findIndex(
      (tag) => tag === selectorRep
    );
  }

  let bestSelectorSet = selectorCandidatesList.reduce((best, curr) => {
    if (best.selProListIndex === -1) return curr;
    if (curr.selProListIndex === -1) return best;
    return curr.selProListIndex < best.selProListIndex ? curr : best;
  });

  return selectorSetArray[bestSelectorSet.inSelSetIndex];
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
  OPTION_VALUE_ATTRIBUTES
) {
  /** DESCRIPTION:
   * Validates whether a candidate variant picker is legitimate.
   *
   * VALIDATION CRITERIA:
   * 1. At least one option wrapper must be visible
   * 2. Option wrappers must map 1:1 with option axes
   * 3. Each wrapper must yield selectors for real option values
   *
   * SPECIAL CASES:
   * - Single-option products relax 1:1 constraints
   * - Numeric option values allow limited ambiguity
   *
   * RETURNS:
   * - vp_validation_data on success
   * - null on failure
   */

  // CHECK 1 : if none of the fs_cand in the vpc are visually present, return null
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

  if (visually_present_fs_cand_indices.length === 0) {
    console.log({
      Control_Function: "isValidVariantPicker()",
      Failure: "Variant picker is fully invisible",
      vp_candidate,
    });
    return null;
  }

  // CHECK 2 : the visually present fs_cand set and optionAxes have a 1:1 mapping

  // ov_attribute filteration :
  // check which ov_attribute are found in each fs_cand (even if visually hidden), remove needless combos
  let ov_attributes_filtered_per_fsCand = vp_candidate.option_wrappers.map(
    (fs_cand) => {
      let matched_ova = OPTION_VALUE_ATTRIBUTES.filter((ova) =>
        fs_cand.querySelector(`[${ova}]`)
      );
      if (matched_ova.length) return matched_ova;
      return [];
    }
  );

  // If you don't get OVA's for any fs_cand of a vp_candidate, its invalid
  // Our regex and structure validation logic sometimes return the valid fs_cand
  // vp_candidates, and it so happens that the true option_wrappers are not
  // contained in a regex-matching variant picker parent (headless variant-picker as I call them)
  // We, need to develop a logic to handle this edge case.
  if (
    ov_attributes_filtered_per_fsCand.every((ova_array) => !ova_array.length)
  ) {
    console.warn({
      Control_Function: "isValidVariantPicker()",
      Error: "Invalid vp_candidate",
      vp_candidate,
      ov_attributes_filtered_per_fsCand,
    });
    return null;
  }

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
      return {
        selector_yielding_ova_perFsCand,
        fieldSet: vp_candidate.option_wrappers[0],
      };
    } else {
      return null;
    }
  }

  // IF optionCount > 1
  // Logic Change : we are now checking for 1:1 mapping for all the fs_cands
  // why : to ferret out a fs_cand disguised as vp_candidate, in a disguised option wrapper,
  // not all the option_wrappers will map 1:1 with the option axes.

  let fieldSetMap = new Array(optionCount).fill(-1);
  let fs_candidates = vp_candidate.option_wrappers;
  let one2oneMappingDetected = false;

  for (
    let fs_cand_index = 0;
    fs_cand_index < vp_candidate.option_wrappers.length;
    fs_cand_index++
  ) {
    for (
      let optionAxisIndex = 0;
      optionAxisIndex < optionValuesRack.length;
      optionAxisIndex++
    ) {
      let ovaListForCurrentFsCand =
        ov_attributes_filtered_per_fsCand[fs_cand_index];

      if (!ovaListForCurrentFsCand.length) {
        selector_yielding_ova_perFsCand.push([]);
        continue;
      }

      let selectorYieldingOVAList =
        ov_attributes_filtered_per_fsCand[fs_cand_index];

      selectorYieldingOVAList = selectorYieldingOVAList.filter((ova) => {
        let attributeSelector = `[${ova}="${CSS.escape(
          optionValuesRack[optionAxisIndex]
        )}"]`;
        let fs_cand = fs_candidates[fs_cand_index];
        return fs_cand.querySelector(attributeSelector);
      });

      if (selectorYieldingOVAList.length > 0) {
        if (fieldSetMap[fs_cand_index] === -1) {
          one2oneMappingDetected = true;
          fieldSetMap[fs_cand_index] = optionAxisIndex;
          selector_yielding_ova_perFsCand.push(selectorYieldingOVAList);
        } else if (isNumericString(optionValuesRack[optionAxisIndex])) {
          continue;
        } else {
          console.log({
            "isValidVariantPicker()": "1:1 mapping failed",
            fs_cand: fs_candidates[fs_cand_index],
            vp_candidate,
          });
          return null;
        }
      }
    }
  }

  // If no fs_cand was 1:1 mapped with the option axes
  // return null
  if (!one2oneMappingDetected) {
    console.warn({
      Control_Function: "isValidVariantPicker()",
      message: "No 1:1 mapping detected",
      vp_candidate,
    });
    return null;
  } // else :

  let vp_validation_data = {
    selector_yielding_ova_perFsCand,
    fieldSetMap,
    // disguisedOptionWrapper: false,
  };

  return vp_validation_data;

  // we are checking for the count of those fs_cand that couldn't be
  // 1:1 mapped to any option axis.

  /*
  let mappedFscandCount = fieldSetMap.filter((v) => v !== -1).length;
  */
  // At this moment, it is implicit that the optionCount was > 1
  // So if despite optionCount > 1, we have only a single 1:1 mapping
  // It can mean only one thing :
  // We have an option_wrapper disguised as the variant picker.

  /*
   if (mappedFscandCount > 1) return vp_validation_data;
    console.warn({
      Control_Function: "isValidVariantPicker()",
      message: "Disguised Option wrapper",
      vp_candidate,
    });
  */

  /*
  return null;
  */

  // if the vp_candidate is a disguised option_wrapper,
  // we attach a disguisedOptionWrapper Boolean flag to the vp_validation_data
  // to let the test() function adjust accordingly.
  /**
   vp_validation_data.disguisedOptionWrapper = true;
    vp_validation_data.matchingOptionAxisIndex = fieldSetMap.find(
      (value) => value > -1
    );
    vp_validation_data.trueFsCand =
    vp_candidate.option_wrappers[fieldSetMap.findIndex((v) => v !== -1)];
    vp_validation_data.selector_yielding_ova_perFsCand =
      selector_yielding_ova_perFsCand.filter((array) => array.length);

    return vp_validation_data;
  */

  // ONE CAVEAT:
  // At this stage, the function can detect only those disguised vp_candidates
  // which were structurally verified. If some option_wrapper is not structurally verified
  // we will still miss it.
}

function isNumericString(value) {
  return (
    typeof value === "string" &&
    value.trim() !== "" &&
    !Number.isNaN(Number(value))
  );
}

function createVariantPicker(leafNodeSelectorsArr, optionCount) {
  // DESCRIPTION:
  /**: #region
   * Reconstructs a variant picker container from leaf selector nodes.
   *
   * MENTAL MODEL:
   * If multiple option elements belong to the same variant picker,
   * they must converge at a common ancestor.
   *
   * This function climbs upward from leaf nodes to find:
   * - The lowest common ancestor (LCA)
   * - That ancestor becomes the variant picker container
   *
   * PROCESS:
   * - Iteratively climb DOM parents from each leaf
   * - Track convergence points
   * - Detect the lowest ancestor that contains all leaf nodes
   *
   * SPECIAL HANDLING:
   * - Multi-option products:
   *   Option wrappers are inferred as direct children of the picker
   * - Single-option products:
   *   Structure is flattened and adjusted heuristically
   *
   * OUTPUT:
   * - variantPicker: the inferred container element
   * - option_wrappers: DOM nodes representing option axes
   *
   * FAILURE MODE:
   * Returns null if no stable ancestor convergence is found.
   */
  // #endregion

  if (!Array.isArray(leafNodeSelectorsArr) || !leafNodeSelectorsArr.length) {
    return null;
  }

  let interParents = [...leafNodeSelectorsArr];
  let flagSelectors = [
    leafNodeSelectorsArr[0],
    leafNodeSelectorsArr[leafNodeSelectorsArr.length - 1],
  ];
  let variantPicker = null;

  // Getting the variant picker;
  while (true) {
    // termination guard to avoid infinite loops
    if (
      interParents.every(
        (el) => !el || el === document.body || !el.parentElement
      )
    ) {
      return null;
    }

    // move one level up
    const tempParents = interParents
      .map((el) => el.parentElement)
      .filter(Boolean);

    // collect parents of option wrappers
    const parentSet = new Set(tempParents.map((el) => el.parentElement));

    // check if you get some parent in the parentSet which contains all the flagSelectors
    let LCA = Array.from(parentSet).find((parent) =>
      flagSelectors.every((flag) => parent.contains(flag))
    );

    // This LCA is that node, running querySelectorAll on which
    // can yield all the leafNodeSelectorsArr elements.

    // lowest common ancestor found
    if (LCA) {
      variantPicker = LCA;

      let option_wrappers = null;
      if (optionCount > 1) {
        option_wrappers = tempParents.map((temp) => {
          while (temp.parentElement !== variantPicker)
            temp = temp.parentElement;
          return temp;
        });
      } else {
        (option_wrappers = [LCA]), (variantPicker = LCA.parentElement);
      }

      return {
        variantPicker,
        option_wrappers,
        LCA
      };
    }
    // continue climbing
    interParents = tempParents;
  }
}

function createLeafNodeSelectorSets(
  selectorKeys,
  reduced_ova_array,
  optionCount
) {
  /** DESCRIPTION:
   * Generates coherent sets of leaf DOM nodes that represent
   * one possible instantiation of a variant picker.
   *
   * MENTAL MODEL:
   * Each option axis may be encoded using the same attribute
   * (e.g. data-value) but multiple elements may match.
   *
   * This function constructs selector combinations such that:
   * - Each option axis contributes exactly one leaf node
   * - No two axes reuse the same DOM element
   *
   * PROCESS:
   * - Iterate over each viable option-value attribute
   * - For that attribute:
   *   • Select one DOM node per option axis
   *   • Ensure uniqueness via index tracking
   *
   * WHY THIS EXISTS:
   * Variant pickers often reuse attributes across axes.
   * We must explore valid combinations without collisions.
   *
   * OUTPUT:
   * - An array of selector sets
   *   Each set is a candidate “leaf representation” of a variant picker
   *
   * CRITICAL INVARIANT:
   * Each returned set can theoretically represent a real variant picker.
   * Invalid combinations are filtered later.
   */

  // console.log({ rawSetectorKeys: selectorKeys, reduced_ova_array });
  let variantPickerKeySets = [];

  reduced_ova_array.forEach((ova) => {
    let variantPickerKey = [];
    let occupiedIndexSet = new Set();
    selectorKeys.forEach((selectorKey) => {
      if (!Object.hasOwn(selectorKey, ova) || !selectorKey[ova].length) {
        return;
      }

      if (selectorKey[ova].length === 1 || optionCount === 1) {
        variantPickerKey.push(selectorKey[ova][0]);
        occupiedIndexSet.add(0);
      } else {
        let firstAvailIndex = selectorKey[ova].findIndex(
          (val, index) => !occupiedIndexSet.has(index)
        );
        occupiedIndexSet.add(firstAvailIndex);
        variantPickerKey.push(selectorKey[ova][firstAvailIndex]);
      }
    });
    variantPickerKeySets.push(variantPickerKey);
  });

  // console.log({ variantPickerKeySets });
  return variantPickerKeySets;
}

function makeOVAKeysforOptionAxes(
  searchNode,
  optionValueRack,
  OPTION_VALUE_ATTRIBUTES
) {
  /** DESCRIPTION:
   * Constructs attribute-based selector keys for each option axis
   * using known product option values.
   *
   * MENTAL MODEL:
   * We already know the truth from product JSON:
   *   → option axes exist
   *   → option values are real
   *
   * This function asks:
   *   “Where in the DOM do these option values appear,
   *    and through which attributes?”
   *
   * PROCESS:
   * - For each option value:
   *   • Probe the searchNode for elements carrying that value
   *     via known OPTION_VALUE_ATTRIBUTES (data-*, aria-*, etc.)
   * - Record which attributes actually yield matches
   * - Gradually reduce the attribute set to only productive ones
   *
   * WHY THIS EXISTS:
   * DOM structure is unreliable across Shopify themes.
   * Attribute-value relationships are more semantically stable.
   *
   * OUTPUT:
   * - selectorKeys:
   *   One object per option axis, mapping attributes → matching elements
   * - reduced_ova_array:
   *   The minimal set of attributes that actually yielded selectors
   *
   * IMPORTANT GUARANTEE:
   * Returned attributes are empirically verified to encode option values.
   * Everything downstream relies on this fact.
   */

  let reduced_ova_array = OPTION_VALUE_ATTRIBUTES;
  let temp_ova_set = new Set();
  let selectorKeys = [];

  optionValueRack.forEach((optionValue, index) => {
    let selectorKey = {
      A1__optionValue: optionValue,
      index,
    };

    reduced_ova_array.forEach((ova) => {
      let attributeSelector = `[${ova}="${CSS.escape(optionValue)}"]`;
      let selectors = Array.from(
        searchNode.querySelectorAll(attributeSelector)
      );

      if (selectors.length) {
        if (Object.hasOwn(selectorKey, ova)) {
          selectorKey[ova].push(...selectors);
        } else {
          temp_ova_set.add(ova);
          selectorKey[ova] = [];
          selectorKey[ova].push(...selectors);
        }
      }
    });

    if (temp_ova_set.size) {
      // Array.from(temp_ova_set).forEach(ova => {
      //   if( !reduced_ova_array.includes(ova) )
      //     reduced_ova_array.push(ova);
      // })

      reduced_ova_array = Array.from(temp_ova_set);
    }
    temp_ova_set.clear();
    selectorKeys.push(selectorKey);
  });

  return { selectorKeys, reduced_ova_array };
}

function getVariantPickersByRevCon(searchNode, product) {
  /** DESCRIPTION:
   * Discovers candidate variant pickers via reverse construction.
   *
   * CORE STRATEGY:
   * Instead of searching for known variant picker patterns,
   * we:
   *   1. Start from known option values (product truth)
   *   2. Discover where they appear in the DOM
   *   3. Reconstruct structure upward
   *
   * ------------------------------------------------------------
   * OPTION VALUE RACK (CRITICAL CONCEPT)
   * ------------------------------------------------------------
   *
   * optionValueRack represents the *probe values* used to locate
   * option axes in the DOM.
   *
   * These are NOT exhaustive option values.
   * They are *representative* values chosen to reverse-map structure.
   *
   * Case 1: optionCount > 1 (multi-axis product)
   * ------------------------------------------------
   * product.options = [
   *   { name: "Color", values: ["Red", "Blue"] },
   *   { name: "Size",  values: ["S", "M", "L"] }
   * ]
   *
   * optionValueRack becomes:
   *   ["Red", "S"]
   *
   * RATIONALE:
   * - One value per option axis is sufficient to detect structure
   * - Reduces combinatorial explosion
   * - Structural mapping does not require all values
   *
   * Each value acts as an axis "beacon" in the DOM.
   *
   * ------------------------------------------------
   * Case 2: optionCount === 1 (single-axis product)
   * ------------------------------------------------
   * product.options = [
   *   { name: "Size", values: ["S", "M", "L"] }
   * ]
   *
   * optionValueRack becomes:
   *   ["S", "M", "L"]
   *
   * RATIONALE:
   * - Single-axis products encode all values in one wrapper
   * - We must probe *all* values to extract selector sets
   *
   * ------------------------------------------------------------
   *
   * PIPELINE:
   * - Build optionValueRack from product JSON
   * - Extract attribute-based selector keys using known attributes
   * - Generate leaf selector combinations
   * - Reconstruct variant picker candidates via ancestor convergence
   *
   * ADAPTIVE LOGIC:
   * - If not all option axes are detected:
   *   • Reduce problem scope
   *   • Retry with partial axes
   *
   * FAILURE SIGNAL:
   * Returns null when:
   * - No attribute convergence occurs
   * - Attribute search space remains unfiltered
   *
   * OUTPUT:
   * - variantPickerSet:
   *   Candidate variant picker structures
   * - OPTION_VALUE_ATTRIBUTES:
   *   Reduced attribute set that yielded matches
   * - optionValueRack, optionCount
   *
   * ROLE IN SYSTEM:
   * This function does NOT validate correctness.
   * It only proposes plausible candidates.
   * Validation happens downstream.
   */

  let OPTION_VALUE_ATTRIBUTES = [
    "value",
    "data-option-value",
    "data-value",
    "data-variant",
    "data-selected-value",
    "data-value-handle",
    "data-option-handle",
    "data-handle",
    "data-option-key",
    "data-key",
    "data-option",
    "data-option-index",
    "data-index",
    "data-name",
    "data-current-value",
    "orig-value",
    "aria-label",
    "aria-valuetext",
  ];

  // GET PRODUCT DATA
  let optionCount = product.options.length;

  // MAKE OPTION VALUE RACK
  let optionValueRack =
    product.options.length > 1
      ? product.options.map((option) => option.values[option.values.length - 1])
      : product.options[0].values;

  let { selectorKeys, reduced_ova_array } = makeOVAKeysforOptionAxes(
    searchNode,
    optionValueRack,
    OPTION_VALUE_ATTRIBUTES
  );

  let populatedSelectorKeys = selectorKeys.filter((selKey) =>
    reduced_ova_array.some((ova) => Object.hasOwn(selKey, ova))
  );

  if (optionCount > 1 && populatedSelectorKeys.length != optionCount) {
    console.warn({
      Control_Function: "Not all fieldsets are present",
      Pivot: "Remaking the selectorKeys for the populated Option Axes...",
      populatedSelectorKeys,
    });

    /** RATIONALE FOR AXIS REDUCTION
     * AXIS REDUCTION — WHY THIS IS SAFE AND NECESSARY
     *
     * CONTEXT:
     * At this point, not all option axes were detected in the DOM.
     * This does NOT immediately mean failure.
     *
     * WHY AXES MAY BE MISSING:
     * - Themes may hide secondary option axes
     * - Some axes may have a single value and be visually suppressed
     * - Variant pickers may be progressively revealed via JS
     *
     * CORE INSIGHT:
     * Variant picker *structure* can be inferred from a subset of axes.
     *
     * Structural truth ≠ Exhaustive value coverage
     *
     * STRATEGY:
     * - Identify which option axes successfully yielded selectors
     * - Reduce the problem space to only those axes
     * - Re-run reverse construction using the reduced axis set
     *
     * CASES:
     * 1) Only one axis detected:
     *    → Treat as single-option product
     *    → Use all values from that axis
     *
     * 2) Multiple axes detected:
     *    → Use one representative value per detected axis
     *
     * WHY THIS WORKS:
     * - DOM structure (parents, wrappers, containers) is shared
     *   across all option axes
     * - Missing axes rarely introduce new containers
     * - Structural convergence remains stable
     *
     * FAILURE GUARANTEE:
     * If reduced-axis reconstruction is incorrect,
     * downstream validation (1:1 mapping & selector checks)
     * will reject the candidate.
     *
     * In other words:
     * Axis reduction increases recall,
     * validation preserves precision.
     */

    let matchedAxisIndices = populatedSelectorKeys.map((psk) => psk.index);
    if (matchedAxisIndices.length === 1) {
      optionValueRack = product.options[matchedAxisIndices[0]].values;
      optionCount = 1;
    } else {
      optionValueRack = matchedAxisIndices.map(
        (index) => product.options[index][0]
      );
      optionCount = matchedAxisIndices.length;
    }

    let newSelectorKeyData = makeOVAKeysforOptionAxes(
      searchNode,
      optionValueRack,
      reduced_ova_array
    );
    ({ selectorKeys, reduced_ova_array } = newSelectorKeyData);
  }

  let variantPickerKeySets = createLeafNodeSelectorSets(
    selectorKeys,
    reduced_ova_array,
    optionCount
  );
  // console.log({ variantPickerKeySets });
  let finalVariantPickerSet = variantPickerKeySets.map((set) =>
    createVariantPicker(set, optionCount)
  );

  if (
    !finalVariantPickerSet.length ||
    reduced_ova_array.length === OPTION_VALUE_ATTRIBUTES.length
  ) {
    console.warn({
      Control_Function: "getVariantPickersByRevCon()",
      Failure: "could not extract the variant picker",
    });
    return null;
  }

  return {
    OPTION_VALUE_ATTRIBUTES: reduced_ova_array,
    variantPickerSet: finalVariantPickerSet,
    optionValueRack,
    optionCount,
    variantPickerKeySets
  };
}

async function test(getFullData = false) {
  let targetData = {
    A__finalVariantPicker: null,
    B__parentNodeForVPCSearch: null,
    C__anchorData: null,
  };

  const anchorProductFormData = findAnchorProductForm();

  const anchorProductForm = anchorProductFormData.anchorProductForm;

  // Failure to find the anchorProductForm
  // INFERENCE: Our fundamental assumptions are violated by the theme. (Absolute Failure)
  if (!anchorProductForm && !anchorProductFormData.nameIdAnchors.length) {
    console.error({
      status: "[TA7] Failed",
      cause: "variantID anchorForm not found",
    });
    return targetData;
  }


  targetData.C__anchorData = {
    nameIdElement: anchorProductFormData.validNameIdElement,
    anchorProductForm,
    nameIdAnchors: anchorProductFormData.nameIdAnchors,
  };

  // GET PRODUCT DATA
  const product = await getProductData();
  const optionNames = product.options.map((option) =>
    option.name.toLowerCase()
  );

  // Find a stable parent,
  let anchorHook =
    anchorProductForm ||
    anchorProductFormData.nameIdAnchors.find((anchor) =>
      isElementVisible(anchor.parentElement)
    );

  let candidateObject;
  if (anchorHook === anchorProductForm)
    candidateObject = getParentNodeForVPCSearch(anchorHook, null, false);
  else candidateObject = getParentNodeForVPCSearch(anchorHook, 5, false);
  let parentFoundInAnchorMode = true;

  targetData.B__parentNodeForVPCSearch = {
    searchNode: candidateObject.parent,
    parentFoundInAnchorMode,
  };

  let variantPickerGenData = getVariantPickersByRevCon(
    candidateObject.parent,
    product
  );

  if (!variantPickerGenData) {
    console.error({
      status: "[TA7] Failed",
      cause: "No variant picker candidates found",
    });
    return null;
  }

  targetData.D__variantPickerGenData = variantPickerGenData;

  let {
    variantPickerSet,
    OPTION_VALUE_ATTRIBUTES,
    optionValueRack,
    optionCount,
  } = variantPickerGenData;

  let finalVariantPicker = null;
  for (const item of variantPickerSet) {
    const vp_validation_data = isValidVariantPicker(
      item,
      optionCount,
      optionValueRack,
      OPTION_VALUE_ATTRIBUTES
    );

    // no 1:1 mapping in item : DISCARD and continue;
    if (!vp_validation_data) continue;

    // true variant picker detected : success
    const finalSelectorResult = getCorrectVariantPickerWithSelectors(
      item,
      optionCount,
      optionValueRack,
      product.options,
      vp_validation_data
    );

    // testing purpose :
    console.log({ Control_Function: "test()", vp_validation_data });

    if (finalSelectorResult) {
      item.selectors = finalSelectorResult.selector_data;
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

  // Final normalization of the Variant Picker:
  if (finalVariantPicker) {
    let option_wrappers_with_selectors = finalVariantPicker.option_wrappers.map(
      (ow, index) => {
        let sample_selector = finalVariantPicker.selectors[index].selectors[0];
        let selector_tagName = sample_selector.tagName.toLowerCase();
        let selector_type =
          selector_tagName === "option" ? "select" : selector_tagName;
        let selectors =
          selector_type === "select"
            ? sample_selector.parentElement
            : finalVariantPicker.selectors[index].selectors;

        return {
          field_selector: ow,
          selectors,
          selector_type,
          value_attribute: finalVariantPicker.selectors[index].value_attribute,
        };
      }
    );

    finalVariantPicker = {
      variantPicker: finalVariantPicker.variantPicker,
      option_wrappers_with_selectors,
      variantIdField : anchorProductFormData.validNameIdElement,
      observer_container : candidateObject.parent,
      z__camouflage_selectors:
        finalVariantPicker.camouflage_selectors ||
        "Camouflage not enabled on store",
    };
    targetData.A__finalVariantPicker = finalVariantPicker;
  }

  // confirming product data :
  console.log({
    optionNames,
    optionCount: optionNames.length,
  });

  if (targetData.A__finalVariantPicker) {
    let TA7_Success_Object = {
      "[TA7 VERDICT]": "Success",
      // Variant_Picker: targetData.A__finalVariantPicker,
    };

    if (!getFullData) {
      TA7_Success_Object.Variant_Picker = targetData.A__finalVariantPicker;
    } else {
      TA7_Success_Object.Full_Data = targetData;
    }

    console.log({ TA7_Success_Object });
    return targetData.A__finalVariantPicker;
  }

  console.error({
    status: "[TA7] Failed",
    cause: "No variant picker candidates found",
  });
  return targetData;
}

await test();
