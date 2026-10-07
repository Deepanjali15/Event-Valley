// ===== AUTH GUARD =====
// Call requireAuth("student") etc. at the top of every dashboard JS
function requireAuth(expectedRole) {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
        window.location.href = "../../login.html";
        return null;
    }
    if (expectedRole && user.role !== expectedRole) {
        alert("Access denied. You are not a " + expectedRole + ".");
        window.location.href = "../../login.html";
        return null;
    }
    return user;
}

// ===== LOGOUT =====
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../../login.html";
}

// ===== SHOW ALERT =====
function showAlert(containerId, message, type = "success") {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `<div class="alert ${type}">${message}</div>`;
    setTimeout(() => { el.innerHTML = ""; }, 3500);
}
