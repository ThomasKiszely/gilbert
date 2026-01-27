const API_URL = "/api/products";

async function fetchProducts() {
    const res = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
    });

    return await res.json();
}

function renderProducts(products) {
    const container = document.getElementById("products");
    container.innerHTML = "";

    if (!products.length) {
        container.innerHTML = "<p>No products to show</p>";
        return;
    }

    products.forEach(product => {
        const card = document.createElement("div");
        card.classList.add("product-card");

        const badge = product.tags?.length
            ? `<div class="product-badge">${product.tags[0].name}</div>`
            : "";

        const image = product.images?.[0] || "/images/ImagePlaceholder.jpg";
        card.innerHTML = `
            <div class="product-image-wrapper">
                ${badge}
                <img src="${image}" alt="${product.title}">
            </div>

            <div class="product-info">
                <div class="product-brand">${product.brand?.name || ""}</div>
                <div class="product-title">${product.title}</div>
                <div class="product-price">${product.price} kr.</div>
            </div>
        `;

        container.appendChild(card);
    });
}

async function getProducts() {
    const products = await fetchProducts();
    renderProducts(products);
}

getProducts();
