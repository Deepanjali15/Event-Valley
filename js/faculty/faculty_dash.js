const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "faculty") window.location.href = "../../login.html";

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../../login.html";
}

document.getElementById("userEmail").innerText = currentUser.email;

const events = JSON.parse(localStorage.getItem("events")) || [];

document.getElementById("totalRequests").innerText = events.length;
document.getElementById("pendingCount").innerText  = events.filter(e => e.status === "pending").length;
document.getElementById("approvedCount").innerText = events.filter(e => e.status === "approved").length;
document.getElementById("revisionCount").innerText = events.filter(e => e.status === "revision").length;
document.getElementById("rejectedCount").innerText = events.filter(e => e.status === "rejected").length;

// Recent 5 events
const recentList = document.getElementById("recentList");
const recent = [...events].reverse().slice(0, 5);

if (recent.length === 0) {
    recentList.innerHTML = '<div class="empty-state">No event requests yet.</div>';
} else {
    recent.forEach(event => {
        const div = document.createElement("div");
        div.classList.add("event-item");
        const statusLabel = event.status === "revision" ? "Needs Revision" : event.status;
        div.innerHTML = `
            <div>
                <strong>${event.name}</strong>
                <p>${event.date} &nbsp;|&nbsp; by ${event.createdBy}</p>
            </div>
            <span class="status ${event.status === 'revision' ? 'revision' : event.status}">${statusLabel}</span>
        `;
        recentList.appendChild(div);
    });
}

// Recent 3 org requests
const orgList     = document.getElementById("orgList");
const orgRequests = JSON.parse(localStorage.getItem("orgRequests")) || [];
const recentOrgs  = [...orgRequests].reverse().slice(0, 3);

if (recentOrgs.length === 0) {
    orgList.innerHTML = '<div class="empty-state">No organizer requests yet.</div>';
} else {
    recentOrgs.forEach(req => {
        const div = document.createElement("div");
        div.classList.add("event-item");
        div.innerHTML = `
            <div>
                <strong>${req.userName}</strong>
                <p>Club: ${req.club}</p>
            </div>
            <span class="status ${req.status}">${req.status}</span>
        `;
        orgList.appendChild(div);
    });
}

// ===== EVENT REPORTS (ONLY COMPLETED EVENTS) =====
const reportContainer = document.getElementById("reportList");

const allEvents = JSON.parse(localStorage.getItem("events")) || [];

// Get today's date
const today = new Date();
today.setHours(0,0,0,0);

// Filter ONLY completed events
const completedEvents = allEvents.filter(e => {
    const eventDate = new Date(e.date);
    eventDate.setHours(0,0,0,0);
    return eventDate < today;
});

reportContainer.innerHTML = "";

if (completedEvents.length === 0) {
    reportContainer.innerHTML = '<div class="empty-state">No completed events yet.</div>';
} else {
    completedEvents.forEach(event => {
        const total = event.participants ? event.participants.length : 0;

        const attended = event.participants
            ? event.participants.filter(p => p.attended).length
            : 0;

        const div = document.createElement("div");
        div.classList.add("event-item");

        div.innerHTML = `
            <div>
                <strong>${event.name}</strong>
                <p>${event.date} | ${event.venue}</p>
                <p style="font-size:13px;color:#666;">
                    Participants: ${total} | Attended: ${attended}
                </p>
            </div>
            <span class="status rejected">
                Completed
            </span>
        `;

        reportContainer.appendChild(div);
    });
}