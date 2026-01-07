
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

function findVariatPickersBasedOnOptionNamesInJSON(
  variantPickerCandidates,
  optionNames
) {
  // find the VARIANT PICKER HOOK
  // It is the first node where all the option-wrapper labels are found
  // The search for the MVP will now be done in this hook node.
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

      if (dataValueFound) {
        return {
          selectorElement: dataValueFound,
          valueMatched: selector,
        };
        // the fieldset had some element that had the sampleOptionValue supplied,
        // This is our variantPicker.
      }
    }
  }

  return false;
  // no fieldset candidate in the vp_candidate has any attribute holding the
  // sampleOptionValue, not our variantPicker
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

    if(selectorArrayPerOptionAxis.length > optionExtKey.optionAxis.values.length){
      
    }

    return Array.from(selectorArrayPerOptionAxis);
  });

  return finalSelectorSet;
}