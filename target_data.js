const target_data = {
  main_container: {
    css_selector: "",
  },

  product_option_count: 0,

  interaction_model: "select" | "radio" | "mixed" | "custom",

  product_options: [
    {
      option_name: "",

      field: {
        element_type: "",
        css_selector: "",
      },

      item: {
        element_type: "",
        css_selector: "",
      },

      value: {
        source: "attribute" | "dataset" | "text" | "computed",
        key: "", // e.g. "value", "data-value"
        normalize: true,
      },

      interaction: {
        click_target: "self" | "label" | "custom",
        click_selector: "", // used if not self
      },
    },
  ],

  mutation: {
    required: false,
    target_selector: "",
    reason: "rerender" | "replace_children" | "unknown",
  },
};

// Main Variant Picker
// Mutation Observer's mounting point
