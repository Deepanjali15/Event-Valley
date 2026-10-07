const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "organizer") window.location.href = "../../login.html";

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../../login.html";
}

const editId = parseInt(localStorage.getItem("editEventId"));
const events = JSON.parse(localStorage.getItem("events")) || [];
const event  = events.find(e => e.id === editId);

if (!event || event.createdBy !== currentUser.email) {
    alert("Event not found or access denied.");
    window.location.href = "organizer_dash.html";
} else {
    document.getElementById("name").value        = event.name        || "";
    document.getElementById("type").value        = event.type        || "";
    document.getElementById("venue").value       = event.venue       || "";
    document.getElementById("date").value        = event.date        || "";
    document.getElementById("time").value        = event.time        || "";
    document.getElementById("description").value = event.description || "";
    document.getElementById("budget").value      = event.budget      || "";
    document.getElementById("coordinator").value = event.coordinator || "";
    document.getElementById("equipment").value   = event.equipment   || "";
}

document.getElementById("editForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const updated = events.map(ev => {
        if (ev.id !== editId) return ev;
        return {
            ...ev,
            name:        document.getElementById("name").value.trim(),
            type:        document.getElementById("type").value,
            venue:       document.getElementById("venue").value.trim(),
            date:        document.getElementById("date").value,
            time:        document.getElementById("time").value,
            description: document.getElementById("description").value.trim(),
            budget:      document.getElementById("budget").value.trim(),
            coordinator: document.getElementById("coordinator").value.trim(),
            equipment:   document.getElementById("equipment").value.trim(),
            status:      "pending"
        };
    });
    localStorage.setItem("events", JSON.stringify(updated));
    alert("Event updated and resubmitted for approval!");
    addNotification(
        currentUser.email,
        `Your event "${document.getElementById("name").value}" was updated and resubmitted`
    );
    window.location.href = "my_org_events.html";
});

function addNotification(userEmail, message) {
    const notifs = JSON.parse(localStorage.getItem("notifications")) || [];

    notifs.push({
        id: Date.now(),
        userEmail,
        message,
        time: new Date().toISOString(),
        read: false
    });

    localStorage.setItem("notifications", JSON.stringify(notifs));
}
