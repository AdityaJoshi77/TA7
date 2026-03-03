

// module level WeakSet for node list to be rejected since they aren't selectors but wrap them.
let rejectedSelectorWrapper = new WeakSet();
let globalCacheData = null;

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


  // DEPRECATED: 
  // const productFormRegex = /product[-_]*.*[-_]*form/i;
  // const validNameIdElement = anchors.find((el) => {
  //   anchorProductForm = findClosestRegexMatchedAncestor(el, productFormRegex);
  //   return Boolean(anchorProductForm);
  // });

  const validNameIdElement = anchors.find(anchor => isElementVisible(anchor.parentElement))

  return {
    validNameIdElement,
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

  let addToCartButton = null;
  if (candidate) {
    addToCartButton = candidate.querySelector('button[type=submit]');
  }

  return {
    addToCartButton,
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
  encodingIndex,
  productOptions,
  vp_validation_data
) {
  let optionExtractionKeys = generateOptionExtractionKeys(
    vp_candidate,
    optionCount,
    optionValueRack,
    encodingIndex,
    productOptions,
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
    generateSelectorsfromOpexKeys(optionExtractionKeys);

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
  encodingIndex,
  productOptions,
  vp_validation_data
) {
  let optionExtractionKeys = []; // used for selector assortment as per data-* value
  console.log({vp_validation_data});

  if (optionCount > 1) {
    optionExtractionKeys = vp_validation_data.fieldSetMap.map(
      (optionAxisIndex, mapIndex) => {
        return {
          optionAxis: productOptions[optionAxisIndex].values[encodingIndex],
          ov_attribute:
            vp_validation_data.selector_yielding_ova_perFsCand[mapIndex],
          fs_cand: vp_candidate.option_wrappers[mapIndex],
        };
      }
    );
  } else {
    optionExtractionKeys.push({
      optionAxis: optionValueRack,
      ov_attribute: vp_validation_data.selector_yielding_ova_perFsCand[0],
      fs_cand: vp_validation_data.fieldSet,
    });
  }

  console.log({ optionExtractionKeys });
  return optionExtractionKeys;
}

function generateSelectorsfromOpexKeys(optionExtractionKeys) {
  let finalSelectorSet = optionExtractionKeys.map((optionExtKey, opexKeyIndex) => {
    let ov_attribute_array = Array.from(optionExtKey.ov_attribute);
    let fs_cand = optionExtKey.fs_cand;

    // Step 1: collect all selector sets per ov_attribute
    let rawSelectorSets = [];

    for (let ov_attribute of ov_attribute_array) {
      let selectorSet = new Set();

      let optionValuesInAxis = optionExtKey.optionAxis;

      for (let i = 0; i < optionValuesInAxis.length; i++) {
        let optionValue = optionValuesInAxis[i];
        let attributeSelector = `[${ov_attribute}="${CSS.escape(
          optionValue
        )}"]`;

        let el;
        if (!globalCacheData) {
          let matches = [...fs_cand.querySelectorAll(attributeSelector)];
          el = matches.find(node => !rejectedSelectorWrapper.has(node));
        } else {
          const { input_selector_types } = globalCacheData;
          attributeSelector = input_selector_types[opexKeyIndex] + attributeSelector;
          el = fs_cand.querySelector(attributeSelector);
        }

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

  console.log({finalSelectorSet});
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

    if (!entries.length) {
      console.warn({
        Control_Function: "extractFinalSelectors()",
        error: "current option axis is empty",
        data: selector_set,
        entries
      })
      return null;
    }

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

    if (!finalSelectorSet) {
      console.warn({
        Control_Function: "extractFinalSelectors()",
        error: "could not extract selectors for current option axis",
        data: optionAxisObject
      })
      return null;
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
  let selectorPriorityList = [
    // Tier 1 — native interactive
    "input",
    "option",
    "button",
    "a",
    "li",
    "div",
    "label",

    // Tier 2 — semantic containers
    "ul",
    "fieldset",

    // Tier 3 — custom UI containers
    "span",
    "p",
    "strong",

    // Tier 4 — media & visual selectors
    "img",
    "picture",
    "svg",
    "path"
  ];

  if (!selectorSetArray.length) {
    console.warn({
      Control_Function: "returnBestSelectorSet()",
      error: "selectorSetArray is empty",
    })
    return null;
  }

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
    selectorCandidate.selProListIndex = selectorPriorityList.findIndex(
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
  OPTION_VALUE_ATTRIBUTES,
  matchedAxisIndices
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

  /** DEPRECATED : VISIBILITY CONFIRMATION
     const visually_present_fs_cand_indices = vp_candidate.option_wrappers.reduce(
      (acc, fs_cand, index) => {
        if (isElementVisible(fs_cand)) acc.push(index);
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
   */

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

  // let selector_yielding_ova_perFsCand = [];
  let selector_yielding_ova_perFsCand = new Array(optionCount).fill(null);


  // IF optionCount === 1, you don't need to have 1:1 mapping with optionAxes
  // check : 1. the option_wrapper of the vp_candidate must be visible.
  // check : 2. You must have some ov_attributes in the fs_cand that give selectors for option values.
  if (optionCount === 1) {
    let selectorYieldingOVAList = ov_attributes_filtered_per_fsCand[0].filter(
      (ova) => {
        let attributeSelector = `[${ova}="${CSS.escape(optionValuesRack[0])}"]`;
        let fs_cand = vp_candidate.option_wrappers[0];
        let selectorFound = fs_cand.querySelector(attributeSelector);

        return selectorFound && isElementVisible(selectorFound.parentElement);
        // why check visibility ? 
        // To ensure that only an interactable selector is taken into account when verifying 1:1 mapping,
        // This happens when some option axis of the true variant picker have been hidden,
        // and the active axis is in some other DOM wrapper,
        // in this case, the earlier variant picker DOM node becomes the new fs_cand for the active option axis
        // and including the selector of the hidden option axis can incorrectly fail the 1:1 mapping check.
      }
    );

    if (selectorYieldingOVAList.length > 0) {
      // selector_yielding_ova_perFsCand.push(selectorYieldingOVAList);
      selector_yielding_ova_perFsCand[0] = selectorYieldingOVAList;
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
  let axisOccupied = new Array(optionCount).fill(false);
  let fs_candidates = vp_candidate.option_wrappers;
  // let one2oneMappingDetected = false;
  console.log({optionValuesRack});
  for (
    let fs_cand_index = 0;
    fs_cand_index < vp_candidate.option_wrappers.length;
    fs_cand_index++
  ) {
    let fs_cand = fs_candidates[fs_cand_index];
    let ovaListForCurrentFsCand =
      ov_attributes_filtered_per_fsCand[fs_cand_index];

    if (!ovaListForCurrentFsCand.length) {
      // selector_yielding_ova_perFsCand.push([]);
      // continue;
      console.warn({
        Control_Function: "isValidVariantPicker()",
        error: "Current option_wrapper has no value_attributes",
        fs_cand
      });
      return null;
    }
    for (
      let optionAxisIndex = 0;
      optionAxisIndex < optionValuesRack.length;
      optionAxisIndex++
    ) {
      let selectorYieldingOVAList =
        ov_attributes_filtered_per_fsCand[fs_cand_index];

      selectorYieldingOVAList = selectorYieldingOVAList.filter((ova) => {
        let attributeSelector = `[${ova}="${CSS.escape(
          optionValuesRack[optionAxisIndex]
        )}"]`;

        let selectorFound = fs_cand.querySelector(attributeSelector);
        console.log({ fs_cand, optionValue: optionValuesRack[optionAxisIndex], selectorFound });


        return selectorFound && isElementVisible(selectorFound.parentElement);
        // why check visibility ? 
        // To ensure that only an interactable selector is taken into account when verifying 1:1 mapping,
        // This happens when some option axis of the true variant picker have been hidden,
        // and the active axis is in some other DOM wrapper,
        // in this case, the earlier variant picker DOM node becomes the new fs_cand for the active option axis
        // and including the selector of the hidden option axis can incorrectly fail the 1:1 mapping check. 
      });

      if (selectorYieldingOVAList.length > 0) {
        if (!axisOccupied[optionAxisIndex] && fieldSetMap[fs_cand_index] === -1) {
          // fieldSetMap[fs_cand_index] = optionAxisIndex;
          fieldSetMap[fs_cand_index] = matchedAxisIndices[optionAxisIndex];
          axisOccupied[optionAxisIndex] = true;
          // selector_yielding_ova_perFsCand.push(selectorYieldingOVAList);
          selector_yielding_ova_perFsCand[fs_cand_index] = selectorYieldingOVAList;

          // axis mapped with the wrapper, 1:1 mapping was ensured earlier during DFS + LCA phase
          // so just move the next fs_cand. 
          break;

          // if (isNumericString(optionValuesRack[optionAxisIndex])) {
          //   break;
          // }
        }

        // DEPRECATED : FALSE FAILURE OF 1:1 MAPPING.
        // else {
        //   console.log({
        //     "isValidVariantPicker()": "1:1 mapping failed",
        //     fs_cand: fs_candidates[fs_cand_index],
        //     vp_candidate,
        //   });
        //   return null;
        // }
      }
    }
  }

  // If no fs_cand was 1:1 mapped with the option axes
  // return null
  if (fieldSetMap.some(v => v === -1)) {
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

  if ((leafNodeSelectorsArr).filter(Boolean).length < optionCount) {
    console.warn({
      Control_Function: "createVariantPicker()",
      message: "Leaf selectors count does not match active optionCount",
      leafNodeSelectorsArr
    })
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

    // POTENTIAL FAILURE :
    // LCA logic will construct an incorrect variant picker
    // if (say) there are three option axes, but
    // the immediate children of LCA are two.

    // solution : Once LCA is detected, begin climbing downwards
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
          while (temp && temp.parentElement !== variantPicker) {
            temp = temp.parentElement;
          }
          return temp;
        });
      } else {
        option_wrappers = [LCA];
        variantPicker =
          LCA.parentElement.tagName === 'FIELDSET'
            ? LCA.parentElement.parentElement
            : LCA.parentElement;
        // hardcode for the swatch_king app
      }


      let mergeVerificationSet = new Set(option_wrappers);
      if (mergeVerificationSet.size < optionCount) {
        /* WHY ?:
          If the leafNodeSelectors given by createLeafNodeSelectorSets() is wrong,
          i.e. it has more than one selector that come from same semantic wrapper,
          the option_wrappers will merge into one another, resuling in fewer option_wrappers than optionCount.
        */

        console.warn({
          Control_Function: "createVariantPicker()",
          message: "option_wrappers merged, resolving...",
          leafSelectors: leafNodeSelectorsArr
        })
        let mergeNode = Array.from(mergeVerificationSet).find(node => flagSelectors.every(sel => node.contains(sel)));

        if (!mergeNode) {
          console.warn({
            Control_Function: "createVariantPicker()",
            message: "Merge resolution failed — invalid wrapper configuration",
            leafSelectors: leafNodeSelectorsArr
          });
          return null;
        }

        variantPicker = mergeNode;
        let tempParentsForMerge = [...leafNodeSelectorsArr];
        option_wrappers = tempParentsForMerge.map(temp => {
          while (temp.parentElement !== variantPicker)
            temp = temp.parentElement;
          return temp;
        })
      }

      return {
        variantPicker,
        option_wrappers,
        LCA,
      };
    }
    // continue climbing
    interParents = tempParents;
  }
}

function variantPickerKeyBuilder(currArrIdx, interArrSet, partialVPKey, firstSelector, lastSelector, optionCount) {
  if (currArrIdx === interArrSet.length) {
    let variantPickerKey = [firstSelector, ...partialVPKey, lastSelector];
    let result = createVariantPicker(variantPickerKey, optionCount);
    if (!result)
      return null;

    return variantPickerKey;
    // we could have returned the variantPicker directly
    // Remove this redundancy in the later iterations.
  }

  for (let i = 0; i < interArrSet[currArrIdx].length; i++) {
    partialVPKey.push(interArrSet[currArrIdx][i]);
    let result = variantPickerKeyBuilder(currArrIdx + 1, interArrSet, partialVPKey, firstSelector, lastSelector, optionCount);

    if (!result) {
      partialVPKey.pop();
    } else {
      return result;
    }
  }

  return null;
}

function createLeafNodeSelectorsSets(
  selectorKeys,
  reduced_ova_array,
  optionCount
) {
  let variantPickerKeySets = [];

  if (optionCount === 1) {
    reduced_ova_array.forEach((ova) => {
      let variantPickerKey = [];
      selectorKeys.forEach((selectorKey) => {
        if (!Object.hasOwn(selectorKey, ova) || !selectorKey[ova].length) {
          return;
        }
        variantPickerKey.push(selectorKey[ova][0]);
      })
      variantPickerKeySets.push(variantPickerKey);
    })

    console.log({ variantPickerKeySets });
    return variantPickerKeySets;
  }

  // 1. Take all [ova] arrays from the selectorKeys
  let ovaSelectorsCollection = reduced_ova_array.map(ova => {
    let selectorCollectionPerOptionAxis = [];
    selectorKeys.forEach(selectorKey => {
      if (!Object.hasOwn(selectorKey, ova) || !selectorKey[ova].length) {
        return;
      }
      selectorCollectionPerOptionAxis.push(selectorKey[ova]);
    })
    return selectorCollectionPerOptionAxis
  });

  ovaSelectorsCollection.forEach(collection => {

    // Each array in the collection holds the selectors found for each optionValue in the Rack
    // the first array gives the selectors for the first option, for which we take collection[0][0]
    // the last array gives the selectors for the last option, for which we take collection.at(-1).at(-1);

    // 2. Take the first selector from the [ova] array of the first selectorKey (confirmed W1)
    let firstSelector = collection[0][0];
    // 3. Take the last selector from the [ova] array of the last selectorKey (confirmed W999)
    let lastSelector = collection.at(-1).at(-1);
    if (collection.length === 2) {
      variantPickerKeySets.push([firstSelector, lastSelector]);
      return;
    }

    // the interArrSet is the group of all the intermediate arrays in the collection
    // these are the selectors for the option values enclosed by the first and the last value in the rack.
    let interArrSet = collection.filter((arr, idx, collection) => (idx > 0 && idx < collection.length - 1));
    console.log({ interArrSet });
    let variantPickerKey = variantPickerKeyBuilder(0, interArrSet, [], firstSelector, lastSelector, optionCount);

    if (variantPickerKey) {
      variantPickerKeySets.push(variantPickerKey);
      console.log({ variantPickerKey });
    }
  })

  return variantPickerKeySets;
}


function isPureLeaf(node, attrSelector) {
  // return !node.querySelector(attrSelector);
  // this will prevent inclusion of selectors from hidden variant pickers
  if (!isElementVisible(node.parentElement)) {
    console.log({ node, message: "selector is not visible" });
    return false;
  }

  if (node.querySelector(attrSelector)) {
    console.log({ node, message: "the node is a wrapper of true selector" });
    rejectedSelectorWrapper.add(node);
    return false;
  }

  return true;
}


function makeOVAKeysForOptionAxes(
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

  let reduced_ova_set = new Set();
  let selectorKeys = [];

  optionValueRack.forEach((optionValue, index) => {
    let selectorKey = {
      A1__optionValue: optionValue,
      index,
    };

    OPTION_VALUE_ATTRIBUTES.forEach((ova) => {
      const attributeSelector = `[${ova}="${CSS.escape(optionValue)}"]`;

      let selectors = Array.from(
        searchNode.querySelectorAll(attributeSelector)
      ).filter(selector => isPureLeaf(selector, attributeSelector));

      if (selectors.length) {
        reduced_ova_set.add(ova); // accumulate globally

        if (!selectorKey[ova]) selectorKey[ova] = [];
        selectorKey[ova].push(...selectors);
      }
    });

    selectorKeys.push(selectorKey);
  });

  return {
    selectorKeys,
    reduced_ova_array: Array.from(reduced_ova_set),
  };
}

function selectorEncodingValidator(
  searchNode,
  OPTION_VALUE_ATTRIBUTES,
  optionValueRack_literal,
  optionValueRack_id = null
) {
  let encodingFormat = -1;
  let rackSize = optionValueRack_literal.length;
  // let attributeSelector = `[${ova}="${CSS.escape(value)}"]`

  outerLoop: for (let ova of OPTION_VALUE_ATTRIBUTES) {
    for (let i = 0; i < rackSize; i++) {
      let optionValueLiteral = optionValueRack_literal[i];
      let attributeSelector = `[${ova}="${CSS.escape(optionValueLiteral)}"]`;
      let selectorFound = searchNode.querySelector(attributeSelector);

      if (selectorFound && isElementVisible(selectorFound.parentElement)) {
        console.log({
          ova,
          selectorFound,
          attributeSelector,
          encodingFormat: 0,
        });

        encodingFormat += 1;
        break outerLoop;
      }
    }
  }

  if (!optionValueRack_id) return encodingFormat;

  outerLoop: for (let ova of OPTION_VALUE_ATTRIBUTES) {
    for (let i = 0; i < rackSize; i++) {
      let optionValueId = optionValueRack_id[i];
      let attributeSelector = `[${ova}="${CSS.escape(optionValueId)}"]`;
      let selectorFound = searchNode.querySelector(attributeSelector);
      if (selectorFound && isElementVisible(selectorFound.parentElement)) {
        console.log({
          ova,
          selectorFound,
          attributeSelector,
          encodingFormat: 1,
        });
        encodingFormat += 2;
        break outerLoop;
      }
    }
  }

  return encodingFormat;
}

function makeOptionValueRack(productOptions, axisIndices, encodingIndex) {
  if (axisIndices.length === 1) {
    return productOptions[axisIndices[0]].values[encodingIndex];
  }

  let uniqueValuesSet = new Set();
  let rack = [];

  axisIndices.forEach((axisIndex) => {
    const valuesArray =
      productOptions[axisIndex].values[encodingIndex];

    if (!valuesArray || !valuesArray.length) return;

    let idx = valuesArray.length - 1;
    let chosenValue = valuesArray[idx];

    while (uniqueValuesSet.has(chosenValue) && idx > 0) {
      idx--;
      chosenValue = valuesArray[idx];
    }

    uniqueValuesSet.add(chosenValue);
    rack.push(chosenValue);
  });

  return rack;
}

function getVariantPickerSets(
  searchNode,
  optionValueRack,
  OPTION_VALUE_ATTRIBUTES,
  encodingIndex,
  optionCount,
  product
) {
  console.log({ optionValueRackSelected: optionValueRack });
  let { selectorKeys, reduced_ova_array } = makeOVAKeysForOptionAxes(
    searchNode,
    optionValueRack,
    OPTION_VALUE_ATTRIBUTES
  );

  let populatedSelectorKeys = selectorKeys.filter((selKey) =>
    reduced_ova_array.some((ova) => Object.hasOwn(selKey, ova))
  );

  let matchedAxisIndices = product.options.map((option, index) => index);
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

    matchedAxisIndices = populatedSelectorKeys.map((psk) => psk.index);

    if (matchedAxisIndices.length === 1) {

      optionValueRack =
        product.options[matchedAxisIndices[0]].values[encodingIndex];

      optionCount = 1;
      console.log({ optionValueRack, optionCount });

    } else {

      optionValueRack = makeOptionValueRack(product.options, matchedAxisIndices, encodingIndex);
      optionCount = matchedAxisIndices.length;
    }

    let newSelectorKeyData = makeOVAKeysForOptionAxes(
      searchNode,
      optionValueRack,
      reduced_ova_array
    );
    ({ selectorKeys, reduced_ova_array } = newSelectorKeyData);
  }

  let variantPickerKeySets = createLeafNodeSelectorsSets(
    selectorKeys,
    reduced_ova_array,
    optionCount
  );
  // console.log({ variantPickerKeySets });

  let finalVariantPickerSet = variantPickerKeySets.map((set) =>
    createVariantPicker(set, optionCount)
  ).filter(Boolean);

  if (
    !finalVariantPickerSet.length ||
    reduced_ova_array.length === OPTION_VALUE_ATTRIBUTES.length
  ) {
    console.warn({
      Control_Function: "getVariantPickerSets",
      Failure: "could not extract the variant picker",
    });
    return null;
  }

  return [...finalVariantPickerSet.map((variant_picker) => {
    return {
      variant_picker,
      encodingIndex,
      OPTION_VALUE_ATTRIBUTES: reduced_ova_array,
      optionCount,
      optionValueRack,
      matchedAxisIndices
    };
  })];

  // return {
  //   encodingIndex,
  //   OPTION_VALUE_ATTRIBUTES: reduced_ova_array,
  //   variantPickerSet: finalVariantPickerSet,
  //   optionValueRack,
  //   optionCount,
  // };

  // return finalVariantPickerSet;
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
    "value-id",

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

    // Tier 5 - Custom theme specific attributes (empirical)
    "data-swatch-option",
    "data-swatch-value"
  ];

  // GET PRODUCT DATA
  let optionCount = product.options.length;

  let allAxisIndices = product.options.map((_, i) => i);

  let optionValueRackCollection = [0, 1]
    .filter(encodingIdx =>
      product.options[0].values.length > encodingIdx
    )
    .map(encodingIdx =>
      makeOptionValueRack(
        product.options,
        allAxisIndices,
        encodingIdx
      )
    );

  console.log({ optionValueRackCollection });

  let encodingIndex = null;
  if (optionValueRackCollection.length > 1)
    encodingIndex = selectorEncodingValidator(
      searchNode,
      OPTION_VALUE_ATTRIBUTES,
      optionValueRackCollection[0],
      optionValueRackCollection[1]
    );
  else {
    encodingIndex = selectorEncodingValidator(
      searchNode,
      OPTION_VALUE_ATTRIBUTES,
      optionValueRackCollection[0]
    );
  }

  if (encodingIndex === -1) {
    console.error({
      Control_Function: "getVariantPickersByRevCon()",
      Failure: "Encoding format failure",
    });
    return null;
  }

  console.log({ encodingIndex });

  ///////////////////////////////////////////////////////////////////////////////////////////////////

  let finalVariantPickerSet = [];
  if (encodingIndex !== 2)
    finalVariantPickerSet = getVariantPickerSets(
      searchNode,
      optionValueRackCollection[encodingIndex],
      OPTION_VALUE_ATTRIBUTES,
      encodingIndex,
      optionCount,
      product
    ) || [];
  else {
    finalVariantPickerSet = optionValueRackCollection.map(
      (optionValueRack, encodingIndex) =>
        getVariantPickerSets(
          searchNode,
          optionValueRack,
          OPTION_VALUE_ATTRIBUTES,
          encodingIndex,
          optionCount,
          product
        )
    ) || [];
  }

  // Now, the behaviour of the code will change based on
  // whether the value of the encodingIndex is 0, 1, or 2.

  /////////////////////////////////////////////////////////////////////////////////////////////////////

  if (!finalVariantPickerSet.length) {
    console.warn({
      Control_Function: "getVariantPickersByRevCon()",
      Failure: "could not extract the variant picker",
    });
    return null;
  }

  return finalVariantPickerSet;
}

function makeLeafNodeAttributeSelectorKeys(matchedAxisIndices, option_wrappers_with_selectors, effectiveOptionValueRack) {

  let leafNodeAttributeSelectorsArr = []
  if (matchedAxisIndices.length === 1) {
    const matchedAxisIndex = matchedAxisIndices[0];
    let tagUsed = option_wrappers_with_selectors[matchedAxisIndex].selector_type;
    tagUsed = tagUsed === 'select' ? 'option' : tagUsed;
    let ovaUsed = option_wrappers_with_selectors[matchedAxisIndex].value_attribute;

    leafNodeAttributeSelectorsArr = effectiveOptionValueRack.map(optionValue => `${tagUsed}[${ovaUsed}="${CSS.escape(
      optionValue
    )}"]`)
  } else {
    matchedAxisIndices.forEach(matchedAxisIndex => {
      let optionValue = effectiveOptionValueRack[matchedAxisIndex];
      let ovaUsed = option_wrappers_with_selectors[matchedAxisIndex].value_attribute;
      let tagUsed = option_wrappers_with_selectors[matchedAxisIndex].selector_type;
      tagUsed = tagUsed === 'select' ? 'option' : tagUsed;
      let leafNodeAttributeSelector = `${tagUsed}[${ovaUsed}="${CSS.escape(
        optionValue
      )}"]`;
      leafNodeAttributeSelectorsArr.push(leafNodeAttributeSelector);
    })
  }

  return leafNodeAttributeSelectorsArr;
}

function makeOptionWrappersWithSelectors(finalVariantPicker, originalOptionCount) {
  let templateOptionWrapperObject = {
    field_selector: null,
    selectors: [],
    selector_type: null,
    make_a_selection_required: null,
    value_attribute: null
  }

  let option_wrappers_with_selectors = new Array(originalOptionCount)
    .fill(null)
    .map(() => ({ ...templateOptionWrapperObject }));


  finalVariantPicker.option_wrappers.forEach((ow, index) => {
    const sample = finalVariantPicker.selectors[index].selectors[0];
    const tag = sample.tagName.toLowerCase();
    const selector_type = tag === "option" ? "select" : tag;

    let returnObject = {
      field_selector: ow,
      selectors:
        selector_type === "select"
          ? sample.parentElement
          : finalVariantPicker.selectors[index].selectors,
      selector_type,
      make_a_selection_required:
        selector_type === 'select' && !sample.parentElement.options[0].value,
      value_attribute:
        finalVariantPicker.selectors[index].value_attribute,
    };

    let trueOptionAxisIndex = finalVariantPicker.matchedAxisIndices[index];
    option_wrappers_with_selectors[trueOptionAxisIndex] = returnObject;
  });

  return option_wrappers_with_selectors;
}


function run_TA7WithCache(variantPickerCache) {
  let {
    searchNode,
    variantIdField,
    leafNodeAttributeSelectorsArr,
    input_selector_types,
    effectiveOptionValueRack,
    effectiveOptionCount,
    encodingIndex,
    finalOVAArrayUsed,
    matchedAxisIndices,
    originalOptionCount,
    productOptions,
  } = variantPickerCache;

  rejectedSelectorWrapper = new WeakSet();
  globalCacheData = { input_selector_types };

  function failCache(reason, extra = {}) {
    console.error("[TA7 CACHE FAIL]", reason, extra);
    globalCacheData = null;
    return null;
  }

  /* 1. searchNode still alive? */
  if (!searchNode || !searchNode.isConnected) {
    return failCache("searchNode not connected", { searchNode });
  }

  /* 2. variantIdField still alive? */
  if (!variantIdField || !variantIdField.isConnected) {
    console.warn("[TA7 CACHE] variantIdField disconnected. Attempting re-query...");
    variantIdField = Array.from(
      searchNode.querySelectorAll('input[name="id"], select[name="id"]'),
    ).find(vif => isElementVisible(vif.parentElement));

    if (!variantIdField) {
      return failCache("Could not re-resolve variantIdField");
    }
  }

  /* 3. Reconstruct selectors */
  let allSelectorsForEachOptionValue = leafNodeAttributeSelectorsArr.map(attSel => [...searchNode.querySelectorAll(attSel)]);

  allSelectorsForEachOptionValue = allSelectorsForEachOptionValue.map((selArray, idx) =>
    selArray.filter(selector => {
      if (!isElementVisible(selector.parentElement)) return false;

      if (selector.querySelector(leafNodeAttributeSelectorsArr[idx])) {
        rejectedSelectorWrapper.add(selector);
        return false;
      }

      return true;
    })
  );

  if (allSelectorsForEachOptionValue.some(arr => !arr.length)) {
    return failCache("Missing selectors during reconstruction", {
      leafNodeAttributeSelectorsArr
    });
  }

  const firstSelector = allSelectorsForEachOptionValue[0][0];
  const lastSelector = allSelectorsForEachOptionValue.at(-1).at(-1);

  let variantPickerKey;
  if (allSelectorsForEachOptionValue.length === 2) {
    variantPickerKey = [firstSelector, lastSelector];
  } else {
    let interArrSet = allSelectorsForEachOptionValue.filter((_, idx, collection) =>
      idx > 0 && idx < collection.length - 1
    );

    variantPickerKey = variantPickerKeyBuilder(
      0,
      interArrSet,
      [],
      firstSelector,
      lastSelector,
      effectiveOptionCount,
    );

    if (!variantPickerKey) {
      return failCache("Failed to build variant picker key");
    }
  }

  /* 4. Rebuild variant picker */
  const variant_picker = createVariantPicker(
    variantPickerKey,
    effectiveOptionCount,
  );

  if (!variant_picker) {
    return failCache("createVariantPicker returned null");
  }

  /* 5. Validate reconstructed picker */
  let vp_validation_data = isValidVariantPicker(
    variant_picker,
    effectiveOptionCount,
    effectiveOptionValueRack,
    finalOVAArrayUsed,
    matchedAxisIndices
  );

  if (!vp_validation_data) {
    return failCache("isValidVariantPicker failed");
  }

  /* 6. Extract selectors */
  let selectorResult = getCorrectVariantPickerWithSelectors(
    variant_picker,
    effectiveOptionCount,
    effectiveOptionValueRack,
    encodingIndex,
    productOptions,
    vp_validation_data,
  );

  if (!selectorResult) {
    return failCache("Failed to generate selector data in cache mode");
  }
  let {selector_data} = selectorResult;
  if( !selector_data || !selector_data.length || selector_data.some(selArray => !selArray.length)){
    return failCache("Failed to generate proper selector data", {selector_data});
  }

  let finalVariantPicker = {
    variantPicker: variant_picker,
    option_wrappers: variant_picker.option_wrappers,
    selectors: selectorResult.selector_data,
    encodingIndex,
    variantIdField,
    matchedAxisIndices,
    vp_validation_data,
  };


  let areAllActiveSelectorsFound = finalVariantPicker.matchedAxisIndices.some(matchedAxisIdx => {
    let matchingWrapperIndex = finalVariantPicker.vp_validation_data.fieldSet ? 0 : finalVariantPicker.vp_validation_data.fieldSetMap.findIndex(idx => idx === matchedAxisIdx);
    let selectorArraytoCompare = finalVariantPicker.selectors.find((_, idx) => idx === matchingWrapperIndex);
    let optionAxistoCompare = productOptions.find((_, idx) => idx === matchedAxisIdx).values[encodingIndex]

    if (optionAxistoCompare.length !== selectorArraytoCompare.selectors.length) {
      console.warn({
        Control_Function: "run_TA7()",
        error: "Could not get all selectors for some optionAxis",
        optionAxistoCompare,
        selectorArraytoCompare
      })
      return false;
    }

    return true;
  })

  if (!areAllActiveSelectorsFound) {
    return fail("Could not get all selectors for some optionAxis");
  }


  let option_wrappers_with_selectors = makeOptionWrappersWithSelectors(
    {
      option_wrappers: variant_picker.option_wrappers,
      selectors: selectorResult.selector_data,
      matchedAxisIndices,
    },
    originalOptionCount,
  );

  if (!option_wrappers_with_selectors?.length) {
    return failCache("makeOptionWrappersWithSelectors returned empty");
  }

  finalVariantPicker.option_wrappers_with_selectors = option_wrappers_with_selectors;
  finalVariantPicker.make_a_selection_required = option_wrappers_with_selectors.some(ow => ow.make_a_selection_required);

  let valueAttributesUsed = new Set(option_wrappers_with_selectors.map(ow => ow.value_attribute));
  finalVariantPicker.attribute_name =
    valueAttributesUsed.size > 1
      ? Array.from(valueAttributesUsed)
      : valueAttributesUsed.values().next().value;

  console.log("[TA7 CACHE SUCCESS] Fast reconstruction successful");
  return finalVariantPicker;
}

async function test(getFullData = true) {
  const targetData = {
    A__finalVariantPicker: null,
    B__parentNodeForVPCSearch: null,
    C__anchorData: null,
    D__variantPickerGenData: null,
  };

  const TA7_Result = {
    Variant_Picker: null,
    Full_Data: targetData,
    status: "failure",
  };

  const fail = (cause) => {
    console.error({ status: "[TA7] Failed : Revert to Legacy", cause });
    return TA7_Result;
  };

  /* ----------------------------------
     0. Clear rejected nodes cache
  ---------------------------------- */
  rejectedSelectorWrapper = new WeakSet();

  /* ----------------------------------
     1. Anchor product form
  ---------------------------------- */

  const anchorProductFormData = findAnchorProductForm();
  let { nameIdAnchors, validNameIdElement } =
    anchorProductFormData;

  if (!validNameIdElement) {
    return fail("valid [name = id] element not found");
  }

  targetData.C__anchorData = {
    nameIdElement: validNameIdElement,
    nameIdAnchors,
  };

  /* ----------------------------------
     2. Product data
  ---------------------------------- */

  let product = null;

  if (window.CAMOUFLAGEE) {
    product = {
      options:
        window.CAMOUFLAGEE.items[0].product.options_with_values.map(
          (option) => ({
            name: option.name,
            values: [
              option.values.map((v) => v.name),
              option.values.map((v) => v.id),
            ],
          })
        ),
    };
  } else {
    const productData = await getProductData();

    product = {
      options: productData.options.map((option) => ({
        name: option.name,
        values: [option.values],
      })),
    };

    //debug:
    console.log({ product });
  }

  const originalOptionCount = product.options.length;
  console.log({ productOptions: product.options, originalOptionCount });

  /* ----------------------------------
     3. Stable parent discovery
  ---------------------------------- */

  const candidateObject = getParentNodeForVPCSearch(validNameIdElement, 5, false);

  targetData.B__parentNodeForVPCSearch = {
    searchNode: candidateObject.parent,
    parentFoundInAnchorMode: true,
  };

  /* ----------------------------------
     4. Variant picker candidates
  ---------------------------------- */

  const variantPickerGenData = getVariantPickersByRevCon(
    candidateObject.parent,
    product
  )?.flat().filter(Boolean);

  if (!variantPickerGenData?.length) {
    return fail("No variant picker candidates found");
  }

  targetData.D__variantPickerGenData = variantPickerGenData;

  // testing : 
  console.log({ variantPickerGenData });

  /* ----------------------------------
     5. Validation loop
  ---------------------------------- */

  let finalVariantPicker = null;
  let effectiveOptionValueRack;
  let effectiveOptionCount;
  let finalOVAArrayUsed;
  let encodingIndex;
  let selectorResult;

  for (const item of variantPickerGenData) {
    const vpValidationData = isValidVariantPicker(
      item.variant_picker,
      item.optionCount,
      item.optionValueRack,
      item.OPTION_VALUE_ATTRIBUTES,
      item.matchedAxisIndices
    );

    if (!vpValidationData) continue;

    selectorResult = getCorrectVariantPickerWithSelectors(
      item.variant_picker,
      item.optionCount,
      item.optionValueRack,
      item.encodingIndex,
      product.options,
      vpValidationData
    );

    let {selector_data} = selectorResult;
    if (!selector_data || !selector_data.length || !selector_data.some(selArray => !selArray.length)) continue;

    finalVariantPicker = {
      variantPicker: item.variant_picker.variantPicker,
      option_wrappers: item.variant_picker.option_wrappers,
      // selectors: selectorResult.selector_data,
      encodingIndex: item.encodingIndex,
      matchedAxisIndices: item.matchedAxisIndices,
      vpValidationData,
    };

    effectiveOptionValueRack = item.optionValueRack;
    effectiveOptionCount = item.optionCount;
    finalOVAArrayUsed = item.OPTION_VALUE_ATTRIBUTES;
    encodingIndex = item.encodingIndex

    //debug:
    console.log({ vpValidationData, finalVariantPicker });

    break;
  }

  /* ----------------------------------
     6. Failure exit (guaranteed shape)
  ---------------------------------- */
  console.log({ finalVariantPicker });
  if (!finalVariantPicker) {
    return fail("Final variant picker could not be resolved");
  }

  let {selector_data} = selectorResult;
  console.log({selectorResult});
  if( !selector_data || !selector_data.length || selector_data.some(object => !object.selectors.length)){
    return fail("Failed to generate proper selector data", {selector_data});
  }


  let areAllActiveSelectorsFound = finalVariantPicker.matchedAxisIndices.every(matchedAxisIdx => {
    let matchingWrapperIndex = finalVariantPicker.vpValidationData.fieldSet ? 0 : finalVariantPicker.vpValidationData.fieldSetMap.findIndex(idx => idx === matchedAxisIdx);
    let selectorArraytoCompare = finalVariantPicker.selectors[matchingWrapperIndex];
    let optionAxistoCompare = product.options[matchedAxisIdx].values[encodingIndex];

    if (optionAxistoCompare.length !== selectorArraytoCompare.selectors.length) {
      console.warn({
        Control_Function: "run_TA7()",
        error: "Could not get all selectors for some optionAxis",
        optionAxistoCompare,
        selectorArraytoCompare
      })
      return false;
    }

    return true;
  })

  if (!areAllActiveSelectorsFound) {
    return fail("Could not get all selectors for some optionAxis");
  }


  /* --------------------------------------------------------------------
     7. Building list of references from variant picker upto the searchNode
  -------------------------------------------------------------------- */
  let ancestorReferences = [];
  for (let currRef = finalVariantPicker.variantPicker; candidateObject.parent.parentElement !== currRef; currRef = currRef.parentElement) {
    ancestorReferences.push(currRef);
  }

  /* ----------------------------------
     8. Normalization
  ---------------------------------- */

  if (window.CAMOUFLAGEE) {
    finalVariantPicker.camouflage_selectors =
      window.CAMOUFLAGEE.items[0].selectors;
  }

  let option_wrappers_with_selectors = makeOptionWrappersWithSelectors(finalVariantPicker, originalOptionCount);

  let leafNodeAttributeSelectorsArr = makeLeafNodeAttributeSelectorKeys(finalVariantPicker.matchedAxisIndices, option_wrappers_with_selectors, effectiveOptionValueRack);

  // Finalize the value_attribute used (if single) or the value_attribute array
  // if the selectors in the axes are not encoded with same value_attribute.
  let valueAttributesUsed = new Set(option_wrappers_with_selectors.map(ow => ow.value_attribute));
  let attribute_name;
  if (valueAttributesUsed.size > 1)
    attribute_name = Array.from(valueAttributesUsed);
  else
    attribute_name = valueAttributesUsed.values().next().value;

  targetData.A__finalVariantPicker = {
    variantPicker: finalVariantPicker.variantPicker,
    variantPickerCache: {
      searchNode: candidateObject.parent,
      variantIdField: validNameIdElement,
      leafNodeAttributeSelectorsArr,
      input_selector_types: option_wrappers_with_selectors.map(ow => ow.selector_type),
      effectiveOptionValueRack,
      effectiveOptionCount,
      encodingIndex,
      finalOVAArrayUsed,
      matchedAxisIndices: finalVariantPicker.matchedAxisIndices,
      originalOptionCount,
      productOptions: product.options,
    },
    encodingIndex: finalVariantPicker.encodingIndex,
    option_wrappers_with_selectors,
    make_a_selection_required: option_wrappers_with_selectors.some(ow => ow.make_a_selection_required),
    attribute_name,
    variantIdField: validNameIdElement,
    observer_container_node: candidateObject.parent,
    ancestorReferences,
    addToCartButton: candidateObject.addToCartButton,
    z__camouflage_selectors:
      finalVariantPicker.camouflage_selectors ||
      "Camouflage not enabled on store",
  };

  /* ----------------------------------
     8. Success return
  ---------------------------------- */

  TA7_Result.Variant_Picker = targetData.A__finalVariantPicker;
  TA7_Result.status = "success";
  TA7_Result.CacheResponse = run_TA7WithCache(TA7_Result.Variant_Picker.variantPickerCache);

  console.log({ "[TA7 VERDICT]": "Success", TA7_Result });
  return TA7_Result;
}

await test();
