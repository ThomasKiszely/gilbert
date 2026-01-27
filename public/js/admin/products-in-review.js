const API_URL = "/api/admin";

async function fetchProductsInReview() {
    const res = await fetch(`${API_URL}/products/in-review`, {
        method: "GET",
        credentials: "include",
    });

    return await res.json();
}

function renderProducts(products) {
    const container = document.getElementById("products");
    container.innerHTML = "";

    if (!products.length) {
        container.innerHTML = "<p>No product waiting for confirmation</p>";
        return;
    }

    products.forEach(product => {
        const div = document.createElement("div");
        div.classList.add("product-item");

        div.innerHTML = `
            <h3>${product.title}</h3>
            <p>Pris: ${product.price} kr</p>
            <p>Sælger: ${product.seller?.username || "Unknown"}</p>

            <button class="approve-btn" data-id="${product._id}">Approve</button>
            <button class="reject-btn" data-id="${product._id}">Reject</button>
        `;

        container.appendChild(div);
    });

    attachButtonEvents();
}

function attachButtonEvents() {
    document.querySelectorAll(".approve-btn").forEach(btn => {
        btn.addEventListener("click", () => updateStatus(btn.dataset.id, "Approved"));
    });

    document.querySelectorAll(".reject-btn").forEach(btn => {
        btn.addEventListener("click", () => updateStatus(btn.dataset.id, "Rejected"));
    });
}

async function updateStatus(id, status) {
    const endpoint = status === "Approved" ? "approve" : "reject"
    const res = await fetch(`${API_URL}/products/${id}/${endpoint}`, {
        method: "PUT",
        credentials: "include"
    });

    if (res.ok) {
        alert(`Product ${status.toLowerCase()}!`);
        loadProducts();
    } else {
        alert("Something went wrong!");
    }
}

async function loadProducts() {
    const products = await fetchProductsInReview();
    renderProducts(products);
}

loadProducts();
