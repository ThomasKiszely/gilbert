// login.js

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const msg = document.getElementById('message');

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

// Tab switching
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

// Handle login/register
async function handleAuthentication(event, endpoint) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    if (endpoint === "register") {
        if (payload.password !== payload.confirmPassword) {
            return showMessage("Passwords do not match", "red");
        }

        if (!payload.termsAccepted) {
            return showMessage("You must accept the terms", "red");
        }

        const registerPayload = {
            username: payload.username,
            email: payload.email,
            password: payload.password,
            confirmPassword: payload.confirmPassword,
            termsAccepted: true,
            location: {
                city: payload.city,
                country: payload.country
            }
        };
        if(payload.cvr && payload.cvr.trim() !== ""){
            registerPayload.cvr = payload.cvr.trim();
        }

        return submitAuth("register", registerPayload);
    }

    submitAuth("login", payload);
}

async function submitAuth(endpoint, payload) {
    try {
        const res = await fetch(`/api/auth/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "include", // ⭐ vigtigt for login
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!data.success) {
            if (data.code === "TERMS_OUTDATED") {
                showTerms({ showAcceptButton: true });
                return;
            }
            if (data.code === "EMAIL_NOT_VERIFIED") {
                showMessage("Your email is not verified", "red");

                const btn = document.createElement("button");
                btn.textContent = "Resend verification email";
                btn.style.marginTop = "10px";

                btn.onclick = () => resendVerification(payload.email);
                msg.appendChild(btn);
                return;
            }
            if (data.errors) {
                return showMessage(data.errors.join(", "), "red");
            }
            return showMessage(data.error || "Something went wrong", "red");
        }

        if (endpoint === "register") {
            return showMessage("User registered. Please verify your email.", "green");
        }

        // LOGIN SUCCESS
        window.location.href = "/";
    } catch (err) {
        console.error(err);
        showMessage("Exception occurred", "red");
    }
}


function showMessage(text, color) {
    msg.textContent = text;
    msg.style.color = color;
}

// Show terms modal (used for TERMS_OUTDATED)
function showTerms({ showAcceptButton }) {
    termsModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    if (showAcceptButton) {
        acceptTermsBtn.classList.remove("hidden");
    } else {
        acceptTermsBtn.classList.add("hidden");
    }
}

// Terms modal
const termsModal = document.getElementById("termsModal");
const closeTerms = document.getElementById("closeTerms");
const termsLink = document.getElementById("termsLink");
const acceptTermsBtn = document.getElementById("acceptTermsBtn");

termsLink.addEventListener("click", (e) => {
    e.preventDefault();
    showTerms({ showAcceptButton: false });
});


closeTerms.addEventListener("click", () => {
    termsModal.classList.add("hidden");
    document.body.style.overflow = "auto";
});

window.addEventListener("click", (e) => {
    if (e.target === termsModal) {
        termsModal.classList.add("hidden");
        document.body.style.overflow = "auto";
    }
});

// Accept terms
document.getElementById("acceptTermsBtn").addEventListener("click", async () => {
    const res = await fetch("/api/auth/acceptTerms", {
        method: "POST",
        credentials: "include"
    });

    const data = await res.json();

    if (data.success) {
        termsModal.classList.add("hidden");
        document.body.style.overflow = "auto";
        window.location.reload();
    } else {
        showMessage(data.error || "Could not accept terms", "red");
    }
});

async function resendVerification(email) {
    try {
        const res = await fetch("/api/auth/resend-verification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (data.success) {
            showMessage("A new verification email has been sent.", "green");
        } else {
            showMessage(data.error || "Could not resend verification email.", "red");
        }
    } catch (err) {
        showMessage("Server error while resending email.", "red");
    }
}
