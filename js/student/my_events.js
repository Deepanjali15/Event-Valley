const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "student") window.location.href = "../../login.html";

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../../login.html";
}

const registrations = JSON.parse(localStorage.getItem("registrations")) || [];
const events        = JSON.parse(localStorage.getItem("events")) || [];

const userRegs = registrations.filter(r => r.userEmail === currentUser.email);
const list = document.getElementById("myEventsList");

if (userRegs.length === 0) {
    list.innerHTML = '<div class="empty-state">You haven\'t registered for any events yet. <a href="events.html">Explore events →</a></div>';
} else {
    userRegs.forEach(reg => {
        const ev = events.find(e => e.id === reg.eventId);
        if (!ev) return;
        const div = document.createElement("div");
        div.classList.add("event-item");
        div.innerHTML = `
            <div>
                <strong>${ev.name}</strong>
                <p>${ev.date} &nbsp;|&nbsp; ${ev.venue}</p>
            </div>
            <div>
                <span class="status approved">Registered</span>
                <button class="btn-ticket" onclick="viewTicket(${ev.id})">View Ticket</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function viewTicket(eventId) {
    localStorage.setItem("ticketEventId", eventId);
    window.location.href = "ticket.html";
}
