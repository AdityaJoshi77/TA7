(async function TA7_Performance_Profile() {
  const PERF = {};
  const T0 = performance.now();
  let t;

  // ---------------------------------------
  // 1. Anchor detection
  // ---------------------------------------
  t = performance.now();
  const anchorProductFormData = findAnchorProductForm();
  PERF.findAnchorProductForm = performance.now() - t;

  // ---------------------------------------
  // 2. Product JSON fetch
  // ---------------------------------------
  t = performance.now();
  const product = await getProductData();
  PERF.getProductData = performance.now() - t;

  // ---------------------------------------
  // 3. Parent node resolution
  // ---------------------------------------
  t = performance.now();
  const anchorHook =
    anchorProductFormData.anchorProductForm ||
    anchorProductFormData.nameIdAnchors?.[0];

  if (!anchorHook) {
    console.error("TA7: No anchor hook found");
    return;
  }

  const candidateObject =
    anchorHook === anchorProductFormData.anchorProductForm
      ? getParentNodeForVPCSearch(anchorHook, null, false)
      : getParentNodeForVPCSearch(anchorHook, 5, false);

  PERF.getParentNodeForVPCSearch = performance.now() - t;

  // ---------------------------------------
  // 4. Variant picker generation
  // ---------------------------------------
  t = performance.now();
  const variantPickerGenData = getVariantPickersByRevCon(
    candidateObject.parent,
    product
  );
  PERF.getVariantPickersByRevCon = performance.now() - t;

  if (!variantPickerGenData) {
    PERF.total = performance.now() - T0;
    console.table(PERF);
    console.warn("TA7: No variant pickers detected");
    return;
  }

  // ---------------------------------------
  // 5. Validation + selector extraction
  // ---------------------------------------
  t = performance.now();

  const {
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

    if (!vp_validation_data) continue;

    const finalSelectorResult = getCorrectVariantPickerWithSelectors(
      item,
      optionCount,
      optionValueRack,
      product.options,
      vp_validation_data
    );

    if (finalSelectorResult) {
      finalVariantPicker = item;
      break;
    }
  }

  PERF.variantValidationPipeline = performance.now() - t;

  // ---------------------------------------
  // 6. Total
  // ---------------------------------------
  PERF.total = performance.now() - T0;

  console.table(PERF);

  // Optional: expose result for inspection
  window.__TA7_PROFILE_RESULT__ = {
    timing: PERF,
    finalVariantPicker,
  };
})();
