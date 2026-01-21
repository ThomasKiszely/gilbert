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
        document.getElementById("avatarUrl").value = user.profile?.avatarUrl || "";
        document.getElementById("language").value = user.profile?.language || "da";

    } catch (err){
        statusBox.innerText = "Error: " + err.message;
    }
}

form.addEventListener('input', () => {
    statusBox.innerText = "";
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
            avatarUrl: document.getElementById("avatarUrl").value,
            language: document.getElementById("language").value
        }
    };

    try {
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
            statusBox.innerText = "Error: " + (json.error || json.message || "Unknown error");
            return;
        }

        statusBox.innerText = "Profile updated";
        loadProfile();

    } catch (err) {
        statusBox.innerText = "Error: " + err.message;
    }
});

loadProfile();
