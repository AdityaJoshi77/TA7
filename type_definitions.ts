
type TA7FinalResult = {
  /** Root DOM element containing the entire variant picker */
  variantPicker: HTMLElement;

  /**
   * How option values are encoded in the DOM
   * 0 → literal values (names)
   * 1 → ids
   */
  encodingIndex: 0 | 1;

  /** One entry per option axis (Color, Size, etc.) */
  option_wrappers_with_selectors: TA7OptionAxis[];

  /** input/select[name="id"] used for variant submission */
  variantIdField: HTMLInputElement | HTMLSelectElement | null;

  /** Container used for mutation observation */
  observer_container: HTMLElement;

  /** The add to cart button that could be disabled if a hidden variant is selected */
  addToCartButton : HTMLElement;

  /** Debug / cross-check data from Camouflage (optional) */
  z__camouflage_selectors: unknown | string;
};

type TA7OptionAxis = {
  /** DOM node wrapping this option axis (fieldset / div / etc.) */
  field_selector: HTMLElement;

  /**
   * If selector_type === "select":
   *   → the <select> element
   * Else:
   *   → array of selectable leaf nodes (input, button, li, a, etc.)
   */
  selectors: HTMLSelectElement | HTMLElement[];

  /**
   * Normalized selector kind
   * Derived from tagName of the representative selector
   */
  selector_type:
    | "select"
    | "input"
    | "option"
    | "button"
    | "a"
    | "li"
    | "div"
    | "label"
    | string;

  /**
   * Attribute used to encode option values for this axis
   * e.g. data-value, aria-label, value, data-option-id, etc.
   * NOTE : The code's current design different value_attributes per option axis,
   * although this is not likely to occur.
   */
  value_attribute: string;
};
