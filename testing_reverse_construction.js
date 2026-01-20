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
  const optionCount = product.options.length;

  // MAKE OPTION VALUE RACK
  let optionValueRack =
    product.options.length > 1
      ? product.options.map((option) => option.values[0])
      : product.options[0].values;

  let reduced_ova_array = OPTION_VALUE_ATTRIBUTES;
  let temp_ova_set = new Set();
  let selectorKeys = [];

  if (optionCount > 1) {
    optionValueRack.forEach((optionValue) => {
      let selectorKey = {
        optionValue,
      };

      reduced_ova_array.forEach((ova) => {
        let attributeSelector = `[${ova}="${CSS.escape(optionValue)}"]`;
        let selector = document.querySelectorAll(attributeSelector);
        if (selector.length) {
          let sel_array = Array.from(selector).filter((el) =>
            isElementVisible(el.parentElement)
          );
          if (ova in selectorKey) {
            selectorKey[ova].push(...sel_array);
          } else {
            temp_ova_set.add(ova);
            selectorKey[ova] = [];
            selectorKey[ova].push(...sel_array);
          }
        }
      });

      if (temp_ova_set.size) reduced_ova_array = Array.from(temp_ova_set);
      temp_ova_set.clear();
      selectorKey.A1__optionValue = selectorKey.optionValue;
      delete selectorKey.optionValue;
      selectorKeys.push(selectorKey);
    });
  }

  return { selectorKeys, reduced_ova_array };
}

await getSelectorUsingOVA();
