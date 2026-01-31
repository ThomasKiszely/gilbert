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

                <div class="favorite-btn ${product.isFavorite ? "active" : ""}" data-id="${product._id}">
    <svg class="heart-icon" viewBox="0 0 24 24">
        <path d="M12 21s-6.7-4.35-10-9.14C-1.6 7.1 1.4 2 6 2c2.54 0 4 1.66 6 3.76C14 3.66 15.46 2 18 2c4.6 0 7.6 5.1 4 9.86C18.7 16.65 12 21 12 21z"/>
    </svg>
</div>




            </div>

            <div class="product-info">
                <div class="product-brand">${product.brand?.name || ""}</div>
                <div class="product-title">${product.title}</div>
                <div class="product-price">${product.price} kr.</div>
            </div>
        `;

        container.appendChild(card);
    });

    // ⭐ meget vigtigt
    setupFavoriteButtons();
}


async function getProducts() {
    const products = await fetchProducts();
    renderProducts(products);
}

getProducts();
