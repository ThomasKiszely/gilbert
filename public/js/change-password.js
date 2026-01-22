const passwordForm = document.getElementById('passwordForm');
const passwordStatus = document.getElementById('passwordStatus');

passwordForm.addEventListener('submit', async(e) => {
    e.preventDefault();

    const payload = {
        currentPassword: document.getElementById('currentPassword').value,
        newPassword: document.getElementById('newPassword').value,
        confirmPassword: document.getElementById('confirmPassword').value,
    };
    const res = await fetch('/api/users/me/password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
    });
    const json = await res.json();

    if(!json.success){
        passwordStatus.innerText = json.error || "Could not change password";
        return;
    }
    passwordStatus.innerText = "Password changed successfully.";
    passwordForm.reset();
    setTimeout(() => {
        window.location.href = "/";
    }, 2000);
});