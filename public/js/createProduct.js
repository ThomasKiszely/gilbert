document.addEventListener("DOMContentLoaded", () => {
    loadDropdownData();

    const form = document.getElementById("createProductForm");
    const imageInput = document.getElementById("imageInput");
    const previewContainer = document.getElementById("imagePreview");

    imageInput.addEventListener("change", () => {
        previewContainer.innerHTML = "";
        [...imageInput.files].forEach(file => {
            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            img.classList.add("preview-img");
            previewContainer.appendChild(img);
        });
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);


        try {
            const res = await fetch("/api/products", {
                method: "POST",
                credentials: "include",
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                alert("Error: " + err.message);
                return;
            }

            alert("Product created!");
            form.reset();
            previewContainer.innerHTML = "";

        } catch (error) {
            console.error(error);
            alert("Something went wrong.");
        }
    });
});


async function loadDropdownData() {
    const endpoints = {
        category: "/api/categories",
        subcategory: "/api/subcategories",
        brand: "/api/brands",
        size: "/api/sizes",
        condition: "/api/conditions",
        color: "/api/colors",
        material: "/api/materials",
        tags: "/api/tags"
    };

    for (const [field, url] of Object.entries(endpoints)) {
        try {
            const res = await fetch(url);
            const data = await res.json();
            populateSelect(field, data);
        } catch (err) {
            console.error(`Failed loading ${field}:`, err);
        }
    }
}

function populateSelect(field, items) {
    const select = document.getElementById(field);
    if (!select) return;

    items.forEach(item => {
        const option = document.createElement("option");
        option.value = item._id;
        option.textContent = item.name || item.label || item.value;
        select.appendChild(option);
    });
}
