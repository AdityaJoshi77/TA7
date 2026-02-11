

// in the start => preserveLegacy()
// before calling the observeVariantInputField() : 
if (
    typeof hoosObj.extras.observer_selector === 'string' &&
    hoosObj.selectors &&
    hoosObj.selectors.length
) {
    let observerContainer;
    let firstElem = hoosObj.selectors[0];
    if (Array.isArray(firstElem)) {
        firstElem = firstElem[0];
    }
    if (firstElem && typeof firstElem.closest === "function") {
        observerContainer = firstElem.closest(hoosObj.extras.observer_selector);
    }
    if (!observerContainer) {
        observerContainer = document.querySelector(hoosObj.extras.observer_selector);
    }
    if (observerContainer === hoosObj.mainContainer) {
        params.setSelectors = setSelectors;
        hoosObj.selectorAuthority = 'legacy';
        observeVariantInputField(hoosObj, params, start);
    }
}

// in the start() => useTA7Flow()
// before calling the observeVariantInputField() : 
if (typeof hoosObj.extras.observer_selector === 'string' && hoosObj.selectors && hoosObj.selectors.length) {
    hoosObj.mainContainer = hoosObj.extras.observer_container_node;
    params.setSelectors = setSelectors_TA7;
    hoosObj.selectorAuthority = 'TA7';
    observeVariantInputField(hoosObj, params, start);
}


// new logic refactor for observeVariantInputField() in commonV2.js
// along with helpers: 
function legacyInvalidated({
    hoosObj,
    mutation,
    nodeStatus,
    variantPickerObserverTags
}) {
    if (mutation.type !== 'childList') return false;

    // ADDED nodes
    for (const child of mutation.addedNodes) {
        for (const tag of variantPickerObserverTags) {
            if (typeof child.closest === 'function' && child.closest(tag)) {
                nodeStatus.added = true;
                return true;
            }
        }
    }

    // REMOVED nodes
    for (const child of mutation.removedNodes) {
        let fieldsetRemoved = false;

        if (
            !child.parentElement &&
            typeof child.closest === 'function' &&
            typeof child.querySelector === 'function'
        ) {
            if (hoosObj.field_selector) {
                fieldsetRemoved =
                    child.closest(hoosObj.field_selector) === child ||
                    !!child.querySelector(hoosObj.field_selector);
            }
        }

        for (const tag of variantPickerObserverTags) {
            if (typeof child.closest === 'function' && child.closest(tag)) {
                nodeStatus.removed = true;
                return true;
            }
        }

        if (fieldsetRemoved) {
            nodeStatus.removed = true;
            return true;
        }
    }

    return false;
}

function ta7Invalidated({ hoosObj }) {

    // 1. Option wrappers must still exist & be connected
    if (!Array.isArray(hoosObj.option_wrappers)) return true;

    if (!hoosObj.option_wrappers.length) return true;

    for (const ow of hoosObj.option_wrappers) {
        if (!ow || !ow.isConnected) {
            return true;
        }
    }

    // 2. Observer container must still be valid
    if (
        hoosObj.extras?.observer_container_node &&
        !hoosObj.extras.observer_container_node.isConnected
    ) {
        return true;
    }

    return false;
}

function shouldRestartByAuthority({
    hoosObj,
    mutation,
    nodeStatus,
    variantPickerObserverTags
}) {
    if (hoosObj.selectorAuthority === 'TA7') {
        return ta7Invalidated({ hoosObj });
    }

    // default = legacy
    return legacyInvalidated({
        hoosObj,
        mutation,
        nodeStatus,
        variantPickerObserverTags
    });
}


const observeVariantInputField = (hoosObj, param, startFn) => {
    console[logLevel]('observeVariantInputField:start');

    if (!checkIfShouldRun(hoosObj)) {
        console[logLevel]("Camouflage", "checkIfShouldRun:false returning....");
        return;
    }

    const customObserverSelector = (hoosObj.extras.observer_selector && typeof hoosObj.extras.observer_selector === 'string') ? [hoosObj.extras.observer_selector] : [];
    const variantPickerObserverTags = [
        '.product-info__block-item[data-block-id="variant_picker"]', // prestige 10x
        '.product-info__block-item[data-block-id="variant_selector"]', '.product-info__block-item[data-block-type="variant-picker"]', // prestige 10x
        '.product-page--block[data-block-type="options"]', // Beyond 4.1+
        '.product--block[data-block-type="options"]', // Beyond 4.1+
        '.f8pr-variant-selection', // Xclusive theme
        'variant-selects',
        'variant-picker',
        '#quick-buy-modal-content', // Prestige quick view -> this element gets added on option change
        '.tt-swatches-container', // Wookie
        'high-variant-selects', // Ascent 3.x
        ...customObserverSelector,
    ];
    if (hoosObj.mainContainer && !hoosObj.mainContainer.getAttribute('is-camouflage-observing')) {
        const observerTarget = hoosObj.mainContainer;
        const observerConfig = { childList: true, subtree: true };

        let callCount = 0;
        let startTime = null;
        const observer_restart_delay = hoosObj.extras.observer_restart_delay || 10;
        let nodeStatus = {
            added: false,
            removed: false,
        };
        const observerCallback = (mutationsList, observer) => {
            if (!startTime) {
                startTime = Date.now();
            }

            let restarted = false;
            let restart = false;

            mutationsList.forEach((mutation) => {
                console[logLevel]({ mutation });

                if (mutation.type !== 'childList') return;

                // AUTHORITY-AWARE INVALIDATION
                restart = restart || shouldRestartByAuthority({
                    hoosObj,
                    mutation,
                    nodeStatus,
                    variantPickerObserverTags
                });
            });

            if (!restarted && restart && (true || !hoosObj.hiddenInputFieldForVariantID.value)) {
                callCount++;
                let timeDiff = Date.now() - startTime;

                if (callCount >= 30 && (timeDiff < 15 * 1000)) {
                    console[logLevel](
                        `\x1b[31m------------Camouflage called ${callCount} times in ${timeDiff / 1000} seconds, stopping observer----------\x1b[0m`
                    );
                    observer.disconnect();
                    setTimeout(() => observer.observe(observerTarget, observerConfig), 3000);
                    return;
                }

                if (timeDiff > 15 * 1000) {
                    startTime = Date.now();
                    callCount = 0;
                }

                restarted = true;

                setTimeout(async () => {
                    param.skip_initial_selection = true;

                    let variantPickerReplaced = false;

                    if (ifVariantSelectorRemoved(hoosObj)) {
                        hoosObj.selectors = [];

                        if (typeof param.setSelectors === "function") {
                            param.setSelectors(hoosObj);
                        } else {
                            setSelectors(hoosObj);
                        }

                        variantPickerReplaced = true;
                    }

                    const resp = getVariantToSelectAfterVariantChange(
                        hoosObj,
                        param.skip_initial_selection,
                        'yes'
                    );

                    param.current_variant_id = resp.tempVariants?.[0]?.id;
                    param.restarted_by = 'mutation-observer';

                    reinitCamouflageFn({
                        param: { ...param },
                        currentVariantId: param.current_variant_id,
                        productId: param.product?.id,
                        camouflageVariants: hoosObj,
                        variantPickerReplaced,
                        startFn,
                    });

                    nodeStatus.added = false;
                    nodeStatus.removed = false;
                }, observer_restart_delay);
            }
        };

        const observer = new MutationObserver(observerCallback);
        observer.observe(observerTarget, observerConfig);

        hoosObj.mainContainer.setAttribute('is-camouflage-observing', 'true');
    }
};