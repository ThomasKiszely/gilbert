async function checkAdmin() {
    try {
        const res = await fetch("/api/users/me", {
            method: "GET",
            credentials: "include"
        });

        if (!res.ok) return;

        const json = await res.json();
        if (!json.success) return;

        const user = json.data;

        if (user.role === "admin") {
            const logo = document.getElementById("logo") || document.querySelector(".logo");
            if (!logo) return;

            const link = document.createElement("a");
            link.href = "/admin";

            // flyt det eksisterende logo ind i linket
            logo.replaceWith(link);
            link.appendChild(logo);
        }
    } catch (err) {
        console.error("Admin check failed", err);
    }
}

document.addEventListener("DOMContentLoaded", checkAdmin);
