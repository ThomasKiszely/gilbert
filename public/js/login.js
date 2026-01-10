const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const msg = document.getElementById('message');

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

// skifte tab
loginTab.addEventListener("click", () => {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    msg.textContent = "";

    loginTab.classList.add("active");
    signupTab.classList.remove("active");
});

signupTab.addEventListener("click", () => {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    msg.textContent = "";

    signupTab.classList.add("active");
    loginTab.classList.remove("active");
});

// bruger FormData
async function handleAuthentication(event, endpoint) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // Laver FormData om til objekt
    const payload = Object.fromEntries(formData.entries());

    if (endpoint === 'register'){
        if(payload.password !== payload.confirmPassword){
            msg.textContent = "Passwords do not match";
            msg.style.color = "red";
            return;
        }

    }

    try {
        const res = await fetch(`/api/auth/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
        });

        const data = await res.json();

        if (data.success) {
            msg.textContent = endpoint === "login" ? "Login successfully" : "User registered";
            msg.style.color = "green";

            localStorage.clear();
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = '/';
        } else {
            msg.textContent = data.error || "Something went wrong";
            msg.style.color = "red";
        }
    } catch (error) {
        console.error(error);
        msg.textContent = "Exception ocurred";
        msg.style.color = "red";
    }
}

// tilføjer eventlisteners
loginForm.addEventListener("submit", (event) => handleAuthentication(event, "login"));
signupForm.addEventListener("submit", (event) => handleAuthentication(event, "register"));
