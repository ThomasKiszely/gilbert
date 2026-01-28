const params = new URLSearchParams(window.location.search);
const userId = params.get("id");

// UI elements
const usernameHeader = document.getElementById("usernameHeader");
const emailSpan = document.getElementById("email");
const roleSpan = document.getElementById("role");
const statusSpan = document.getElementById("professionalStatus");
const badgesSpan = document.getElementById("badges");
const message = document.getElementById("message");

// Badge checkboxes
const badgeProfessional = document.getElementById("badgeProfessional");
const badgeExpert = document.getElementById("badgeExpert");
const badgeIdVerified = document.getElementById("badgeIdVerified");

// Fetch user
async function fetchUser() {
    try {
        const res = await fetch(`/api/admin/users/${userId}`, {
            method: "GET",
            credentials: "include"
        });

        const data = await res.json();
        return data.data;
    } catch (err) {
        console.error("Kunne ikke hente bruger", err);
        return null;
    }
}

// Render user info
function renderUser(user) {
    usernameHeader.textContent = user.username;
    emailSpan.textContent = user.email;
    roleSpan.textContent = user.role;
    statusSpan.textContent = user.professionalStatus;

    // Badge text
    badgesSpan.textContent = `
        Professional: ${user.badges.isProfessional ? "✔" : "✘"},
        Expert Seller: ${user.badges.isExpertSeller ? "✔" : "✘"},
        ID Verified: ${user.badges.isIdVerified ? "✔" : "✘"}
    `;

    // Sync checkboxes
    badgeProfessional.checked = user.badges.isProfessional;
    badgeExpert.checked = user.badges.isExpertSeller;
    badgeIdVerified.checked = user.badges.isIdVerified;
}

// Update role
async function updateRole() {
    const newRole = document.getElementById("roleSelect").value;

    const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
    });

    const data = await res.json();
    renderUser(data.data);
    message.textContent = "Rolle opdateret!";
}

// Update professional status
async function updateStatus() {
    const newStatus = document.getElementById("statusSelect").value;

    const res = await fetch(`/api/admin/users/${userId}/professional`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalStatus: newStatus })
    });

    const data = await res.json();
    renderUser(data.data);
    message.textContent = "Status opdateret!";
}

// Update badges (boolean object)
async function updateBadges() {
    const badges = {
        isProfessional: badgeProfessional.checked,
        isExpertSeller: badgeExpert.checked,
        isIdVerified: badgeIdVerified.checked
    };

    const res = await fetch(`/api/admin/users/${userId}/badges`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badges })
    });

    const data = await res.json();
    renderUser(data.data);
    message.textContent = "Badges opdateret!";
}

// Event listeners
document.getElementById("updateRoleBtn").addEventListener("click", updateRole);
document.getElementById("updateStatusBtn").addEventListener("click", updateStatus);
document.getElementById("updateBadgesBtn").addEventListener("click", updateBadges);

// Init
async function init() {
    const user = await fetchUser();
    if (!user) return;

    renderUser(user);
}

init();
