const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "student") window.location.href = "../../login.html";

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../../login.html";
}

const eventId       = parseInt(localStorage.getItem("ticketEventId"));
const events        = JSON.parse(localStorage.getItem("events")) || [];
const registrations = JSON.parse(localStorage.getItem("registrations")) || [];

const event = events.find(e => e.id === eventId);
const reg   = registrations.find(r => r.eventId === eventId && r.userEmail === currentUser.email);
const container = document.getElementById("ticketContainer");

if (!event || !reg) {
    container.innerHTML = '<p>Ticket not found. <a href="my_events.html">Go back</a></p>';
} else {
    const ticketCode = "EV-" + reg.id.toString().slice(-6).toUpperCase();
    container.innerHTML = `
        <div style="font-size:40px;margin-bottom:10px;">🎫</div>
        <h2>${event.name}</h2>
        <hr style="margin:15px 0;border:none;border-top:1px dashed #ddd;">
        <p><strong>Attendee:</strong> ${currentUser.name || currentUser.email}</p>
        <p><strong>Date:</strong> ${event.date}</p>
        <p><strong>Time:</strong> ${event.time}</p>
        <p><strong>Venue:</strong> ${event.venue}</p>
        <p><strong>Type:</strong> ${event.type}</p>
        <div class="ticket-id">Ticket ID: ${ticketCode}</div>
        <div class="qr-box" style="margin-top:20px;">
            <div style="width:100px;height:100px;margin:0 auto;background:repeating-linear-gradient(45deg,#4f46e5 0,#4f46e5 2px,transparent 0,transparent 50%);background-size:6px 6px;border-radius:8px;"></div>
            <p style="font-size:11px;color:#aaa;margin-top:6px;">Scan at entry</p>
        </div>
        <hr style="margin:15px 0;border:none;border-top:1px dashed #ddd;">
        <button class="btn-primary" onclick="window.print()" style="width:100%;margin-bottom:8px;">🖨 Print Ticket</button>
        <button class="btn-outline" onclick="window.location.href='my_events.html'" style="width:100%;">← Back</button>
    `;
}
