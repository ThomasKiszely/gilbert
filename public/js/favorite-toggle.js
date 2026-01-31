// Toggle favorite on server
async function toggleFavorite(productId) {
    const res = await fetch(`/api/favorites/${productId}`, {
        method: "PATCH",
        credentials: "include"
    });

    const json = await res.json();
    return json.success;
}

// Attach click handlers to all heart icons
function setupFavoriteButtons() {
    document.querySelectorAll(".favorite-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            e.stopPropagation();

            const productId = btn.dataset.id;

            const ok = await toggleFavorite(productId);
            if (!ok) return;

            btn.classList.toggle("active");
        });
    });
}
