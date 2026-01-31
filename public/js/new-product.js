document.getElementById("product-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const res = await fetch("/api/products", {
        method: "POST",
        credentials: "include",
        body: formData
    });

    const json = await res.json();

    if (res.ok) {
        document.getElementById("status").innerText = "Produkt oprettet!";
    } else {
        document.getElementById("status").innerText = "Fejl: " + json.message;
    }
});
