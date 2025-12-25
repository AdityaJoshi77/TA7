function getVariantPickerCandidates() {
  const array_A = ["variant", "variants", "option", "options", "product"];
  const array_B = ["select", "selects", "selector", "selectors", "picker", "pickers", "radio", "radios", "wrapper", "container", "option", "options"];

  const regex = new RegExp(
    `^(${array_A.join("|")})([-_]+)(${array_B.join("|")})$`,
    "i"
  );

  const matchedElements = Array.from(document.querySelectorAll("*")).filter(
    (el) => {
      // check tag name
      if (regex.test(el.tagName.toLowerCase())) return true;

      // check class names
      return Array.from(el.classList).some((cls) => regex.test(cls));
    }
  );

  if (matchedElements.length) {
    console.log({
      status: "Found VariantPicker Candidates",
      Data: matchedElements,
    });

    return matchedElements;
  } else {
    console.log({
        status: "No VariantPickers found",
        Data: "null and void"
    });
  }

  return [];
}

getVariantPickerCandidates();
