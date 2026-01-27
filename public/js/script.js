const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", logout);

async function logout() {
    try{
        const res = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: "include",
        });
        if (res.ok) {
            alert("Logged out successfully");
            window.location.href = "/";
        } else {
            alert('Log out failed');
        }
    } catch (error) {
        alert('Could not log out');
    }
}