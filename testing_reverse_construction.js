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

function createVariantPicker(leafNodeSelectorsArr, optionCount) {
  if (!Array.isArray(leafNodeSelectorsArr) || !leafNodeSelectorsArr.length) {
    return null;
  }

  let interParents = [...leafNodeSelectorsArr];
  let flagSelectors = [
    leafNodeSelectorsArr[0],
    leafNodeSelectorsArr[leafNodeSelectorsArr.length - 1],
  ];
  let variantPicker = null;

  // console.log({flagSelectors});

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

    // console.log({ interParents });

    // move one level up
    const tempParents = interParents
      .map((el) => el.parentElement)
      .filter(Boolean);

    // collect parents of option wrappers
    const parentSet = new Set(tempParents.map((el) => el.parentElement));

    let LCA = Array.from(parentSet).find((parent) =>
      flagSelectors.every((flag) => parent.contains(flag))
    );

    // lowest common ancestor found
    if (LCA) {
      console.log({ LCA, flagSelectors });
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
  console.log({ rawSetectorKeys: selectorKeys, reduced_ova_array });
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
    // console.log({ occupiedIndexSet });
  });

  console.log({ variantPickerKeySets });
  return variantPickerKeySets;
}

function makeOVAKeysforOptionAxes(optionValueRack, OPTION_VALUE_ATTRIBUTES) {
  let reduced_ova_array = OPTION_VALUE_ATTRIBUTES;
  let temp_ova_set = new Set();
  let selectorKeys = [];

  optionValueRack.forEach((optionValue, index) => {
    let selectorKey = {
      A1__optionValue : optionValue,
      index
    };

    reduced_ova_array.forEach((ova) => {
      let attributeSelector = `[${ova}="${CSS.escape(optionValue)}"]`;
      let selectors = Array.from(document.querySelectorAll(attributeSelector));

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

async function getSelectorUsingOVA() {
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

  // GET PRODUCT DATA
  const product = await getProductData();
  let optionCount = product.options.length;

  // MAKE OPTION VALUE RACK
  let optionValueRack =
    product.options.length > 1
      ? product.options.map((option) => option.values[0])
      : product.options[0].values;

  let { selectorKeys, reduced_ova_array } = makeOVAKeysforOptionAxes(
    optionValueRack,
    OPTION_VALUE_ATTRIBUTES
  );

  let populatedSelectorKeys = selectorKeys.filter((selKey) =>
    reduced_ova_array.some((ova) => Object.hasOwn(selKey, ova))
  );

  if (populatedSelectorKeys.length != optionCount) {
    console.warn({
      Control_Function: "Not all fieldsets are present",
      Pivot: "Remaking the selectorKeys for the populated Option Axes...",
      populatedSelectorKeys
    });

    let matchedAxisIndices = populatedSelectorKeys.map(psk => psk.index);
    if(matchedAxisIndices.length === 1){
      optionValueRack = product.options[matchedAxisIndices[0]].values;
      optionCount = 1;
    }else{
      optionValueRack = matchedAxisIndices.map(index => product.options[index][0]);
      optionCount = matchedAxisIndices.length;
    }

    let newSelectorKeyData = makeOVAKeysforOptionAxes(optionValueRack, reduced_ova_array);
    ({selectorKeys, reduced_ova_array} = newSelectorKeyData);
  }

  let variantPickerKeySets = createLeafNodeSelectorSets(
    selectorKeys,
    reduced_ova_array,
    optionCount
  );
  console.log({ variantPickerKeySets });
  let finalVariantPickerSet = variantPickerKeySets.map((set) =>
    createVariantPicker(set, optionCount)
  );

  return {
    selector_data: { selectorKeys, reduced_ova_array },
    variantPickerData: finalVariantPickerSet,
  };
}

await getSelectorUsingOVA();
