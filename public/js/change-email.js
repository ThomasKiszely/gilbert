const emailForm = document.getElementById('emailForm');
const emailStatus = document.getElementById('emailStatus');

emailForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    const payload = {
        currentPassword: document.getElementById('currentPassword').value,
        newEmail: document.getElementById('newEmail').value,
        confirmEmail: document.getElementById('confirmEmail').value,
    };
    const res = await fetch('/api/users/me/email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify(payload),
    });
    const json = await res.json();
    if(!json.success) {
        emailStatus.innerText = json.error || "Could not change email";
        return;
    }
    emailStatus.innerText = "Check your mail box to confirm change";
    emailForm.reset();
    setTimeout(() => {
        window.location.href = "/";
    }, 2000);
});
