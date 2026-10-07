const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "organizer") window.location.href = "../../login.html";

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../../login.html";
}

let currentFilter = "all";

function filterBy(f) {
    currentFilter = f;
    ["all","draft","pending","approved","rejected"].forEach(k => {
        document.getElementById("btn-" + k).className = k === f ? "btn-primary" : "btn-outline";
    });
    render();
}

function render() {
    const events   = JSON.parse(localStorage.getItem("events")) || [];
    const mine     = events.filter(e => e.createdBy === currentUser.email);
    const filtered = currentFilter === "all" ? mine : mine.filter(e => e.status === currentFilter);
    const list     = document.getElementById("eventList");
    list.innerHTML = "";

    if (filtered.length === 0) {
        list.innerHTML = '<div class="empty-state">No events found. <a href="create_event.html">Create one →</a></div>';
        return;
    }

    [...filtered].reverse().forEach(ev => {
        const div = document.createElement("div");
        div.classList.add("event-item");
        div.innerHTML = `
            <div>
                <strong>${ev.name}</strong>
                <p>${ev.type} &nbsp;|&nbsp; ${ev.date} at ${ev.time} &nbsp;|&nbsp; ${ev.venue}</p>
                ${ev.budget      ? `<p style="font-size:12px;color:#888;">Budget: ₹${ev.budget}</p>` : ""}
                ${ev.coordinator ? `<p style="font-size:12px;color:#888;">Coordinator: ${ev.coordinator}</p>` : ""}
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span class="status ${ev.status}">${ev.status}</span>
                <button class="btn-outline" onclick="viewParticipants(${ev.id})">Participants</button>
                <button class="btn-outline" onclick="editEvent(${ev.id})">Edit</button>
                <button class="btn-reject" onclick="deleteEvent(${ev.id})">Delete</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function viewParticipants(id) {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const event = events.find(e => e.id === id);
    if (!event) return;

    document.getElementById("participantTitle").innerText = "Participants - " + event.name;

    const container = document.getElementById("participantList");
    container.innerHTML = "";

    const participants = event.participants || [];

    if (participants.length === 0) {
        container.innerHTML = "<p>No participants yet.</p>";
    } else {
        participants.forEach((p, index) => {
            const div = document.createElement("div");
            div.style.padding = "8px";
            div.style.borderBottom = "1px solid #eee";

            div.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span><strong>${index + 1}.</strong> ${p.email}</span>
                    <button 
                        class="btn-outline" 
                        style="font-size:12px;"
                        onclick="toggleAttendance(${id}, '${p.email}')"
                    >
                        ${p.attended ? "Present ✅" : "Mark Present"}
                    </button>
                </div>
`;

            container.appendChild(div);
        });
    }

    document.getElementById("participantModal").style.display = "flex";
}

function toggleAttendance(eventId, email) {
    const events = JSON.parse(localStorage.getItem("events")) || [];

    const updatedEvents = events.map(e => {
        if (e.id !== eventId) return e;

        const updatedParticipants = (e.participants || []).map(p => {
            if (p.email !== email) return p;

            return {
                ...p,
                attended: !p.attended
            };
        });

        return {
            ...e,
            participants: updatedParticipants
        };
    });

    localStorage.setItem("events", JSON.stringify(updatedEvents));

    // 🔄 Refresh modal
    viewParticipants(eventId);
}

function closeParticipantModal() {
    document.getElementById("participantModal").style.display = "none";
}

function editEvent(id) {
    localStorage.setItem("editEventId", id);
    window.location.href = "edit_event.html";
}

function deleteEvent(id) {
    if (!confirm("Delete this event?")) return;
    const events  = JSON.parse(localStorage.getItem("events")) || [];
    const updated = events.filter(e => e.id !== id);
    localStorage.setItem("events", JSON.stringify(updated));
    render();
}

render();
