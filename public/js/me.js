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
    <a href="/edit-product/${p._id}" class="product-link">
        <img src="${p.images[0]}" style="max-width:120px">
        <p><strong>${p.title}</strong></p>
        <p>${p.price} kr</p>
        <p>Status: ${p.status}</p>
    </a>
`;


            container.appendChild(div);
        });

    } catch (err) {
        console.error(err);
    }
}

loadProfile();
loadMyProducts();
