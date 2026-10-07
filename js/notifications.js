// =============================================
//  EventValley — Notifications Page (all roles)
// =============================================

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) window.location.href = "../../login.html";

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../../login.html";
}

const container = document.getElementById("notifList");

function iconFor(type) {
    const icons = {
        event_new:   "🎉",
        deadline:    "⏰",
        approval:    "✅",
        org_request: "👤",
        general:     "🔔"
    };
    return icons[type] || "🔔";
}

function render() {
    const notifs = JSON.parse(localStorage.getItem("notifications")) || [];

    const userNotifs = notifs
        .filter(n => n.userEmail === currentUser.email)
        .reverse();

    if (userNotifs.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:#888;">
                <div style="font-size:36px;margin-bottom:12px;">🔔</div>
                <p>No notifications yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = "";

    userNotifs.forEach(n => {
        const div = document.createElement("div");
        div.classList.add("event-item");

        // Unread styling
        if (!n.read) {
            div.style.borderLeft = "4px solid #4f46e5";
            div.style.background = "#f5f3ff";
        }

        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                <div style="flex:1;">
                    <p style="margin:0 0 4px;font-size:15px;">
                        <span style="font-size:18px;margin-right:6px;">${iconFor(n.type)}</span>
                        ${n.message}
                    </p>
                    <small style="color:#888;">${new Date(n.time).toLocaleString()}</small>
                </div>
                ${!n.read ? `<button class="btn-outline" style="font-size:12px;white-space:nowrap;" onclick="markRead('${n.id}')">Mark read</button>` : `<span style="font-size:12px;color:#aaa;">Read</span>`}
            </div>
        `;

        container.appendChild(div);
    });
}

function markRead(id) {
    const notifs = JSON.parse(localStorage.getItem("notifications")) || [];
    const updated = notifs.map(n => String(n.id) === String(id) ? { ...n, read: true } : n);
    localStorage.setItem("notifications", JSON.stringify(updated));
    render();
    updateBadge();
}

function markAllRead() {
    const notifs = JSON.parse(localStorage.getItem("notifications")) || [];
    const updated = notifs.map(n => n.userEmail === currentUser.email ? { ...n, read: true } : n);
    localStorage.setItem("notifications", JSON.stringify(updated));
    render();
    updateBadge();
}

function updateBadge() {
    const badge = document.getElementById("notifBadge");
    if (!badge) return;
    const notifs = JSON.parse(localStorage.getItem("notifications")) || [];
    const count  = notifs.filter(n => n.userEmail === currentUser.email && !n.read).length;
    badge.textContent = count > 0 ? count : "";
    badge.style.display = count > 0 ? "inline-block" : "none";
}

window.addEventListener("DOMContentLoaded", () => {
    render();
    updateBadge();
});
