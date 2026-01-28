let currentPage = 1;
const pageSize = 10;

async function fetchUsers() {
    try {
        const res = await fetch(`/api/admin/users?page=${currentPage}&limit=${pageSize}`, {
            method: "GET",
            credentials: "include"
        });

        return await res.json();
    } catch (err) {
        console.error("Could not fetch users", err);
        return null;
    }
}

function renderUsers(users) {
    const container = document.getElementById("users-list");
    container.innerHTML = "";

    users.forEach(user => {
        const div = document.createElement("div");
        div.classList.add("user-card");

        div.innerHTML = `
            <h3>${user.username}</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Rolle:</strong> ${user.role}</p>
            <p><strong>Status:</strong> ${user.professionalStatus}</p>
            <button class="edit-btn" data-id="${user._id}">Rediger</button>
        `;

        container.appendChild(div);
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            window.location.href = `/admin-user-edit?id=${btn.dataset.id}`;
        });
    });
}

function updatePaginationUI(page, totalPages) {
    document.getElementById("pageInfo").textContent =
        `Side ${page} af ${totalPages}`;

    document.getElementById("prevPage").disabled = page <= 1;
    document.getElementById("nextPage").disabled = page >= totalPages;
}

function setupPagination() {
    document.getElementById("prevPage").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            init();
        }
    });

    document.getElementById("nextPage").addEventListener("click", () => {
        currentPage++;
        init();
    });
}

async function init() {
    const result = await fetchUsers();

    if (!result) return;

    renderUsers(result.users);
    updatePaginationUI(result.page, result.totalPages);
}

setupPagination();
init();
