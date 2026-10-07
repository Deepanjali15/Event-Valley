const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) window.location.href = "../../login.html";

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../../login.html";
}

const eventId    = parseInt(localStorage.getItem("viewEventId"));
const events     = JSON.parse(localStorage.getItem("events")) || [];
const registrations = JSON.parse(localStorage.getItem("registrations")) || [];

const event = events.find(e => e.id === eventId);
const container = document.getElementById("eventDetails");

if (!event) {
    container.innerHTML = '<p>Event not found. <a href="events.html">Go back</a></p>';
} else {
    const alreadyRegistered = registrations.some(
        r => r.eventId === event.id && r.userEmail === currentUser.email
    );

    const today = new Date();
    today.setHours(0,0,0,0);

    const eventDate = new Date(event.date);
    eventDate.setHours(0,0,0,0);

    const isPast = eventDate < today;


    container.innerHTML = `
        <button onclick="window.location.href='events.html'" 
            style="border:none;background:none;cursor:pointer;color:#4f46e5;font-size:14px;margin-bottom:15px;">
            ← Back to Events
        </button>
        <h2>${event.name}</h2>
        <div class="event-meta">
            <p><strong>Type:</strong> ${event.type}</p>
            <p><strong>Date:</strong> ${event.date} at ${event.time}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
            <p><strong>Organized by:</strong> ${event.createdBy}</p>
        </div>
        <p>${event.description}</p>
        <div class="register-btn">
            ${alreadyRegistered
                ? `<span class="status approved">✓ You are registered</span>
                <button class="btn-ticket" style="margin-left:10px;" onclick="goTicket(${event.id})">View Ticket</button>`

                : (event.reg_deadline && new Date(event.reg_deadline) < new Date())
                    ? `<span class="status rejected">⛔ Registration Closed</span>`

                : (event.max_participants && event.participants.length >= event.max_participants)
                    ? `<span class="status rejected">🚫 Event Full</span>`

                : isPast
                    ? `<span class="status rejected">Event Completed</span>`

                : `<button class="btn-primary register-btn" onclick="registerEvent(${event.id})">
                    Register
                    </button>`
            }
        </div>
    `;
}

function registerEvent(id) {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const regs   = JSON.parse(localStorage.getItem("registrations")) || [];

    const event = events.find(e => e.id === id);
    if (!event) return;

    const already = regs.some(r => r.eventId === id && r.userEmail === currentUser.email);
    if (already) {
        alert("Already registered!");
        return;
    }

    const now = new Date();

    if (event.reg_deadline && new Date(event.reg_deadline) < now) {
        alert("Registration closed!");
        return;
    }

    if (event.max_participants && event.participants.length >= event.max_participants) {
        alert("Event is full!");
        return;
    }

    regs.push({
        id: Date.now(),
        eventId: id,
        userEmail: currentUser.email,
        registeredAt: new Date().toISOString()
    });

    const updatedEvents = events.map(e => {
        if (e.id !== id) return e;

        const updatedParticipants = e.participants || [];
        updatedParticipants.push({
            email: currentUser.email,
            attended: false
        });

        return { ...e, participants: updatedParticipants };
    });

    localStorage.setItem("registrations", JSON.stringify(regs));
    localStorage.setItem("events", JSON.stringify(updatedEvents));

    alert("Registered successfully!");
    location.reload();

    // Notify student
    addNotification(
        currentUser.email,
        `You registered for ${event.name}`
    );

    // Notify organizer
    addNotification(
        event.createdBy,
        `${currentUser.email} registered for your event "${event.name}"`
    );
}

function goTicket(id) {
    localStorage.setItem("ticketEventId", id);
    window.location.href = "ticket.html";
}



