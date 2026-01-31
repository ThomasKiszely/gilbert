async function loadProduct() {
    const id = window.location.pathname.split("/").pop();

    const res = await fetch(`/api/products/${id}`, {
        method: "GET",
        credentials: "include"
    });

    const product = await res.json();

    document.getElementById("title").value = product.title;
    document.getElementById("price").value = product.price;
    document.getElementById("description").value = product.description;

    document.getElementById("preview").src = product.images[0];
}
document.getElementById("edit-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = window.location.pathname.split("/").pop();
    const formData = new FormData(e.target);

    const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData
    });

    const json = await res.json();

    if (res.ok) {
        document.getElementById("status").innerText = "Saved!";
    } else {
        document.getElementById("status").innerText = "Error: " + json.message;
    }
});


loadProduct();
