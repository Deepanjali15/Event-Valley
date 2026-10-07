const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "organizer") {
    window.location.href = "../../login.html";
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../../login.html";
}

// ✅ DATE VALIDATION FUNCTION
function validateDates() {
    const date = document.getElementById("date").value;
    const deadline = document.getElementById("reg_deadline").value;

    const today = new Date();
    today.setHours(0,0,0,0);

    const eventDate = new Date(date);
    eventDate.setHours(0,0,0,0);

    // ❌ Event date in past
    if (eventDate < today) {
        alert("Event date must be today or future!");
        return false;
    }

    if (deadline) {
        const dl = new Date(deadline);
        dl.setHours(0,0,0,0);

        // ❌ Deadline in past
        if (dl < today) {
            alert("Registration deadline cannot be in the past!");
            return false;
        }

        // ❌ Deadline after event
        if (dl > eventDate) {
            alert("Registration deadline must be before event date!");
            return false;
        }
    }

    return true;
}

// ✅ COLLECT FORM DATA
function collectForm(status) {
    return {
        id: Date.now(),
        name: document.getElementById("name").value.trim(),
        type: document.getElementById("type").value,
        venue: document.getElementById("venue").value.trim(),
        date: document.getElementById("date").value,
        time: document.getElementById("time").value,
        description: document.getElementById("description").value.trim(),
        budget: document.getElementById("budget").value.trim(),
        coordinator: document.getElementById("coordinator").value.trim(),
        equipment: document.getElementById("equipment").value.trim(),
        club: document.getElementById("club").value.trim(),
        max_participants: document.getElementById("max_participants").value
            ? Math.max(1, parseInt(document.getElementById("max_participants").value))
            : null,
        reg_deadline: document.getElementById("reg_deadline").value || null,
        participants: [],
        status: status,
        createdBy: currentUser.email,
        createdAt: new Date().toISOString()
    };
}

// ✅ SAVE DRAFT
function saveDraft() {
    const name = document.getElementById("name").value.trim();
    if (!name) {
        alert("Please enter at least an event name to save a draft.");
        return;
    }

    if (!validateDates()) return;

    const events = JSON.parse(localStorage.getItem("events")) || [];
    events.push(collectForm("draft"));
    localStorage.setItem("events", JSON.stringify(events));

    alert("Draft saved! You can find it in My Events.");
    window.location.href = "my_org_events.html";
}

// ✅ FORM SUBMIT
document.getElementById("eventForm").addEventListener("submit", function(e) {
    e.preventDefault();

    if (!validateDates()) return;

    const newEvent = collectForm("pending");
    const events   = JSON.parse(localStorage.getItem("events")) || [];
    events.push(newEvent);
    localStorage.setItem("events", JSON.stringify(events));

    // 🔔 Notify all faculty about new event request
    notifyFacultyNewEventRequest(newEvent);

    alert("Event submitted for faculty approval!");
    window.location.href = "organizer_dash.html";
});

// ✅ UI DATE RESTRICTIONS
window.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split("T")[0];

    const dateInput = document.getElementById("date");
    const deadlineInput = document.getElementById("reg_deadline");

    dateInput.setAttribute("min", today);
    deadlineInput.setAttribute("min", today);

    // Auto restrict deadline based on event date
    dateInput.addEventListener("change", function() {
        deadlineInput.setAttribute("max", this.value);
    });
});