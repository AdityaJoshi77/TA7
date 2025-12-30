async function getProductData() {
  const productJsonUrl = `${window.location.pathname}.json`;

  const fetchProductData = async (productJsonUrl) => {
    const response = await fetch(productJsonUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch product JSON");
    }

    const data = await response.json();
    return data.product;
  };

  fetchProductData();
}

fetchProductData(productJsonUrl)
  .then((productData) => {
    console.log(productData);
    // authoritative product object here
  })
  .catch((err) => {
    console.error(err);
  });
