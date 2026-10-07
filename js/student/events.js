const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) window.location.href = "../../login.html";

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../../login.html";
}

// Compute status badge based on date
function getEventStatus(dateStr) {
    const today    = new Date(); today.setHours(0,0,0,0);
    const eventDay = new Date(dateStr); eventDay.setHours(0,0,0,0);
    if (eventDay.getTime() === today.getTime()) return { label: "Ongoing",   cls: "pending"  };
    if (eventDay > today)                       return { label: "Upcoming",  cls: "approved" };
    return                                             { label: "Completed", cls: "rejected" };
}

let currentFilter = "All";

function filterBy(type) {
    currentFilter = type;
    // reset all buttons
    document.querySelectorAll("[id^='btn-']").forEach(b => b.className = "btn-outline");
    document.getElementById("btn-" + type).className = "btn-primary";
    render();
}

function render() {
    const allEvents     = JSON.parse(localStorage.getItem("events")) || [];
    const registrations = JSON.parse(localStorage.getItem("registrations")) || [];

    // Get today's date
    const today = new Date();
    today.setHours(0,0,0,0);

    // Filter ONLY approved + upcoming events
    const approvedUpcoming = allEvents.filter(e => {
        if (e.status !== "approved") return false;

        const eventDate = new Date(e.date);
        eventDate.setHours(0,0,0,0);

        return eventDate >= today;
    });

    // Apply type filter
    const filtered = currentFilter === "All"
        ? approvedUpcoming
        : approvedUpcoming.filter(e => e.type === currentFilter);

    const container = document.getElementById("eventsContainer");
    container.innerHTML = "";

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">No upcoming events.</div>';
        return;
    }

    filtered.forEach(event => {
        const alreadyReg = registrations.some(r => r.eventId === event.id && r.userEmail === currentUser.email);
        const evStatus   = getEventStatus(event.date);

        const card = document.createElement("div");
        card.classList.add("event-card");

        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                <h3 style="margin:0;flex:1;">${event.name}</h3>
                <span class="status ${evStatus.cls}" style="margin-left:8px;white-space:nowrap;">
                    ${evStatus.label}
                </span>
            </div>
            <p><strong>Type:</strong> ${event.type}</p>
            <p><strong>Date:</strong> ${event.date} at ${event.time}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
            <p style="margin-top:8px;color:#666;font-size:13px;">${event.description}</p>

            <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
                <button class="btn-primary" onclick="viewEvent(${event.id})">
                    View Details
                </button>

                ${alreadyReg
                    ? `<span class="status approved">✓ Registered</span>`
                    : `<button class="btn-approve" onclick="registerEvent(${event.id})">Register</button>`
                }
            </div>
        `;

        container.appendChild(card);
    });
}


function viewEvent(id) {
    localStorage.setItem("viewEventId", id);
    window.location.href = "event_det.html";
}

function registerEvent(id) {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const regs   = JSON.parse(localStorage.getItem("registrations")) || [];

    const event = events.find(e => e.id === id);
    if (!event) return;

    // ❌ Already registered
    const already = regs.some(r => 
        r.eventId === id && r.userEmail === currentUser.email
    );
    if (already) {
        alert("You are already registered!");
        return;
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    // ❌ Deadline passed
    if (event.reg_deadline) {
        const deadline = new Date(event.reg_deadline);
        deadline.setHours(0,0,0,0);

        if (deadline < today) {
            alert("Registration deadline has passed!");
            return;
        }
    }

    // ❌ Event full
    if (
        event.max_participants &&
        event.participants &&
        event.participants.length >= event.max_participants
    ) {
        alert("Event is full!");
        return;
    }

    // ✅ Add to registrations
    regs.push({
        id: Date.now(),
        eventId: id,
        userEmail: currentUser.email,
        registeredAt: new Date().toISOString()
    });

    // ✅ Update event participants (IMMUTABLE)
    const updatedEvents = events.map(e => {
        if (e.id !== id) return e;

        return {
            ...e,
            participants: [
                ...(e.participants || []),
                {
                    email: currentUser.email,
                    attended: false
                }
            ]
        };
    });

    localStorage.setItem("registrations", JSON.stringify(regs));
    localStorage.setItem("events", JSON.stringify(updatedEvents));

    alert("Registered successfully!");
    render();
}


window.addEventListener("DOMContentLoaded", () => {
    currentFilter = "All";

    // highlight All button
    document.querySelectorAll("[id^='btn-']").forEach(b => b.className = "btn-outline");

    const allBtn = document.getElementById("btn-All");
    if (allBtn) allBtn.className = "btn-primary";

    // 🔔 Check for approaching deadlines and notify unregistered students
    checkDeadlineNotifications();

    render();
});


