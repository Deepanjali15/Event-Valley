const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "student") window.location.href = "../../login.html";

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../../login.html";
}

function getEventStatus(dateStr) {
    const today    = new Date(); today.setHours(0,0,0,0);
    const eventDay = new Date(dateStr); eventDay.setHours(0,0,0,0);
    if (eventDay.getTime() === today.getTime()) return { label: "Ongoing",   cls: "pending"  };
    if (eventDay > today)                       return { label: "Upcoming",  cls: "approved" };
    return                                             { label: "Completed", cls: "rejected" };
}

const registrations = JSON.parse(localStorage.getItem("registrations")) || [];
const events        = JSON.parse(localStorage.getItem("events")) || [];

const userRegs   = registrations.filter(r => r.userEmail === currentUser.email);
const userEvents = userRegs.map(r => {
    const ev = events.find(e => e.id === r.eventId);
    return ev ? { ...ev, regId: r.id } : null;
}).filter(Boolean);

document.getElementById("welcomeText").innerText = "Welcome, " + (currentUser.name || currentUser.email);
document.getElementById("userEmail").innerText   = currentUser.email;

const today    = new Date(); today.setHours(0,0,0,0);
const upcoming = userEvents.filter(e => new Date(e.date) >= today).length;
const past     = userEvents.filter(e => new Date(e.date) < today).length;

document.getElementById("totalEvents").innerText    = userEvents.length;
document.getElementById("upcomingEvents").innerText = upcoming;
document.getElementById("pastEvents").innerText     = past;

const eventList = document.getElementById("eventList");
eventList.innerHTML = "";

if (userEvents.length === 0) {
    eventList.innerHTML = '<div class="empty-state">No registered events yet. <a href="events.html">Explore events →</a></div>';
} else {
    userEvents.forEach(event => {
        const evStatus = getEventStatus(event.date);
        const div = document.createElement("div");
        div.classList.add("event-item");
        div.innerHTML = `
            <div>
                <strong>${event.name}</strong>
                <p>${event.date} &nbsp;|&nbsp; ${event.venue}</p>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
                <span class="status ${evStatus.cls}">${evStatus.label}</span>
                <button class="btn-ticket" onclick="viewTicket(${event.id})">View Ticket</button>
            </div>
        `;
        eventList.appendChild(div);
    });
}

function viewTicket(eventId) {
    localStorage.setItem("ticketEventId", eventId);
    window.location.href = "ticket.html";
}
