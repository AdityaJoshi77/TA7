
// @ts-check

const fetchProductData = async (productLink) => {
    const response = await fetch(productLink);
    const data = await response.json();
    return data.product;
};


/**
 *
 * All of the selectors gets removed and re-added on variant-change.
 * Find the closest DOM element that contains all of the selectors where we can attach mutation observer
 */
const findTheClosestDOMForMutationObserver = (selectors) => {
};


const findMainContainer = (selectors) => {
    console.debug('findMainContainer', selectors);
    // find mainContainer - mainContainer contains all selectors
    const mainContainerMaxLevelSearch = 7;
    let mainContainer = selectors[0] && selectors[0][0] ? selectors[0][0] : selectors[0];
    console.debug({ mainContainer, selectors });
    for (let i = 0; i < mainContainerMaxLevelSearch; i++) {
        let isMainContainerContainsAllSelectors = true;
        for (let selectorGroup of selectors) {
            if (Array.isArray(selectorGroup)) {
                for (let element of selectorGroup) {
                    if (!mainContainer.contains(element)) {
                        isMainContainerContainsAllSelectors = false;
                        break;
                    }
                }
            } else {
                if (!mainContainer.contains(selectorGroup)) {
                    isMainContainerContainsAllSelectors = false;
                    break;
                }
            }
                
            if (!isMainContainerContainsAllSelectors) break;
        }
        if (isMainContainerContainsAllSelectors) {
            break;
        }
        mainContainer = mainContainer.parentElement;
    }

    return mainContainer;
};

const testAutoDetection = async (productLink, mainContainer) => {
    console.debug("testAutoDetection", productLink, mainContainer);
    const productData = await fetchProductData(productLink);
    console.debug(productData);

    if (mainContainer && typeof mainContainer === 'string') {
        mainContainer = document.querySelector(mainContainer);
    }

    let domSearchContainer = mainContainer || document.body;

    /**
     * @type Element | null
     */
    const productFormElement = document.querySelector('form[action="/cart/add"]');

    // find elements where productData.options[0].values[] are present
    const options = productData.options;

    let tagsToCheck = ['input[type="radio"]', 'option', 'button', 'a', 'span', 'div', 'label'];
    let dataAttributesToCheck = ['data-option-id', 'data-option-value', 'value', 'data-value', 'orig-value'];
    let extrasObj = {};

    let selectors = [];
    const maxDomLevelCheck = 4;
    options.forEach((option) => {
        const values = option.values;
        /**
         * @type Element[]
         */
        let elements = [];
        let domQuery = [];
        let dataAttribute = 'value';
        let targetParentElement = false;
        let targetParent2Element = false;
        let inputSelector = '';
        let selectorType = '';

        for (let tag of tagsToCheck) {
            for (let attribute of dataAttributesToCheck) {
                domQuery = values.map(value => `${tag}[${attribute}="${CSS.escape(value.name || value)}"]`);
                console.debug({ domQuery });

                // search within a form[action="/cart/add"] first

                if (productFormElement) {
                    elements = productFormElement.querySelectorAll(domQuery.join(','));
                }
                if (elements.length !== values.length) {
                    console.debug(`elements not found in productFormElement, trying domSearchContainer`)
                    elements = domSearchContainer.querySelectorAll(domQuery.join(','));
                } else {
                    mainContainer = productFormElement;
                }


                console.debug({ elements });
                if (elements.length === values.length) {
                    dataAttribute = attribute;
                    inputSelector = `${tag.toLowerCase()}[${attribute}]`;
                    selectorType = tag.toLowerCase();
                    if (selectorType === 'option') {
                        selectorType = 'select';
                    }
                    break;
                }
            }
            if (elements.length === values.length) {
                break;
            }
        }

        if (elements.length !== values.length) {
            console.debug(`option ${option.name} count didn't match where ${elements.length} elements found and ${values.length} values found`)
            return;
        }

        console.debug({ domQuery, elements });


        let i = 1;
        let parentElement1 = elements[0].parentElement;
        let parentElement2 = elements[elements.length - 1].parentElement;
        let parentsMatched = false;
        while (i < maxDomLevelCheck) {
            if (parentElement1 === parentElement2) {
                parentsMatched = true;
                console.debug({ parentsMatched, i });
                break;
            }
            if (parentElement1) {
                parentElement1 = parentElement1.parentElement;
            }
            if (parentElement2) {
                parentElement2 = parentElement2.parentElement;
            }
            i++;
        }

        if (!parentsMatched) {
            console.debug(`option ${option.name} parents didn't match`);
            return;
        }

        if (!parentElement1 || parentElement1.clientWidth < 10) {
            console.debug(`option ${option.name} parent element width is less than 10`);
            return;
        }

        if (elements[0].nodeName.toLowerCase() === 'option') {
            selectors.push(elements[0].parentElement);
        } else {
            selectors.push([...elements]);
        }

        // set targetParentElement and targetParent2Element
        const selectorFirstItem = selectors[selectors.length - 1];
        const firstItem = selectorType === 'select' ? selectorFirstItem : selectorFirstItem[0];
        const parentElementTemp = firstItem.parentElement;
        console.log({ firstItem, parentElementTemp });
        if (selectorType !== 'select' && selectorFirstItem.length > 1 && parentElementTemp.querySelectorAll(inputSelector).length === 1) {
            targetParentElement = true;
        }

        extrasObj[option.name] = {
            targetParentElement,
            targetParent2Element,
            dataAttribute,
            inputSelector,
            selectorType,
        };
    });

    if (!mainContainer && selectors.length) {
        mainContainer = findMainContainer(selectors);
    }

    console.debug({ selectors, mainContainer, domSearchContainer, extrasObj });
};


testAutoDetection(`${window.location.href.split('?')[0]}.json`);