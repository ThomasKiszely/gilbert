async function loadFavorites() {
    const container = document.getElementById("favoritesContainer");
    const emptyMessage = document.getElementById("emptyMessage");

    const res = await fetch("/api/favorites", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
    });

    const json = await res.json();

    if (!json.success) {
        emptyMessage.textContent = "Could not load favorites.";
        emptyMessage.style.display = "block";
        return;
    }

    const favorites = json.favorites;

    if (!favorites.length) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";
    container.innerHTML = "";

    favorites.forEach(product => {
        const card = document.createElement("a");
        card.href = `/product/${product._id}`;
        card.classList.add("product-card-link");

        card.innerHTML = `
            <div class="product-card">
                <div class="product-image-wrapper">
                    <img src="${product.images?.[0] || '/images/ImagePlaceholder.jpg'}" alt="${product.title}">
                </div>

                <div class="product-info">
                    <div class="product-title">${product.title}</div>
                    <div class="product-price">${product.price} kr.</div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

loadFavorites();
setupFavoriteButtons();
