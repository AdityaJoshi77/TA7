
const variantPicker = document.querySelector('.product-block');
const option_wrappers = Array.from(variantPicker.querySelectorAll('.variant-wrapper'));

let optionValueRack = ['Natural Linen', '38', '34'];

option_wrappers.forEach(wrapper => {
    let selectors = Array.from(wrapper.querySelectorAll('input[value]'));
    
})