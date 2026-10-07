const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "organizer") window.location.href = "../../login.html";

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../../login.html";
}

document.getElementById("welcomeText").innerText = "Welcome, " + (currentUser.name || currentUser.email);

const events   = JSON.parse(localStorage.getItem("events")) || [];
const myEvents = events.filter(e => e.createdBy === currentUser.email);

document.getElementById("totalEvents").innerText    = myEvents.length;
document.getElementById("approvedEvents").innerText = myEvents.filter(e => e.status === "approved").length;
document.getElementById("pendingEvents").innerText  = myEvents.filter(e => e.status === "pending").length;

const eventList = document.getElementById("eventList");
eventList.innerHTML = "";

if (myEvents.length === 0) {
    eventList.innerHTML = '<div class="empty-state">No events yet. <a href="create_event.html">Create your first event →</a></div>';
} else {
    // Show latest 5
    [...myEvents].reverse().slice(0, 5).forEach(event => {
        const div = document.createElement("div");
        div.classList.add("event-item");
        const statusLabel = event.status === "revision" ? "Needs Revision" : event.status;
        div.innerHTML = `
            <div>
                <strong>${event.name}</strong>
                <p>${event.date} &nbsp;|&nbsp; ${event.venue}</p>
                ${event.revisionNote ? `<p style="font-size:12px;color:#e07b00;">📝 ${event.revisionNote}</p>` : ""}
            </div>
            <div>
                <span class="status ${event.status}">${statusLabel}</span>
                <button class="btn-outline" onclick="editEvent(${event.id})" style="margin-left:8px;">Edit</button>
            </div>
        `;
        eventList.appendChild(div);
    });
}

function editEvent(id) {
    localStorage.setItem("editEventId", id);
    window.location.href = "edit_event.html";
}
