const form = document.getElementById('profileForm');
const statusBox = document.getElementById('status');

async function loadProfile(){
    try{
        const res = await fetch("/api/users/me", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });

        const json = await res.json();
        if(!json.success){
            throw new Error("Could not get profile");
        }

        const user = json.data;

        document.getElementById("username").value = user.username || "";
        document.getElementById("email").value = user.email || "";
        document.getElementById("city").value = user.location?.city || "";
        document.getElementById("country").value = user.location?.country || "";
        document.getElementById("cvr").value = user.cvr || "";
        document.getElementById("bio").value = user.profile?.bio || "";
        document.getElementById("avatarPreview").src = user.profile?.avatarUrl || "/avatars/Gilbert.jpeg";
        document.getElementById("language").value = user.profile?.language || "da";

    } catch (err){
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
        email: document.getElementById("email").value,
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
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!json.success) {
        statusBox.innerText = "Error: " + (json.error || json.message);
        return;
    }

    const file = document.getElementById("avatarFile").files[0];
    if (file) {
        const formData = new FormData();
        formData.append("avatar", file);

        const uploadRes = await fetch("/api/users/me/avatar", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: formData
        });

        const uploadJson = await uploadRes.json();
        if (!uploadJson.success) {
            statusBox.innerText = "Avatar upload failed";
            return;
        }
    }

    statusBox.innerText = "Profil opdateret";
    loadProfile();
});


loadProfile();
