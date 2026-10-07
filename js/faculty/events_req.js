const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "faculty") window.location.href = "../../login.html";

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../../login.html";
}

let currentFilter = "all";
let reviewingId   = null;

function filterEvents(filter) {
    currentFilter = filter;
    ["all","pending","approved","revision","rejected"].forEach(f => {
        document.getElementById("btn-" + f).className = f === filter ? "btn-primary" : "btn-outline";
    });
    renderEvents();
}

function renderEvents() {
    const events    = JSON.parse(localStorage.getItem("events")) || [];
    const filtered  = currentFilter === "all" ? events : events.filter(e => e.status === currentFilter);
    const container = document.getElementById("eventRequests");
    container.innerHTML = "";

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No requests found.</div>';
        return;
    }

    [...filtered].reverse().forEach(event => {
        const div = document.createElement("div");
        div.classList.add("event-item");
        const statusLabel = event.status === "revision" ? "Needs Revision" : event.status;
        div.innerHTML = `
            <div>
                <strong>${event.name}</strong>
                <p>${event.type} &nbsp;|&nbsp; ${event.date} at ${event.time} &nbsp;|&nbsp; ${event.venue}</p>
                <p style="font-size:12px;color:#aaa;">By: ${event.createdBy}</p>
                ${event.revisionNote ? `<p style="font-size:12px;color:#e07b00;margin-top:4px;">📝 Revision note: ${event.revisionNote}</p>` : ""}
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <span class="status ${event.status === 'revision' ? 'pending' : event.status}">${statusLabel}</span>
                <button class="btn-outline" style="font-size:12px;padding:5px 10px;" onclick="openReview(${event.id})">Review Details</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openReview(id) {
    reviewingId = id;
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const ev     = events.find(e => e.id === id);
    if (!ev) return;

    document.getElementById("modal-title").textContent = ev.name;
    document.getElementById("modal-body").innerHTML = `
        <p><strong>Type:</strong> ${ev.type}</p>
        <p><strong>Date:</strong> ${ev.date} at ${ev.time}</p>
        <p><strong>Venue:</strong> ${ev.venue}</p>
        <p><strong>Organizer:</strong> ${ev.createdBy}</p>
        ${ev.budget      ? `<p><strong>Budget:</strong> ₹${ev.budget}</p>`          : ""}
        ${ev.coordinator ? `<p><strong>Coordinator:</strong> ${ev.coordinator}</p>` : ""}
        ${ev.equipment   ? `<p><strong>Equipment:</strong> ${ev.equipment}</p>`     : ""}
        <p style="margin-top:10px;"><strong>Description:</strong><br>${ev.description || "—"}</p>
        ${ev.revisionNote ? `<p style="margin-top:10px;color:#e07b00;"><strong>Previous Revision Note:</strong> ${ev.revisionNote}</p>` : ""}
    `;

    document.getElementById("modal-revision-box").style.display = "none";
    document.getElementById("revisionNote").value = "";

    const actionsDiv = document.getElementById("modal-actions");
    if (ev.status === "pending" || ev.status === "revision") {
        actionsDiv.innerHTML = `
            <button class="btn-approve" onclick="decide(${id}, 'approved')">✓ Approve</button>
            <button class="btn-reject"  onclick="decide(${id}, 'rejected')">✗ Reject</button>
            <button class="btn-outline" style="font-size:13px;" onclick="showRevisionBox()">📝 Send for Revision</button>
            <button class="btn-outline" style="font-size:13px;" onclick="closeModal()">Close</button>
        `;
    } else {
        actionsDiv.innerHTML = `<button class="btn-outline" onclick="closeModal()">Close</button>`;
    }

    const modal = document.getElementById("reviewModal");
    modal.style.display = "flex";
}

function showRevisionBox() {
    document.getElementById("modal-revision-box").style.display = "block";
    const actionsDiv = document.getElementById("modal-actions");
    actionsDiv.innerHTML = `
        <button class="btn-approve" onclick="submitRevision()">Send Note</button>
        <button class="btn-outline" onclick="closeModal()">Cancel</button>
    `;
}

function submitRevision() {
    const note = document.getElementById("revisionNote").value.trim();
    if (!note) { alert("Please write a revision note."); return; }

    const events  = JSON.parse(localStorage.getItem("events")) || [];
    const event   = events.find(e => e.id === reviewingId);
    const updated = events.map(e => e.id === reviewingId ? { ...e, status: "revision", revisionNote: note } : e);
    localStorage.setItem("events", JSON.stringify(updated));

    // 🔔 Notify organizer — revision required
    if (event) {
        addNotification(
            event.createdBy,
            `📝 Your event "${event.name}" has been sent for revision. Note: ${note}`,
            "approval"
        );
    }

    closeModal();
    renderEvents();
}

function decide(id, newStatus) {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const event  = events.find(e => e.id === id);

    if (newStatus === "approved") {
        // 🔔 Notify organizer
        addNotification(
            event.createdBy,
            `✅ Your event "${event.name}" has been approved by faculty!`,
            "approval"
        );

        // 🔔 Notify all students about the new approved event
        // Mark it so we don't double-notify if page refreshes
        if (!event.studentsNotified) {
            notifyStudentsNewEvent(event);
            const withFlag = events.map(e => e.id === id ? { ...e, status: newStatus, revisionNote: "", studentsNotified: true } : e);
            localStorage.setItem("events", JSON.stringify(withFlag));
            closeModal();
            renderEvents();
            return;
        }
    }

    if (newStatus === "rejected") {
        // 🔔 Notify organizer
        addNotification(
            event.createdBy,
            `❌ Your event "${event.name}" was rejected by faculty.`,
            "approval"
        );
    }

    const updated = events.map(e => e.id === id ? { ...e, status: newStatus, revisionNote: "" } : e);
    localStorage.setItem("events", JSON.stringify(updated));
    closeModal();
    renderEvents();
}

function closeModal() {
    document.getElementById("reviewModal").style.display = "none";
    reviewingId = null;
}

renderEvents();
