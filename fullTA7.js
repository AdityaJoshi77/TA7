(function() {
  "use strict";
  window.CAMOUFLAGEE = window.CAMOUFLAGEE || { items: [] };
  if (!window.CAMOUFLAGEE.items) {
    window.CAMOUFLAGEE.items = [];
  }
  function getHoosObj$1(params) {
    if (!params) {
      params = {};
    }
    let hiddenInputFieldForVariantID;
    const hide_oos_m_settings = params.hide_oos_m_settings || { ...window.hide_oos_m_settings };
    const hide_oos_t_settings = params.hide_oos_t_settings || { ...window.hide_oos_t_settings };
    let hide_oos_qty_threshold = Number(hide_oos_t_settings.hide_oos_qty_threshold || hide_oos_m_settings.hide_oos_qty_threshold || 0);
    if (typeof window.hide_oos_qty_threshold !== "undefined") {
      hide_oos_qty_threshold = Number(window.hide_oos_qty_threshold);
    }
    const query_selectors = params.hide_oos_query_selectors || { ...window.hide_oos_query_selectors || {} };
    let hoosExtras = params.hide_oos_extras || { ...window.hide_oos_extras || {} };
    hoosExtras = { ...hoosExtras };
    hoosExtras.always_hide = params.always_hide || hoosExtras.always_hide || hide_oos_m_settings.always_hide;
    hoosExtras.always_show = params.always_show || hoosExtras.always_show || hide_oos_m_settings.always_show;
    if (hoosExtras.always_hide && typeof hoosExtras.always_hide === "string" && hoosExtras.always_hide.indexOf("key_field:") >= 0) {
      try {
        hoosExtras.always_hide = JSON.parse(hoosExtras.always_hide);
      } catch (error) {
        console.error(error);
      }
    }
    if (hoosExtras.always_show && typeof hoosExtras.always_show === "string" && hoosExtras.always_show.indexOf("key_field:") >= 0) {
      try {
        hoosExtras.always_show = JSON.parse(hoosExtras.always_show);
      } catch (error) {
        console.error(error);
      }
    }
    hoosExtras.schedule_hide = params.schedule_hide || hoosExtras.schedule_hide || hide_oos_m_settings.schedule_hide || {};
    hoosExtras.always_hide_countries = params.always_hide_countries || hoosExtras.always_hide_countries || hide_oos_m_settings.always_hide_countries || {};
    hoosExtras.always_hide_show_field = params.always_hide_show_field || hoosExtras.always_hide_show_field || hide_oos_m_settings.always_hide_show_field || "variant_title";
    hoosExtras.exclude_tags = hoosExtras.exclude_tags || hide_oos_m_settings.exclude_tags || "";
    hoosExtras.include_tags = hoosExtras.include_tags || hide_oos_m_settings.include_tags || "";
    hoosExtras.include_only_hide_show_field = hoosExtras.include_only_hide_show_field || hide_oos_m_settings.include_only_hide_show_field;
    hoosExtras.option_disable = hoosExtras.option_disable || hide_oos_m_settings.option_disable;
    hoosExtras.append_soldout_text = hoosExtras.append_soldout_text || hide_oos_m_settings.append_soldout_text;
    hoosExtras.append_unavailable_text = hoosExtras.append_unavailable_text || hide_oos_m_settings.append_unavailable_text;
    hoosExtras.hide_in_safari = hoosExtras.hide_in_safari || hide_oos_m_settings.hide_in_safari;
    hoosExtras.hide_unavailable = hoosExtras.hide_unavailable || hide_oos_m_settings.hide_unavailable;
    hoosExtras.version = hoosExtras.version || hide_oos_m_settings.version;
    hoosExtras.integrates_with = hoosExtras.integrates_with || hide_oos_m_settings.integrates_with;
    hoosExtras.variant_change_delay = Number(hoosExtras.variant_change_delay || 10);
    hoosExtras.is_featured_product = params.is_featured_product || hoosExtras.is_featured_product;
    if (hoosExtras.version && typeof hoosExtras.version === "string") {
      hoosExtras.version = Number(hoosExtras.version.replace("v", ""));
    }
    if (typeof hoosExtras.include_only_hide_show_field === "boolean") {
      hoosExtras.include_only_hide_show_field = hoosExtras.include_only_hide_show_field === true ? "yes" : "";
    }
    hoosExtras.hide_specific_variants = hoosExtras.hide_specific_variants || hide_oos_m_settings.hide_specific_variants;
    let themeVersion = window.BOOMR && window.BOOMR.themeVersion ? window.BOOMR.themeVersion : "";
    if (!themeVersion) {
      themeVersion = window.Shopify && window.Shopify.theme && window.Shopify.theme.schema_version;
    }
    if (typeof themeVersion === "string") {
      themeVersion = Number(themeVersion.split(".")[0] || 1);
    } else {
      themeVersion = themeVersion || 1;
    }
    const hoosObj2 = {
      // query_selectors: window.hide_oos_query_selectors || null, // not used
      product: params.product || hide_oos_t_settings.product,
      hide_oos_variant_qty: params.hide_oos_variant_qty || (Array.isArray(window.hide_oos_variant_qty) ? [...window.hide_oos_variant_qty] : void 0),
      // array of variant quantity, eg: [1,1,0,4,10]
      mainContainer: params.mainContainer || window.mainHoosContainer || query_selectors.mainContainer || null,
      // window.mainHoosContainer is set only in case of quickview
      selected_or_first_available_variant_id: params.selected_or_first_available_variant_id || window.selected_or_first_available_variant_id || "",
      hide_variants_options_arr: params.hide_variants_options_arr || hide_oos_m_settings.hide_variants_options_arr,
      params,
      query_selectors,
      selector_type: query_selectors.selector_type || hide_oos_t_settings.selector_type || hide_oos_m_settings.selector_type || "",
      // select | radio
      original_selector_type: query_selectors.selector_type || hide_oos_t_settings.selector_type || hide_oos_m_settings.selector_type || "",
      field_selector: query_selectors.field_selector || window.hide_oos_field_selector || hide_oos_t_settings.field_selector || hide_oos_m_settings.field_selector || "",
      // field_selector is the wrapper element within which options or radios can be found
      click_label_path: query_selectors.click_label_path || "",
      // default is empty string for canopy
      unavailable_label_path: query_selectors.unavailable_label_path || "",
      // default is empty string for canopy
      input_elem_path_from_label: query_selectors.input_elem_path_from_label || "",
      // default is empty string for canopy
      input_selector: query_selectors.input_selector || window.hide_oos_input_selector,
      swatch_input_selector: query_selectors.swatch_input_selector || window.swatch_input_selector,
      swatch_picker_for: query_selectors.swatch_picker_for || window.swatch_picker_for,
      hide_oos_product_json_selector: window.hide_oos_product_json_selector || "",
      theme_name: hide_oos_t_settings.theme_name || hide_oos_m_settings.theme_name || "",
      other_theme_name: hide_oos_t_settings.other_theme_name || hide_oos_m_settings.other_theme_name || "",
      theme_version: themeVersion,
      hide_oos_variants: hide_oos_t_settings.hide_oos_variants || hide_oos_m_settings.hide_oos_variants || false,
      variant_action: params.variant_action || hide_oos_t_settings.variant_action || hide_oos_m_settings.variant_action || "",
      timeout_interval: window.hoos_timeout_interval || hoosExtras.hoos_timeout_interval || 0,
      hide_oos_check_qty: window.hide_oos_check_qty || hide_oos_t_settings.hide_oos_check_qty || hide_oos_m_settings.hide_oos_check_qty || false,
      hide_oos_qty_threshold,
      reverse_options: hide_oos_t_settings.reverse_options || hide_oos_m_settings.reverse_options || false,
      hide_if_no_image: hide_oos_m_settings.hide_if_no_image || "",
      hide_if_price_zero: hide_oos_m_settings.hide_if_price_zero || "",
      extras: hoosExtras,
      selectors: [],
      selectors_metadata: [],
      // it might contain which selector's parent element should be hidden etc
      availableVariants: [],
      markedUnavailableVariants: [],
      productOptions: {
        option1: {},
        option2: {},
        option3: {}
      },
      selectedProductOptions: {
        option1: null,
        option2: null,
        option3: null
      },
      previousProductOptions: {
        option1: null,
        option2: null,
        option3: null
      },
      unavailable_class: hide_oos_t_settings.unavailable_class || hide_oos_m_settings.unavailable_class || "hide-oos-disable",
      isSafari: params.isSafari || false,
      defaultUnavailableClass: "hide-oos-disable",
      // sold out + unavailable
      camouflageUnavailableClass: "camouflage-unavailable",
      // unavailable
      camouflageMarkedUnavailableClass: "camouflage-marked-unavailable",
      // unavailable
      makeSelectionNoHideClass: "camouflage-no-hide",
      unavailableClass: hide_oos_t_settings.unavailable_class || hide_oos_m_settings.unavailable_class || "hide-oos-disable",
      hiddenInputFieldForVariantID,
      mappedLabels: [[]],
      enableDisabledSelectorsArr: [],
      hide_variants_options: {},
      skip_execution: false,
      // helpful for image_hide to know if it should skip execution
      ext_version: 3,
      country: window.Shopify && window.Shopify.country ? window.Shopify.country : "",
      locale: window.Shopify && window.Shopify.locale ? window.Shopify.locale : "",
      started_at: /* @__PURE__ */ new Date()
    };
    if (typeof hoosObj2.hide_oos_variants === "string") {
      hoosObj2.hide_oos_variants = hoosObj2.hide_oos_variants === "true";
    }
    if (typeof hoosObj2.hide_oos_check_qty === "string") {
      hoosObj2.hide_oos_check_qty = hoosObj2.hide_oos_check_qty === "true";
    }
    if (typeof hoosObj2.reverse_options === "string") {
      hoosObj2.reverse_options = hoosObj2.reverse_options === "true";
    }
    if (hide_oos_m_settings.product_images_with_id && hoosObj2.product && !hoosObj2.product.product_images_with_id) {
      hoosObj2.product.product_images_with_id = hide_oos_m_settings.product_images_with_id;
    }
    if (!hoosObj2.isSafari) {
      let isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
      if (!isSafari) {
        isSafari = /iphone/i.test(navigator.userAgent) || /ipad/i.test(navigator.userAgent);
      }
      hoosObj2.isSafari = isSafari;
      if (typeof hoosObj2.extras.hide_oos_variants === "boolean" && isSafari) {
        hoosObj2.hide_oos_variants = hoosObj2.extras.hide_oos_variants;
      }
      if (isSafari && !hoosObj2.extras.delay) {
        hoosObj2.extras.delay = 100;
      }
    }
    const horizonThemes = ["atelier", "dwell", "fabric", "heritage", "horizon", "pitch", "ritual", "savor", "tinker", "vessel"];
    const dawn15Themes = ["dawn", "studio", "trade"];
    if (hoosObj2.product && hoosObj2.product.options.length > 1 && horizonThemes.includes(hoosObj2.theme_name)) {
      hoosObj2.isSafari = false;
    } else if (hoosObj2.product && hoosObj2.product.options.length > 1 && dawn15Themes.includes(hoosObj2.theme_name) && hoosObj2.theme_version >= 15) {
      hoosObj2.isSafari = false;
    }
    hoosObj2.horizonThemes = horizonThemes;
    hoosObj2.dawn15Themes = dawn15Themes;
    if (horizonThemes.includes(hoosObj2.theme_name)) {
      hoosObj2.variantPickerMorphed = true;
    }
    if (hoosObj2.extras.hide_oos_product_json_selector) {
      hoosObj2.hide_oos_product_json_selector = hoosObj2.extras.hide_oos_product_json_selector;
    }
    if (hoosObj2.variant_action === "strike-through-disabled") {
      hoosObj2.extras.disabled = true;
    }
    const EU_COUNTRY_CODES2 = [
      "AT",
      "BE",
      "BG",
      "CY",
      "CZ",
      "DE",
      "DK",
      "EE",
      "ES",
      "FI",
      "FR",
      "GR",
      "HR",
      "HU",
      "IE",
      "IT",
      "LT",
      "LU",
      "LV",
      "MT",
      "NL",
      "PL",
      "PT",
      "RO",
      "SE",
      "SI",
      "SK"
    ];
    const setStrtoArrValues = (optionValues) => {
      if (Array.isArray(optionValues)) return optionValues;
      return typeof optionValues === "string" ? optionValues.split(",").map((v) => v.trim()).filter((v) => v) : [];
    };
    if (Array.isArray(hoosObj2.hide_variants_options_arr)) {
      for (const option of hoosObj2.hide_variants_options_arr) {
        const optionName = option.name.trim();
        const values = option.values.split(",").map((v) => v.trim()).filter((v) => v);
        option.values_arr = values;
        option.name = optionName;
        option.product_tags = setStrtoArrValues(option.product_tags);
        option.product_types = setStrtoArrValues(option.product_types);
        option.customer_tags = setStrtoArrValues(option.customer_tags);
        const excludedConfiguredTags = option.customer_tags.filter((tag) => tag.charAt(0) === "-").map((tag) => tag.slice(1));
        option.excluded_customer_tags = excludedConfiguredTags;
        if (window.camouflageCustomerTags && Array.isArray(window.camouflageCustomerTags)) {
          const customerTaggedWithExcludedTag = excludedConfiguredTags.length ? window.camouflageCustomerTags.some((tag) => excludedConfiguredTags.includes(tag)) : false;
          option.is_customer_tag_excluded = customerTaggedWithExcludedTag;
        }
        if (Array.isArray(option.countries) && option.countries.includes("EU")) {
          option.countries.push(...EU_COUNTRY_CODES2);
        }
        if (Array.isArray(option.ex_countries) && option.ex_countries.includes("EU")) {
          option.ex_countries.push(...EU_COUNTRY_CODES2);
        }
        if (Array.isArray(option.ex_countries) && option.ex_countries.length && option.ex_countries.includes(hoosObj2.country)) {
          if (!Array.isArray(option.countries) || !option.countries || !option.countries.length) {
            option.countries = ["NONE"];
          }
          option.countries = option.countries.filter((c) => c !== hoosObj2.country);
        }
        hoosObj2.hide_variants_options[optionName] = hoosObj2.hide_variants_options[optionName] || [];
        hoosObj2.hide_variants_options[optionName] = [...hoosObj2.hide_variants_options[optionName], ...values];
        if (optionName === "exclude_tags_specific_variants") {
          hoosObj2.exclude_tags_specific_variants = values;
        }
      }
    }
    if (!hoosObj2.extras.hide_specific_variants && ["hide"].includes(hoosObj2.variant_action)) {
      hoosObj2.extras.hide_specific_variants = "hide";
    }
    hoosObj2.extras.hide_specific_variants = hoosObj2.extras.hide_specific_variants || hoosObj2.variant_action || "hide";
    if (!hoosObj2.extras.version || hoosObj2.extras.version < 2) {
      if (!params.no_hoos_obj) {
        window.hoosObj = hoosObj2;
      }
    }
    hoosObj2.extras.variant_picker_selector = hoosObj2.extras.variant_picker_selector || hoosObj2.extras.observer_selector;
    if (params.no_camouflage_items === true) {
      return hoosObj2;
    }
    window.CAMOUFLAGEE.items.push(hoosObj2);
    window.hide_oos_extras = null;
    window.hide_oos_query_selectors = null;
    return hoosObj2;
  }
  if (window.camouflage_global_config) {
    const searchParams2 = new URLSearchParams(window.location.search);
    if (searchParams2.get("debug") === "camouflage") {
      window.camouflage_global_config.logLevel = "debug";
      if (window.localStorage) {
        window.localStorage.setItem("camouflage_log_level", window.camouflage_global_config.logLevel);
      }
    } else if (window.localStorage) {
      const logLevel2 = window.localStorage.getItem("camouflage_log_level");
      if (logLevel2) {
        window.camouflage_global_config.logLevel = logLevel2;
      }
    }
  }
  window.CAMOUFLAGEE.getHoosObj = getHoosObj$1;
  var base = {
    getHoosObj: getHoosObj$1,
    logLevel: window.camouflage_global_config && window.camouflage_global_config.logLevel ? window.camouflage_global_config.logLevel : "fakeLog"
  };
  const camouflage_global_config$1 = window.camouflage_global_config || {};
  const gridCommonConfig = {
    local_storage_key: "camouflage_products",
    local_storage_context: "camouflage_products_context",
    local_storage_expiry: 60,
    // in seconds
    hide_class: "camouflage-grid-disable",
    camouflage_marked_unavailable_class: "camouflage-marked-unavailable",
    price_updated_class: "camouflage-price-updated",
    grid_marking_class: "camouflage-complete",
    first_available_class: "camouflage-first-available-swatch",
    options_to_hide: ["Color", "color", "Colour", "colour"],
    logLevel: "fakeLog"
  };
  const camouflageDefaultProductGridConfig = {
    is_enabled: "no",
    grid_container: ".collection__products",
    grid_item_container: ".product-grid-item",
    swatch_container: "product-grid-item-swatch",
    swatch_item: ".swatch__button",
    swatch_data_attribute: "data-value",
    target_parent: false,
    handle_query: "a.product__media__holder",
    // element where handle will be found
    handle_query_attribute: "href",
    // element attribute where the handle will be found
    grid_from_price_selector: ".camouflage-price-selector, span.price-item.price-item--regular",
    ...gridCommonConfig
  };
  const quickViewDefaultConfig = {
    is_enabled: "false",
    quickview_body_container: "",
    quickview_elem_selector: "a.btn--quick",
    quick_view_variants_container: `.popup-quick-view__wrapper`,
    product_handle_from_quick_elem: "",
    // eg: quickTriggerElem.closest('body').querySelector('.btn')
    product_handle_attribute: "href",
    is_quick_view_cached: false
  };
  const featuredProductDefaultConfig = {
    is_enabled: "false",
    featured_product_container: ".featured-product-section",
    handle_query: "a.product-link",
    handle_query_attribute: "href"
  };
  const imageHideDefaultConfig = {
    is_enabled: "false",
    thumbnail_wrapper: ".product__thumbnail-list-inner",
    thumbnail_key: "id",
    // or image_id; id is the media id
    thumbnail_element: "button",
    thumbnail_attribute: "data-media-id",
    thumbnail_hide_or_remove: "hide",
    // or remove
    hide_class: "camouflage-thumbnail-hidden",
    thumbnail_target_parent: false
  };
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("debug") === "camouflage") {
    camouflageDefaultProductGridConfig.logLevel = "debug";
    camouflage_global_config$1.logLevel = "debug";
    if (window.localStorage) {
      localStorage.setItem("camouflage_log_level", camouflage_global_config$1.logLevel);
    }
  } else if (window.localStorage) {
    const logLevel2 = localStorage.getItem("camouflage_log_level");
    if (logLevel2) {
      camouflage_global_config$1.logLevel = logLevel2;
    }
  }
  if (camouflage_global_config$1.product_grid) {
    camouflage_global_config$1.product_grid = {
      ...camouflageDefaultProductGridConfig,
      ...camouflage_global_config$1.product_grid
    };
  }
  if (camouflage_global_config$1.quick_view) {
    camouflage_global_config$1.quick_view = {
      ...quickViewDefaultConfig,
      ...camouflage_global_config$1.quick_view
    };
  }
  if (camouflage_global_config$1.featured_product) {
    camouflage_global_config$1.featured_product = {
      ...featuredProductDefaultConfig,
      ...camouflage_global_config$1.featured_product
    };
  }
  if (camouflage_global_config$1.image_hide) {
    camouflage_global_config$1.image_hide = {
      ...imageHideDefaultConfig,
      ...camouflage_global_config$1.image_hide
    };
  }
  camouflage_global_config$1.product_grid = camouflage_global_config$1.product_grid || camouflageDefaultProductGridConfig;
  camouflage_global_config$1.quick_view = camouflage_global_config$1.quick_view || quickViewDefaultConfig;
  camouflage_global_config$1.featured_product = camouflage_global_config$1.featured_product || featuredProductDefaultConfig;
  camouflage_global_config$1.image_hide = camouflage_global_config$1.image_hide || imageHideDefaultConfig;
  var camouflageBase = {
    // camouflageProductGridConfig,
    camouflage_global_config: camouflage_global_config$1
  };
  const { camouflage_global_config } = camouflageBase;
  const GRAPHQL_VERSION = "2024-10";
  camouflage_global_config.logLevel || "fakeLog";
  const getGraphqlQuery = ({ handles = [], include_collections = false, include_all_media = false, variants_cursor = null }) => {
    const collectionQuery = include_collections ? `collections(first: 5) {
                edges {
                    node {
                        title
                        handle
                    }
                }
            }` : "";
    const mediaMaxQty = include_all_media ? 250 : 1;
    const queryTemplate = `
        product(handle: "PRODUCT_HANDLE") {
            id
            handle
            title
            availableForSale
            type: productType
            variantsCount {
                count
                precision
            }
            variants(first: 250${variants_cursor ? `, after: "${variants_cursor}"` : ""}) {
                edges {
                    cursor
                    node {
                        id
                        title
                        sku
                        image {
                            id
                            url
                        }
                        price {
                            amount
                            currencyCode
                        }
                        quantityAvailable
                        availableForSale
                        compareAtPrice {
                            amount
                            currencyCode
                        }
                        selectedOptions {
                            name
                            value
                        }
                        always_hide: metafield(namespace: "camouflage_custom", key: "always_hide") {
                            value
                        }
                        always_hide_countries: metafield(namespace: "camouflage_custom", key: "always_hide_countries") {
                            value
                        }
                        schedule_hide: metafield(namespace: "camouflage_custom", key: "schedule_hide") {
                            value
                        }
                    }
                }
                pageInfo {
					hasNextPage
					hasPreviousPage
				}
            }
            tags
            options {
                id
                name
                values: optionValues {
                id
                name
                swatch {
                    color
                    image {
                            alt
                            previewImage {
                                url
                            }
                        }
                    }
                }
            }
            priceRange {
                maxVariantPrice {
                    amount
                }
                minVariantPrice {
                    amount
                }
            }
            compareAtPriceRange {
                maxVariantPrice {
                    amount
                }
                minVariantPrice {
                    amount
                }
            }
            always_hide: metafield(namespace: "camouflage", key: "always_hide") {
                value
            }
            always_show: metafield(namespace: "camouflage", key: "always_show") {
                value
            }
            schedule_hide: metafield(namespace: "camouflage", key: "schedule_hide") {
                value
            }

            always_hide2: metafield(namespace: "$app:camouflage", key: "always_hide") {
                value
            }
            always_show2: metafield(namespace: "$app:camouflage", key: "always_show") {
                value
            }
            schedule_hide2: metafield(namespace: "$app:camouflage", key: "schedule_hide") {
                value
            }

            always_hide_countries: metafield(namespace: "$app:camouflage", key: "always_hide_countries") {
                value
            }
    
            media(first: ${mediaMaxQty}) {
                edges {
                    node {
                        id
                        previewImage {
                            id
                            url
                        }
                    }
                }
            }
            ${collectionQuery}
        }
    
    `;
    let finalQuery = "";
    for (let i2 = 0; i2 < handles.length; i2++) {
      const queryTemplateWithName = `product_${i2 + 1} : ${queryTemplate.replace("PRODUCT_HANDLE", handles[i2])}`;
      finalQuery += queryTemplateWithName;
    }
    finalQuery = `{ ${finalQuery} }`;
    return finalQuery;
  };
  const getUpdatedToken = (token) => {
    if (!token) return token;
    return token.replaceAll("-", "").replace("#", "");
  };
  const transformGraphqlProduct = (product) => {
    product.id = Number(product.id.split("/").pop());
    const options = product.options.slice().map((option) => {
      if (typeof option.id === "string") {
        option.id = Number(option.id.split("/").pop());
      }
      option.values.map((v) => {
        if (typeof v.id === "string") {
          v.id = Number(v.id.split("/").pop());
        }
        return v;
      });
      return option;
    });
    product.options = options.map((o) => o.name);
    product.options_with_values = options;
    const always_hide = product.always_hide && typeof product.always_hide.value === "string" ? JSON.parse(product.always_hide.value) : product.always_hide;
    const always_show = product.always_show && typeof product.always_show.value === "string" ? JSON.parse(product.always_show.value) : product.always_show;
    const schedule_hide = product.schedule_hide && typeof product.schedule_hide.value === "string" ? JSON.parse(product.schedule_hide.value) : product.schedule_hide;
    const always_hide_show_field = product.always_hide_show_field || "";
    const always_hide2 = product.always_hide2 && typeof product.always_hide2.value === "string" ? JSON.parse(product.always_hide2.value) : product.always_hide2;
    const always_show2 = product.always_show2 && typeof product.always_show2.value === "string" ? JSON.parse(product.always_show2.value) : product.always_show2;
    const schedule_hide2 = product.schedule_hide2 && typeof product.schedule_hide2.value === "string" ? JSON.parse(product.schedule_hide2.value) : product.schedule_hide2;
    const always_hide_countries = product.always_hide_countries && typeof product.always_hide_countries.value === "string" ? JSON.parse(product.always_hide_countries.value) : product.always_hide_countries;
    product.metafields = {
      always_hide: always_hide2 || always_hide,
      always_show: always_show2 || always_show,
      always_hide_countries,
      schedule_hide: schedule_hide2 || schedule_hide,
      always_hide_show_field
    };
    product.available = product.availableForSale;
    if (product.images && product.images.edges) {
      product.images = product.images.edges.map((i2) => {
        return {
          id: Number(i2.node.id.split("/").pop()),
          url: i2.node.url
        };
      });
    }
    if (product.media && product.media.edges) {
      product.media = product.media.edges.map((edge) => {
        const node = edge.node;
        node.id = node.id.split("/").pop();
        node.image_id = node.previewImage ? node.previewImage.id.split("/").pop() : null;
        return node;
      });
    }
    if (product.collections && product.collections.edges) {
      product.collections = product.collections.edges.map((c) => {
        return c.node;
      });
    }
    product.variants = product.variants.edges.map((v) => {
      const temp = v.node;
      temp.id = Number(temp.id.split("/").pop());
      temp.options = temp.selectedOptions.map((so, idx) => {
        temp[`option${idx + 1}`] = so.value;
        return so.value;
      });
      temp.inventory_quantity = temp.quantityAvailable;
      temp.price = temp.price.amount;
      temp.available = temp.availableForSale;
      temp.compare_at_price = temp.compareAtPrice && temp.compareAtPrice.amount ? temp.compareAtPrice.amount : null;
      const variant_always_hide = temp.always_hide && typeof temp.always_hide.value === "string" ? JSON.parse(temp.always_hide.value) : temp.always_hide;
      const variant_always_hide_countries = temp.always_hide_countries && typeof temp.always_hide_countries.value === "string" ? JSON.parse(temp.always_hide_countries.value) : temp.always_hide_countries;
      const variant_schedule_hide = temp.schedule_hide && typeof temp.schedule_hide.value === "string" ? JSON.parse(temp.schedule_hide.value) : temp.schedule_hide;
      temp.always_hide = variant_always_hide;
      temp.always_hide_countries = variant_always_hide_countries;
      temp.schedule_hide = variant_schedule_hide;
      if (temp.image && temp.image.url && temp.image.id) {
        temp.featured_image = {
          id: Number(temp.image.id.split("/").pop()),
          src: temp.image.url
        };
      }
      return temp;
    });
    if (product.priceRange && product.priceRange.minVariantPrice) {
      product.min_price = product.priceRange.minVariantPrice.amount;
      product.max_price = product.priceRange.maxVariantPrice.amount;
    }
    if (product.options_with_values) {
      const options_with_values_flat_keys = {};
      product.options_with_values.map((o) => o.values).flat().forEach((item) => {
        options_with_values_flat_keys[item.id] = item;
      });
      product.options_with_values_flat_keys = options_with_values_flat_keys;
    }
    if (product.variantsCount && product.variantsCount.count) {
      product.variants_count = product.variantsCount.count;
    }
    product.fetched_at = /* @__PURE__ */ new Date();
    return product;
  };
  const getProductGraphqlQueryWithParams = ({ handles, include_all_media, include_collections, variants_cursor }) => {
    const query = getGraphqlQuery({ handles, include_all_media, include_collections, variants_cursor });
    let shopifyQuery = { query };
    const language = window.Shopify.locale.split("-")[0].toUpperCase();
    if (window.Shopify ? window.Shopify.country : "") {
      shopifyQuery = {
        query: `query @inContext(country: ${window.Shopify.country}, language: ${language}) ${query} `
      };
    }
    return shopifyQuery;
  };
  const fetchProducts = async ({
    handles,
    token,
    include_all_media,
    include_collections
  }) => {
    handles = handles.map((handle) => decodeURIComponent(handle));
    token = getUpdatedToken(token);
    const options = {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Shopify-Storefront-Access-Token": token
      },
      body: JSON.stringify(getProductGraphqlQueryWithParams({ handles, include_all_media, include_collections }))
    };
    try {
      const products = [];
      if (handles.length === 1) {
        let current_product = null;
        let loop_count = 0;
        while (true) {
          loop_count++;
          if (loop_count > 10) break;
          const resp = await fetch(`/api/${GRAPHQL_VERSION}/graphql.json`, options);
          const data = await resp.json();
          if (data && data.data) {
            const keys = Object.keys(data.data);
            if (!keys.length) break;
            const gqlProduct = data.data[keys[0]];
            if (!gqlProduct) break;
            if (!current_product) {
              current_product = gqlProduct;
            } else {
              current_product.variants.edges = [...current_product.variants.edges, ...gqlProduct.variants.edges];
            }
            const last_variant_cursor = gqlProduct.variants.edges[gqlProduct.variants.edges.length - 1].cursor;
            if (!gqlProduct.variants.pageInfo.hasNextPage) break;
            if (current_product.variantsCount && current_product.variantsCount.count >= 250 && gqlProduct.variants.edges.length === 250 && gqlProduct.variants.pageInfo.hasNextPage && last_variant_cursor) {
              options.body = JSON.stringify(getProductGraphqlQueryWithParams({ handles, include_all_media, include_collections, variants_cursor: last_variant_cursor }));
            } else {
              break;
            }
          }
        }
        if (current_product) {
          products.push(transformGraphqlProduct(current_product));
        }
      } else {
        const resp = await fetch(`/api/${GRAPHQL_VERSION}/graphql.json`, options);
        const data = await resp.json();
        if (data && data.data) {
          for (const key in data.data) {
            if (!data.data[key]) continue;
            products.push(transformGraphqlProduct(data.data[key]));
          }
        }
      }
      try {
        document.querySelectorAll("script.camouflage-product").forEach((script) => {
          const product = JSON.parse(script.textContent);
          if (product && product.id && product.variants) {
            const productFound = products.find((p) => p.id == product.id);
            if (productFound) {
              for (let variant of product.variants) {
                const variantFound = productFound.variants.find((v) => v.id == variant.id);
                if (variantFound) {
                  variantFound.image = variant.image;
                  variantFound.featured_image = variant.featured_image;
                  variantFound.featured_media = variant.featured_media;
                }
              }
            }
          }
        });
      } catch (error) {
        console.error(error);
      }
      if (typeof window.camouflagePostGraphqlProductFetch === "function") {
        window.camouflagePostGraphqlProductFetch({ products });
      }
      return products;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  const fetchProductByHandle$1 = async (handle, token) => {
    const products = await fetchProducts({ handles: [handle], token, include_all_media: true });
    if (!products) return null;
    const product = products[0];
    return product;
  };
  var camouflageCommon = {
    fetchProductByHandle: fetchProductByHandle$1
  };
  const logLevel$4 = window.camouflage_global_config && window.camouflage_global_config.logLevel ? window.camouflage_global_config.logLevel : "fakeLog";
  const EU_COUNTRY_CODES = [
    "AT",
    "BE",
    "BG",
    "CY",
    "CZ",
    "DE",
    "DK",
    "EE",
    "ES",
    "FI",
    "FR",
    "GR",
    "HR",
    "HU",
    "IE",
    "IT",
    "LT",
    "LU",
    "LV",
    "MT",
    "NL",
    "PL",
    "PT",
    "RO",
    "SE",
    "SI",
    "SK"
  ];
  function reArrangeProductOptions(productRef) {
    productRef.options = productRef.options.reverse();
    for (let variant of productRef.variants) {
      if (variant.options.length === 2) {
        let optn1 = variant.option1;
        variant.option1 = variant.option2;
        variant.option2 = optn1;
      } else if (variant.options.length === 3) {
        let optn1 = variant.option1;
        variant.option1 = variant.option3;
        variant.option3 = optn1;
      }
      variant.options = variant.options.reverse();
    }
    return productRef;
  }
  function getAvailableVariants$2({ hoosObj: hoosObj2 }) {
    console[logLevel$4]("Camouflage", "getAvailableVariants:start", hoosObj2.product.id, hoosObj2);
    let { product, exclude_tags_specific_variants } = hoosObj2;
    let exclude_tags_specific_variants_exists = false;
    let {
      exclude_tags,
      include_tags,
      always_show,
      always_hide,
      always_hide_countries,
      schedule_hide,
      always_hide_show_field,
      include_only_hide_show_field,
      hide_unavailable,
      hide_specific_variants,
      version,
      timezone
    } = hoosObj2.extras;
    let productTags = product.tags || [];
    if (!Array.isArray(productTags)) {
      productTags = productTags.split(",").map((p) => p.trim());
    }
    console[logLevel$4]("Camouflage", "getAvailableVariants:variables", {
      exclude_tags,
      include_tags,
      always_show,
      always_hide,
      always_hide_countries,
      schedule_hide,
      always_hide_show_field,
      include_only_hide_show_field,
      hide_unavailable,
      hide_specific_variants,
      version,
      variant_action: hoosObj2.variant_action
    });
    if (exclude_tags && exclude_tags.length) {
      if (!Array.isArray(exclude_tags)) {
        exclude_tags = exclude_tags.split(",").map((p) => p.trim());
      }
      for (let extag of exclude_tags) {
        if (productTags.includes(extag)) {
          console[logLevel$4]("Camouflage", `Exclude tag ${extag} is present, skipping Camouflage execution`);
          hoosObj2.skip_execution = true;
          return false;
        }
      }
    }
    if (exclude_tags_specific_variants && exclude_tags_specific_variants.length) {
      if (exclude_tags_specific_variants && !Array.isArray(exclude_tags_specific_variants)) {
        exclude_tags_specific_variants = exclude_tags_specific_variants.split(",").map((p) => p.trim());
      }
      for (let extag of exclude_tags_specific_variants) {
        if (productTags.includes(extag)) {
          exclude_tags_specific_variants_exists = true;
          break;
        }
      }
    }
    let exit_due_to_include_tags = false;
    if (include_tags && include_tags.length) {
      if (!Array.isArray(include_tags)) {
        include_tags = include_tags.split(",").map((p) => p.trim());
      }
      let atleastOneTagExists = false;
      for (let inctag of include_tags) {
        if (productTags.includes(inctag)) {
          atleastOneTagExists = true;
          break;
        }
      }
      if (!atleastOneTagExists) {
        console[logLevel$4]("Camouflage", `None of the ${include_tags} is present, skipping Camouflage execution`);
        hoosObj2.skip_execution = true;
        exit_due_to_include_tags = true;
        hoosObj2.exit_due_to_include_tags = true;
      }
    }
    if (hoosObj2.reverse_options) {
      product = reArrangeProductOptions(product);
    }
    const hoe = window.hide_oos_enabled === "codecrux hide oos";
    try {
      const parentPathname = window.parent.location ? window.parent.location.pathname : "";
      if (product.options.length > 1 && !parentPathname.startsWith("/admin") && !hoe) {
        hoosObj2.skip_execution = true;
        return false;
      }
    } catch (error) {
      console.error(error);
    }
    let inventory_qty_available = false;
    if (hoosObj2.hide_oos_variant_qty && hoosObj2.hide_oos_variant_qty.length === product.variants.length) {
      for (let i2 = 0; i2 < product.variants.length; i2++) {
        product.variants[i2].inventory_quantity = hoosObj2.hide_oos_variant_qty[i2];
      }
      inventory_qty_available = true;
    } else if (typeof product.variants[0].inventory_quantity === "number") {
      inventory_qty_available = true;
    }
    const timeZone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone }));
    let markedUnavailableVariants = [];
    if (logLevel$4 === "debug") {
      console.group(`${product.id} ${product.handle} ${product.title}`);
    }
    let hide_variants_options_arr = hoosObj2.hide_variants_options_arr || [];
    let removed_variants_options_arr = [];
    let customer_has_tags_or_logged_in = window.camouflageCustomerTags && window.camouflageCustomerTags.length ? true : false;
    if (Array.isArray(hide_variants_options_arr) && hide_variants_options_arr.length) {
      hide_variants_options_arr = hide_variants_options_arr.filter((option) => {
        let conditionValid = true;
        if (conditionValid && Array.isArray(option.product_types) && option.product_types.length) {
          if (!option.product_types.some((product_type) => product_type === product.type)) {
            removed_variants_options_arr.push(option);
            conditionValid = false;
          }
        }
        if (conditionValid && Array.isArray(option.product_tags) && option.product_tags.length) {
          if (!option.product_tags.some((product_tag) => productTags.includes(product_tag))) {
            removed_variants_options_arr.push(option);
            conditionValid = false;
          }
        }
        if (option.is_customer_tag_excluded === true) {
          conditionValid = false;
        }
        if (conditionValid && option.excluded_customer_tags && option.excluded_customer_tags.length) {
          if (!customer_has_tags_or_logged_in) {
            option.hide_from_current_country = true;
            return true;
          }
          if (customer_has_tags_or_logged_in && window.camouflageCustomerTags && window.camouflageCustomerTags.length) {
            if (option.excluded_customer_tags.some((customer_tag) => window.camouflageCustomerTags.includes(customer_tag))) {
              return false;
            }
            option.hide_from_current_country = true;
            return true;
          }
        }
        if (conditionValid && Array.isArray(window.camouflageCustomerTags) && Array.isArray(option.customer_tags) && option.customer_tags.length) {
          if (!option.customer_tags.some((customer_tag) => window.camouflageCustomerTags.includes(customer_tag))) {
            removed_variants_options_arr.push(option);
            conditionValid = false;
          }
        }
        return conditionValid;
      });
      if (removed_variants_options_arr.length) {
        console[logLevel$4](`Camouflage: ${removed_variants_options_arr.length} variants options removed`);
      }
      try {
        for (const option of hide_variants_options_arr) {
          if (option.name.startsWith("variant.")) {
            const variantKey = option.name.replace("variant.", "").trim();
            if (variantKey) {
              if (typeof always_hide_countries !== "object") {
                always_hide_countries = { hide_show_field: "id", variants: {} };
              }
              if (!always_hide_countries.variants) {
                always_hide_countries.variants = {};
              }
              const tempVariantsIds = product.variants.filter((v) => option.values_arr.includes(v[variantKey])).map((v) => v.id.toString());
              const tempCountries = option.countries || [];
              if (Array.isArray(tempCountries) && tempCountries.includes("EU")) {
                tempCountries.push(...EU_COUNTRY_CODES);
              }
              for (const tempVariantsId of tempVariantsIds) {
                always_hide_countries.variants[tempVariantsId] = always_hide_countries.variants[tempVariantsId] || [];
                always_hide_countries.variants[tempVariantsId].push(...tempCountries);
                if (!always_hide_countries.variants[tempVariantsId].length) {
                  always_hide_countries.variants[tempVariantsId].push(hoosObj2.country);
                } else if (option.hide_from_current_country) {
                  always_hide_countries.variants[tempVariantsId].push(hoosObj2.country);
                }
              }
            }
          }
        }
        console[logLevel$4]("Camouflage", "always_hide_countries", always_hide_countries, product.id);
      } catch (error) {
        console.error(error);
      }
    }
    let availableVariants = product.variants.filter((variant) => {
      if (always_show && Array.isArray(always_show) && always_show.length) {
        let asFound;
        always_hide_show_field = hoosObj2.extras.always_hide_show_field;
        const temp = always_show[0].split("key_field:");
        if (temp.length === 2) {
          always_hide_show_field = temp[1].trim();
        }
        if (always_hide_show_field === "sku") {
          asFound = always_show.find((as) => variant.sku == as);
        } else if (always_hide_show_field === "id") {
          asFound = always_show.find((as) => variant.id == as);
        } else if (variant.always_show === true) {
          asFound = variant.always_show;
        } else {
          asFound = always_show.find((as) => variant.title.includes(as));
        }
        if (asFound) {
          console[logLevel$4]("Camouflage", "Always show variant found", variant.id, variant.title);
          return true;
        }
      } else if (variant.always_show === true) {
        return false;
      }
      if (always_hide && Array.isArray(always_hide) && always_hide.length) {
        let ahFound;
        always_hide_show_field = hoosObj2.extras.always_hide_show_field;
        const temp = always_hide[0].split("key_field:");
        if (temp.length === 2) {
          always_hide_show_field = temp[1].trim();
        }
        if (always_hide_show_field === "sku") {
          ahFound = always_hide.find((ah) => variant.sku == ah);
        } else if (always_hide_show_field === "id") {
          ahFound = always_hide.find((ah) => variant.id == ah);
          if (!ahFound && variant.always_hide === true) {
            ahFound = true;
          }
        } else if (variant.always_hide === true) {
          ahFound = variant.always_hide;
        } else {
          ahFound = always_hide.find((ah) => variant.title.includes(ah));
        }
        if (ahFound) {
          markedUnavailableVariants.push(variant.id);
          console[logLevel$4]("Camouflage", "Always hide variant found", variant.id, variant.title);
          return false;
        }
      } else if (variant.always_hide === true) {
        markedUnavailableVariants.push(variant.id);
        console[logLevel$4]("Camouflage", "Always hide variant found", variant.id, variant.title);
        return false;
      }
      if (Array.isArray(variant.always_hide_countries) && variant.always_hide_countries.length) {
        if (!always_hide_countries) {
          always_hide_countries = {};
        }
        always_hide_countries.variants = always_hide_countries.variants || {};
        always_hide_countries.variants[variant.id] = variant.always_hide_countries;
      }
      let alwaysHideFromCurrentCountry = false;
      if (always_hide_countries && typeof always_hide_countries === "object" && always_hide_countries.variants) {
        let ahFound;
        always_hide_show_field = always_hide_countries.hide_show_field || "id";
        if (always_hide_show_field === "id") {
          const countries = always_hide_countries.variants[variant.id.toString()] || [];
          const includedCountries = Array.isArray(countries) ? countries.filter((c) => !c.startsWith("-")) : [];
          let excludedCountries = Array.isArray(countries) ? countries.filter((c) => c.startsWith("-")).map((c) => c.slice(1)) : [];
          if (excludedCountries.length && !includedCountries.length) {
            countries.push(hoosObj2.country);
          }
          if (Array.isArray(countries) && countries.includes("EU")) {
            countries.push(...EU_COUNTRY_CODES);
          } else if (Array.isArray(countries) && countries.includes("-EU")) {
            excludedCountries.push(...EU_COUNTRY_CODES);
          }
          ahFound = Array.isArray(countries) && countries.includes(hoosObj2.country);
          if (ahFound && Array.isArray(excludedCountries) && excludedCountries.length && excludedCountries.includes(hoosObj2.country)) {
            console[logLevel$4]("Camouflage", "Excluded country found!!", variant.id, variant.title, hoosObj2.country);
            ahFound = false;
          }
        }
        if (ahFound) {
          markedUnavailableVariants.push(variant.id);
          console[logLevel$4]("Camouflage", "Always hide for countries variant found", variant.id, variant.title);
          alwaysHideFromCurrentCountry = true;
        }
      }
      let schedules = schedule_hide ? schedule_hide.variants : null;
      let schedule_hide_field = schedule_hide ? schedule_hide.hide_show_field : null;
      if (variant.schedule_hide && typeof variant.schedule_hide === "object" && variant.schedule_hide.from && variant.schedule_hide.to) {
        if (schedules && typeof schedules === "object" && !schedules[variant.id]) {
          schedules[variant.id] = variant.schedule_hide;
        } else if (!schedules) {
          schedules = {};
          schedules[variant.id] = variant.schedule_hide;
        }
      }
      let scheduledForHidingVariantNow = false;
      let schedulingExistsForVariant = false;
      if (schedules && typeof schedules === "object") {
        if (variant.id in schedules) {
          schedulingExistsForVariant = true;
          const from = new Date(new Date(schedules[variant.id].from).toLocaleString("en-US", { timeZone }));
          const to = new Date(new Date(schedules[variant.id].to).toLocaleString("en-US", { timeZone }));
          if (now >= from && now <= to) {
            markedUnavailableVariants.push(variant.id);
            console[logLevel$4]("Camouflage", "Schedule hide variant found", variant.id, variant.title);
            scheduledForHidingVariantNow = true;
          } else if (alwaysHideFromCurrentCountry && schedule_hide_field !== "remove") {
            alwaysHideFromCurrentCountry = false;
          }
        }
      }
      if (scheduledForHidingVariantNow) return false;
      if (!scheduledForHidingVariantNow && schedulingExistsForVariant && alwaysHideFromCurrentCountry) {
        alwaysHideFromCurrentCountry = false;
      }
      if (alwaysHideFromCurrentCountry) return false;
      if (Array.isArray(hide_variants_options_arr) && !exclude_tags_specific_variants_exists) {
        for (let index = 0; index < product.options.length; index++) {
          let matchedArr = hide_variants_options_arr.filter((item) => item.name === product.options[index] && item.values_arr.includes(variant.options[index]));
          let matchedArr2 = hide_variants_options_arr.filter((item) => {
            if (!item.name.includes("variant.")) {
              return false;
            }
            if (!Array.isArray(item.values_arr)) {
              return false;
            }
            let key = item.name.replace("variant.", "");
            return item.values_arr.includes(variant[key]);
          });
          matchedArr = matchedArr.concat(matchedArr2);
          const countryArrExists = matchedArr.find((item) => Array.isArray(item.countries) && item.countries.length > 0);
          const countryFound = matchedArr.find((item) => Array.isArray(item.countries) && item.countries.includes(hoosObj2.country));
          if (matchedArr.length) {
            matchedArr = matchedArr.filter((item) => {
              if (item.excluded_customer_tags && item.excluded_customer_tags.length) {
                if (!customer_has_tags_or_logged_in) {
                  return true;
                }
                if (customer_has_tags_or_logged_in && window.camouflageCustomerTags && window.camouflageCustomerTags.length) {
                  if (item.excluded_customer_tags.some((customer_tag) => window.camouflageCustomerTags.includes(customer_tag))) {
                    return false;
                  }
                  return true;
                }
              }
              if (!item.customer_tags || !item.customer_tags.length) return true;
              if (Array.isArray(item.customer_tags) && item.customer_tags.length && Array.isArray(window.camouflageCustomerTags)) {
                return item.customer_tags.some((customer_tag) => window.camouflageCustomerTags.includes(customer_tag));
              }
              return true;
            });
          }
          if (matchedArr.length) {
            if (countryArrExists && !countryFound) {
              console[logLevel$4]("Camouflage", `countries have been selected but the option shouldn't be hidden from the current country`, variant.id, variant.title);
            } else {
              markedUnavailableVariants.push(variant.id);
              console[logLevel$4]("Camouflage", "Global hide variant found", variant.id, variant.title, matchedArr);
              return false;
            }
          }
        }
      }
      if (hoosObj2.hide_oos_check_qty && hoosObj2.hide_oos_qty_threshold && inventory_qty_available) {
        if (variant.inventory_quantity <= hoosObj2.hide_oos_qty_threshold) {
          console[logLevel$4]("Camouflage", "Variant quantity lower than the threshold quantity", variant.id, variant.title);
          return false;
        }
      }
      if (hoe && hoosObj2.hide_if_no_image === "yes" && !(variant.featured_image || variant.featured_media || variant.image)) {
        markedUnavailableVariants.push(variant.id);
        console[logLevel$4]("Camouflage", "Variant hiding due to no image", variant.id, variant.title);
        return false;
      }
      let price = variant.price;
      if (typeof price === "object" && price.amount) {
        price = price.amount;
      }
      if (hoe && hoosObj2.hide_if_price_zero === "yes" && !Number(price || 0)) {
        markedUnavailableVariants.push(variant.id);
        console[logLevel$4]("Camouflage", "Variant hiding due 0 price", variant.id, variant.title);
        return false;
      }
      if (include_only_hide_show_field === "yes" || include_only_hide_show_field === true) {
        console[logLevel$4]("Camouflage", "Variant not hiding due to include_only_hide_show_field");
        return true;
      }
      if (hoosObj2.variant_action === "none" && (hide_unavailable === "yes" || !hide_unavailable)) {
        console[logLevel$4]("Camouflage", "Variant not hiding due to variant_action=none and hide_unavailable=yes");
        return true;
      }
      if (exit_due_to_include_tags) return true;
      return variant.available;
    });
    if (hoosObj2.selected_or_first_available_variant_id) {
      let currentSelectedVariant = availableVariants.find((variant) => variant.id == hoosObj2.selected_or_first_available_variant_id);
      if (currentSelectedVariant) {
        availableVariants = [
          currentSelectedVariant,
          ...availableVariants.filter((variant) => variant.id != currentSelectedVariant.id)
        ];
      }
    }
    if (markedUnavailableVariants.length && (hide_specific_variants === "hide" || version >= 4)) {
      hoosObj2.markedUnavailableVariants = markedUnavailableVariants;
      for (const v of hoosObj2.product.variants) {
        if (markedUnavailableVariants.includes(v.id)) {
          v.marked_unavailable = true;
        }
      }
    }
    if (logLevel$4 === "debug") {
      console[logLevel$4]("Camouflage", `availableVariants (${availableVariants.length}) Table for: ${hoosObj2.product.title}, ${hoosObj2.product.handle}, ${hoosObj2.product.id}`);
      console.table(availableVariants.slice(), ["id", "title", "sku", "available", "marked_unavailable", "inventory_quantity", "price"]);
    }
    if (window.getCamouflageAvailableVariants && typeof window.getCamouflageAvailableVariants === "function") {
      const temp = window.getCamouflageAvailableVariants(hoosObj2.product, availableVariants);
      console[logLevel$4]("Camouflage", "window.getCamouflageAvailableVariants found", temp);
      if (temp.availableVariants && temp.product) {
        availableVariants = temp.availableVariants;
        product = temp.product;
        if (logLevel$4 === "debug") {
          console.table(availableVariants, ["id", "title", "sku", "available", "marked_unavailable", "inventory_quantity", "price"]);
        }
      } else {
        console[logLevel$4]("Camouflage", "window.getCamouflageAvailableVariants not returning the correct keys");
      }
    }
    const availableVariantsIds = availableVariants.map((v) => v.id);
    let hiddenVariants = product.variants.filter((v) => !availableVariantsIds.includes(v.id));
    hoosObj2.hiddenVariants = hiddenVariants;
    if (logLevel$4 === "debug") {
      console[logLevel$4]("Camouflage", `hiddenVariants (${hiddenVariants.length}) Table for: ${hoosObj2.product.title}, ${hoosObj2.product.handle}, ${hoosObj2.product.id}`);
      console.table(hiddenVariants, ["id", "title", "sku", "available", "marked_unavailable", "inventory_quantity", "price"]);
    }
    for (let v of availableVariants) {
      if (hoosObj2.extras.lowercase_value) {
        v.option1 = v.option1 ? v.option1.toLowerCase() : v.option1;
        v.option2 = v.option2 ? v.option2.toLowerCase() : v.option2;
        v.option3 = v.option3 ? v.option3.toLowerCase() : v.option3;
        v.options = v.options.map((optn) => optn.toLowerCase());
      }
      let availability = 1;
      if (!v.available) {
        availability = 2;
      }
      hoosObj2.productOptions.option1[v.option1] = availability;
      if (v.option2) {
        hoosObj2.productOptions.option2[v.option2] = availability;
      }
      if (v.option3) {
        hoosObj2.productOptions.option3[v.option3] = availability;
      }
    }
    hoosObj2.product = product;
    hoosObj2.availableVariants = availableVariants;
    if (hoosObj2.skip_execution && exit_due_to_include_tags && hoosObj2.markedUnavailableVariants && hoosObj2.markedUnavailableVariants.length) {
      hoosObj2.skip_execution = false;
    }
    if (logLevel$4 === "debug") {
      console.groupEnd();
    }
    return availableVariants;
  }
  window.CAMOUFLAGEE.getAvailableVariants = getAvailableVariants$2;
  var getAvailableVariantsFn = {
    getAvailableVariants: getAvailableVariants$2
  };
  const { logLevel: logLevel$3 } = base;
  const { fetchProductByHandle } = camouflageCommon;
  const { getAvailableVariants: getAvailableVariants$1 } = getAvailableVariantsFn;
  const getVariantElement = (selectors) => {
    let variantElem = Array.isArray(selectors[0]) ? selectors[0][0] : selectors[0];
    return variantElem;
  };
  const ifVariantSelectorRemoved = (hoosObj2) => {
    let variantElem = getVariantElement(hoosObj2.selectors);
    if (!variantElem || !document.body.contains(variantElem)) {
      return true;
    }
    const mainContainer = hoosObj2.mainContainer;
    if (mainContainer instanceof HTMLElement) {
      if (!mainContainer.isConnected) {
        return true;
      }
      if (mainContainer.style && mainContainer.style.display === "none") {
        return true;
      }
    }
    return false;
  };
  const sleep$2 = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  const getNodeNameLowerCase$1 = (node) => {
    if (Array.isArray(node)) {
      return node[0]?.nodeName?.toLowerCase() || "";
    }
    return node.nodeName?.toLowerCase() || "";
  };
  function getRadioValue$1(hoosObj2, elem, elemValue = "") {
    let value = elem.value || elemValue;
    if (hoosObj2.extras.value_type === "variant_id" && hoosObj2.selectors.length === 1) {
      const variant = hoosObj2.product.variants.find((v) => v.id == value);
      if (variant) {
        value = variant.options[0];
      }
    } else if (hoosObj2.extras.value_type === "option_id" || value in hoosObj2.product.options_with_values_flat_keys) {
      const options_with_values_flat_keys = hoosObj2.product.options_with_values_flat_keys;
      const option = options_with_values_flat_keys[value];
      if (option && option.name) {
        value = option.name;
      }
    }
    return value;
  }
  const camouflageGetSelectedVariantOptionValue = ({ hoosObj: hoosObj2, selector: selector2 }) => {
    let element = selector2[0] ? selector2[0] : selector2;
    if (element.nodeName === "OPTION" && selector2.nodeName === "SELECT") {
      element = selector2;
    }
    if (element.nodeName === "BUTTON") {
      const checkedElem = selector2.find((r) => r.getAttribute("aria-selected") === "true");
      if (checkedElem) {
        return getRadioValue$1(hoosObj2, checkedElem);
      }
    } else if (element.nodeName === "LI" && element.closest("ul") && element.closest("ul").querySelector('li[aria-selected="true"]')) {
      const checkedElem = selector2.find((r) => r.getAttribute("aria-selected") === "true");
      if (checkedElem) {
        return getRadioValue$1(hoosObj2, checkedElem, checkedElem.getAttribute(hoosObj2.extras.attribute_name));
      }
    } else if (element.nodeName === "INPUT") {
      const checkedElem = selector2.find((r) => r.checked);
      if (checkedElem) {
        return getRadioValue$1(hoosObj2, checkedElem);
      }
    } else if (element.nodeName === "SELECT" && element.selectedIndex !== null && element.selectedIndex !== void 0) {
      const checkedElem = selector2.options[selector2.selectedIndex];
      if (checkedElem) {
        return getRadioValue$1(hoosObj2, checkedElem);
      }
    }
    return "";
  };
  function getVariantToSelectAfterVariantChange(hoosObj2, skip_initial_selection = false, skip_strikethrough_variant_change = "yes") {
    let tempVariants = hoosObj2.availableVariants.slice();
    const tempValArr = [];
    for (let i2 = 0; i2 < hoosObj2.selectors.length; i2++) {
      let checkdElemValue = camouflageGetSelectedVariantOptionValue({ hoosObj: hoosObj2, selector: hoosObj2.selectors[i2] });
      let tempVal = checkdElemValue ? getRadioValue$1(hoosObj2, checkdElemValue, checkdElemValue) : null;
      if (typeof window.camouflageGetSelectedVariantOptionValue === "function") {
        tempVal = window.camouflageGetSelectedVariantOptionValue({ hoosObj: hoosObj2, selector: hoosObj2.selectors[i2] }) || tempVal;
      }
      if (tempVal) {
        const selectedOptionVariants = tempVariants.filter((v) => v.options[i2] == tempVal);
        if (!selectedOptionVariants.length && tempVariants.length && !["strike-through", "select-append-text"].includes(hoosObj2.variant_action)) {
          tempVal = tempVariants[0].options[i2];
        }
        tempValArr.push(tempVal);
        if (i2 === hoosObj2.selectors.length - 1) {
          if (selectedOptionVariants.length) {
            tempVariants = selectedOptionVariants;
          }
        }
        tempVariants = selectedOptionVariants;
      }
    }
    if (tempVariants.length === 0 && ["strike-through", "select-append-text", "hide", "strike-through-disabled"].includes(hoosObj2.variant_action)) {
      const temp12 = hoosObj2.product.variants.filter((v) => v.options.join() === tempValArr.join());
      if (temp12.length && !temp12[0].marked_unavailable) {
        tempVariants = temp12;
      } else if (!temp12.length && tempValArr.length > 1) {
        const tempIfAtleast2OptionsAvailable = hoosObj2.product.variants.filter((v) => v.options.slice(0, -1).join() === tempValArr.slice(0, -1).join());
        if (tempIfAtleast2OptionsAvailable.length && !tempIfAtleast2OptionsAvailable[0].marked_unavailable) {
          tempVariants = tempIfAtleast2OptionsAvailable;
          skip_initial_selection = true;
          skip_strikethrough_variant_change = "no";
        } else if (tempValArr.length > 2) {
          const tempIfAtleast3OptionsAvailable = hoosObj2.product.variants.filter((v) => v.options.slice(0, -2).join() === tempValArr.slice(0, -2).join());
          if (tempIfAtleast3OptionsAvailable.length && !tempIfAtleast3OptionsAvailable[0].marked_unavailable) {
            tempVariants = tempIfAtleast3OptionsAvailable;
            skip_initial_selection = true;
            skip_strikethrough_variant_change = "no";
          }
        }
      }
    }
    return {
      tempVariants,
      tempValArr,
      skip_initial_selection,
      skip_strikethrough_variant_change
    };
  }
  const getOptionsToSelect$1 = ({
    hoosObj: hoosObj2,
    i: i2,
    tempVariants1,
    tempVariants2,
    checkedSelector,
    currentSelectedValue
  }) => {
    let selectedOptionExistsInAvailableVariants;
    let switchToOption = "";
    let selectedVariantId = "";
    console[logLevel$3]("switchToOption-1", switchToOption, currentSelectedValue);
    if (checkedSelector && currentSelectedValue) {
      selectedOptionExistsInAvailableVariants = tempVariants1.find((v) => currentSelectedValue == v.options[i2]);
      if (selectedOptionExistsInAvailableVariants) {
        selectedVariantId = selectedOptionExistsInAvailableVariants.id;
      }
    }
    if (selectedOptionExistsInAvailableVariants && selectedOptionExistsInAvailableVariants.options) {
      switchToOption = selectedOptionExistsInAvailableVariants.options[i2];
      selectedVariantId = selectedOptionExistsInAvailableVariants.id;
      console[logLevel$3]("switchToOption-2", switchToOption, currentSelectedValue);
    } else {
      if (tempVariants1.length) {
        switchToOption = tempVariants1[0].options[i2];
        selectedVariantId = tempVariants1[0].id;
        console[logLevel$3]("switchToOption-3", switchToOption, currentSelectedValue);
        if (hoosObj2.params.restarted_by == "mutation-observer" && hoosObj2.params.current_variant_id && tempVariants2.find((v) => v.id == hoosObj2.params.current_variant_id)) {
          switchToOption = tempVariants2.find((v) => v.id == hoosObj2.params.current_variant_id).options[i2];
          selectedVariantId = tempVariants2.find((v) => v.id == hoosObj2.params.current_variant_id).id;
          console[logLevel$3]("switchToOption-3-3", switchToOption, currentSelectedValue);
        }
      } else {
        const temp22 = tempVariants2.find((v) => currentSelectedValue == v.options[i2]);
        if (temp22) {
          switchToOption = temp22.options[i2];
          selectedVariantId = temp22.id;
          console[logLevel$3]("switchToOption-4", switchToOption, currentSelectedValue);
        } else {
          switchToOption = tempVariants2[0].options[i2];
          selectedVariantId = tempVariants2[0].id;
          console[logLevel$3]("switchToOption-5", switchToOption, currentSelectedValue);
        }
      }
    }
    return {
      switchToOption,
      selectedVariantId,
      selectedOptionExistsInAvailableVariants
    };
  };
  const getSelectedVariantOption$1 = (elemArray, hoosObj2) => {
    if (!elemArray) return null;
    if (Array.isArray(elemArray) && !elemArray.length) {
      return null;
    }
    if (typeof window.camouflageGetSelectedVariantOption === "function") {
      return window.camouflageGetSelectedVariantOption(elemArray, hoosObj2);
    }
    if (!Array.isArray(elemArray) && elemArray.nodeName === "SELECT") {
      return elemArray.options[elemArray.selectedIndex];
    }
    const htmlTag = getNodeNameLowerCase$1(elemArray[0]);
    const element = elemArray[0];
    if (htmlTag === "input") return elemArray.find((input) => input.checked);
    if (htmlTag === "select") return elemArray.value;
    if (htmlTag === "li" && typeof element.closest === "function" && element.closest("ul") && element.closest("ul").querySelector("li[aria-selected]")) {
      return element.closest("ul").querySelector('li[aria-selected="true"]');
    }
    if (htmlTag === "li" && typeof element.closest === "function" && element.closest("ul") && element.closest("ul").querySelector("li[aria-checked]")) {
      return element.closest("ul").querySelector('li[aria-checked="true"]');
    }
    if (htmlTag === "a" && typeof element.closest === "function" && element.closest("ul") && element.closest("ul").querySelector("li.active")) {
      return element.closest("ul").querySelector("li.active a");
    }
    return null;
  };
  const isOptionSelected$1 = (option) => {
    if (typeof window.camouflageIsOptionSelected === "function") {
      return window.camouflageIsOptionSelected(option);
    }
    const htmlTag = getNodeNameLowerCase$1(option);
    if (htmlTag === "input") return option.checked;
    if (htmlTag === "option") return option.selected;
    if (htmlTag === "li" && typeof option.closest === "function" && option.closest("ul") && option.closest("ul").querySelector("li[aria-selected]")) {
      return option.getAttribute("aria-selected") === "true";
    }
    if (htmlTag === "li" && typeof option.closest === "function" && option.closest("ul") && option.closest("ul").querySelector("li[aria-checked]")) {
      return option.getAttribute("aria-checked") === "true";
    }
    if (htmlTag === "a" && option.parentElement.nodeName === "LI" && option.parentElement.classList.contains("active")) {
      return true;
    }
    return false;
  };
  function getMainContainer$1() {
    const selectorsArr = ["variant-radios", "variant-selects", ".product-form product-variants", "main[role=main] form", "body"];
    for (let selector2 of selectorsArr) {
      const element = document.querySelector(selector2);
      if (element) {
        if (element.clientHeight < 10 || element.clientWidth < 10) {
          continue;
        }
        if (["variant-radios", "variant-selects"].includes(selector2)) {
          return element.parentElement;
        }
        return element;
      }
    }
    return null;
  }
  function updateAppIntegration$1(hoosObj2) {
    const integrates_with = hoosObj2.extras.integrates_with;
    if (!Object.keys(hoosObj2.query_selectors).length && integrates_with || integrates_with === "camouflage-variant-picker" && document.querySelector("camouflage-variant-picker")) {
      console[logLevel$3]("Camouflage", "updateAppIntegration", integrates_with);
      if (integrates_with === "globo-swatch") {
        if (hoosObj2.selector_type === "radio") {
          hoosObj2.mainContainer = ".globo-swatch-list";
          hoosObj2.extras.target_parent_element = true;
          hoosObj2.field_selector = ".globo-swatch-product-detail .globo-swatch-list ul";
          hoosObj2.input_selector = "input";
        }
      } else if (integrates_with === "pagefly") ;
      else if (integrates_with === "vopo") {
        if (hoosObj2.selector_type === "radio") {
          hoosObj2.mainContainer = "#bcpo";
          hoosObj2.field_selector = "#bcpo .single-option-selector[data-option]";
          hoosObj2.input_selector = "input";
          hoosObj2.extras.target_parent_element = true;
        }
      } else if (integrates_with === "ymq") {
        if (hoosObj2.selector_type === "radio") {
          hoosObj2.mainContainer = "#ymq-box";
          hoosObj2.field_selector = "#ymq-box .ymq-shopify-option-box";
          hoosObj2.input_selector = "input";
        }
      } else if (integrates_with === "swatch-king") {
        if (hoosObj2.selector_type !== "select") {
          hoosObj2.mainContainer = document.querySelector("variant-swatch-king") || "variant-swatch-king";
          hoosObj2.field_selector = "#swatch-option1, #swatch-option2, #swatch-option3";
          hoosObj2.input_selector = "li";
          hoosObj2.selector_type = "li";
          hoosObj2.extras.attribute_name = "orig-value";
          hoosObj2.extras.target_parent_element = false;
        }
      } else if (integrates_with === "camouflage-variant-picker") {
        hoosObj2.mainContainer = `.camouflage-variant-picker[data-product-id="${hoosObj2.product.id}"][variant-camouflage-ready="true"]`;
        hoosObj2.field_selector = ".camouflage-option-wrapper";
        hoosObj2.input_selector = "input, select";
        hoosObj2.selector_type = "input";
        hoosObj2.extras.attribute_name = "value";
        hoosObj2.extras.target_parent_element = true;
      }
    }
  }
  function setSelectors$1(hoosObj2) {
    let { selectors, enableDisabledSelectorsArr } = hoosObj2;
    if (!selectors.length) {
      selectors = [...hoosObj2.mainContainer.querySelectorAll(hoosObj2.field_selector)];
      enableDisabledSelectorsArr = selectors.slice();
      if (hoosObj2.selector_type === "radio") {
        selectors = selectors.map((fieldset) => {
          return [...fieldset.querySelectorAll("input[type=radio]")];
        });
      } else if (hoosObj2.selector_type !== "select") {
        selectors = selectors.map((fieldset) => {
          return [...fieldset.querySelectorAll(hoosObj2.input_selector)];
        });
      } else if (hoosObj2.selector_type === "select" && selectors.length && selectors[0].nodeName !== "SELECT" && selectors[0].querySelector && selectors[0].querySelector("select")) {
        console[logLevel$3]("Camouflage", "setSelectors:SELECT TYPE NEW!");
        selectors = selectors.map((fieldset) => {
          return fieldset.querySelector("select");
        });
      }
    }
    if (hoosObj2.reverse_options) {
      selectors = selectors.reverse();
      enableDisabledSelectorsArr = enableDisabledSelectorsArr.reverse();
      console[logLevel$3]("Camouflage", "Reversed variant options");
    }
    hoosObj2.enableDisabledSelectorsArr = enableDisabledSelectorsArr;
    console[logLevel$3]("Camouflage", "setSelectors:end", selectors);
    hoosObj2.selectors = selectors;
  }
  function shouldDisableMarkUnavailable$2(hoosObj2) {
    return ["hide", "disable", "strike-through-disabled"].includes(hoosObj2.extras.hide_specific_variants);
  }
  function shouldHideMarkUnavailable$2(hoosObj2) {
    const markedUnavailableVariantFound = hoosObj2.product.variants.some((v) => v.marked_unavailable);
    return markedUnavailableVariantFound && ["hide"].includes(hoosObj2.extras.hide_specific_variants);
  }
  function handleForMarkUnavailable$1(hoosObj2) {
    if (shouldHideMarkUnavailable$2(hoosObj2)) {
      const style = document.createElement("style");
      style.innerHTML = `.camouflage-marked-unavailable, 
        .ProductForm__Option li.HorizontalList__Item:has(input.camouflage-marked-unavailable) 
        {display: none !important;}`;
      document.head.appendChild(style);
    }
  }
  function labelHideShow$2(hoosObj2, label2, action = "hide", variantExists = true, markedUnavailable = false) {
    if (!label2) {
      return;
    }
    const {
      defaultUnavailableClass,
      unavailableClass,
      camouflageUnavailableClass,
      camouflageMarkedUnavailableClass
    } = hoosObj2;
    if (variantExists === false && hoosObj2.extras.include_only_hide_show_field === "yes" && hoosObj2.extras.hide_unavailable !== "yes") {
      if (markedUnavailable && shouldHideMarkUnavailable$2(hoosObj2)) ;
      else {
        return;
      }
    }
    const cssClasses = [unavailableClass, defaultUnavailableClass];
    let target_parent_element = hoosObj2.extras.target_parent_element;
    let target_parent2_element = hoosObj2.extras.target_parent2_element === true || hoosObj2.extras.target_parent2_element === "yes";
    if (hoosObj2.original_selector_type === "swatch_and_dropdown_mixed" && hoosObj2.selectors_metadata && hoosObj2.selectors_metadata.length) {
      if (hoosObj2.theme_name === "prestige-popover" && label2.nodeName === "BUTTON") {
        target_parent_element = false;
      }
    } else if (label2 && label2.nodeName === "OPTION") {
      target_parent_element = false;
    }
    if (action === "hide") {
      if (!variantExists) {
        cssClasses.push(camouflageUnavailableClass);
      } else if (markedUnavailable) {
        cssClasses.push(camouflageMarkedUnavailableClass);
      }
      label2.classList.add(...cssClasses);
      if (target_parent_element) {
        label2.parentElement.classList.add(...cssClasses);
      }
      if (target_parent2_element) {
        label2.parentElement.parentElement.classList.add(...cssClasses);
      }
    } else {
      cssClasses.push(camouflageUnavailableClass, camouflageMarkedUnavailableClass);
      label2.classList.remove(...cssClasses);
      if (target_parent_element) {
        label2.parentElement.classList.remove(...cssClasses);
      }
      if (target_parent2_element) {
        label2.parentElement.parentElement.classList.remove(...cssClasses);
      }
    }
    const hoosEvent = new CustomEvent("hoos:labelhideshow", { detail: action });
    document.dispatchEvent(hoosEvent);
  }
  async function getProduct$1(hoosObj2) {
    if (window.getCamouflageProduct && typeof window.getCamouflageProduct === "function") {
      hoosObj2.product = await window.getCamouflageProduct(hoosObj2.product, hoosObj2);
      console[logLevel$3]("Camouflage", "window.getCamouflageProduct found");
    }
    if (hoosObj2.extras && hoosObj2.extras.hide_oos_product_json_selector) {
      const productDataContainer = document.getElementById(hoosObj2.extras.hide_oos_product_json_selector);
      if (productDataContainer) {
        hoosObj2.product = JSON.parse(productDataContainer.innerHTML);
      }
    }
    if (hoosObj2.product && hoosObj2.product.variants_count > 250 && hoosObj2.product.variants.length <= 250) {
      hoosObj2.product = await fetchProductByHandle(hoosObj2.product.handle, window.camouflage_global_config.key);
      if (hoosObj2.params && hoosObj2.params.product) {
        hoosObj2.params.product = hoosObj2.product;
      }
    }
    if (hoosObj2.product.options_with_values) {
      const options_with_values_flat_keys = {};
      hoosObj2.product.options_with_values.map((o) => o.values).flat().forEach((item) => {
        options_with_values_flat_keys[item.id] = item;
      });
      hoosObj2.product.options_with_values_flat_keys = options_with_values_flat_keys;
    }
    return hoosObj2.product;
  }
  function fireCamouflageExecutedEvent$1(hoosObj2) {
    if (window.CustomEvent) {
      hoosObj2.currentTime = (/* @__PURE__ */ new Date()).getTime();
      const hoosEvent = new CustomEvent("hoos:executed", { detail: hoosObj2 });
      document.dispatchEvent(hoosEvent);
      console[logLevel$3]("Camouflage", "hoos:executed event fired");
    }
  }
  function getCSSEscapedValue$2(selectedValue) {
    if (typeof selectedValue === "number") {
      selectedValue = selectedValue.toString();
    }
    if (selectedValue && typeof selectedValue !== "function" && (selectedValue.indexOf(`'`) >= 0 || selectedValue.indexOf(`"`) >= 0 || selectedValue.indexOf("\n") >= 0 || selectedValue.indexOf("\r") >= 0 || selectedValue.indexOf("	") >= 0) && window.CSS && window.CSS.escape && typeof window.CSS.escape === "function") {
      selectedValue = CSS.escape(selectedValue);
    }
    return selectedValue;
  }
  function checkIfShouldRun$1(hoosObj2) {
    if (hoosObj2.extras.should_run) return true;
    if (hoosObj2.extras.should_run === false) return false;
    if (shouldHideMarkUnavailable$2(hoosObj2)) {
      return true;
    }
    if ((hoosObj2.hide_if_no_image === "yes" || hoosObj2.extras.hide_if_price_zero === "yes") && hoosObj2.availableVariants.length !== hoosObj2.product.variants.length) {
      return true;
    }
    if (hoosObj2.extras.include_only_hide_show_field === "yes" && hoosObj2.extras.hide_unavailable !== "yes" && hoosObj2.availableVariants.length === hoosObj2.product.variants.length) {
      return false;
    }
    if (hoosObj2.variant_action === "none" && hoosObj2.extras.include_only_hide_show_field !== "yes" && hoosObj2.extras.hide_unavailable !== "yes") {
      return false;
    }
    return true;
  }
  const shouldHideInSafari$1 = (hoosObj2, markedUnavailable = false) => {
    if (!(hoosObj2.isSafari && hoosObj2.hide_oos_variants && typeof hoosObj2.hide_oos_variants === "boolean")) {
      if (markedUnavailable && !shouldHideMarkUnavailable$2(hoosObj2)) {
        return false;
      }
    }
    if (hoosObj2.product.options.length === 1) {
      return true;
    }
    return hoosObj2.extras.hide_in_safari === "hide";
  };
  const wrapSelectOption$1 = ({ option, markedUnavailable, hoosObj: hoosObj2 }) => {
    if (["strike-through", "strike-through-disabled"].includes(hoosObj2.variant_action)) {
      return;
    }
    console[logLevel$3]("Camouflage", "wrapSelectOption:start", option.nodeName, option.value);
    if (!(hoosObj2.isSafari && option.nodeName === "OPTION")) return;
    if (option.parentElement.nodeName === "SPAN") return;
    if (!shouldHideInSafari$1(hoosObj2, markedUnavailable)) {
      console[logLevel$3]("Camouflage", "wrapSelectOption:shouldHideInSafari not wrapping in span", { markedUnavailable, optionValue: option.value });
      return;
    }
    const wrapper = document.createElement("span");
    option.parentNode.insertBefore(wrapper, option);
    wrapper.appendChild(option);
  };
  const checkAndHandleOptionDisable$2 = ({
    option,
    variantExists = true,
    markedUnavailable = false,
    hoosObj: hoosObj2,
    isSelectedValue,
    allSoldout
  }) => {
    if (variantExists === false && hoosObj2.extras.hide_unavailable !== "yes" && hoosObj2.extras.include_only_hide_show_field === "yes") {
      if (markedUnavailable && shouldDisableMarkUnavailable$2(hoosObj2)) ;
      else {
        return;
      }
    }
    let textToAppend = hoosObj2.extras.append_soldout_text;
    if (!variantExists) {
      textToAppend = hoosObj2.extras.append_unavailable_text || textToAppend;
    }
    if (textToAppend && !option.innerText.includes(textToAppend)) {
      if (!option.dataset.camouflageoptiontext) {
        option.dataset.camouflageoptiontext = option.innerText.trim();
      }
      option.innerText += textToAppend;
    }
    if (hoosObj2.extras.option_disable === "no-disable") {
      if (!variantExists && hoosObj2.extras.hide_unavailable === "yes") {
        option.disabled = true;
        option.camouflage_disabled = true;
        if (allSoldout && isSelectedValue) ;
        else if (hoosObj2.extras.variant_change_delay) {
          setTimeout(() => {
            wrapSelectOption$1({ option, markedUnavailable, hoosObj: hoosObj2 });
          }, hoosObj2.extras.variant_wrap_change_delay || 10);
        } else {
          wrapSelectOption$1({ option, markedUnavailable, hoosObj: hoosObj2 });
        }
      }
    } else {
      option.disabled = true;
      option.camouflage_disabled = true;
      if (allSoldout && isSelectedValue) ;
      else if (hoosObj2.extras.variant_change_delay) {
        setTimeout(() => {
          wrapSelectOption$1({ option, markedUnavailable, hoosObj: hoosObj2 });
        }, hoosObj2.extras.variant_wrap_change_delay || 10);
      } else {
        wrapSelectOption$1({ option, markedUnavailable, hoosObj: hoosObj2 });
      }
    }
  };
  const hideUnavailableOption1FromSelect$1 = (hoosObj2) => {
    const firstFieldOptions = [...hoosObj2.selectors[0].querySelectorAll("option")];
    for (let option of firstFieldOptions) {
      let optionValue = option.value;
      if (hoosObj2.extras.select_attribute_name && hoosObj2.product.options.length === 1) {
        optionValue = option.getAttribute(hoosObj2.extras.select_attribute_name);
        if (!optionValue) {
          continue;
        }
      }
      if ((!optionValue || optionValue === "not-selected") && hoosObj2.extras.make_a_selection_required === true) {
        continue;
      }
      if (optionValue in hoosObj2.productOptions.option1) {
        option.disabled = false;
        option.camouflage_disabled = false;
      } else {
        if (option.classList.contains(hoosObj2.makeSelectionNoHideClass)) {
          continue;
        }
        let variantExists = true;
        let markedUnavailable = false;
        if (hoosObj2.product.options.length === 1) {
          markedUnavailable = hoosObj2.product.variants.some((variant) => variant.options[0] === option.value && variant.marked_unavailable);
        } else {
          markedUnavailable = hoosObj2.product.variants.filter((variant) => variant.options[0] === option.value).every((variant) => variant.marked_unavailable);
        }
        labelHideShow$2(hoosObj2, option, "hide", variantExists, markedUnavailable);
        checkAndHandleOptionDisable$2({
          option,
          variantExists,
          markedUnavailable,
          hoosObj: hoosObj2
        });
      }
    }
  };
  const hideFromVariantIdDropdown$1 = ({ hoosObj: hoosObj2 }) => {
    let firstAvailableVariantId;
    let selectedVariantValue;
    if (hoosObj2.selector_type === "select") {
      const availableVariants = hoosObj2.availableVariants;
      const firstFieldOptions = [...hoosObj2.selectors[0].querySelectorAll("option")];
      selectedVariantValue = hoosObj2.selectors[0].value;
      for (let option of firstFieldOptions) {
        let optionValue = option.value;
        if (hoosObj2.extras.select_attribute_name) {
          optionValue = option.getAttribute(hoosObj2.extras.select_attribute_name);
          if (!optionValue) {
            continue;
          }
        }
        if (!optionValue || optionValue === "not-selected") {
          continue;
        }
        const avaiable = availableVariants.find((v) => v.id == optionValue);
        if (avaiable) {
          option.disabled = false;
          option.camouflage_disabled = false;
        } else {
          if (option.classList.contains(hoosObj2.makeSelectionNoHideClass)) {
            continue;
          }
          let variantExists = true;
          let markedUnavailable = false;
          if (hoosObj2.product.options.length === 1) {
            markedUnavailable = hoosObj2.product.variants.some((variant) => variant.id == optionValue && variant.marked_unavailable);
          } else {
            markedUnavailable = hoosObj2.product.variants.filter((variant) => variant.id == optionValue).every((variant) => variant.marked_unavailable);
          }
          labelHideShow$2(hoosObj2, option, "hide", variantExists, markedUnavailable);
          checkAndHandleOptionDisable$2({
            option,
            variantExists,
            markedUnavailable,
            hoosObj: hoosObj2
          });
        }
      }
      let firstEnabledVariant = firstFieldOptions.find((v) => !v.classList.contains("hide-oos-disable") && v.value && v.value !== "not-selected");
      if (firstEnabledVariant) {
        firstAvailableVariantId = firstEnabledVariant.value;
      }
    }
    return { firstAvailableVariantId, selectedVariantValue };
  };
  const hideFromVariantIdUIElem$1 = ({ hoosObj: hoosObj2 }) => {
    console[logLevel$3]("hideFromVariantIdUIElem");
    let firstAvailableVariantId;
    let selectedVariantValue;
    let firstFieldOptions = [];
    if (hoosObj2.selector_type === "select") {
      firstFieldOptions = [...hoosObj2.selectors[0].querySelectorAll("option")];
    } else {
      firstFieldOptions = [...hoosObj2.selectors[0]];
    }
    const availableVariants = hoosObj2.availableVariants;
    selectedVariantValue = hoosObj2.selectors[0][0].getAttribute(hoosObj2.extras.select_attribute_name || hoosObj2.extras.attribute_name || "value");
    for (let option of firstFieldOptions) {
      let optionValue = option.value;
      if (hoosObj2.extras.select_attribute_name || hoosObj2.extras.attribute_name) {
        optionValue = option.getAttribute(hoosObj2.extras.select_attribute_name || hoosObj2.extras.attribute_name);
        if (!optionValue) {
          continue;
        }
      }
      if (!optionValue || optionValue === "not-selected") {
        continue;
      }
      const avaiable = availableVariants.find((v) => v.id == optionValue);
      console[logLevel$3]("hideFromVariantIdUIElem:mid", avaiable);
      if (avaiable) {
        option.disabled = false;
        option.camouflage_disabled = false;
      } else {
        if (option.classList.contains(hoosObj2.makeSelectionNoHideClass)) {
          continue;
        }
        let variantExists = true;
        let markedUnavailable = false;
        if (hoosObj2.product.options.length === 1) {
          markedUnavailable = hoosObj2.product.variants.some((variant) => variant.id == optionValue && variant.marked_unavailable);
        } else {
          markedUnavailable = hoosObj2.product.variants.filter((variant) => variant.id == optionValue).every((variant) => variant.marked_unavailable);
        }
        let labelToHide = option;
        if (option.nodeName === "INPUT") {
          labelToHide = hoosObj2.mainContainer.querySelector(`[for='${getCSSEscapedValue$2(option.id)}]'`) || option.nextElementSibling;
        }
        labelHideShow$2(hoosObj2, labelToHide, "hide", variantExists, markedUnavailable);
        if (hoosObj2.selector_type === "select") {
          checkAndHandleOptionDisable$2({
            option,
            variantExists,
            markedUnavailable,
            hoosObj: hoosObj2
          });
        }
      }
    }
    const firstEnabledVariant = firstFieldOptions.find((v) => !v.classList.contains("hide-oos-disable"));
    if (firstEnabledVariant) {
      firstAvailableVariantId = firstEnabledVariant.value;
    }
    return { firstAvailableVariantId, selectedVariantValue };
  };
  const reinitCamouflageFn = ({
    param,
    currentVariantId,
    productId,
    camouflageVariants,
    variantPickerReplaced,
    startFn
  }) => {
    if (productId && currentVariantId && param.product) {
      if (!param.product.variants.find((v) => v.id == currentVariantId)) {
        console[logLevel$3](...["%c reinitCamouflage:mid1", "color:pink; font-size: 20px", `current product is not ${param.product.title}`]);
        return;
      }
    }
    console[logLevel$3](...["%c reinitCamouflage:mid2", "color:green; font-size: 20px", productId, currentVariantId]);
    let lapsedTime = 0;
    let intervalDuration = 10;
    let shouldRestart = variantPickerReplaced;
    if (param.source && ["quick_view", "featured_product"].includes(param.source)) {
      shouldRestart = true;
    }
    const intervalTimer = setInterval(() => {
      lapsedTime += intervalDuration;
      if (ifVariantSelectorRemoved(camouflageVariants)) {
        shouldRestart = true;
      }
      if (shouldRestart || lapsedTime >= 500) {
        clearInterval(intervalTimer);
      }
      if (shouldRestart) {
        param.selected_or_first_available_variant_id = currentVariantId;
        console[logLevel$3](`Restarting...`, currentVariantId);
        startFn(param);
      } else {
        console[logLevel$3](`Not starting...`);
      }
    }, intervalDuration);
  };
  const getCorrectHoosObj$1 = (cacheSignature = null, getLatest = false) => {
    let cacheSignatureToCompare = cacheSignature || window.CAMOUFLAGEE.cacheSignature;
    let hoosObjCorrect = null;
    if (getLatest) {
      hoosObjCorrect = window.CAMOUFLAGEE.items.findLast((item) => {
        if (!item.extras.cacheSignature) {
          return false;
        }
        let productIdMatched = item.extras.cacheSignature.productId === cacheSignature.productId;
        let searchNodeSignatureMatched = item.extras.cacheSignature.searchNodeSignature === cacheSignature.searchNodeSignature;
        return productIdMatched && searchNodeSignatureMatched;
      });
      return hoosObjCorrect;
    }
    return window.CAMOUFLAGEE.items.find((item) => {
      if (!item.extras.cacheSignature) {
        return false;
      }
      let productIdMatched = item.extras.cacheSignature.productId === cacheSignatureToCompare.productId;
      let searchNodeSignatureMatched = item.extras.cacheSignature.searchNodeSignature === cacheSignatureToCompare.searchNodeSignature;
      return productIdMatched && searchNodeSignatureMatched;
    });
  };
  const observeVariantInputFieldTA7$1 = (hoosObj2, param, startFn) => {
    console.groupCollapsed("[TA7][OVIF] INIT");
    console[logLevel$3]("Starting observer setup...");
    console[logLevel$3]("hoosObj:", hoosObj2);
    console.groupEnd();
    hoosObj2.product.id;
    const originalHoosObj = getCorrectHoosObj$1(hoosObj2.extras.cacheSignature);
    if (!checkIfShouldRun$1(hoosObj2)) {
      console.warn("[TA7][OVIF] checkIfShouldRun returned false");
      return;
    }
    let observerTarget = hoosObj2.extras?.observer_container_node;
    if (!observerTarget) {
      console.warn("[TA7][OVIF] No observerTarget found");
      return;
    }
    if (observerTarget.getAttribute("is-camouflage-observing") && observerTarget === originalHoosObj.extras.deepestStableNode) {
      console.warn("[TA7][OVIF] Observer already attached on deepest stable node");
      return;
    }
    console[logLevel$3]("[TA7][OVIF] Observing node:", observerTarget);
    const observerConfig = { childList: true, subtree: true };
    const originalContainer = observerTarget;
    let removedDetected = false;
    let addedDetected = false;
    let restartScheduled = false;
    let debounceTimer = null;
    let callCount = 0;
    let startTime = Date.now();
    const DEBOUNCE_DELAY = hoosObj2.extras?.observer_restart_delay || 20;
    const observerCallback = (mutationsList, observer2) => {
      const hoosObjLatest = getCorrectHoosObj$1(hoosObj2.extras.cacheSignature, true);
      const originalMainContainer = hoosObjLatest.mainContainer || null;
      const originalWrappers = Array.isArray(hoosObjLatest.option_wrappers) ? hoosObjLatest.option_wrappers.filter(Boolean) : [];
      const originalFirstSelectors = Array.isArray(hoosObjLatest.selectors) ? hoosObjLatest.selectors.map((axis) => Array.isArray(axis) ? axis[0] : axis).filter(Boolean) : [];
      if (logLevel$3 === "debug") {
        console.groupCollapsed("[TA7][OVIF] SNAPSHOT");
        console[logLevel$3]("originalContainer:", originalContainer);
        console[logLevel$3]("originalMainContainer:", originalMainContainer);
        console[logLevel$3]("originalWrappers:", originalWrappers);
        console[logLevel$3]("originalFirstSelectors:", originalFirstSelectors);
        console.groupEnd();
      }
      if (logLevel$3 === "debug") {
        console.groupCollapsed("[TA7][OVIF] MUTATION CALLBACK");
        console[logLevel$3]("Mutations received:", mutationsList);
        console[logLevel$3]("removedDetected:", removedDetected);
        console[logLevel$3]("addedDetected:", addedDetected);
        console.groupEnd();
      }
      if (!removedDetected) {
        const containerGone = !originalContainer.isConnected;
        const mainGone = originalMainContainer && !originalMainContainer.isConnected;
        const wrapperGone = originalWrappers.length && originalWrappers.some((w) => !w.isConnected);
        const selectorGone = originalFirstSelectors.length && originalFirstSelectors.some((s) => !s.isConnected);
        if (containerGone || mainGone || wrapperGone || selectorGone) {
          removedDetected = true;
          console.warn("[TA7][OVIF] ✅ Removal detected");
        }
      }
      if (!addedDetected) {
        if (hoosObj2.extras.variant_picker_selector) {
          let variantPickerFound = observerTarget.querySelector(hoosObj2.extras.variant_picker_selector);
          if (variantPickerFound) {
            addedDetected = true;
          }
        }
        if (!addedDetected) {
          const { leafNodeAttributeSelectorsArr, effectiveOptionCount } = originalHoosObj.extras.hoos_ta7_cache;
          const relevantNodesAdded = mutationsList.some((m) => {
            if (m.type !== "childList" || m.addedNodes.length === 0) return false;
            return Array.from(m.addedNodes).some((node) => {
              if (node.nodeType !== 1) return false;
              return leafNodeAttributeSelectorsArr.some((selector2) => node.matches?.(selector2) || node.querySelector?.(selector2));
            });
          });
          if (relevantNodesAdded) {
            if (effectiveOptionCount === 1) {
              addedDetected = true;
            } else {
              let allSelectorsPresent = leafNodeAttributeSelectorsArr.every((selector2) => observerTarget.querySelector(selector2));
              if (allSelectorsPresent) {
                addedDetected = true;
              }
            }
          }
        }
      }
      if (!(removedDetected && addedDetected)) {
        console[logLevel$3]("[TA7][OVIF] Did not detect both removal + addition...");
        return;
      }
      console.warn("[TA7][OVIF] 🔁 Re-render confirmed. Scheduling restart.");
      originalHoosObj.extras.mutation_observer_requirement_decided = true;
      originalHoosObj.extras.mutation_observer_still_needed = true;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (restartScheduled) {
          console[logLevel$3]("[TA7][OVIF] Restart already scheduled");
          return;
        }
        restartScheduled = true;
        const now = Date.now();
        const timeDiff = now - startTime;
        if (timeDiff > 15e3) {
          startTime = now;
          callCount = 0;
        }
        callCount++;
        console[logLevel$3]("[TA7][OVIF] Restart attempt #", callCount);
        if (callCount >= 30 && timeDiff < 15e3) {
          console.error("[TA7][OVIF] Circuit breaker triggered");
          observer2.disconnect();
          setTimeout(() => {
            console[logLevel$3]("[TA7][OVIF] Re-attaching observer after cooldown");
            observer2.observe(observerTarget, observerConfig);
          }, 3e3);
          removedDetected = false;
          addedDetected = false;
          restartScheduled = false;
          return;
        }
        if (logLevel$3 === "debug") {
          console.groupCollapsed("[TA7][OVIF] 🚀 RESTARTING CAMOUFLAGE");
          console[logLevel$3]("Calling setSelectors_TA7...");
          console.groupEnd();
        }
        try {
          hoosObj2.selectors = [];
          hoosObjLatest.selectors = [];
          let tempVariants = hoosObj2.availableVariants.slice();
          const resp = getVariantToSelectAfterVariantChange(
            hoosObjLatest,
            param.skip_initial_selection,
            "yes"
          );
          tempVariants = resp.tempVariants;
          param.skip_initial_selection = resp.skip_initial_selection;
          if (tempVariants.length) {
            param.current_variant_id = tempVariants[0].id;
            console[logLevel$3]("[TA7][OVIF] New current_variant_id:", param.current_variant_id);
          }
          param.restarted_by = "mutation-observer-ta7";
          param.skip_initial_selection = true;
          if (!originalHoosObj.extras.deepestStableNode || !originalHoosObj.extras.deepestStableNode.isConnected) {
            let deepestStableNode = originalHoosObj.extras.ancestorReferences.find((node) => node.isConnected);
            originalHoosObj.extras.deepestStableNode = deepestStableNode;
            originalHoosObj.extras.deepestStableNodeUpdated = true;
            originalHoosObj.extras.hoos_ta7_cache.deepestStableNode = deepestStableNode;
          }
          window.CAMOUFLAGEE.cacheSignature = hoosObjLatest.extras.cacheSignature;
          reinitCamouflageFn({
            param: { ...param },
            currentVariantId: param.current_variant_id || "",
            productId: param.product?.id || "",
            camouflageVariants: hoosObjLatest,
            variantPickerReplaced: true,
            startFn
          });
        } catch (err) {
          console.error("[TA7][OVIF] Restart error:", err);
        }
        removedDetected = false;
        addedDetected = false;
        restartScheduled = false;
      }, DEBOUNCE_DELAY);
    };
    if (originalHoosObj.extras.use_ta7_cache && originalHoosObj.extras.deepestStableNode && originalHoosObj.extras.deepestStableNodeUpdated) {
      let previousObservedNode = originalHoosObj.extras.currObservedNode;
      let previousMutationObserver = originalHoosObj.extras.currMutationObserver;
      previousMutationObserver.disconnect();
      previousObservedNode.removeAttribute("is-camouflage-observing");
      observerTarget = originalHoosObj.extras.deepestStableNode;
      originalHoosObj.extras.currObservedNode = originalHoosObj.extras.deepestStableNode;
      originalHoosObj.extras.deepestStableNodeUpdated = false;
      originalHoosObj.extras.isObserverScopeMinimized = true;
    }
    const observer = new MutationObserver(observerCallback);
    observer.observe(observerTarget, observerConfig);
    observerTarget.setAttribute("is-camouflage-observing", "true");
    originalHoosObj.extras.currMutationObserver = observer;
    originalHoosObj.extras.currObservedNode = observerTarget;
    console[logLevel$3]("[TA7][OVIF] Observer attached.");
    const handleVariantChange = (event) => {
      setTimeout(() => {
        const { source: variantChangeSource } = event.detail;
        if (variantChangeSource !== "detectChangeAndUpdateElements()") {
          return;
        }
        const { ta7_selector_snapshot: snapShot } = originalHoosObj.extras;
        const originalSnapShotConnected = snapShot.mainContainer.isConnected && snapShot.wrappers.every((w) => w?.isConnected) && snapShot.selectors.every((s) => s?.isConnected);
        if (originalSnapShotConnected) {
          console[logLevel$3]("[TA7][OVIF] Original Snapshot still connected, observer not needed");
          originalHoosObj.extras.mutation_observer_still_needed = false;
          let previousMutationObserver = originalHoosObj.extras.currMutationObserver;
          if (previousMutationObserver) previousMutationObserver.disconnect();
        } else {
          console[logLevel$3]("[TA7][OVIF] Original Snapshot disconnected, observer needed");
          originalHoosObj.extras.mutation_observer_still_needed = true;
        }
        originalHoosObj.extras.mutation_observer_requirement_decided = true;
        console[logLevel$3]("[TA7][OVIF] Mutation observer requirement decided, unmounting variantchangelistener");
        observerTarget.removeEventListener("hoos:variantchanged", handleVariantChange);
      }, 4e3);
    };
    if (!originalHoosObj.extras.mutation_observer_requirement_decided) {
      observerTarget.addEventListener("hoos:variantchanged", handleVariantChange, { once: true });
    }
  };
  const observeVariantInputField$1 = (hoosObj2, param, startFn) => {
    console[logLevel$3]("observeVariantInputField:start");
    if (!checkIfShouldRun$1(hoosObj2)) {
      console[logLevel$3]("Camouflage", "checkIfShouldRun:false returning....");
      return;
    }
    const customObserverSelector = hoosObj2.extras.observer_selector && typeof hoosObj2.extras.observer_selector === "string" ? [hoosObj2.extras.observer_selector] : [];
    const variantPickerObserverTags = [
      ...customObserverSelector,
      '.product-info__block-item[data-block-id="variant_picker"]',
      // prestige 10x
      '.product-info__block-item[data-block-id="variant_selector"]',
      '.product-info__block-item[data-block-type="variant-picker"]',
      // prestige 10x
      '.product-page--block[data-block-type="options"]',
      // Beyond 4.1+
      '.product--block[data-block-type="options"]',
      // Beyond 4.1+
      ".f8pr-variant-selection",
      // Xclusive theme
      "variant-selects",
      "variant-picker",
      "#quick-buy-modal-content",
      // Prestige quick view -> this element gets added on option change
      ".tt-swatches-container",
      // Wookie
      "high-variant-selects"
      // Ascent 3.x
    ];
    if (hoosObj2.mainContainer && !hoosObj2.mainContainer.getAttribute("is-camouflage-observing")) {
      const observerTarget = hoosObj2.mainContainer;
      const observerConfig = { childList: true, subtree: true };
      let callCount = 0;
      let startTime = null;
      const observer_restart_delay = hoosObj2.extras.observer_restart_delay || 10;
      let nodeStatus = {
        added: false,
        removed: false
      };
      const observerCallback = (mutationsList, observer2) => {
        if (!startTime) {
          startTime = Date.now();
        }
        let restarted = false;
        let restart = false;
        mutationsList.forEach((mutation) => {
          console[logLevel$3]({ mutation });
          if (mutation.type === "childList") {
            for (const child of mutation.addedNodes) {
              for (const variantPickerElem of variantPickerObserverTags) {
                if (typeof child.closest === "function" && child.closest(variantPickerElem)) {
                  console[logLevel$3]("closest", child.closest(variantPickerElem));
                  nodeStatus.added = true;
                  break;
                }
              }
              if (nodeStatus.added) break;
            }
            for (const child of mutation.removedNodes) {
              for (const variantPickerElem of variantPickerObserverTags) {
                let variantPickerFieldsetRemovedFromDOM = false;
                if (!child.parentElement && typeof child.closest === "function" && typeof child.querySelector === "function") {
                  variantPickerFieldsetRemovedFromDOM = !!(child.closest(hoosObj2.field_selector) === child || child.querySelector(hoosObj2.field_selector));
                }
                if (typeof child.closest === "function" && child.closest(variantPickerElem)) {
                  console[logLevel$3]("closest", child.closest(variantPickerElem));
                  nodeStatus.removed = true;
                  break;
                } else if (variantPickerFieldsetRemovedFromDOM) {
                  console[logLevel$3]("variantPickerFieldsetRemovedFromDOM");
                  nodeStatus.removed = true;
                  break;
                }
              }
              if (nodeStatus.removed) break;
            }
            restart = nodeStatus.added && nodeStatus.removed;
          }
        });
        if (!restarted && restart && true) {
          callCount++;
          let timeDiff = Date.now() - startTime;
          if (callCount >= 30 && timeDiff < 15 * 1e3) {
            console[logLevel$3](`\x1B[31m------------Camouflage called ${callCount} times in ${timeDiff / 1e3} seconds, stopping observer, timeDiff ${timeDiff}, callCount: ${callCount}----------\x1B[0m`);
            observer2.disconnect();
            setTimeout(() => {
              observer2.observe(observerTarget, observerConfig);
            }, 3e3);
            return;
          }
          if (timeDiff > 15 * 1e3) {
            startTime = Date.now();
            callCount = 0;
          }
          restarted = true;
          setTimeout(async () => {
            if (["strike-through", "select-append-text"].includes(hoosObj2.variant_action)) {
              param.skip_initial_selection = true;
            } else {
              param.skip_initial_selection = true;
            }
            let variantPickerReplaced = false;
            if (ifVariantSelectorRemoved(hoosObj2)) {
              hoosObj2.selectors = [];
              if (typeof window.setCustomCamouflageSelectors === "function") {
                const result = await window.setCustomCamouflageSelectors({ hoosObj: hoosObj2, product: hoosObj2.product });
                hoosObj2.selectors = result.selectors;
                hoosObj2.enableDisabledSelectorsArr = result.enableDisabledSelectorsArr;
                hoosObj2.extras.target_parent_element = true;
              } else {
                if (typeof param.setSelectors === "function") {
                  param.setSelectors(hoosObj2);
                } else {
                  setSelectors$1(hoosObj2);
                }
              }
              variantPickerReplaced = true;
            }
            if (localStorage.getItem("camouflage_test") === "yes" && hoosObj2.selectors && hoosObj2.selectors.length > hoosObj2.product.options.length) {
              console[logLevel$3](`------------MULTIPLE VARIANTS PRESENT!!---------------`);
              variantPickerReplaced = false;
              nodeStatus.removed = false;
              restart = false;
              restarted = false;
              return;
            }
            let tempVariants = hoosObj2.availableVariants.slice();
            const resp = getVariantToSelectAfterVariantChange(hoosObj2, param.skip_initial_selection, "yes");
            tempVariants = resp.tempVariants;
            param.skip_initial_selection = resp.skip_initial_selection;
            param.hide_oos_extras.skip_strikethrough_variant_change = resp.skip_strikethrough_variant_change;
            console[logLevel$3]({ tempVariants11: tempVariants, tempValArr: resp.tempValArr, selectedProductOptions: hoosObj2.selectedProductOptions });
            if (tempVariants.length) {
              param.current_variant_id = tempVariants[0].id;
              console[logLevel$3](`------------set current_variant_id: ${param.current_variant_id}, tempValArr: ${resp.tempValArr.join(", ")}---------------`);
            }
            let productId = param.product ? param.product.id : "";
            let currentVariantId = param.current_variant_id ? param.current_variant_id : "";
            param.restarted_by = "mutation-observer";
            reinitCamouflageFn({
              param: { ...param },
              currentVariantId,
              productId,
              camouflageVariants: hoosObj2,
              variantPickerReplaced,
              startFn
            });
            nodeStatus.added = false;
            nodeStatus.removed = false;
          }, observer_restart_delay);
        }
      };
      const observer = new MutationObserver(observerCallback);
      observer.observe(observerTarget, observerConfig);
      hoosObj2.mainContainer.setAttribute("is-camouflage-observing", "true");
    }
  };
  document.addEventListener("hoos:executed", (event) => {
  });
  const addRemoveCSStyleForHiddenVariants$1 = (hoosObj2) => {
    if (!Array.isArray(hoosObj2.enableDisabledSelectorsArr) || hoosObj2.enableDisabledSelectorsArr.length !== hoosObj2.product.options.length) {
      return;
    }
    let render_global_hide_script = hoosObj2.render_global_hide_script;
    if (!render_global_hide_script && hoosObj2.extras) {
      render_global_hide_script = hoosObj2.extras.render_global_hide_script;
    }
    if (render_global_hide_script !== "yes") {
      return;
    }
    const source = hoosObj2.params && hoosObj2.params.source || "";
    let cssStlyId = "camouflage-custom-css-pdp";
    if (source === "quick_view" || source === "featured_product") {
      cssStlyId = `camouflage-custom-css-pdp-${hoosObj2.product.id}`;
    }
    const camouflageGeneratedStyle = document.getElementById(cssStlyId);
    if (camouflageGeneratedStyle) {
      return;
    }
    let cssCode = `display: none !important;`;
    if (hoosObj2.extras.include_only_hide_show_field !== "yes" && hoosObj2.variant_action !== "hide") {
      cssCode = `text-decoration: line-through !important; `;
      if (["disable", "strike-through-disabled"].includes(hoosObj2.variant_action)) {
        cssCode += ` cursor: not-allowed!important;`;
      }
    }
    const cssValues = [];
    for (let i2 = 0; i2 < hoosObj2.enableDisabledSelectorsArr.length; i2++) {
      if (!hoosObj2.productOptions) {
        continue;
      }
      if (!hoosObj2.productOptions[`option${i2 + 1}`]) {
        continue;
      }
      let inputSelector = hoosObj2.input_selector || hoosObj2.selector_type;
      if (inputSelector === "select") {
        inputSelector = "option";
      } else if (inputSelector === "radio") {
        inputSelector = "input";
      }
      if (!inputSelector && hoosObj2.enableDisabledSelectorsArr[i2]) {
        inputSelector = getNodeNameLowerCase$1(hoosObj2.enableDisabledSelectorsArr[i2]);
      }
      let valueAttribute = hoosObj2.extras && hoosObj2.extras.attribute_name || "value";
      const option = hoosObj2.product.options_with_values[i2];
      const values = option.values;
      for (const value of values) {
        if (!(value.name in hoosObj2.productOptions[`option${i2 + 1}`])) {
          if (typeof window.camouflageGlobalVariantHideFnPDP === "function") {
            window.camouflageGlobalVariantHideFnPDP({
              option_name: option.name,
              option_value: value.name,
              option,
              value,
              css_array: cssValues,
              hoosObj: hoosObj2
            });
          } else {
            const valueSelector = `${hoosObj2.field_selector} ${inputSelector}[${valueAttribute}="${CSS.escape(value.name)}"]`;
            const radio2 = hoosObj2.mainContainer.querySelector(valueSelector);
            if (radio2 && radio2.id) {
              cssValues.push(`${hoosObj2.field_selector} label[for="${radio2.id}"] { ${cssCode} }`);
            } else if (source !== "quick_view" && source !== "featured_product") {
              cssValues.push(`${valueSelector} { ${cssCode} }`);
              cssValues.push(`${valueSelector} + label { ${cssCode} }`);
            }
            if (value.id) {
              cssValues.push(`${hoosObj2.field_selector} ${inputSelector}[${valueAttribute}="${value.id}"] { ${cssCode} }`);
              cssValues.push(`${hoosObj2.field_selector} ${inputSelector}[${valueAttribute}="${value.id}"] + label { ${cssCode} }`);
            }
          }
        }
      }
    }
    const style = document.createElement("style");
    style.innerHTML = cssValues.join("\n");
    style.id = cssStlyId;
    document.head.appendChild(style);
    if (camouflageGeneratedStyle) {
      camouflageGeneratedStyle.remove();
    }
  };
  window.CAMOUFLAGEE.getRadioValue = getRadioValue$1;
  var commonV2 = {
    getOptionsToSelect: getOptionsToSelect$1,
    updateAppIntegration: updateAppIntegration$1,
    getMainContainer: getMainContainer$1,
    getAvailableVariants: getAvailableVariants$1,
    handleForMarkUnavailable: handleForMarkUnavailable$1,
    getProduct: getProduct$1,
    fireCamouflageExecutedEvent: fireCamouflageExecutedEvent$1,
    getCSSEscapedValue: getCSSEscapedValue$2,
    checkIfShouldRun: checkIfShouldRun$1,
    shouldHideMarkUnavailable: shouldHideMarkUnavailable$2,
    shouldDisableMarkUnavailable: shouldDisableMarkUnavailable$2,
    sleep: sleep$2,
    getNodeNameLowerCase: getNodeNameLowerCase$1,
    getSelectedVariantOption: getSelectedVariantOption$1,
    isOptionSelected: isOptionSelected$1,
    hideUnavailableOption1FromSelect: hideUnavailableOption1FromSelect$1,
    hideFromVariantIdDropdown: hideFromVariantIdDropdown$1,
    hideFromVariantIdUIElem: hideFromVariantIdUIElem$1,
    observeVariantInputField: observeVariantInputField$1,
    observeVariantInputFieldTA7: observeVariantInputFieldTA7$1,
    getCorrectHoosObj: getCorrectHoosObj$1,
    addRemoveCSStyleForHiddenVariants: addRemoveCSStyleForHiddenVariants$1
    // createHiddenVariantStylesheet,
  };
  const { logLevel: logLevel$2 } = base;
  function getRadioValue(hoosObj2, elem) {
    let value = elem.value;
    if (hoosObj2.extras.value_type === "variant_id" && hoosObj2.selectors.length === 1) {
      const variant = hoosObj2.product.variants.find((v) => v.id == value);
      if (variant) {
        value = variant.options[0];
      }
    } else if (hoosObj2.extras.value_type === "option_id" || hoosObj2.product.options_with_values_flat_keys && value in hoosObj2.product.options_with_values_flat_keys) {
      const options_with_values_flat_keys = hoosObj2.product.options_with_values_flat_keys;
      const option = options_with_values_flat_keys[value];
      if (option && option.name) {
        value = option.name;
      }
    }
    return value;
  }
  async function getMainContainerFromString$1(mainContainerString, waitForMS = 4e3) {
    console[logLevel$2]("getMainContainerFromString:start", mainContainerString);
    let lapsedTime = 0;
    let intervalDuration = 100;
    let mainContainer;
    return new Promise((resolve, reject) => {
      const intervalTimer = setInterval(() => {
        lapsedTime += intervalDuration;
        mainContainer = document.querySelector(mainContainerString);
        if (mainContainer || lapsedTime >= waitForMS) {
          resolve(mainContainer);
          clearInterval(intervalTimer);
          console[logLevel$2]("Camouflage", { mainContainer, lapsedTime });
        }
      }, intervalDuration);
    });
  }
  function shouldDisableMarkUnavailable$1(hoosObj2) {
    return ["hide", "disable", "strike-through-disabled"].includes(hoosObj2.extras.hide_specific_variants);
  }
  function shouldHideMarkUnavailable$1(hoosObj2) {
    const markedUnavailableVariantFound = hoosObj2.product.variants.some((v) => v.marked_unavailable);
    return markedUnavailableVariantFound && ["hide"].includes(hoosObj2.extras.hide_specific_variants);
  }
  function updateExtraObj$1(hoosObj2) {
    if ((hoosObj2.hide_oos_variants === true || hoosObj2.variant_action === "hide") && hoosObj2.selector_type === "radio" && !window.hide_oos_input_selector) {
      hoosObj2.extras.disabled = true;
    }
    const { selectors } = hoosObj2;
    const attribute_name = hoosObj2.extras.attribute_name;
    if (attribute_name !== void 0 && !["", "value"].includes(attribute_name)) {
      for (let selector2 of selectors) {
        for (let item of selector2) {
          const value2 = getRadioValue(hoosObj2, item);
          if (value2) {
            item.setAttribute(attribute_name, value2);
          }
        }
      }
    }
    if (typeof hoosObj2.extras.radio_disabled === "boolean") {
      hoosObj2.extras.disabled = hoosObj2.extras.radio_disabled;
    }
    if (hoosObj2.selector_type === "select" || hoosObj2.extras.target_parent_element) {
      return;
    }
    const value = getRadioValue(hoosObj2, selectors[0][0]);
    if (selectors && selectors[0] && selectors[0][0] && value) {
      const parentElement = selectors[0][0].parentElement;
      if (selectors[0][0].nodeName === "INPUT" && parentElement && parentElement.nodeName === "LABEL" && !parentElement.getAttribute("for")) {
        const childElements = parentElement.querySelectorAll("input");
        if (childElements.length === 1) {
          hoosObj2.extras.target_parent_element = true;
          return;
        }
      }
      if (selectors[0][0].nodeName === "INPUT") {
        return;
      }
      const attrValue = selectors[0][0].parentElement.getAttribute("data-value");
      if (!attrValue) {
        return;
      }
      if (value === attrValue) {
        hoosObj2.extras.target_parent_element = true;
      }
    }
  }
  function labelHideShow$1(hoosObj2, label2, action = "hide", variantExists = true, markedUnavailable = false) {
    if (!label2) {
      return;
    }
    const {
      defaultUnavailableClass,
      unavailableClass,
      camouflageUnavailableClass,
      camouflageMarkedUnavailableClass
    } = hoosObj2;
    if (variantExists === false && hoosObj2.extras.include_only_hide_show_field === "yes" && hoosObj2.extras.hide_unavailable !== "yes") {
      if (markedUnavailable && shouldHideMarkUnavailable$1(hoosObj2)) ;
      else {
        return;
      }
    }
    const cssClasses = [unavailableClass, defaultUnavailableClass];
    let target_parent_element = hoosObj2.extras.target_parent_element;
    let target_parent2_element = hoosObj2.extras.target_parent2_element === true || hoosObj2.extras.target_parent2_element === "yes";
    if (hoosObj2.original_selector_type === "swatch_and_dropdown_mixed" && hoosObj2.selectors_metadata && hoosObj2.selectors_metadata.length) {
      if (hoosObj2.theme_name === "prestige-popover" && label2.nodeName === "BUTTON") {
        target_parent_element = false;
      }
    } else if (label2 && label2.nodeName === "OPTION") {
      target_parent_element = false;
    }
    if (action === "hide") {
      if (!variantExists) {
        cssClasses.push(camouflageUnavailableClass);
      } else if (markedUnavailable) {
        cssClasses.push(camouflageMarkedUnavailableClass);
      }
      label2.classList.add(...cssClasses);
      for (let c of cssClasses) {
        let underscored_c = c.replace(/-/g, "_");
        label2[underscored_c] = true;
      }
      if (target_parent_element) {
        label2.parentElement.classList.add(...cssClasses);
        for (let c of cssClasses) {
          let underscored_c = c.replace(/-/g, "_");
          label2.parentElement[underscored_c] = true;
        }
      }
      if (target_parent2_element) {
        label2.parentElement.parentElement.classList.add(...cssClasses);
      }
    } else {
      cssClasses.push(camouflageUnavailableClass, camouflageMarkedUnavailableClass);
      label2.classList.remove(...cssClasses);
      for (let c of cssClasses) {
        let underscored_c = c.replace(/-/g, "_");
        label2[underscored_c] = false;
      }
      if (target_parent_element) {
        label2.parentElement.classList.remove(...cssClasses);
        for (let c of cssClasses) {
          let underscored_c = c.replace(/-/g, "_");
          label2.parentElement[underscored_c] = false;
        }
      }
      if (target_parent2_element) {
        label2.parentElement.parentElement.classList.remove(...cssClasses);
        for (let c of cssClasses) {
          let underscored_c = c.replace(/-/g, "_");
          label2.parentElement.parentElement[underscored_c] = false;
        }
      }
    }
    const hoosEvent = new CustomEvent("hoos:labelhideshow", { detail: action });
    document.dispatchEvent(hoosEvent);
  }
  function fireCamouflageHoosObjPreparedEvent$1(hoosObj2) {
    if (window.CustomEvent) {
      const hoosEvent = new CustomEvent("hoos:prepared", { detail: hoosObj2 });
      document.dispatchEvent(hoosEvent);
      console[logLevel$2]("Camouflage", "hoos:prepared event fired");
    }
  }
  function getCSSEscapedValue$1(selectedValue) {
    if (typeof selectedValue === "number") {
      selectedValue = selectedValue.toString();
    }
    if (selectedValue && typeof selectedValue !== "function" && (selectedValue.indexOf(`'`) >= 0 || selectedValue.indexOf(`"`) >= 0 || selectedValue.indexOf("\n") >= 0 || selectedValue.indexOf("\r") >= 0 || selectedValue.indexOf("	") >= 0) && window.CSS && window.CSS.escape && typeof window.CSS.escape === "function") {
      selectedValue = CSS.escape(selectedValue);
    }
    return selectedValue;
  }
  const shouldHideInSafari = (hoosObj2, markedUnavailable = false) => {
    if (!(hoosObj2.isSafari && hoosObj2.hide_oos_variants && typeof hoosObj2.hide_oos_variants === "boolean")) {
      if (markedUnavailable && !shouldHideMarkUnavailable$1(hoosObj2)) {
        return false;
      }
    }
    if (hoosObj2.product.options.length === 1) {
      return true;
    }
    return hoosObj2.extras.hide_in_safari === "hide";
  };
  const wrapSelectOption = ({ option, markedUnavailable, hoosObj: hoosObj2 }) => {
    if (["strike-through", "strike-through-disabled"].includes(hoosObj2.variant_action)) {
      return;
    }
    console[logLevel$2]("Camouflage", "wrapSelectOption:start", option.nodeName, option.value);
    if (!(hoosObj2.isSafari && option.nodeName === "OPTION")) return;
    if (option.parentElement.nodeName === "SPAN") return;
    if (!shouldHideInSafari(hoosObj2, markedUnavailable)) {
      console[logLevel$2]("Camouflage", "wrapSelectOption:shouldHideInSafari not wrapping in span", { markedUnavailable, optionValue: option.value });
      return;
    }
    const wrapper = document.createElement("span");
    option.parentNode.insertBefore(wrapper, option);
    wrapper.appendChild(option);
  };
  const unwrapSelectOption$1 = ({ option, hoosObj: hoosObj2 }) => {
    if (!(hoosObj2.isSafari && option.nodeName === "OPTION")) return;
    const wrapper = option.parentElement;
    if (wrapper.nodeName !== "SPAN") return;
    const docFrag = document.createDocumentFragment();
    while (wrapper.firstChild) {
      const child = wrapper.removeChild(wrapper.firstChild);
      docFrag.appendChild(child);
    }
    wrapper.parentNode.replaceChild(docFrag, wrapper);
  };
  const checkAndHandleOptionDisable$1 = ({
    option,
    variantExists = true,
    markedUnavailable = false,
    hoosObj: hoosObj2,
    isSelectedValue,
    allSoldout
  }) => {
    if (variantExists === false && hoosObj2.extras.hide_unavailable !== "yes" && hoosObj2.extras.include_only_hide_show_field === "yes") {
      if (markedUnavailable && shouldDisableMarkUnavailable$1(hoosObj2)) ;
      else {
        return;
      }
    }
    let textToAppend = hoosObj2.extras.append_soldout_text;
    if (!variantExists) {
      textToAppend = hoosObj2.extras.append_unavailable_text || textToAppend;
    }
    if (textToAppend && !option.innerText.includes(textToAppend)) {
      if (!option.dataset.camouflageoptiontext) {
        option.dataset.camouflageoptiontext = option.innerText.trim();
      }
      option.innerText += textToAppend;
    }
    if (hoosObj2.extras.option_disable === "no-disable") {
      if (!variantExists && hoosObj2.extras.hide_unavailable === "yes") {
        option.disabled = true;
        option.camouflage_disabled = true;
        if (allSoldout && isSelectedValue) ;
        else if (hoosObj2.extras.variant_change_delay) {
          setTimeout(() => {
            wrapSelectOption({ option, markedUnavailable, hoosObj: hoosObj2 });
          }, hoosObj2.extras.variant_wrap_change_delay || 10);
        } else {
          wrapSelectOption({ option, markedUnavailable, hoosObj: hoosObj2 });
        }
      }
    } else {
      option.disabled = true;
      option.camouflage_disabled = true;
      if (allSoldout && isSelectedValue) ;
      else if (hoosObj2.extras.variant_change_delay) {
        setTimeout(() => {
          wrapSelectOption({ option, markedUnavailable, hoosObj: hoosObj2 });
        }, hoosObj2.extras.variant_wrap_change_delay || 10);
      } else {
        wrapSelectOption({ option, markedUnavailable, hoosObj: hoosObj2 });
      }
    }
  };
  const triggerChangeEventOnSelect$1 = (selectElem, selectedValue, index, hoosObj2) => {
    let selector_type = hoosObj2.selector_type;
    if (selectElem && selectElem.nodeName === "SELECT") {
      selector_type = "select";
    }
    if (Array.isArray(selectElem) && selector_type === "select") {
      selector_type = selectElem[0].nodeName.toLowerCase();
    } else if (selector_type !== "select" && !Array.isArray(selectElem) && selectElem.nodeName === "SELECT") {
      selector_type = "select";
    }
    let shouldDispatchEvent = true;
    if (hoosObj2 && hoosObj2.extras && hoosObj2.extras.is_featured_product === true && hoosObj2.extras.page_loaded !== true) {
      setTimeout(() => {
        hoosObj2.extras.page_loaded = true;
      }, 1500);
      shouldDispatchEvent = false;
    }
    if (selector_type === "select") {
      if (typeof selectElem === "function") {
        return;
      }
      selectedValue = getCSSEscapedValue$1(selectedValue);
      let optn = selectElem.querySelector(`[value='${selectedValue}']`);
      if (!optn && hoosObj2.extras.select_attribute_name && typeof selectElem.querySelector === "function") {
        optn = selectElem.querySelector(`option[${hoosObj2.extras.select_attribute_name}='${CSS.escape(selectedValue)}']`);
      }
      if (optn) {
        optn.selected = true;
        const event = new Event("change", { bubbles: true });
        if (shouldDispatchEvent) {
          selectElem.dispatchEvent(event);
        }
      }
    } else {
      let radioInput = selectElem.find((s) => s.value == selectedValue);
      if (radioInput) {
        radioInput.checked = true;
        const event = new Event("change", { bubbles: true });
        if (shouldDispatchEvent) {
          radioInput.dispatchEvent(event);
        }
      }
      if (hoosObj2.extras.radio_mapped_select_selector && hoosObj2.extras.map_select_with_radio === true) {
        let mapped_selectors = document.querySelectorAll(hoosObj2.extras.radio_mapped_select_selector);
        if (mapped_selectors && mapped_selectors.length === hoosObj2.selectors.length) {
          selectedValue = getCSSEscapedValue$1(selectedValue);
          let option_to_select = mapped_selectors[index].querySelector(`option[value=${selectedValue}]`);
          if (option_to_select) {
            option_to_select.selected = true;
            const event = new Event("change", { bubbles: true });
            if (shouldDispatchEvent) {
              mapped_selectors[index].dispatchEvent(event);
            }
          }
        }
      }
    }
    if (typeof window.camouflageDispatchVariantChange === "function") {
      window.camouflageDispatchVariantChange({
        selectElem,
        selectedValue,
        index,
        hoosObj: hoosObj2
      });
    }
  };
  const observeContainerForRestoringAttributes$1 = (hoosObj2) => {
    let shouldDisableSoldOut = hoosObj2.extras.disabled === true || ["hide", "disable", "strike-through-disabled"].includes(hoosObj2.variant_action);
    let shouldDisableMarkedUnavailable = shouldDisableMarkUnavailable$1(hoosObj2);
    function handleMutation(mutation) {
      if (mutation.type !== "attributes" || mutation.attributeName !== "class") {
        return;
      }
      const target = mutation.target;
      const oldClassList = mutation.oldValue ? mutation.oldValue.split(" ") : [];
      const newClassList = Array.from(target.classList || []);
      const classesToCheck = [
        hoosObj2.camouflageUnavailableClass,
        hoosObj2.camouflageMarkedUnavailableClass,
        hoosObj2.defaultUnavailableClass
      ];
      classesToCheck.forEach((checkClass) => {
        const wasRemoved = oldClassList.includes(checkClass) && !newClassList.includes(checkClass);
        if (!wasRemoved) {
          return;
        }
        console[logLevel$2]("Camouflage", `Class ${checkClass} was removed from:`, target);
        const propertyName = checkClass.replace(/-/g, "_");
        if (target[propertyName] === true) {
          console[logLevel$2]("Camouflage", `Restoring class ${checkClass} because the property is true`);
          target.classList.add(checkClass);
          if (target.camouflage_disabled === true) {
            if (checkClass === hoosObj2.defaultUnavailableClass && shouldDisableSoldOut) {
              target.disabled = true;
            } else if (checkClass === hoosObj2.camouflageMarkedUnavailableClass && shouldDisableMarkedUnavailable) {
              target.disabled = true;
            } else if (checkClass === hoosObj2.camouflageUnavailableClass) {
              target.disabled = true;
            }
          }
        }
      });
    }
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(handleMutation);
    });
    const config = {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ["class"],
      subtree: true
    };
    const variantPicker = document.querySelector("variant-picker");
    if (variantPicker) {
      observer.observe(variantPicker, config);
      console[logLevel$2]("MutationObserver started to track specific class removal");
    } else {
      console[logLevel$2]("variant-picker element not found, observer not started");
    }
  };
  document.addEventListener("hoos:executed", (event) => {
  });
  var common = {
    getMainContainerFromString: getMainContainerFromString$1,
    updateExtraObj: updateExtraObj$1,
    labelHideShow: labelHideShow$1,
    fireCamouflageHoosObjPreparedEvent: fireCamouflageHoosObjPreparedEvent$1,
    unwrapSelectOption: unwrapSelectOption$1,
    checkAndHandleOptionDisable: checkAndHandleOptionDisable$1,
    triggerChangeEventOnSelect: triggerChangeEventOnSelect$1,
    // createHiddenVariantStylesheet,
    observeContainerForRestoringAttributes: observeContainerForRestoringAttributes$1
  };
  const { sleep: sleep$1 } = commonV2;
  const { logLevel: logLevel$1 } = base;
  let rejectedSelectorWrapper = /* @__PURE__ */ new WeakSet();
  let globalCacheData = null;
  function isElementVisible(el) {
    const style = getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden" && parseFloat(style.opacity) > 0 && el.offsetParent !== null && el.getClientRects().length > 0;
  }
  async function waitForVisibleElement(selector2, timeout = 1500, interval = 100) {
    const start2 = Date.now();
    while (Date.now() - start2 < timeout) {
      const el = document.querySelector(selector2);
      if (el && isElementVisible(el)) {
        return el;
      }
      await sleep$1(interval);
    }
    throw new Error(`Element ${selector2} not visible within ${timeout}ms`);
  }
  function findProductIdMatch(node, id) {
    for (let attr of node.attributes) {
      if (attr.value.includes(id)) {
        return true;
      }
    }
    return false;
  }
  function findNameIdElement(idSignaturesForAnchors) {
    const { productId, variantIds } = idSignaturesForAnchors;
    const previousSearchNodes = window.CAMOUFLAGEE.previousSearchNodes ?? [];
    const id = String(productId);
    let anchors = Array.from(
      document.querySelectorAll('[name="id"]')
    );
    if (previousSearchNodes.length) {
      anchors = anchors.filter((anchor) => previousSearchNodes.every((psn) => psn && !psn.contains(anchor)));
    }
    console[logLevel$1]({ anchors });
    console[logLevel$1]({ variantIds });
    let validNameIdElement = anchors.find((anchor) => isElementVisible(anchor.parentElement) && (variantIds.includes(anchor.value) || findProductIdMatch(anchor, id) || findProductIdMatch(anchor.parentElement, id) || Array.from(anchor.parentElement.querySelectorAll("*")).some((child) => findProductIdMatch(child, id))));
    if (!validNameIdElement) {
      const productIdMatches = Array.from(document.querySelectorAll("*")).filter((node) => {
        for (const attr of node.attributes) {
          if (attr.value.includes(id)) return true;
        }
        return false;
      });
      validNameIdElement = anchors.find((anchor) => productIdMatches.some((pim) => pim === anchor || pim.contains(anchor) || anchor.contains(pim) || anchor.parentElement.contains(pim) || pim.parentElement.contains(anchor)));
    }
    console[logLevel$1]({ validNameIdElement });
    return {
      validNameIdElement,
      nameIdAnchors: anchors
    };
  }
  function getParentNodeForVPCSearch(node, specifiedDepth, recall = false) {
    let current;
    let candidate;
    if (!recall) {
      current = node.parentElement;
      candidate = current;
      let maxDepth = specifiedDepth;
      let depth = 0;
      while (current && current !== document.body && depth < maxDepth) {
        candidate = current;
        current = current.parentElement;
        depth++;
      }
    } else {
      if (!candidate || candidate === document.body) return null;
      candidate = candidate.parentElement;
    }
    let addToCartButton = null;
    if (candidate) {
      addToCartButton = candidate.querySelector("button[type=submit]");
    }
    return {
      addToCartButton,
      parent: candidate,
      isBodyNext: candidate?.parentElement === document.body
    };
  }
  function generateOptionExtractionKeys(vp_candidate, optionCount, optionValueRack, encodingIndex, productOptions, vpValidationData) {
    let optionExtractionKeys = [];
    if (optionCount > 1) {
      optionExtractionKeys = vpValidationData.fieldSetMap.map(
        (optionAxisIndex, mapIndex) => {
          return {
            optionAxis: productOptions[optionAxisIndex].values[encodingIndex],
            ov_attribute: vpValidationData.selector_yielding_ova_perFsCand[mapIndex],
            fs_cand: vp_candidate.option_wrappers[mapIndex]
          };
        }
      );
    } else {
      optionExtractionKeys.push({
        optionAxis: optionValueRack,
        ov_attribute: vpValidationData.selector_yielding_ova_perFsCand[0],
        fs_cand: vpValidationData.fieldSet
      });
    }
    console[logLevel$1]({ optionExtractionKeys });
    return optionExtractionKeys;
  }
  function generateSelectorsfromOpexKeys(optionExtractionKeys) {
    let finalSelectorSet = optionExtractionKeys.map((optionExtKey, opexKeyIndex) => {
      let ov_attribute_array = Array.from(optionExtKey.ov_attribute);
      let fs_cand = optionExtKey.fs_cand;
      let rawSelectorSets = [];
      for (let ov_attribute of ov_attribute_array) {
        let selectorSet = /* @__PURE__ */ new Set();
        let optionValuesInAxis = optionExtKey.optionAxis;
        for (let i2 = 0; i2 < optionValuesInAxis.length; i2++) {
          let optionValue = optionValuesInAxis[i2];
          let attributeSelector = `[${ov_attribute}="${CSS.escape(
            optionValue
          )}"]`;
          let el;
          if (!globalCacheData) {
            let matches = [...fs_cand.querySelectorAll(attributeSelector)];
            el = matches.find((node) => !rejectedSelectorWrapper.has(node));
          } else {
            let { input_selector_types } = globalCacheData;
            input_selector_types = input_selector_types.filter(Boolean);
            let tagUsed = input_selector_types[opexKeyIndex];
            if (tagUsed === "select") {
              tagUsed = "option";
            }
            attributeSelector = tagUsed + attributeSelector;
            el = fs_cand.querySelector(attributeSelector);
          }
          if (el) selectorSet.add(el);
        }
        if (selectorSet.size) {
          rawSelectorSets.push({
            ov_attribute,
            selectors: selectorSet
          });
        }
      }
      let dedupedResult = {};
      for (let i2 = 0; i2 < rawSelectorSets.length; i2++) {
        let { ov_attribute, selectors } = rawSelectorSets[i2];
        let isDuplicate = false;
        for (let existingAttr in dedupedResult) {
          let existingSet = dedupedResult[existingAttr];
          if (selectors.size === existingSet.length && [...selectors].every((el) => existingSet.includes(el))) {
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
  function returnBestSelectorSet(selectorSetArray) {
    let selectorPriorityList = [
      // Tier 1 — native interactive
      "input",
      "option",
      "button",
      "a",
      "li",
      "div",
      "label",
      // Tier 3 — custom UI containers
      "span",
      "p",
      // Tier 4 — media & visual selectors
      "img",
      "picture",
      "svg",
      "path",
      // Tier 2 — semantic containers
      "ul",
      "fieldset",
      "strong"
    ];
    if (!selectorSetArray.length) {
      console.warn({
        Control_Function: "returnBestSelectorSet()",
        error: "selectorSetArray is empty"
      });
      return null;
    }
    let selectorCandidatesList = selectorSetArray.map((selectorSet, index) => {
      return {
        selectorRep: selectorSet.selectors[0].tagName.toLowerCase(),
        inSelSetIndex: index,
        selProListIndex: -1
      };
    });
    for (let selectorCandidate of selectorCandidatesList) {
      let { selectorRep } = selectorCandidate;
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
  function extractFinalSelectors(selector_set) {
    let extractedSelectorData = [];
    for (const optionAxisObject of selector_set) {
      const entries = Object.entries(optionAxisObject);
      if (!entries.length) {
        console.warn({
          Control_Function: "extractFinalSelectors()",
          error: "current option axis is empty"
        });
        return null;
      }
      if (entries.length === 1) {
        const [[attribute_name, selectors]] = entries;
        extractedSelectorData.push({
          value_attribute: attribute_name,
          selectors
        });
        continue;
      }
      let isSelectorSetVisible = false;
      let finalSelectorSet = null;
      let visibleSelectorSet = [];
      let invisibleSelectorSet = [];
      for (const [ov_attribute, selectors] of entries) {
        isSelectorSetVisible = selectors.some(
          (selector2) => {
            let isVisible = true;
            if (["input", "option"].includes(selector2.tagName.toLowerCase())) {
              isVisible = isElementVisible(selector2.parentElement);
            }
            return isVisible;
          }
          // We check the parent element's visibility to account for cases
          // where the selector itself might be hidden but its parent is visible.
        );
        if (isSelectorSetVisible) {
          visibleSelectorSet.push({ ov_attribute, selectors });
        } else {
          invisibleSelectorSet.push({ ov_attribute, selectors });
        }
      }
      if (visibleSelectorSet.length) {
        if (visibleSelectorSet.length === 1) {
          finalSelectorSet = visibleSelectorSet[0];
        } else {
          finalSelectorSet = returnBestSelectorSet(visibleSelectorSet);
        }
      } else {
        finalSelectorSet = returnBestSelectorSet(invisibleSelectorSet);
      }
      if (!finalSelectorSet) {
        console.warn({
          Control_Function: "extractFinalSelectors()",
          error: "could not extract selectors for current option axis",
          data: optionAxisObject
        });
        return null;
      }
      finalSelectorSet = {
        value_attribute: finalSelectorSet.ov_attribute,
        selectors: finalSelectorSet.selectors
      };
      extractedSelectorData.push(finalSelectorSet);
    }
    return extractedSelectorData;
  }
  function getCorrectVariantPickerWithSelectors(vp_candidate, optionCount, optionValueRack, encodingIndex, productOptions, vpValidationData) {
    let optionExtractionKeys = generateOptionExtractionKeys(
      vp_candidate,
      optionCount,
      optionValueRack,
      encodingIndex,
      productOptions,
      vpValidationData
    );
    let finalSelectorResult = {};
    let optionExtKeyGenSuccess = false;
    if (optionCount > 1) {
      optionExtKeyGenSuccess = optionExtractionKeys.length === vp_candidate.option_wrappers.length;
    } else {
      optionExtKeyGenSuccess = optionExtractionKeys.length === 1;
    }
    if (!optionExtKeyGenSuccess) {
      console.warn({
        option_extraction_status: "[Failure]",
        optionExtractionKeys
      });
      return null;
    }
    finalSelectorResult.selector_set = generateSelectorsfromOpexKeys(optionExtractionKeys);
    finalSelectorResult.selector_data = extractFinalSelectors(
      finalSelectorResult.selector_set
    );
    if (finalSelectorResult.selector_set.length) {
      return finalSelectorResult;
    }
    return null;
  }
  function isValidVariantPicker(vp_candidate, optionCount, optionValuesRack, OPTION_VALUE_ATTRIBUTES, matchedAxisIndices) {
    let ov_attributes_filtered_per_fsCand = vp_candidate.option_wrappers.map(
      (fs_cand) => {
        let matched_ova = OPTION_VALUE_ATTRIBUTES.filter((ova) => fs_cand.querySelector(`[${ova}]`));
        if (matched_ova.length) return matched_ova;
        return [];
      }
    );
    console[logLevel$1]({ vp_candidate });
    if (ov_attributes_filtered_per_fsCand.every((ova_array) => !ova_array.length)) {
      console.warn({
        Control_Function: "isValidVariantPicker()",
        Error: "Invalid vp_candidate",
        vp_candidate,
        ov_attributes_filtered_per_fsCand
      });
      return null;
    }
    let selector_yielding_ova_perFsCand = new Array(optionCount).fill(null);
    if (optionCount === 1) {
      let selectorYieldingOVAList = ov_attributes_filtered_per_fsCand[0].filter(
        (ova) => {
          let attributeSelector = `[${ova}="${CSS.escape(optionValuesRack[0])}"]`;
          let fs_cand = vp_candidate.option_wrappers[0];
          let selectorFound = fs_cand.querySelector(attributeSelector);
          let selectorVisible = true;
          if (selectorFound && ["input", "option"].includes(selectorFound.tagName.toLowerCase())) {
            selectorVisible = isElementVisible(selectorFound.parentElement);
          }
          return selectorFound && selectorVisible;
        }
      );
      if (selectorYieldingOVAList.length > 0) {
        selector_yielding_ova_perFsCand[0] = selectorYieldingOVAList;
        return {
          selector_yielding_ova_perFsCand,
          fieldSet: vp_candidate.option_wrappers[0]
        };
      }
      return null;
    }
    let fieldSetMap = new Array(optionCount).fill(-1);
    let axisOccupied = new Array(optionCount).fill(false);
    let fs_candidates = vp_candidate.option_wrappers;
    for (let fs_cand_index = 0; fs_cand_index < vp_candidate.option_wrappers.length; fs_cand_index++) {
      let fs_cand = fs_candidates[fs_cand_index];
      let ovaListForCurrentFsCand = ov_attributes_filtered_per_fsCand[fs_cand_index];
      if (!ovaListForCurrentFsCand.length) {
        console.warn({
          Control_Function: "isValidVariantPicker()",
          error: "Current option_wrapper has no value_attributes",
          fs_cand
        });
        return null;
      }
      for (let optionAxisIndex = 0; optionAxisIndex < optionValuesRack.length; optionAxisIndex++) {
        let selectorYieldingOVAList = ov_attributes_filtered_per_fsCand[fs_cand_index];
        selectorYieldingOVAList = selectorYieldingOVAList.filter((ova) => {
          let attributeSelector = `[${ova}="${CSS.escape(
            optionValuesRack[optionAxisIndex]
          )}"]`;
          let selectorFound = fs_cand.querySelector(attributeSelector);
          let selectorVisible = true;
          if (selectorFound && ["input", "option"].includes(selectorFound.tagName.toLowerCase())) {
            selectorVisible = isElementVisible(selectorFound.parentElement);
          }
          return selectorFound && selectorVisible;
        });
        if (selectorYieldingOVAList.length > 0) {
          if (!axisOccupied[optionAxisIndex] && fieldSetMap[fs_cand_index] === -1) {
            fieldSetMap[fs_cand_index] = matchedAxisIndices[optionAxisIndex];
            axisOccupied[optionAxisIndex] = true;
            selector_yielding_ova_perFsCand[fs_cand_index] = selectorYieldingOVAList;
            break;
          }
        }
      }
    }
    if (fieldSetMap.some((v) => v === -1)) {
      console.warn({
        Control_Function: "isValidVariantPicker()",
        message: "No 1:1 mapping detected",
        vp_candidate
      });
      return null;
    }
    let vpValidationData = {
      selector_yielding_ova_perFsCand,
      fieldSetMap
    };
    return vpValidationData;
  }
  function createVariantPicker(leafNodeSelectorsArr, optionCount) {
    if (!Array.isArray(leafNodeSelectorsArr) || !leafNodeSelectorsArr.length) {
      return null;
    }
    if (leafNodeSelectorsArr.filter(Boolean).length < optionCount) {
      console.warn({
        Control_Function: "createVariantPicker()",
        message: "Leaf selectors count does not match active optionCount",
        leafNodeSelectorsArr
      });
      return null;
    }
    let interParents = [...leafNodeSelectorsArr];
    let flagSelectors = [
      leafNodeSelectorsArr[0],
      leafNodeSelectorsArr[leafNodeSelectorsArr.length - 1]
    ];
    let variantPicker = null;
    while (interParents.length) {
      if (interParents.every(
        (el) => !el || el === document.body || !el.parentElement
      )) {
        return null;
      }
      const tempParents = interParents.map((el) => el.parentElement).filter(Boolean);
      const parentSet = new Set(tempParents.map((el) => el.parentElement));
      let LCA = Array.from(parentSet).find((parent) => flagSelectors.every((flag) => parent.contains(flag)));
      if (LCA) {
        variantPicker = LCA;
        let option_wrappers = null;
        if (optionCount > 1) {
          option_wrappers = tempParents.map((temp) => {
            let current = temp;
            while (current && current.parentElement !== variantPicker) {
              current = current.parentElement;
            }
            return current;
          });
        } else {
          option_wrappers = [LCA];
          variantPicker = LCA.parentElement.tagName === "FIELDSET" ? LCA.parentElement.parentElement : LCA.parentElement;
        }
        let mergeVerificationSet = new Set(option_wrappers);
        if (mergeVerificationSet.size < optionCount) {
          console.warn({
            Control_Function: "createVariantPicker()",
            message: "option_wrappers merged, resolving...",
            leafSelectors: leafNodeSelectorsArr
          });
          let mergeNode = Array.from(mergeVerificationSet).find((node) => flagSelectors.every((sel) => node.contains(sel)));
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
          option_wrappers = tempParentsForMerge.map((temp) => {
            let current = temp;
            while (current.parentElement !== variantPicker) {
              current = current.parentElement;
            }
            return current;
          });
        }
        return {
          variantPicker,
          option_wrappers,
          LCA
        };
      }
      interParents = tempParents;
    }
    return null;
  }
  function variantPickerKeyBuilder(currArrIdx, interArrSet, partialVPKey, firstSelector, lastSelector, optionCount) {
    if (currArrIdx === interArrSet.length) {
      let variantPickerKey = [firstSelector, ...partialVPKey, lastSelector];
      let result = createVariantPicker(variantPickerKey, optionCount);
      if (!result) return null;
      return variantPickerKey;
    }
    for (let i2 = 0; i2 < interArrSet[currArrIdx].length; i2++) {
      partialVPKey.push(interArrSet[currArrIdx][i2]);
      let result = variantPickerKeyBuilder(currArrIdx + 1, interArrSet, partialVPKey, firstSelector, lastSelector, optionCount);
      if (!result) {
        partialVPKey.pop();
      } else {
        return result;
      }
    }
    return null;
  }
  function createLeafNodeSelectorSets(selectorKeys, reduced_ova_array, optionCount) {
    let variantPickerKeySets = [];
    if (optionCount === 1) {
      reduced_ova_array.forEach((ova) => {
        let variantPickerKey = [];
        selectorKeys.forEach((selectorKey) => {
          if (!Object.hasOwn(selectorKey, ova) || !selectorKey[ova].length) {
            return;
          }
          variantPickerKey.push(selectorKey[ova][0]);
        });
        variantPickerKeySets.push(variantPickerKey);
      });
      console[logLevel$1]({ variantPickerKeySets });
      return variantPickerKeySets;
    }
    let commonOVAInOptionAxes = reduced_ova_array.find((ova) => selectorKeys.every((selectorKey) => Object.hasOwn(selectorKey, ova) && selectorKey[ova].length));
    let ovaSelectorsCollection = [];
    if (!commonOVAInOptionAxes) {
      let collection = [];
      selectorKeys.forEach((selectorKey) => {
        let ovaUsedInCurrAxis = reduced_ova_array.find((ova) => Object.hasOwn(selectorKey, ova) && selectorKey[ova].length);
        collection.push(selectorKey[ovaUsedInCurrAxis]);
      });
      ovaSelectorsCollection.push(collection);
    } else {
      ovaSelectorsCollection = [commonOVAInOptionAxes, ...reduced_ova_array].map((ova) => {
        let selectorCollectionPerOVA = [];
        selectorKeys.forEach((selectorKey) => {
          if (!Object.hasOwn(selectorKey, ova) || !selectorKey[ova].length) {
            return;
          }
          selectorCollectionPerOVA.push(selectorKey[ova]);
        });
        return selectorCollectionPerOVA;
      });
    }
    ovaSelectorsCollection.forEach((collection) => {
      let firstSelector = collection[0][0];
      let lastSelector = collection.at(-1).at(-1);
      if (collection.length === 2) {
        variantPickerKeySets.push([firstSelector, lastSelector]);
        return;
      }
      let interArrSet = collection.filter((arr, idx, collect) => idx > 0 && idx < collect.length - 1);
      console[logLevel$1]({ interArrSet });
      let variantPickerKey = variantPickerKeyBuilder(0, interArrSet, [], firstSelector, lastSelector, optionCount);
      if (variantPickerKey) {
        variantPickerKeySets.push(variantPickerKey);
        console[logLevel$1]({ variantPickerKey });
      }
    });
    return variantPickerKeySets;
  }
  function isPureLeaf(node, attributeSelector) {
    const interactiveTags = [
      "input",
      "option",
      "button",
      "a",
      "li",
      "div",
      "label",
      "span",
      "p",
      "img",
      "picture",
      "svg",
      "path"
    ];
    const descendant = node.querySelector(attributeSelector);
    if (descendant && interactiveTags.includes(descendant.tagName.toLowerCase())) {
      rejectedSelectorWrapper.add(node);
      return false;
    }
    if (["input", "option"].includes(node.tagName.toLowerCase())) {
      if (!isElementVisible(node.parentElement)) return false;
    }
    return true;
  }
  function makeOVAKeysForOptionAxes(searchNode, optionValueRack, OPTION_VALUE_ATTRIBUTES) {
    let reduced_ova_set = /* @__PURE__ */ new Set();
    let selectorKeys = [];
    optionValueRack.forEach((optionValue, index) => {
      let selectorKey = {
        A1__optionValue: optionValue,
        index
      };
      OPTION_VALUE_ATTRIBUTES.forEach((ova) => {
        const attributeSelector = `[${ova}="${CSS.escape(optionValue)}"]`;
        let selectors = Array.from(searchNode.querySelectorAll(attributeSelector)).filter((selector2) => isPureLeaf(selector2, attributeSelector));
        if (selectors.length) {
          reduced_ova_set.add(ova);
          if (!selectorKey[ova]) selectorKey[ova] = [];
          selectorKey[ova].push(...selectors);
        }
      });
      selectorKeys.push(selectorKey);
    });
    return {
      selectorKeys,
      reduced_ova_array: Array.from(reduced_ova_set)
    };
  }
  function selectorEncodingValidator(searchNode, OPTION_VALUE_ATTRIBUTES, optionValueRack_literal, optionValueRack_id = null) {
    let encodingFormat = -1;
    let rackSize = optionValueRack_literal.length;
    let found = false;
    for (const ova of OPTION_VALUE_ATTRIBUTES) {
      for (let i2 = 0; i2 < rackSize; i2++) {
        const optionValueLiteral = optionValueRack_literal[i2];
        const attributeSelector = `[${ova}="${CSS.escape(optionValueLiteral)}"]`;
        const selectorFound = searchNode.querySelector(attributeSelector);
        if (selectorFound) {
          let isVisible = true;
          if (["input", "option"].includes(selectorFound.tagName.toLowerCase())) {
            isVisible = isElementVisible(selectorFound.parentElement);
          }
          if (isVisible) {
            console[logLevel$1]({
              ova,
              selectorFound,
              attributeSelector,
              encodingFormat: 0
            });
            encodingFormat += 1;
            found = true;
            break;
          }
        }
      }
      if (found) break;
    }
    if (!optionValueRack_id) return encodingFormat;
    found = false;
    for (const ova of OPTION_VALUE_ATTRIBUTES) {
      for (let i2 = 0; i2 < rackSize; i2++) {
        const optionValueId = optionValueRack_id[i2];
        const attributeSelector = `[${ova}="${CSS.escape(optionValueId)}"]`;
        const selectorFound = searchNode.querySelector(attributeSelector);
        if (selectorFound) {
          let isVisible = true;
          if (["input", "option"].includes(selectorFound.tagName.toLowerCase())) {
            isVisible = isElementVisible(selectorFound.parentElement);
          }
          if (isVisible) {
            console[logLevel$1]({
              ova,
              selectorFound,
              attributeSelector,
              encodingFormat: 1
            });
            encodingFormat += 2;
            found = true;
            break;
          }
        }
      }
      if (found) break;
    }
    return encodingFormat;
  }
  function makeOptionValueRack(productOptions, axisIndices, encodingIndex) {
    if (axisIndices.length === 1) {
      return productOptions[axisIndices[0]].values[encodingIndex];
    }
    let uniqueValuesSet = /* @__PURE__ */ new Set();
    let rack = [];
    axisIndices.forEach((axisIndex) => {
      const valuesArray = productOptions[axisIndex].values[encodingIndex];
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
  function getVariantPickerSets(searchNode, optionValueRack, OPTION_VALUE_ATTRIBUTES, encodingIndex, optionCount, product) {
    console[logLevel$1]({ optionValueRackSelected: optionValueRack });
    let workingOptionValueRack = optionValueRack;
    let workingOptionCount = optionCount;
    let { selectorKeys, reduced_ova_array } = makeOVAKeysForOptionAxes(
      searchNode,
      workingOptionValueRack,
      OPTION_VALUE_ATTRIBUTES
    );
    const populatedSelectorKeys = selectorKeys.filter(
      (selKey) => reduced_ova_array.some((ova) => Object.hasOwn(selKey, ova))
    );
    let matchedAxisIndices = product.options.map((_, index) => index);
    if (workingOptionCount > 1 && populatedSelectorKeys.length !== workingOptionCount) {
      console.warn({
        Control_Function: "Not all fieldsets are present",
        Pivot: "Remaking the selectorKeys for the populated Option Axes...",
        populatedSelectorKeys
      });
      matchedAxisIndices = populatedSelectorKeys.map(
        (psk) => psk.index
      );
      if (matchedAxisIndices.length === 1) {
        workingOptionValueRack = product.options[matchedAxisIndices[0]].values[encodingIndex];
        workingOptionCount = 1;
      } else {
        workingOptionValueRack = makeOptionValueRack(product.options, matchedAxisIndices, encodingIndex);
        workingOptionCount = matchedAxisIndices.length;
      }
      const newSelectorKeyData = makeOVAKeysForOptionAxes(
        searchNode,
        workingOptionValueRack,
        reduced_ova_array
      );
      ({ selectorKeys, reduced_ova_array } = newSelectorKeyData);
    }
    const variantPickerKeySets = createLeafNodeSelectorSets(
      selectorKeys,
      reduced_ova_array,
      workingOptionCount
    );
    console[logLevel$1]({ variantPickerKeySets });
    const finalVariantPickerSet = variantPickerKeySets.map((set) => createVariantPicker(set, workingOptionCount)).filter(Boolean);
    if (finalVariantPickerSet.length === 0 || reduced_ova_array.length === OPTION_VALUE_ATTRIBUTES.length) {
      console.warn({
        Control_Function: "getVariantPickerSets",
        Failure: "could not extract the variant picker"
      });
      return null;
    }
    return finalVariantPickerSet.map(
      (variant_picker) => ({
        variant_picker,
        encodingIndex,
        OPTION_VALUE_ATTRIBUTES: reduced_ova_array,
        optionCount: workingOptionCount,
        optionValueRack: workingOptionValueRack,
        matchedAxisIndices
      })
    );
  }
  function getVariantPickersByRevCon(searchNode, product) {
    let OPTION_VALUE_ATTRIBUTES = [
      // Tier 1 — high-confidence, canonical
      "camouflage-value",
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
    let optionCount = product.options.length;
    let allAxisIndices = product.options.map((_, i2) => i2);
    let optionValueRackCollection = [0, 1].filter((encodingIdx) => product.options[0].values.length > encodingIdx).map((encodingIdx) => makeOptionValueRack(
      product.options,
      allAxisIndices,
      encodingIdx
    ));
    console[logLevel$1]({ optionValueRackCollection });
    let encodingIndex = null;
    if (optionValueRackCollection.length > 1) {
      encodingIndex = selectorEncodingValidator(
        searchNode,
        OPTION_VALUE_ATTRIBUTES,
        optionValueRackCollection[0],
        optionValueRackCollection[1]
      );
    } else {
      encodingIndex = selectorEncodingValidator(
        searchNode,
        OPTION_VALUE_ATTRIBUTES,
        optionValueRackCollection[0]
      );
    }
    if (encodingIndex === -1) {
      console.error({
        Control_Function: "getVariantPickersByRevCon()",
        Failure: "Encoding format failure"
      });
      return -111;
    }
    console[logLevel$1]({ encodingIndex });
    let finalVariantPickerSet = [];
    if (encodingIndex !== 2) {
      finalVariantPickerSet = getVariantPickerSets(
        searchNode,
        optionValueRackCollection[encodingIndex],
        OPTION_VALUE_ATTRIBUTES,
        encodingIndex,
        optionCount,
        product
      ) || [];
    } else {
      finalVariantPickerSet = optionValueRackCollection.map(
        (optionValueRack, encodingIdx) => getVariantPickerSets(
          searchNode,
          optionValueRack,
          OPTION_VALUE_ATTRIBUTES,
          encodingIdx,
          optionCount,
          product
        )
      ) || [];
    }
    if (!finalVariantPickerSet.length) {
      console.warn({
        Control_Function: "getVariantPickersByRevCon()",
        Failure: "could not extract the variant picker"
      });
      return null;
    }
    return finalVariantPickerSet;
  }
  function makeLeafNodeAttributeSelectorKeys(matchedAxisIndices, option_wrappers_with_selectors, effectiveOptionValueRack) {
    let leafNodeAttributeSelectorsArr = [];
    if (matchedAxisIndices.length === 1) {
      const matchedAxisIndex = matchedAxisIndices[0];
      let tagUsed = option_wrappers_with_selectors[matchedAxisIndex].selector_type;
      tagUsed = tagUsed === "select" ? "option" : tagUsed;
      let ovaUsed = option_wrappers_with_selectors[matchedAxisIndex].value_attribute;
      leafNodeAttributeSelectorsArr = effectiveOptionValueRack.map((optionValue) => `${tagUsed}[${ovaUsed}="${CSS.escape(
        optionValue
      )}"]`);
    } else {
      matchedAxisIndices.forEach((matchedAxisIndex, idx) => {
        let optionValue = effectiveOptionValueRack[idx];
        let ovaUsed = option_wrappers_with_selectors[matchedAxisIndex].value_attribute;
        let tagUsed = option_wrappers_with_selectors[matchedAxisIndex].selector_type;
        tagUsed = tagUsed === "select" ? "option" : tagUsed;
        let leafNodeAttributeSelector = `${tagUsed}[${ovaUsed}="${CSS.escape(
          optionValue
        )}"]`;
        leafNodeAttributeSelectorsArr.push(leafNodeAttributeSelector);
      });
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
    };
    let option_wrappers_with_selectors = new Array(originalOptionCount).fill(null).map(() => ({ ...templateOptionWrapperObject }));
    finalVariantPicker.option_wrappers.forEach((ow, index) => {
      const sample = finalVariantPicker.selectors[index].selectors[0];
      const tag = sample.tagName.toLowerCase();
      const selector_type = tag === "option" ? "select" : tag;
      let returnObject = {
        field_selector: ow,
        selectors: selector_type === "select" ? sample.parentElement : finalVariantPicker.selectors[index].selectors,
        selector_type,
        make_a_selection_required: selector_type === "select" && !sample.parentElement.options[0].value,
        value_attribute: finalVariantPicker.selectors[index].value_attribute
      };
      let trueOptionAxisIndex = finalVariantPicker.matchedAxisIndices[index];
      option_wrappers_with_selectors[trueOptionAxisIndex] = returnObject;
    });
    return option_wrappers_with_selectors;
  }
  function run_TA7WithCache$1(variantPickerCache) {
    let {
      searchNode,
      deepestStableNode,
      variantIdField,
      leafNodeAttributeSelectorsArr,
      input_selector_types,
      effectiveOptionValueRack,
      effectiveOptionCount,
      encodingIndex,
      finalOVAArrayUsed,
      matchedAxisIndices,
      originalOptionCount,
      productOptions
    } = variantPickerCache;
    rejectedSelectorWrapper = /* @__PURE__ */ new WeakSet();
    globalCacheData = { input_selector_types };
    function failCache(reason, extra = {}) {
      console.error("[TA7 CACHE FAIL]", reason, extra);
      globalCacheData = null;
      return null;
    }
    if (!searchNode || !searchNode.isConnected) {
      return failCache("searchNode not connected", { searchNode });
    }
    if (!variantIdField || !variantIdField.isConnected) {
      console.warn("[TA7 CACHE] variantIdField disconnected. Attempting re-query...");
      variantIdField = Array.from(
        searchNode.querySelectorAll('input[name="id"], select[name="id"]')
      ).find((vif) => isElementVisible(vif.parentElement));
      if (!variantIdField) {
        return failCache("Could not re-resolve variantIdField");
      }
    }
    let allSelectorsForEachOptionValue = leafNodeAttributeSelectorsArr.map((attSel) => [...deepestStableNode.querySelectorAll(attSel)]);
    allSelectorsForEachOptionValue = allSelectorsForEachOptionValue.map((selArray, idx) => selArray.filter((selector2) => {
      if (selector2.querySelector(leafNodeAttributeSelectorsArr[idx])) {
        rejectedSelectorWrapper.add(selector2);
        return false;
      }
      if (["input", "option"].includes(selector2.tagName.toLowerCase())) {
        if (isElementVisible(selector2.parentElement)) {
          return true;
        }
        return false;
      }
      return true;
    }));
    if (allSelectorsForEachOptionValue.some((arr) => !arr.length)) {
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
      let interArrSet = allSelectorsForEachOptionValue.filter((_, idx, collection) => idx > 0 && idx < collection.length - 1);
      variantPickerKey = variantPickerKeyBuilder(
        0,
        interArrSet,
        [],
        firstSelector,
        lastSelector,
        effectiveOptionCount
      );
      if (!variantPickerKey) {
        return failCache("Failed to build variant picker key");
      }
    }
    const variant_picker = createVariantPicker(
      variantPickerKey,
      effectiveOptionCount
    );
    if (!variant_picker) {
      return failCache("createVariantPicker returned null");
    }
    let vpValidationData = isValidVariantPicker(
      variant_picker,
      effectiveOptionCount,
      effectiveOptionValueRack,
      finalOVAArrayUsed,
      matchedAxisIndices
    );
    if (!vpValidationData) {
      return failCache("isValidVariantPicker failed");
    }
    let selectorResult = getCorrectVariantPickerWithSelectors(
      variant_picker,
      effectiveOptionCount,
      effectiveOptionValueRack,
      encodingIndex,
      productOptions,
      vpValidationData
    );
    if (!selectorResult) {
      return failCache("Failed to generate selector data in cache mode");
    }
    let { selector_data } = selectorResult;
    if (!selector_data || !selector_data.length || selector_data.some((selObject) => !selObject.selectors || !selObject.selectors.length)) {
      return failCache("Failed to generate proper selector data", { selector_data });
    }
    let finalVariantPicker = {
      variantPicker: variant_picker,
      option_wrappers: variant_picker.option_wrappers,
      selectors: selectorResult.selector_data,
      encodingIndex,
      variantIdField,
      matchedAxisIndices,
      vpValidationData
    };
    let areAllActiveSelectorsFound = finalVariantPicker.matchedAxisIndices.every((matchedAxisIdx) => {
      let matchingWrapperIndex = finalVariantPicker.vpValidationData.fieldSet ? 0 : finalVariantPicker.vpValidationData.fieldSetMap.findIndex((idx) => idx === matchedAxisIdx);
      let selectorArraytoCompare = finalVariantPicker.selectors[matchingWrapperIndex];
      let optionAxistoCompare = productOptions[matchedAxisIdx].values[encodingIndex];
      if (!selectorArraytoCompare.selectors.length) {
        console.warn({
          Control_Function: "run_TA7WithCache()",
          error: "Could not get all selectors for some optionAxis",
          optionAxistoCompare,
          selectorArraytoCompare
        });
        return false;
      }
      return true;
    });
    if (!areAllActiveSelectorsFound) {
      return failCache("Could not get all selectors for some optionAxis");
    }
    let option_wrappers_with_selectors = makeOptionWrappersWithSelectors(
      {
        option_wrappers: variant_picker.option_wrappers,
        selectors: selectorResult.selector_data,
        matchedAxisIndices
      },
      originalOptionCount
    );
    if (!option_wrappers_with_selectors?.length) {
      return failCache("makeOptionWrappersWithSelectors returned empty");
    }
    finalVariantPicker.option_wrappers_with_selectors = option_wrappers_with_selectors;
    finalVariantPicker.make_a_selection_required = option_wrappers_with_selectors.some((ow) => ow.make_a_selection_required);
    let valueAttributesUsed = new Set(option_wrappers_with_selectors.map((ow) => ow.value_attribute));
    finalVariantPicker.attribute_name = valueAttributesUsed.size > 1 ? Array.from(valueAttributesUsed) : valueAttributesUsed.values().next().value;
    console[logLevel$1]("[TA7 CACHE SUCCESS] Fast reconstruction successful");
    globalCacheData = null;
    return finalVariantPicker;
  }
  async function getCorrectSearchNode(mainContainerFromParams) {
    let typeOfMainContainer = typeof mainContainerFromParams;
    if (typeOfMainContainer === "string") {
      try {
        mainContainerFromParams = await waitForVisibleElement(mainContainerFromParams);
      } catch (error) {
        mainContainerFromParams = document.querySelector(mainContainerFromParams);
      }
    }
    let validNameIdElement = null;
    let nameIdSearchNode = mainContainerFromParams;
    let nameIdAnchors = null;
    nameIdAnchors = nameIdSearchNode.querySelectorAll("[name=id]");
    while (!nameIdAnchors?.length) {
      nameIdSearchNode = nameIdSearchNode.parentElement;
      nameIdAnchors = nameIdSearchNode.querySelectorAll("[name=id]");
    }
    validNameIdElement = nameIdAnchors[0];
    return {
      mainContainer: mainContainerFromParams,
      nameIdElement: validNameIdElement,
      nameIdSearchNode
      // ancestorReferences,
    };
  }
  async function runTA7$1(hoosObjProduct, mainContainerFromParams = null) {
    const targetData = {
      A__finalVariantPicker: null,
      B__parentNodeForVPCSearch: null,
      C__anchorData: null,
      D__variantPickerGenData: null
    };
    const TA7_Result = {
      Variant_Picker: null,
      Full_Data: targetData,
      status: "failure"
    };
    const fail = (cause) => {
      console.error({ status: "[TA7] Failed : Revert to Legacy", cause });
      return TA7_Result;
    };
    rejectedSelectorWrapper = /* @__PURE__ */ new WeakSet();
    let product = null;
    product = {
      options: hoosObjProduct.options_with_values.map(
        (option) => ({
          name: option.name,
          values: [
            option.values.map((v) => v.name),
            option.values.map((v) => v.id)
          ]
        })
      )
    };
    let originalOptionCount = product.options.length;
    const productId = hoosObjProduct.id;
    let ancestorReferences = [];
    let validNameIdElement = null;
    let supportSearchNode = null;
    let mainContainerSupportData = null;
    let anchorProductFormData = null;
    let nameIdAnchors = null;
    let nameIdSearchNode = null;
    if (mainContainerFromParams) {
      console[logLevel$1]({ mainContainerFromParams });
      mainContainerSupportData = await getCorrectSearchNode(mainContainerFromParams);
    }
    if (mainContainerSupportData) {
      validNameIdElement = mainContainerSupportData.nameIdElement;
      supportSearchNode = mainContainerSupportData.mainContainer;
      nameIdSearchNode = mainContainerSupportData.nameIdSearchNode;
    } else {
      const variantIds = hoosObjProduct.variants.map((variant) => variant.id);
      anchorProductFormData = findNameIdElement({ productId, variantIds });
      nameIdAnchors = anchorProductFormData.nameIdAnchors;
      validNameIdElement = anchorProductFormData.validNameIdElement;
      if (!validNameIdElement) {
        return fail("valid [name = id] element not found");
      }
    }
    targetData.C__anchorData = {
      nameIdElement: validNameIdElement,
      nameIdAnchors
    };
    let candidateObject = null;
    let searchDepth = 4;
    let variantPickerGenData = null;
    let useRecall = false;
    if (supportSearchNode) {
      variantPickerGenData = getVariantPickersByRevCon(supportSearchNode, product);
      if (!variantPickerGenData || variantPickerGenData === -111) {
        variantPickerGenData = null;
      } else {
        variantPickerGenData = variantPickerGenData.flat().filter(Boolean);
      }
    }
    while (!variantPickerGenData?.length) {
      candidateObject = getParentNodeForVPCSearch(validNameIdElement, searchDepth, useRecall);
      if (!candidateObject || candidateObject.isBodyNext) {
        return fail("Search reached body without finding variant picker");
      }
      variantPickerGenData = getVariantPickersByRevCon(candidateObject.parent, product);
      if (variantPickerGenData === -111) {
        useRecall = true;
        variantPickerGenData = null;
        continue;
      } else if (!variantPickerGenData?.length) {
        return fail("No variant picker candidates found");
      }
      variantPickerGenData = variantPickerGenData.flat().filter(Boolean);
    }
    if (!window.CAMOUFLAGEE.previousSearchNodes) {
      window.CAMOUFLAGEE.previousSearchNodes = [];
    }
    let searchNodeUsed = candidateObject?.parent || nameIdSearchNode;
    if (!window.CAMOUFLAGEE.previousSearchNodes.includes(searchNodeUsed)) {
      window.CAMOUFLAGEE.previousSearchNodes.push(searchNodeUsed);
    }
    targetData.D__variantPickerGenData = variantPickerGenData;
    targetData.B__parentNodeForVPCSearch = {
      searchNode: searchNodeUsed,
      parentFoundInAnchorMode: true
    };
    targetData.D__variantPickerGenData = variantPickerGenData;
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
      if (!selectorResult) continue;
      let { selector_data: selector_data2 } = selectorResult;
      if (!selector_data2 || !selector_data2.length || selector_data2.some((selObject) => !selObject.selectors || !selObject.selectors.length)) continue;
      finalVariantPicker = {
        variantPicker: item.variant_picker.variantPicker,
        option_wrappers: item.variant_picker.option_wrappers,
        encodingIndex: item.encodingIndex,
        matchedAxisIndices: item.matchedAxisIndices,
        vpValidationData
      };
      effectiveOptionValueRack = item.optionValueRack;
      effectiveOptionCount = item.optionCount;
      finalOVAArrayUsed = item.OPTION_VALUE_ATTRIBUTES;
      encodingIndex = item.encodingIndex;
      break;
    }
    if (!finalVariantPicker) {
      return fail("Final variant picker could not be resolved");
    }
    let { selector_data } = selectorResult;
    if (!selector_data || !selector_data.length || selector_data.some((selObject) => !selObject.selectors || !selObject.selectors.length)) {
      return fail("Failed to generate proper selector data");
    }
    finalVariantPicker.selectors = selector_data;
    let areAllActiveSelectorsFound = finalVariantPicker.matchedAxisIndices.every((matchedAxisIdx) => {
      let matchingWrapperIndex = finalVariantPicker.vpValidationData.fieldSet ? 0 : finalVariantPicker.vpValidationData.fieldSetMap.findIndex((idx) => idx === matchedAxisIdx);
      let selectorArraytoCompare = finalVariantPicker.selectors[matchingWrapperIndex];
      let optionAxistoCompare = product.options[matchedAxisIdx].values[encodingIndex];
      if (!selectorArraytoCompare.selectors.length) {
        console.warn({
          Control_Function: "run_TA7()",
          error: "Could not get all selectors for some optionAxis",
          optionAxistoCompare,
          selectorArraytoCompare
        });
        return false;
      }
      return true;
    });
    if (!areAllActiveSelectorsFound) {
      return fail("Could not get all selectors for some optionAxis");
    }
    if (!ancestorReferences.length) {
      for (
        let currRef = finalVariantPicker.variantPicker;
        currRef !== document.body && searchNodeUsed.parentElement.parentElement !== currRef;
        // to take one node about the searchNode in ancestor references as well, just for safety.
        currRef = currRef.parentElement
      ) {
        ancestorReferences.push(currRef);
      }
    }
    if (window.CAMOUFLAGEE) {
      finalVariantPicker.camouflage_selectors = window.CAMOUFLAGEE.items[0].selectors;
    }
    let option_wrappers_with_selectors = makeOptionWrappersWithSelectors(finalVariantPicker, originalOptionCount);
    let leafNodeAttributeSelectorsArr = makeLeafNodeAttributeSelectorKeys(finalVariantPicker.matchedAxisIndices, option_wrappers_with_selectors, effectiveOptionValueRack);
    let valueAttributesUsed = new Set(option_wrappers_with_selectors.map((ow) => ow.value_attribute));
    let attribute_name;
    if (valueAttributesUsed.size > 1) {
      attribute_name = Array.from(valueAttributesUsed);
    } else {
      attribute_name = valueAttributesUsed.values().next().value;
    }
    const input_selector_types = option_wrappers_with_selectors.map((ow) => ow.selector_type);
    targetData.A__finalVariantPicker = {
      variantPicker: finalVariantPicker.variantPicker,
      variantPickerCache: {
        searchNode: searchNodeUsed,
        variantIdField: validNameIdElement,
        leafNodeAttributeSelectorsArr,
        input_selector_types,
        effectiveOptionValueRack,
        effectiveOptionCount,
        encodingIndex,
        finalOVAArrayUsed,
        matchedAxisIndices: finalVariantPicker.matchedAxisIndices,
        originalOptionCount,
        productOptions: product.options
      },
      encodingIndex: finalVariantPicker.encodingIndex,
      input_selector_types,
      option_wrappers_with_selectors,
      make_a_selection_required: option_wrappers_with_selectors.some((ow) => ow.make_a_selection_required),
      attribute_name,
      variantIdField: validNameIdElement,
      observer_container_node: searchNodeUsed,
      ancestorReferences,
      addToCartButton: candidateObject?.addToCartButton ?? null,
      z__camouflage_selectors: finalVariantPicker.camouflage_selectors || "Camouflage not enabled on store"
    };
    TA7_Result.Variant_Picker = targetData.A__finalVariantPicker;
    TA7_Result.status = "success";
    console[logLevel$1]({ "[TA7 VERDICT]": "Success", TA7_Result });
    return TA7_Result;
  }
  var TA7_variant_picker_detection = { runTA7: runTA7$1, run_TA7WithCache: run_TA7WithCache$1 };
  const { getHoosObj, logLevel } = base;
  const {
    observeVariantInputField,
    observeVariantInputFieldTA7,
    getCorrectHoosObj,
    addRemoveCSStyleForHiddenVariants,
    checkIfShouldRun,
    fireCamouflageExecutedEvent,
    updateAppIntegration,
    getAvailableVariants,
    getOptionsToSelect,
    getProduct,
    getCSSEscapedValue,
    handleForMarkUnavailable,
    hideFromVariantIdUIElem,
    hideFromVariantIdDropdown,
    hideUnavailableOption1FromSelect,
    shouldDisableMarkUnavailable,
    shouldHideMarkUnavailable,
    getSelectedVariantOption,
    getNodeNameLowerCase,
    getMainContainer,
    isOptionSelected,
    sleep
  } = commonV2;
  const {
    // setSelectors,
    labelHideShow,
    getMainContainerFromString,
    updateExtraObj,
    unwrapSelectOption,
    // handleNativeSelectOptionBasedOnPrevChoice,
    checkAndHandleOptionDisable,
    triggerChangeEventOnSelect,
    // getCurrentVariantFromURLOrInput,
    fireCamouflageHoosObjPreparedEvent,
    observeContainerForRestoringAttributes
  } = common;
  const { runTA7, run_TA7WithCache } = TA7_variant_picker_detection;
  const setSelectors = (hoosObj2) => {
    let {
      selectors,
      enableDisabledSelectorsArr,
      swatch_picker_for,
      swatch_input_selector
    } = hoosObj2;
    if (hoosObj2.input_selector === "radio") {
      hoosObj2.input_selector = "input";
    }
    if (!selectors.length) {
      if (hoosObj2.extras.integrates_with === "camouflage-variant-picker") {
        hoosObj2.mainContainer.querySelectorAll(".camouflage-option-wrapper").forEach((selector2) => {
          const selectSelector = selector2.querySelector("select");
          const inputSelector = [...selector2.querySelectorAll("input")];
          if (selectSelector) {
            selectors.push(selectSelector);
            if (!selectSelector.options[0].value) {
              hoosObj2.extras.make_a_selection_required = true;
            }
          } else if (inputSelector.length) {
            selectors.push(inputSelector);
          }
        });
      } else {
        let fieldSelectors = [...hoosObj2.mainContainer.querySelectorAll(hoosObj2.field_selector)];
        if (fieldSelectors.length === hoosObj2.product.options.length * 2) {
          if (fieldSelectors[0].clientWidth) {
            fieldSelectors = fieldSelectors.slice(0, hoosObj2.product.options.length);
          } else if (fieldSelectors[fieldSelectors.length / 2].clientWidth) {
            fieldSelectors = fieldSelectors.slice(hoosObj2.product.options.length);
          }
        }
        fieldSelectors.forEach((selector2, index) => {
          const isSwatchOption = typeof swatch_picker_for === "string" ? swatch_picker_for.split(",").map((o) => o.trim()).includes(hoosObj2.product.options[index]) : false;
          let optionSelector = [];
          if (!isSwatchOption) {
            optionSelector = selector2.querySelectorAll(hoosObj2.input_selector);
          } else {
            optionSelector = selector2.querySelectorAll(swatch_input_selector);
          }
          if (!optionSelector.length && selector2 && selector2.nodeName === "SELECT") {
            optionSelector = [selector2];
          }
          if (optionSelector.length) {
            const input_selector_name2 = getNodeNameLowerCase(optionSelector[0]);
            if (input_selector_name2 === "select") {
              selectors.push(...optionSelector);
            } else {
              selectors.push([...optionSelector]);
            }
          }
        });
      }
      if (selectors.length !== hoosObj2.product.options.length) {
        return;
      }
      enableDisabledSelectorsArr = selectors.slice();
    }
    if (hoosObj2.reverse_options) {
      selectors = selectors.reverse();
      enableDisabledSelectorsArr = enableDisabledSelectorsArr.reverse();
      console[logLevel]("Camouflage", "Reversed variant options");
    }
    hoosObj2.enableDisabledSelectorsArr = enableDisabledSelectorsArr;
    hoosObj2.selectors = selectors;
  };
  class CamouflageVariants {
    constructor(hoosObj2) {
      this.hoosObj = hoosObj2;
      this.selectors_metadata = [];
    }
    setValueAttrOnOtherElementType() {
      const hoosObj = this.hoosObj;
      for (let i = 0; i < hoosObj.selectors.length; i++) {
        hoosObj.mappedLabels.push(Array(hoosObj.selectors[i].length));
        const input_selector_name = getNodeNameLowerCase(hoosObj.selectors[i]);
        if (input_selector_name !== "select") {
          for (let j = 0; j < hoosObj.selectors[i].length; j++) {
            let label = null;
            const currentElem = hoosObj.selectors[i][j];
            if (hoosObj.unavailable_label_path) {
              try {
                label = eval(hoosObj.unavailable_label_path);
              } catch (e) {
                console.error(e);
              }
            }
            if (!label && currentElem.id) {
              label = this.hoosObj.mainContainer.querySelector(
                `label[for="${CSS.escape(currentElem.id)}"]`
              );
            }
            if (!label) {
              const possibleLabel = currentElem.closest("label");
              if (possibleLabel && hoosObj.option_wrappers && hoosObj.option_wrappers[i]?.contains(possibleLabel)) {
                label = possibleLabel;
              }
            }
            if (!label) {
              label = currentElem;
            }
            hoosObj.mappedLabels[i][j] = label;
          }
        }
      }
    }
    // setValueAttrOnOtherElementType() {
    //   const hoosObj = this.hoosObj;
    //   for (let i = 0; i < hoosObj.selectors.length; i++) {
    //     hoosObj.mappedLabels.push(Array(hoosObj.selectors[i].length));
    //     const input_selector_name = getNodeNameLowerCase(hoosObj.selectors[i]);
    //     if (input_selector_name !== 'select') {
    //       for (let j = 0; j < hoosObj.selectors[i].length; j++) {
    //         // map its label as well
    //         let currentElem = hoosObj.selectors[i][j];
    //         hoosObj.mappedLabels[i][j] = currentElem;
    //         if (hoosObj.unavailable_label_path) {
    //           try {
    //             const labelFound = eval(hoosObj.unavailable_label_path);
    //             hoosObj.mappedLabels[i][j] = labelFound || currentElem;
    //           } catch (error) {
    //             console.error(error);
    //           }
    //         }
    //       }
    //     }
    //   }
    // }
    getInputLabel(input, i2, j2) {
      return this.hoosObj.mappedLabels[i2][j2];
    }
    getRadioValueLocal(elem) {
      let value = "";
      if (Array.isArray(this.hoosObj.extras.attribute_name) && this.hoosObj.extras.attribute_name.length) {
        for (let an of this.hoosObj.extras.attribute_name) {
          value = elem.getAttribute(an);
          if (value) break;
        }
      } else if (this.hoosObj.extras.attribute_name) {
        value = elem.getAttribute(this.hoosObj.extras.attribute_name);
      } else if (this.hoosObj.extras.value_dataset) {
        value = elem.dataset[this.hoosObj.extras.value_dataset] || "";
      } else {
        value = elem.dataset && elem.dataset.value || elem.value || elem.attributes && elem.attributes.value && elem.attributes.value.value || elem.attributes.rel && elem.attributes.rel.value || "";
      }
      if (this.hoosObj.extras.lowercase_value) {
        value = value.toLowerCase();
      }
      if (this.hoosObj.extras.value_dataset_manipulate !== void 0 && value) {
        value = this.hoosObj.extras.value_dataset_manipulate(value);
      }
      return value;
    }
    disableElement(radio2, markedUnavailable = false, variantExists = true) {
      if (!radio2) return;
      if (typeof this.hoosObj.extras.radio_disabled === "boolean" && this.hoosObj.extras.radio_disabled === false) {
        console.debug("Must not disable, returning");
        return;
      }
      let shouldReturn = this.hoosObj.extras.disabled === false;
      if (shouldReturn && markedUnavailable && shouldDisableMarkUnavailable(this.hoosObj)) {
        shouldReturn = false;
      }
      if (!variantExists && this.hoosObj.extras.hide_unavailable === "yes") {
        shouldReturn = false;
      }
      if (variantExists === false && this.hoosObj.extras.include_only_hide_show_field === "yes" && this.hoosObj.extras.hide_unavailable !== "yes") {
        if (markedUnavailable && shouldHideMarkUnavailable(this.hoosObj)) ;
        else {
          shouldReturn = true;
        }
      }
      if (shouldReturn) {
        return;
      }
      radio2.disabled = true;
      radio2.camouflage_disabled = true;
      radio2.checked = false;
    }
    hideAllUnavailableVariants() {
      this.hoosObj.selectors.forEach((selector2, idx1) => {
        const input_selector_name2 = getNodeNameLowerCase(selector2);
        if (input_selector_name2 === "select") {
          if (selector2.options) {
            const selectValue = selector2.value;
            [...selector2.options].forEach((optn) => {
              labelHideShow(this.hoosObj, optn, "hide");
              checkAndHandleOptionDisable({
                option: optn,
                hoosObj: this.hoosObj,
                isSelectedValue: optn.value == selectValue,
                allSoldout: true
              });
            });
          }
        } else {
          selector2.forEach((radio2, idx2) => {
            if (!radio2) {
              return;
            }
            this.disableElement(radio2);
            radio2.checked = false;
            const label2 = this.getInputLabel(radio2, idx1, idx2);
            labelHideShow(this.hoosObj, label2, "hide");
          });
        }
      });
      if (window.CustomEvent) {
        const hoosEvent = new CustomEvent("hoos:alldisabled", { detail: this.hoosObj });
        document.dispatchEvent(hoosEvent);
      }
    }
    // if there is only option1 available
    hideUnavailableOption1() {
      const firstFieldRadios = this.hoosObj.selectors[0];
      if (getNodeNameLowerCase(firstFieldRadios) === "select") {
        hideUnavailableOption1FromSelect(this.hoosObj);
      } else {
        let j2 = 0;
        for (let radio2 of firstFieldRadios) {
          const radioValue = this.getRadioValueLocal(radio2);
          if (!radioValue) {
            console[logLevel]("Camouflage", { radioValue });
            continue;
          }
          if (radioValue in this.hoosObj.productOptions.option1) {
            radio2.disabled = false;
            radio2.camouflage_disabled = false;
          } else {
            let variantExists = true;
            let markedUnavailable = false;
            if (this.hoosObj.product.options.length === 1) {
              markedUnavailable = this.hoosObj.product.variants.some((variant) => variant.options[0] === radioValue && variant.marked_unavailable);
            } else {
              markedUnavailable = this.hoosObj.product.variants.filter((variant) => variant.options[0] === radioValue).every((variant) => variant.marked_unavailable);
            }
            this.disableElement(radio2, markedUnavailable);
            const label2 = this.getInputLabel(radio2, 0, j2);
            labelHideShow(this.hoosObj, label2, "hide", variantExists, markedUnavailable);
          }
          j2++;
        }
      }
    }
    clickRadioLabel(currentElem) {
      try {
        if (this.hoosObj.extras && this.hoosObj.extras.is_featured_product === true && this.hoosObj.extras.page_loaded !== true) {
          setTimeout(() => {
            this.hoosObj.extras.page_loaded = true;
          }, 1500);
          return;
        }
      } catch (error) {
        console.error(error);
      }
      try {
        let labelToClick = currentElem;
        if (this.hoosObj.click_label_path) {
          try {
            const labelFound = eval(this.hoosObj.click_label_path);
            labelToClick = labelFound || labelToClick;
          } catch (error) {
            console.error(error);
          }
        }
        if (typeof window.camouflageLabelClick === "function") {
          window.camouflageLabelClick({ labelToClick, hoosObj: this.hoosObj });
          return;
        }
        if (labelToClick) labelToClick.click();
      } catch (error) {
        console.error(error);
      }
    }
    // initial selection of available variant
    setInitialSelection(variant) {
      const hoosObj2 = this.hoosObj;
      if (hoosObj2.extras.skip_initial_selection === true) {
        return;
      }
      if (hoosObj2.extras.version && hoosObj2.extras.version >= 3 && hoosObj2.hiddenInputFieldForVariantID && hoosObj2.hiddenInputFieldForVariantID.value == variant.id) {
        return;
      }
      const integrates_with = hoosObj2.extras.integrates_with;
      for (let index = 0; index < hoosObj2.selectors.length; index++) {
        const input_selector_name2 = getNodeNameLowerCase(hoosObj2.selectors[index]);
        if (input_selector_name2 === "select") {
          this.hoosObj.selectors[index].value = variant.options[index];
          if (!this.hoosObj.selectors[index].value && this.hoosObj.extras.select_attribute_name) {
            const correctOption = this.hoosObj.selectors[index].querySelector(`option[${this.hoosObj.extras.select_attribute_name}="${CSS.escape(variant.options[index])}"]`);
            if (correctOption) {
              this.hoosObj.selectors[index].value = correctOption.value;
            }
          }
          triggerChangeEventOnSelect(this.hoosObj.selectors[index], variant.options[index], index, this.hoosObj);
          hoosObj2.selectedProductOptions[`option${index + 1}`] = variant.options[index];
        } else {
          let j2 = 0;
          for (let radio2 of hoosObj2.selectors[index]) {
            const radioVal = this.getRadioValueLocal(radio2);
            let flag = radioVal === variant.options[index];
            let radioAlreadySelected = false;
            if (integrates_with === "swatch-king") {
              radioAlreadySelected = radio2.getAttribute("aria-checked") === "true";
            } else if (radio2.nodeName === "LI" && radio2.closest("ul.custom-select__listbox") && radio2.closest("ul.custom-select__listbox").querySelector("li[aria-selected]")) {
              radioAlreadySelected = radio2.getAttribute("aria-selected") === "true";
            }
            if (flag && !radioAlreadySelected) {
              this.clickRadioLabel(radio2, index, j2);
              hoosObj2.selectedProductOptions[`option${index + 1}`] = variant.options[index];
            }
            radio2.checked = flag;
            j2++;
          }
        }
      }
    }
    hideSelectOptionBasedOnPrevChoice(startInd2 = 1, currentSelectedVariant = null) {
      console[logLevel](`hideSelectOptionBasedOnPrevChoice:start ${startInd2}`, currentSelectedVariant);
      const hoosObj2 = this.hoosObj;
      const endInd = hoosObj2.selectors.length;
      let tempVariants1 = [...hoosObj2.availableVariants];
      let tempVariants2 = [...hoosObj2.product.variants];
      let selectedVariantId;
      if (!hoosObj2.selectors[startInd2]) return;
      for (let i2 = 1; i2 < endInd; i2++) {
        if (getNodeNameLowerCase(hoosObj2.selectors[i2]) === "select") {
          const prevCheckedElem = getSelectedVariantOption(this.hoosObj.selectors[i2 - 1], this.hoosObj);
          if (!prevCheckedElem) {
            break;
          }
          const prevSelection = this.getRadioValueLocal(prevCheckedElem);
          tempVariants1 = tempVariants1.filter((variant) => variant.options[i2 - 1] === prevSelection);
          tempVariants2 = tempVariants2.filter((variant) => variant.options[i2 - 1] === prevSelection);
          if (i2 >= startInd2) {
            const checkedSelector = getSelectedVariantOption(this.hoosObj.selectors[i2], this.hoosObj);
            const currentSelectedValue = checkedSelector ? this.getRadioValueLocal(checkedSelector) : null;
            const optionResult = getOptionsToSelect({
              i: i2,
              hoosObj: this.hoosObj,
              tempVariants1,
              tempVariants2,
              checkedSelector,
              currentSelectedValue
            });
            selectedVariantId = optionResult.selectedVariantId;
            const switchToOption = optionResult.switchToOption;
            const currOptions = [...this.hoosObj.selectors[i2].querySelectorAll("option")];
            for (let option of currOptions) {
              const optionOriginalValue = option.value;
              const currentVariantOptionValue = this.getRadioValueLocal(option);
              const variantAvailable = tempVariants1.some((variant) => variant.options[i2] === currentVariantOptionValue);
              const variantExists = tempVariants2.some((variant) => variant.options[i2] === currentVariantOptionValue);
              const markedUnavailable = tempVariants2.some((variant) => variant.options[i2] === currentVariantOptionValue && variant.marked_unavailable);
              if (!switchToOption) continue;
              if (option.classList.contains(this.hoosObj.makeSelectionNoHideClass)) {
                continue;
              }
              if (this.hoosObj.extras.make_a_selection_required === true && (!optionOriginalValue || optionOriginalValue === "not-selected")) {
                continue;
              }
              if (this.hoosObj.extras.skip_variant_change === "yes" && this.hoosObj.variant_action !== "hide") continue;
              if (switchToOption == currentVariantOptionValue) {
                if (option.value === checkedSelector.value) {
                  if (!variantAvailable && ["strike-through", "select-append-text"].includes(this.hoosObj.variant_action)) {
                    labelHideShow(this.hoosObj, option, "hide", variantExists, markedUnavailable);
                    checkAndHandleOptionDisable({
                      option,
                      variantExists,
                      markedUnavailable,
                      hoosObj: this.hoosObj
                    });
                    continue;
                  }
                  continue;
                }
                let selection_delay_time = this.hoosObj.extras.selection_delay_time || 10;
                setTimeout(() => {
                  this.hoosObj.selectors[i2].value = optionOriginalValue;
                  triggerChangeEventOnSelect(this.hoosObj.selectors[i2], optionOriginalValue, i2, this.hoosObj);
                  console[logLevel]("switchToOption-6", switchToOption, option);
                }, selection_delay_time * i2);
              } else if (variantAvailable) {
                continue;
              } else {
                labelHideShow(this.hoosObj, option, "hide", variantExists, markedUnavailable);
                checkAndHandleOptionDisable({
                  option,
                  variantExists,
                  markedUnavailable,
                  hoosObj: this.hoosObj
                });
                console[logLevel](`\x1B[31mVariant ${currentVariantOptionValue} has been hidden, prev selection: ${prevSelection}\x1B[0m`);
              }
            }
          }
        } else {
          const prevCheckedElem = getSelectedVariantOption(this.hoosObj.selectors[i2 - 1], this.hoosObj);
          if (!prevCheckedElem) {
            break;
          }
          const prevSelection = this.getRadioValueLocal(prevCheckedElem);
          tempVariants1 = tempVariants1.filter((variant) => variant.options[i2 - 1] === prevSelection);
          tempVariants2 = tempVariants2.filter((variant) => variant.options[i2 - 1] === prevSelection);
          if (i2 >= startInd2) {
            const checkedSelector = getSelectedVariantOption(this.hoosObj.selectors[i2], this.hoosObj);
            const currentSelectedValue = checkedSelector ? this.getRadioValueLocal(checkedSelector) : null;
            const optionResult = getOptionsToSelect({
              i: i2,
              hoosObj: this.hoosObj,
              tempVariants1,
              tempVariants2,
              checkedSelector,
              currentSelectedValue
            });
            selectedVariantId = optionResult.selectedVariantId;
            const switchToOption = optionResult.switchToOption;
            for (let radio2 of this.hoosObj.selectors[i2]) {
              const currentVariantOptionValue = this.getRadioValueLocal(radio2);
              const variantExists = tempVariants2.some((variant) => variant.options[i2] === currentVariantOptionValue);
              const markedUnavailable = tempVariants2.some((variant) => variant.options[i2] === currentVariantOptionValue && variant.marked_unavailable);
              const variantAvailable = tempVariants1.some((variant) => variant.options[i2] === currentVariantOptionValue);
              console[logLevel]("switchToOption-****", { switchToOption, currentVariantOptionValue, variantAvailable });
              if (!switchToOption) continue;
              if (switchToOption == currentVariantOptionValue) {
                if (isOptionSelected(radio2)) {
                  continue;
                }
                if (this.hoosObj.extras.skip_variant_change === "yes" && this.hoosObj.variant_action !== "hide") continue;
                let selection_delay_time = this.hoosObj.extras.selection_delay_time || 10;
                setTimeout(() => {
                  if (!variantAvailable && ["strike-through", "select-append-text"].includes(this.hoosObj.variant_action)) {
                    let labelToHide = this.hoosObj.mainContainer.querySelector(`[for='${getCSSEscapedValue(radio2.id)}']`) || radio2.nextElementSibling;
                    if (radio2.nodeName !== "INPUT") {
                      labelToHide = radio2;
                    }
                    if (labelToHide) {
                      labelHideShow(this.hoosObj, labelToHide, "hide", variantExists, markedUnavailable);
                    }
                  }
                  this.clickRadioLabel(radio2);
                  radio2.checked = true;
                  radio2.disabled = false;
                  radio2.camouflage_disabled = false;
                  triggerChangeEventOnSelect(this.hoosObj.selectors[i2], currentVariantOptionValue, i2, this.hoosObj);
                  console[logLevel]("switchToOption-6", switchToOption, radio2);
                }, selection_delay_time * i2);
              } else if (variantAvailable) {
                continue;
              } else {
                this.disableElement(radio2, markedUnavailable, variantExists);
                let labelToHide = this.hoosObj.mainContainer.querySelector(`[for='${getCSSEscapedValue(radio2.id)}']`) || radio2.nextElementSibling;
                if (radio2.nodeName !== "INPUT") {
                  labelToHide = radio2;
                }
                if (labelToHide) {
                  labelHideShow(this.hoosObj, labelToHide, "hide", variantExists, markedUnavailable);
                  console[logLevel](`\x1B[31mVariant ${currentVariantOptionValue} has been hidden, prev selection: ${prevSelection}\x1B[0m`);
                }
              }
            }
          }
        }
      }
      console[logLevel]("selectedVariantId:", selectedVariantId);
      console[logLevel]("hiddenInputFieldForVariantID:", this.hoosObj.hiddenInputFieldForVariantID);
      if (selectedVariantId) {
        if (this.hoosObj.hiddenInputFieldForVariantID) {
          this.hoosObj.hiddenInputFieldForVariantID.value = selectedVariantId;
        }
        const hoosEvent = new CustomEvent("hoos:variantchanged", {
          detail: {
            currentVariant: this.hoosObj.product.variants.find((v) => v.id == selectedVariantId),
            hoosObj: this.hoosObj,
            // isInitialSelection: this.hoosObj.isInitialSelection === true,
            source: this.hoosObj.extras.variantChangeSource,
            cacheSignature: this.hoosObj.extras.cacheSignature
          },
          bubbles: true
        });
        this.hoosObj.extras.variantChangeSource = void 0;
        const originalHoosObj = getCorrectHoosObj(this.hoosObj.extras.cacheSignature);
        const { ancestorReferences } = originalHoosObj.extras;
        ancestorReferences.find((node) => node.isConnected).dispatchEvent(hoosEvent);
      }
    }
    // removes "hide-oos-diable" class from options which were not avaiable for previous selection
    enableDisabledSelectors(startInd = 1) {
      const tempSelectors = this.hoosObj.selectors.slice(startInd);
      for (let offset = 0; offset < tempSelectors.length; offset++) {
        let selector = tempSelectors[offset];
        let ow_index = startInd + offset;
        if (typeof window.camouflagePostEnableDisableSelectors === "function") {
          window.camouflagePostEnableDisableSelectors({ hoosObj: this.hoosObj, selector });
          continue;
        }
        if (getNodeNameLowerCase(selector) === "select") {
          const hiddenOptions = [...selector.querySelectorAll(`.${this.hoosObj.defaultUnavailableClass}`)];
          for (let option of hiddenOptions) {
            if (option.dataset && option.dataset.camouflageoptiontext && (this.hoosObj.extras.append_soldout_text || this.hoosObj.extras.append_unavailable_text)) {
              option.innerText = option.dataset.camouflageoptiontext;
            }
            labelHideShow(this.hoosObj, option, "show");
            option.disabled = false;
            option.camouflage_disabled = false;
            unwrapSelectOption({ option, hoosObj: this.hoosObj });
          }
        } else {
          if (!selector[0]) return;
          const tempSelector = this.hoosObj.field_selector ? selector[0].closest(this.hoosObj.field_selector) : this.hoosObj.option_wrappers[ow_index];
          if (!tempSelector) {
            console.error(`tempSelector is empty`);
            break;
          }
          const hiddenLabels = tempSelector.querySelectorAll(`.${this.hoosObj.defaultUnavailableClass}`);
          for (let label of hiddenLabels) {
            labelHideShow(this.hoosObj, label, "show");
            label.disabled = false;
            label.camouflage_disabled = false;
            const elemToEnable = this.hoosObj.input_selector ? label.querySelector(this.hoosObj.input_selector) : label.querySelector(this.hoosObj.input_selector_types[ow_index]);
            if (elemToEnable) {
              elemToEnable.disabled = false;
              elemToEnable.camouflage_disabled = false;
            }
            const forVal = label.getAttribute("for");
            let radio;
            if (forVal && this.hoosObj.mainContainer && typeof this.hoosObj.mainContainer.querySelector === "function") {
              radio = this.hoosObj.mainContainer.querySelector(`#${CSS.escape(forVal)}`) || document.getElementById(CSS.escape(forVal));
            } else {
              radio = label.querySelector(`input`);
            }
            if (radio) {
              radio.disabled = false;
              radio.camouflage_disabled = false;
            }
            if (this.hoosObj.input_elem_path_from_label) {
              try {
                const inputFound = eval(this.hoosObj.input_elem_path_from_label);
                if (inputFound) {
                  inputFound.disabled = false;
                  inputFound.camouflage_disabled = false;
                }
              } catch (error) {
                console.error(error);
              }
            }
          }
        }
      }
    }
    resetVSKOnClick() {
      if (this.hoosObj.extras.integrates_with === "swatch-king") {
        if (this.hoosObj.selector_type === "select" && this.hoosObj.selectors.length > 1) {
          this.hoosObj.selectors.forEach((selector2, index) => {
            if (index < this.hoosObj.selectors.length - 1 && selector2.camouflage_click_event_added) {
              selector2.addEventListener("change", () => {
                setTimeout(() => {
                  this.hoosObj.selectors = [];
                  setSelectors(this.hoosObj);
                  this.detectChangeAndUpdateElements(this.hoosObj.selectors[index]);
                }, 0);
              });
            }
          });
        } else {
          this.hoosObj.mainContainer.addEventListener("click", (event) => {
            setTimeout(() => {
              let targetElem = event.target.closest("li.swatch-view-item");
              if (!targetElem || !targetElem.camouflage_click_event_added) {
                return;
              }
              this.hoosObj.selectors = [];
              setSelectors(this.hoosObj);
              this.hoosObj.mappedLabels = [[]];
              this.setValueAttrOnOtherElementType();
              this.detectChangeAndUpdateElements();
            }, 0);
          });
        }
      }
    }
    // binds "change" event to selectors, and hides unavailable variant choices when choice changes
    detectChangeAndUpdateElements() {
      const selectors = this.hoosObj.selectors;
      const maxLvl = selectors.length - 1;
      const variant_change_delay = this.hoosObj.extras.variant_change_delay || 0;
      for (let i2 = 0; i2 < maxLvl; i2++) {
        if (getNodeNameLowerCase(selectors[i2]) === "select") {
          if (selectors[i2].camouflage_click_event_added === true) continue;
          selectors[i2].camouflage_click_event_added = true;
          selectors[i2].addEventListener("change", (event) => {
            setTimeout(() => {
              const eventTarge = event.target ? event.target : selectors[i2];
              try {
                this.hoosObj.previousProductOptions = { ...this.hoosObj.selectedProductOptions };
                this.hoosObj.selectedProductOptions[`option${i2 + 1}`] = this.getRadioValueLocal(eventTarge);
              } catch (error) {
                console.error(error);
              }
              this.enableDisabledSelectors(i2 + 1);
              if ((!eventTarge.value || eventTarge.value === "not-selected") && this.hoosObj.extras.make_a_selection_required === true) ;
              else {
                this.hoosObj.extras.variantChangeSource = "user";
                this.hideSelectOptionBasedOnPrevChoice(i2 + 1);
              }
            }, variant_change_delay);
          });
        } else {
          for (let input of selectors[i2]) {
            if (input.camouflage_click_event_added === true) continue;
            input.camouflage_click_event_added = true;
            input.addEventListener("click", (event) => {
              if (event.currentTarget.disabled) return;
              this.hoosObj.previousProductOptions = { ...this.hoosObj.selectedProductOptions };
              this.hoosObj.selectedProductOptions[`option${i2 + 1}`] = this.getRadioValueLocal(event.currentTarget);
              setTimeout(() => {
                this.enableDisabledSelectors(i2 + 1);
                this.hoosObj.extras.variantChangeSource = "detectChangeAndUpdateElements()";
                this.hideSelectOptionBasedOnPrevChoice(i2 + 1, null, this.hoosObj.previousProductOptions);
              }, variant_change_delay);
            });
          }
        }
      }
    }
    // invokes functions to hide OOS variant properties based on type of selector, with only variants which are available
    hideSoldOutVariants() {
      const hoosObj2 = this.hoosObj;
      let availableVariants = getAvailableVariants({ hoosObj: hoosObj2 });
      if (availableVariants === false) {
        console[logLevel]("Camouflage", "hideSoldOutVariants: Camouflage is exiting due to availableVariants false...");
        return;
      }
      if (this.hoosObj.exit_due_to_include_tags && this.hoosObj.product.variants.length === this.hoosObj.availableVariants.length) {
        console[logLevel]("Camouflage", "hideSoldOutVariants: Camouflage is exiting due to exit_due_to_include_tags...");
        return;
      }
      if (this.hoosObj.skip_execution && this.hoosObj.exit_due_to_include_tags) {
        console[logLevel]("Camouflage", "hideSoldOutVariants: Camouflage is exiting due to skip_execution and exit_due_to_include_tags...");
        return;
      }
      if (!checkIfShouldRun(this.hoosObj)) {
        console[logLevel]("Camouflage", "checkIfShouldRun:false returning....");
        return;
      }
      if (hoosObj2.extras.hide_from_variantid_dropdown === "yes" && hoosObj2.selectors.length === 1) {
        const { firstAvailableVariantId, selectedVariantValue } = hideFromVariantIdDropdown({ hoosObj: hoosObj2 });
        if (firstAvailableVariantId && hoosObj2.extras.make_a_selection_required !== true && firstAvailableVariantId != selectedVariantValue) {
          const firstAvailableVariant = hoosObj2.product.variants.find((v) => v.id == firstAvailableVariantId);
          if (firstAvailableVariant) {
            triggerChangeEventOnSelect(hoosObj2.selectors[0], firstAvailableVariantId, 0, hoosObj2);
          }
        }
        return;
      } else if (this.hoosObj.extras.hide_from_variantid_ui === "yes" && this.hoosObj.selectors.length === 1) {
        const { firstAvailableVariantId, selectedVariantValue } = hideFromVariantIdUIElem({ hoosObj: this.hoosObj });
        if (firstAvailableVariantId && this.hoosObj.extras.make_a_selection_required !== true && firstAvailableVariantId != selectedVariantValue) {
          const firstAvailableVariant = this.hoosObj.product.variants.find((v) => v.id == firstAvailableVariantId);
          if (firstAvailableVariant) {
            triggerChangeEventOnSelect(this.hoosObj.selectors[0], firstAvailableVariantId, 0, this.hoosObj);
          }
        }
        return;
      }
      if (!availableVariants.length) {
        this.hideAllUnavailableVariants();
        handleForMarkUnavailable(this.hoosObj);
        return;
      }
      if (hoosObj2.selectors.length !== hoosObj2.product.options.length) {
        return;
      }
      hoosObj2.selectedProductOptions.option1 = availableVariants[0].option1;
      hoosObj2.selectedProductOptions.option2 = availableVariants[0].option2;
      hoosObj2.selectedProductOptions.option3 = availableVariants[0].option3;
      hoosObj2.previousProductOptions = { ...hoosObj2.selectedProductOptions };
      let currentSelectedVariant = hoosObj2.selected_or_first_available_variant_id == availableVariants[0].id ? availableVariants[0] : null;
      if (typeof window.camouflagePreHideVariants === "function") {
        window.camouflagePreHideVariants({ hoosObj: hoosObj2 });
      }
      handleForMarkUnavailable(this.hoosObj);
      this.hideUnavailableOption1();
      if (hoosObj2.extras.make_a_selection_required !== true) {
        if (this.hoosObj.params.skip_initial_selection) ;
        else {
          this.setInitialSelection(availableVariants[0]);
        }
        this.hoosObj.extras.variantChangeSource = "hideSoldOutVariants()";
        this.hideSelectOptionBasedOnPrevChoice(1, currentSelectedVariant, hoosObj2.previousProductOptions);
      }
      this.detectChangeAndUpdateElements();
    }
  }
  async function setSelectors_TA7(hoosObj2) {
    let originalHoosObj;
    if (window.CAMOUFLAGEE.cacheSignature) {
      originalHoosObj = getCorrectHoosObj();
    } else {
      originalHoosObj = window.CAMOUFLAGEE.items.findLast((item) => item.product.id === hoosObj2.product.id && !Object.hasOwn(item.extras, "cacheSignature"));
    }
    console.log({ originalHoosObj });
    if (!originalHoosObj.extras.mutation_observer_requirement_decided) {
      originalHoosObj.extras.mutation_observer_requirement_decided = false;
      originalHoosObj.extras.mutation_observer_still_needed = true;
    }
    const cache = originalHoosObj.extras.hoos_ta7_cache;
    const cacheUseAllowed = originalHoosObj.extras.use_ta7_cache;
    if (cache && cacheUseAllowed) {
      let newVariantPickerData = run_TA7WithCache(cache);
      if (newVariantPickerData) {
        hoosObj2.extras.observer_container_node = originalHoosObj.extras.hoos_ta7_cache.deepestStableNode;
        hoosObj2.mainContainer = newVariantPickerData.variantPicker.variantPicker;
        hoosObj2.option_wrappers = newVariantPickerData.option_wrappers_with_selectors.map((ow) => ow.field_selector);
        hoosObj2.input_selector_types = newVariantPickerData.option_wrappers_with_selectors.map((ow) => ow.selector_type);
        hoosObj2.selectors = newVariantPickerData.option_wrappers_with_selectors.map((ow) => ow.selectors);
        hoosObj2.enableDisabledSelectorsArr = hoosObj2.selectors.slice();
        hoosObj2.hiddenInputFieldForVariantID = newVariantPickerData.variantIdField;
        hoosObj2.extras.attribute_name = newVariantPickerData.attribute_name;
        hoosObj2.extras.make_a_selection_required = newVariantPickerData.make_a_selection_required;
        hoosObj2.extras.cacheSignature = window.CAMOUFLAGEE.cacheSignature;
        window.CAMOUFLAGEE.cacheSignature = void 0;
        console[logLevel]("TA7 FAST MODE USED");
        return true;
      }
      originalHoosObj.extras.use_ta7_cache = false;
      originalHoosObj.extras.ta7_cache_invalidated = true;
      console[logLevel]("[TA7 CACHE INVALIDATED. USING FULL TA7 ENGINE]");
    }
    let TA7_Result = await runTA7(hoosObj2.product, hoosObj2.params.mainContainer);
    if (TA7_Result.status === "failure") {
      return false;
    }
    console[logLevel]("TA7 FULL MODE USED");
    const Variant_Picker = TA7_Result.Variant_Picker;
    hoosObj2.hiddenInputFieldForVariantID = Variant_Picker.variantIdField;
    hoosObj2.mainContainer = Variant_Picker.variantPicker;
    hoosObj2.option_wrappers = Variant_Picker.option_wrappers_with_selectors.map((ow) => ow.field_selector);
    hoosObj2.input_selector_types = Variant_Picker.input_selector_types;
    hoosObj2.selectors = Variant_Picker.option_wrappers_with_selectors.map((ow) => ow.selectors);
    hoosObj2.enableDisabledSelectorsArr = hoosObj2.selectors.slice();
    hoosObj2.extras.attribute_name = Variant_Picker.attribute_name;
    hoosObj2.extras.observer_container_node = Variant_Picker.observer_container_node;
    hoosObj2.extras.ancestorReferences = Variant_Picker.ancestorReferences;
    hoosObj2.extras.make_a_selection_required = Variant_Picker.make_a_selection_required;
    if (!originalHoosObj.extras.ta7_cache_invalidated) {
      hoosObj2.extras.ta7_cache = Variant_Picker.variantPickerCache;
      originalHoosObj.extras.hoos_ta7_cache = Variant_Picker.variantPickerCache;
      originalHoosObj.extras.use_ta7_cache = true;
    }
    if (!originalHoosObj.extras.mutation_observer_requirement_decided) {
      originalHoosObj.extras.mutation_observer_requirement_decided = false;
      originalHoosObj.extras.mutation_observer_still_needed = true;
      originalHoosObj.extras.ta7_selector_snapshot = {
        mainContainer: hoosObj2.mainContainer,
        wrappers: hoosObj2.option_wrappers,
        selectors: hoosObj2.selectors.map((selector2) => Array.isArray(selector2) ? selector2[0] : selector2)
      };
    }
    originalHoosObj.extras.ancestorReferences = Variant_Picker.ancestorReferences;
    hoosObj2.extras.cacheSignature = {
      productId: hoosObj2.product.id,
      searchNodeSignature: Variant_Picker.observer_container_node
    };
    hoosObj2.extras.addToCartButton = Variant_Picker.addToCartButton;
    return true;
  }
  async function useTA7(params, hoosObj2, camouflageVariants, startFn) {
    try {
      await getProduct(hoosObj2);
      if (!hoosObj2.product) {
        console.error("%cProduct not found.", "color:red");
        return;
      }
      if (hoosObj2.product.options.length !== hoosObj2.product.variants[0].options.length) {
        console.error("%cProduct options length does not match variant options length.", "color:red");
        return;
      }
      if (hoosObj2.product.variants_count && hoosObj2.product.variants.length !== hoosObj2.product.variants_count) {
        console.error("%cProduct variants count does not match variant count.", "color:red, font-size:20px");
        return;
      }
    } catch (error) {
      console.error({
        Control_Function: "startFn(params)",
        error: "Error occured in fetching product data"
      });
      return;
    }
    let selectorExtracted = true;
    if (!hoosObj2.selectors.length) {
      console[logLevel]("[setSelectors called from useTA7]");
      selectorExtracted = await setSelectors_TA7(hoosObj2);
    }
    if (!selectorExtracted) {
      console.error({
        Control_Function: "start() -> useTA7()",
        error: "TA7 could not find selectors, USE LEGACY MODE"
      });
      return;
    }
    updateExtraObj(hoosObj2);
    if (typeof window.camouflagePostSelectorsSet === "function") {
      window.camouflagePostSelectorsSet({ hoosObj: hoosObj2 });
    }
    camouflageVariants.setValueAttrOnOtherElementType();
    if (hoosObj2.original_selector_type === "swatch_and_dropdown_mixed" && hoosObj2.theme_name === "prestige-popover") {
      document.addEventListener("hoos:labelhideshow", () => {
        document.querySelectorAll(".Popover__Content div.Popover__ValueList").forEach((elem) => {
          elem.classList.remove(hoosObj2.unavailableClass);
          elem.classList.remove(hoosObj2.defaultUnavailableClass);
        });
      });
    }
    if (hoosObj2.horizonThemes && hoosObj2.horizonThemes.includes(hoosObj2.theme_name)) {
      observeContainerForRestoringAttributes(hoosObj2);
    }
    if (["swatch-king"].includes(hoosObj2.extras.integrates_with)) {
      camouflageVariants.resetVSKOnClick();
    }
    const originalHoosObj = getCorrectHoosObj(hoosObj2.extras.cacheSignature);
    if (typeof hoosObj2.extras.variant_picker_selector === "string" && !originalHoosObj.extras.mutation_observer_requirement_decided) {
      let observer_container_node_enforced = null;
      try {
        observer_container_node_enforced = hoosObj2.extras.observer_container_node.closest(hoosObj2.extras.variant_picker_selector) || hoosObj2.extras.observer_container_node.querySelector(hoosObj2.extras.variant_picker_selector);
        if (observer_container_node_enforced) {
          hoosObj2.extras.observer_container_node = observer_container_node_enforced;
        }
        originalHoosObj.extras.mutation_observer_still_needed = true;
        originalHoosObj.extras.mutation_observer_requirement_decided = true;
        originalHoosObj.extras.isObserverScopeMinimized = true;
      } catch (error) {
        console[logLevel]({ error });
      }
    }
    if (originalHoosObj.extras.mutation_observer_still_needed) {
      params.setSelectors = setSelectors_TA7;
      observeVariantInputFieldTA7(hoosObj2, params, startFn);
    }
    camouflageVariants.hideSoldOutVariants();
    fireCamouflageExecutedEvent(hoosObj2);
  }
  async function useLegacy(params, hoosObj2, camouflageVariants, startFn) {
    updateAppIntegration(camouflageVariants.hoosObj);
    await getProduct(hoosObj2);
    if (!hoosObj2.product) {
      console.error("%cProduct not found.", "color:red");
      return;
    }
    if (hoosObj2.product.options.length !== hoosObj2.product.variants[0].options.length) {
      console.error("%cProduct options length does not match variant options length.", "color:red");
      return;
    }
    if (hoosObj2.product.variants_count && hoosObj2.product.variants.length !== hoosObj2.product.variants_count) {
      console.error(
        "%cProduct variants count does not match variant count.",
        "color:red, font-size:20px"
      );
      return;
    }
    if (params.mainContainer && typeof params.mainContainer === "string") {
      hoosObj2.mainContainer = document.querySelector(params.mainContainer) || hoosObj2.mainContainer;
      if (!hoosObj2.mainContainer) {
        const tempContainer = await getMainContainerFromString(params.mainContainer, 3e3);
        if (tempContainer) {
          hoosObj2.mainContainer = tempContainer;
        }
      }
    }
    if (!hoosObj2.mainContainer) {
      hoosObj2.mainContainer = getMainContainer();
    } else if (typeof hoosObj2.mainContainer === "string") {
      const mainContainerString = hoosObj2.mainContainer;
      hoosObj2.mainContainer = document.querySelector(mainContainerString);
      if (!hoosObj2.mainContainer) {
        hoosObj2.mainContainer = await getMainContainerFromString(mainContainerString);
      }
    }
    if (!hoosObj2.mainContainer) {
      return;
    }
    hoosObj2.hiddenInputFieldForVariantID = hoosObj2.mainContainer.querySelector("[name=id]") || document.querySelector("[name=id]");
    let selectorsSetupComplete = false;
    let lapsedTime = 0;
    const intervalDuration = 100;
    let delay = 0;
    if (hoosObj2.extras.delay) {
      delay = Number(hoosObj2.extras.delay);
    }
    if (delay) {
      await sleep(delay);
    }
    function setupSelectors() {
      if (!(hoosObj2.selector_type && hoosObj2.field_selector)) {
        console.error(`Select the field type. Contact the admin`);
      }
      if (!hoosObj2.field_selector) return;
      if (!hoosObj2.selectors.length && typeof window.camouflagePreSelectorsSet === "function") {
        window.camouflagePreSelectorsSet({ hoosObj: hoosObj2 });
      }
      if (!hoosObj2.selectors.length) {
        setSelectors(hoosObj2);
      }
      if (!hoosObj2.selectors.length) {
        return;
      }
      updateExtraObj(hoosObj2);
      if (typeof window.camouflagePostSelectorsSet === "function") {
        window.camouflagePostSelectorsSet({ hoosObj: hoosObj2 });
      }
      camouflageVariants.setValueAttrOnOtherElementType();
      camouflageVariants.hideSoldOutVariants();
      if (hoosObj2.horizonThemes && hoosObj2.horizonThemes.includes(hoosObj2.theme_name) && [
        "variant-picker fieldset.variant-option",
        "variant-picker .variant-option__select",
        ".variant-option"
      ].includes(hoosObj2.field_selector)) {
        observeContainerForRestoringAttributes(hoosObj2);
      }
      selectorsSetupComplete = true;
      fireCamouflageExecutedEvent(hoosObj2);
      if (["swatch-king"].includes(hoosObj2.extras.integrates_with)) {
        camouflageVariants.resetVSKOnClick();
      }
      if (hoosObj2.original_selector_type === "swatch_and_dropdown_mixed" && hoosObj2.theme_name === "prestige-popover") {
        document.addEventListener("hoos:labelhideshow", () => {
          document.querySelectorAll(".Popover__Content div.Popover__ValueList").forEach((elem) => {
            elem.classList.remove(hoosObj2.unavailableClass);
            elem.classList.remove(hoosObj2.defaultUnavailableClass);
          });
        });
      }
      if (typeof hoosObj2.extras.variant_picker_selector === "string" && hoosObj2.selectors && hoosObj2.selectors.length) {
        let observerContainer;
        let firstElem = hoosObj2.selectors[0];
        if (Array.isArray(firstElem)) {
          firstElem = firstElem[0];
        }
        if (firstElem && typeof firstElem.closest === "function") {
          observerContainer = firstElem.closest(hoosObj2.extras.variant_picker_selector);
        }
        if (!observerContainer) {
          observerContainer = document.querySelector(hoosObj2.extras.variant_picker_selector);
        }
        if (observerContainer && (hoosObj2.mainContainer === observerContainer || hoosObj2.mainContainer.contains(observerContainer))) {
          params.setSelectors = setSelectors;
          hoosObj2.selectorAuthority = "legacy";
          observeVariantInputField(hoosObj2, params, startFn);
        }
      }
    }
    setupSelectors();
    if (!selectorsSetupComplete) {
      const intervalTimer = setInterval(() => {
        lapsedTime += intervalDuration;
        setupSelectors();
        if (selectorsSetupComplete || lapsedTime >= 4e3) {
          clearInterval(intervalTimer);
        }
      }, intervalDuration);
    }
  }
  function start(params) {
    const hoosObj2 = getHoosObj(params);
    const camouflageVariants = new CamouflageVariants(hoosObj2);
    camouflageVariants.hoosObj.getAvailableVariants = getAvailableVariants;
    const shouldRunTA7 = (params.hide_oos_query_selectors || hoosObj2.integrates_with || typeof window.camouflagePreSelectorsSet === "function") === false;
    if (hoosObj2.extras.use_TA7 && shouldRunTA7) {
      console[logLevel]({
        Control_Function: "start() -> useTA7()"
      });
      useTA7(
        params,
        hoosObj2,
        camouflageVariants,
        start
      );
    } else {
      console[logLevel]({
        Control_Function: "start() -> useLegacy()"
      });
      useLegacy(
        params,
        hoosObj2,
        camouflageVariants,
        start
      );
    }
    return camouflageVariants;
  }
  document.addEventListener("hoos:alldisabled", (event) => {
    console[logLevel]("Camouflage", "hoos:alldisabled event fired");
    const hoosObj2 = event.detail;
    const is_product_page = window.camouflage_global_config.request.page_type === "product";
    let addBtn = is_product_page ? hoosObj2.mainContainer.querySelector('[name="add"]') || document.querySelector('[name="add"]') : hoosObj2.mainContainer.querySelector('[name="add"]');
    if (!addBtn && !is_product_page && hoosObj2.mainContainer.parentElement && hoosObj2.mainContainer.parentElement.parentElement) {
      addBtn = hoosObj2.mainContainer.parentElement.parentElement.querySelector('[name="add"]');
    }
    if (addBtn) {
      addBtn.disabled = true;
    }
    if (hoosObj2.extras.integrates_with === "camouflage-variant-picker" && hoosObj2.mainContainer.nodeName === "CAMOUFLAGE-VARIANT-PICKER" && hoosObj2.variant_action === "hide") {
      hoosObj2.mainContainer.classList.add("hide-oos-disable");
    }
  });
  const initCamouflage = (param) => {
    setTimeout(() => {
      const camouflageVariants = start(param);
      fireCamouflageHoosObjPreparedEvent(camouflageVariants.hoosObj);
    }, 10);
  };
  window.initCamouflage = initCamouflage;
  const scriptLoadedEvent = new CustomEvent("hoos:scriptloaded", {
    detail: {
      currentTime: (/* @__PURE__ */ new Date()).getTime()
    }
  });
  document.dispatchEvent(scriptLoadedEvent);
  document.addEventListener("hoos:executed", (event) => {
    console[logLevel]("Camouflage", "hoos:executed event fired");
    const hoosObj2 = event.detail;
    if (hoosObj2.skip_execution) {
      return;
    }
    addRemoveCSStyleForHiddenVariants(hoosObj2);
  });
})();
