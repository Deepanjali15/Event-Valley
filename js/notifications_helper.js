// =============================================
//  EventValley — Shared Notification Helpers
// =============================================

/**
 * Base demo users — must mirror the list in login.js exactly.
 * These users are never written to localStorage so we must include
 * them here whenever we need to fan-out notifications to all users
 * of a given role.
 */
const BASE_USERS = [
    { email: "student@test.com",  role: "student"   },
    { email: "student2@test.com", role: "student"   },
    { email: "org@test.com",      role: "organizer" },
    { email: "faculty@test.com",  role: "faculty"   }
];

/**
 * Return all known users by merging base demo users with any
 * dynamically signed-up users stored in localStorage("appUsers").
 */
function getAllUsers() {
    const stored = JSON.parse(localStorage.getItem("appUsers")) || [];
    const merged = [...BASE_USERS];
    stored.forEach(su => {
        if (!merged.find(u => u.email === su.email)) merged.push(su);
    });
    // Also apply role overrides (students promoted to organizer)
    const overrides = JSON.parse(localStorage.getItem("roleOverrides")) || {};
    return merged.map(u => ({
        ...u,
        role: overrides[u.email] || u.role
    }));
}

/**
 * Push a new notification entry into localStorage.
 * @param {string} userEmail  - Recipient's email
 * @param {string} message    - Notification text
 * @param {string} [type]     - "event_new" | "deadline" | "approval" | "org_request"
 */
function addNotification(userEmail, message, type) {
    const notifs = JSON.parse(localStorage.getItem("notifications")) || [];
    notifs.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        userEmail,
        message,
        type: type || "general",
        time: new Date().toISOString(),
        read: false
    });
    localStorage.setItem("notifications", JSON.stringify(notifs));
}

/**
 * Notify ALL students about a newly approved event.
 * @param {object} event - The event object
 */
function notifyStudentsNewEvent(event) {
    const students = getAllUsers().filter(u => u.role === "student");
    students.forEach(s => {
        addNotification(
            s.email,
            `📢 New event available: "${event.name}" on ${event.date} at ${event.venue}. Register now!`,
            "event_new"
        );
    });
}

/**
 * Check all approved upcoming events whose registration deadline is tomorrow.
 * Notify each student who is NOT yet registered for those events.
 * Deduped per day so it won't spam on every page load.
 */
function checkDeadlineNotifications() {
    const events        = JSON.parse(localStorage.getItem("events"))        || [];
    const registrations = JSON.parse(localStorage.getItem("registrations")) || [];
    const students      = getAllUsers().filter(u => u.role === "student");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const todayStr = new Date().toISOString().split("T")[0];
    const sentLog  = JSON.parse(localStorage.getItem("deadlineNotifsDate")) || {};

    events
        .filter(e => e.status === "approved" && e.reg_deadline)
        .forEach(event => {
            const dl = new Date(event.reg_deadline);
            dl.setHours(0, 0, 0, 0);
            if (dl.getTime() !== tomorrow.getTime()) return;

            students.forEach(student => {
                const alreadyReg = registrations.some(
                    r => r.eventId === event.id && r.userEmail === student.email
                );
                if (alreadyReg) return;

                const logKey = `${todayStr}_${event.id}_${student.email}`;
                if (sentLog[logKey]) return;

                addNotification(
                    student.email,
                    `⏰ Registration deadline for "${event.name}" is tomorrow (${event.reg_deadline}). Don't miss it!`,
                    "deadline"
                );
                sentLog[logKey] = true;
            });
        });

    localStorage.setItem("deadlineNotifsDate", JSON.stringify(sentLog));
}

/**
 * Notify ALL faculty members about a new event pending approval.
 * @param {object} event - The newly submitted event
 */
function notifyFacultyNewEventRequest(event) {
    const faculty = getAllUsers().filter(u => u.role === "faculty");
    faculty.forEach(f => {
        addNotification(
            f.email,
            `📋 New event request: "${event.name}" submitted by ${event.createdBy} needs your approval.`,
            "approval"
        );
    });
}

/**
 * Notify ALL faculty members about a new organizer request.
 * @param {object} req - The org request object
 */
function notifyFacultyOrgRequest(req) {
    const faculty = getAllUsers().filter(u => u.role === "faculty");
    faculty.forEach(f => {
        addNotification(
            f.email,
            `👤 "${req.userName}" (${req.userEmail}) has requested organizer access for ${req.club}.`,
            "org_request"
        );
    });
}

/**
 * Return unread notification count for a user.
 * @param {string} userEmail
 */
function getUnreadCount(userEmail) {
    const notifs = JSON.parse(localStorage.getItem("notifications")) || [];
    return notifs.filter(n => n.userEmail === userEmail && !n.read).length;
}
