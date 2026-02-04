const form = document.getElementById('profileForm');
const statusBox = document.getElementById('status');

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}


async function loadProfile() {
    try {
        const res = await fetch("/api/users/me", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const json = await res.json();
        if (!json.success) {
            throw new Error("Could not get profile");
        }

        const user = json.data;

        document.getElementById("username").value = user.username || "";
        document.getElementById("city").value = user.location?.city || "";
        document.getElementById("country").value = user.location?.country || "";
        document.getElementById("cvr").value = user.cvr || "";
        document.getElementById("bio").value = user.profile?.bio || "";
        document.getElementById("avatarPreview").src = user.profile?.avatarUrl || "/avatars/Gilbert.jpeg";
        document.getElementById("language").value = user.profile?.language || "da";

    } catch (err) {
        statusBox.innerText = "Error: " + err.message;
    }
}

form.addEventListener('input', () => {
    statusBox.innerText = "";
});

document.getElementById("avatarFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        document.getElementById("avatarPreview").src = URL.createObjectURL(file);
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        username: document.getElementById("username").value,
        location: {
            city: document.getElementById("city").value,
            country: document.getElementById("country").value
        },
        cvr: document.getElementById("cvr").value,
        profile: {
            bio: document.getElementById("bio").value,
            language: document.getElementById("language").value
        }
    };

    const res = await fetch("/api/users/me", {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!json.success) {
        showToast("Error updating profile");
        return;
    }

    const file = document.getElementById("avatarFile").files[0];
    if (file) {
        const formData = new FormData();
        formData.append("avatar", file);

        const uploadRes = await fetch("/api/users/me/avatar", {
            method: "POST",
            credentials: "include",
            body: formData
        });

        const uploadJson = await uploadRes.json();
        if (!uploadJson.success) {
            showToast("Avatar upload failed");
            return;
        }
    }

    showToast("Profile updated");
    loadProfile();
});


loadProfile();
