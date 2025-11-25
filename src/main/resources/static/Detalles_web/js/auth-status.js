async function checkAuthStatus() {
    try {
        const res = await fetch("/api/auth/status", {
            credentials: "include" 
        });

        const data = await res.json();

        if (data.authenticated) {
            document.querySelector(".nav-icon i.fa-user").style.color = "#d00";
            window.USER_ID = data.userId;
        } else {
            window.USER_ID = null;
        }
    } catch (e) {
        window.USER_ID = null;
    }
}

document.addEventListener("DOMContentLoaded", checkAuthStatus);

