const statusBox = document.getElementById("status");

async function loadProfile() {
    try {
        const res = await fetch("/api/users/me", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            }
        });

        const json = await res.json();
        if (!json.success) {
            throw new Error("Could not fetch profile");
        }

        const user = json.data;

        document.getElementById("username").innerText = user.username || "";
        document.getElementById("city").innerText = user.location?.city || "";
        document.getElementById("country").innerText = user.location?.country || "";
        document.getElementById("cvr").innerText = user.cvr || "";
        document.getElementById("bio").innerText = user.profile?.bio || "";
        document.getElementById("language").innerText = user.profile?.language || "da";
        document.getElementById("avatar").src = user.profile?.avatarUrl || "/api/images/avatars/Gilbert.jpg";

    } catch (err) {
        statusBox.innerText = "Error: " + err.message;
    }
}
async function loadMyProducts() {
    try {
        const res = await fetch("/api/products/me", {
            method: "GET",
            credentials: "include"
        });

        const json = await res.json();
        if (!json.success) {
            throw new Error("Could not fetch products");
        }

        const products = json.data;
        const container = document.getElementById("my-products");

        container.innerHTML = "";

        products.forEach(p => {
            const div = document.createElement("div");
            div.className = "product-card";

            div.innerHTML = `
    <a href="/edit-product/${p._id}" class="product-card-link">
        <div class="product-card">
            <div class="product-image-wrapper">
                <img src="${p.images[0]}" alt="${p.title}">
            </div>

            <div class="product-info">
                <div class="product-title">${p.title}</div>
                <div class="product-price">${p.price} kr.</div>
                <div class="product-status">${p.status}</div>
            </div>
        </div>
    </a>
`;



            container.appendChild(div);
        });

    } catch (err) {
        console.error(err);
    }
}

document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
        const res = await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include"
        });

        const json = await res.json();

        if (json.success) {
            window.location.href = "/"; // redirect til forsiden
        } else {
            statusBox.innerText = "Logout failed";
        }
    } catch (err) {
        statusBox.innerText = "Error logging out";
    }
});


loadProfile();
loadMyProducts();
