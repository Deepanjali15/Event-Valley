const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "faculty") window.location.href = "../../login.html";

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../../login.html";
}

function renderRequests() {
    const requests  = JSON.parse(localStorage.getItem("orgRequests")) || [];
    const container = document.getElementById("requestList");
    container.innerHTML = "";

    if (requests.length === 0) {
        container.innerHTML = '<div class="empty-state">No organizer requests yet.</div>';
        return;
    }

    [...requests].reverse().forEach(req => {
        const div = document.createElement("div");
        div.classList.add("event-item");
        div.innerHTML = `
            <div>
                <strong>${req.userName}</strong>
                <p>Email: ${req.userEmail}</p>
                <p>Club: <strong>${req.club}</strong></p>
                <p style="font-size:12px;color:#888;margin-top:4px;">${req.reason}</p>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <span class="status ${req.status}">${req.status}</span>
                ${req.status === "pending" ? `
                    <button class="btn-approve" onclick="decideOrg(${req.id}, 'approved')">✓ Approve</button>
                    <button class="btn-reject"  onclick="decideOrg(${req.id}, 'rejected')">✗ Reject</button>
                ` : ""}
            </div>
        `;
        container.appendChild(div);
    });
}

function decideOrg(id, newStatus) {
    const requests = JSON.parse(localStorage.getItem("orgRequests")) || [];
    const req      = requests.find(r => r.id === id);
    if (!req) return;

    // Update request status
    const updatedReqs = requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
    localStorage.setItem("orgRequests", JSON.stringify(updatedReqs));

    if (newStatus === "approved") {
        const users   = JSON.parse(localStorage.getItem("appUsers")) || [];
        const already = users.find(u => u.email === req.userEmail);
        if (already) {
            const updatedUsers = users.map(u =>
                u.email === req.userEmail ? { ...u, role: "organizer" } : u
            );
            localStorage.setItem("appUsers", JSON.stringify(updatedUsers));
        } else {
            const overrides = JSON.parse(localStorage.getItem("roleOverrides")) || {};
            overrides[req.userEmail] = "organizer";
            localStorage.setItem("roleOverrides", JSON.stringify(overrides));
        }

        // 🔔 Notify the student their organizer request was approved
        addNotification(
            req.userEmail,
            `🎉 Your organizer request for "${req.club}" has been approved! You can now log in as an Organizer.`,
            "org_request"
        );

        alert(`${req.userName} has been approved as an organizer for ${req.club}.\nThey can now log in using the Organizer role.`);
    } else {
        // 🔔 Notify the student their request was rejected
        addNotification(
            req.userEmail,
            `❌ Your organizer request for "${req.club}" was not approved at this time.`,
            "org_request"
        );
    }

    renderRequests();
}

renderRequests();
