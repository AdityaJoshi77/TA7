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

  const formRegex = /product.*form/i;

  const anchorInProductForm = anchors.find((el) => {
    const form = el.closest("form");
    if (!form) return false;

    const formId = form.getAttribute("id");
    if (formId && formRegex.test(formId)) return true;

    // fallback: check class list
    return Array.from(form.classList).some((cls) => formRegex.test(cls));
  });

  if (anchorInProductForm) {
    // SUCCESS MESSAGE:
    // console.log({
    //   status: "Anchor Found",
    //   anchor: anchorInProductForm,
    //   parentForm: anchorInProductForm.closest("form"),
    //   formId: anchorInProductForm.closest("form")?.id,
    //   formRegex,
    // });
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
function getCandidateContainer(node, recall = false) {
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

  // SUCCESS MESSAGE:
  //   console.log({
  //     Status: "Candidate container",
  //     Data: candidate,
  //   });

  return {
    parent: candidate,
    isBodyNext: candidate?.parentElement === document.body,
  };
}

// HELPER:
// we find the element whose tagName, or one of the classes
// matches with phrases like variant-picker, option_selectors, etc.
// most theme would resort to this kind of nomenclature.
function getVariantPickerCandidates(mainContainerCandidate) {
  const array_A = ["variant", "variants", "option", "options", "product"];
  const array_B = [
    "select",
    "selects",
    "selector",
    "selectors",
    "picker",
    "pickers",
    "radio",
    "radios",
    "wrapper",
    "container",
    "option",
    "options",
  ];

  //   const regex = new RegExp(
  //     `^(${array_A.join("|")})([-_]+)(${array_B.join("|")})$`,
  //     "i"
  //   );

  const regex = new RegExp(
    `^(${array_A.join("|")})([-_]+)(${array_B.join("|")})([-_]+[a-z0-9]+)*$`,
    "i"
  );

  const matchedElements = Array.from(
    mainContainerCandidate.querySelectorAll("*")
  ).filter((el) => {
    // check tag name
    if (regex.test(el.tagName.toLowerCase())) return true;

    // check class names
    return Array.from(el.classList).some((cls) => regex.test(cls));
  });

  if (matchedElements.length) {
    // SUCCESS MESSAGE:
    // console.log({
    //   status: "Found VariantPicker Candidates",
    //   Data: matchedElements,
    // });

    return matchedElements;
  }

  return [];
}

function test() {
  const anchor = findVariantIdAnchor();
  if (!anchor) {
    const statusObject = {
      status: "[TA7] Failed",
      cause: "variantID anchor not found",
    };
    console.log(statusObject);
    return statusObject;
  }

  let candidateObject = getCandidateContainer(anchor, false);
  let variantPickerCandidates = getVariantPickerCandidates(
    candidateObject.parent
  );
  while (
    candidateObject &&
    !variantPickerCandidates.length &&
    !candidateObject.isBodyNext
  ) {
    // depth++;
    candidateObject = getCandidateContainer(candidateObject.parent, true);
    variantPickerCandidates = getVariantPickerCandidates(
      candidateObject.parent
    );
  }

  if (!variantPickerCandidates.length) {
    console.log({
      status: "No variant picker found",
      cause: candidateObject.isBodyNext ? "Body hit" : "Recheck Anchor",
      anchor,
      parent: candidateObject.parent,
    });
    return [];
  }

  const targetData = {
    // parent: candidateObject.parent,
    anchor,
    parentForm: anchor.parentElement,
    mainContainerCandidates: variantPickerCandidates,
  };

  //   SUCCESS MESSAGE
  //   console.log({
  //     status: "[TA7] Passed",
  //     data: targetData,
  //   });

  return targetData;
}

test();
