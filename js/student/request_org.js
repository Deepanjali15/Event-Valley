const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "student") window.location.href = "../../login.html";

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../../login.html";
}

const statusMsg = document.getElementById("statusMsg");

// Check if already submitted
const orgRequests = JSON.parse(localStorage.getItem("orgRequests")) || [];
const existing = orgRequests.find(r => r.userEmail === currentUser.email && r.status === "pending");

if (existing) {
    document.getElementById("requestForm").style.display = "none";
    statusMsg.innerHTML = `
        <div class="status pending" style="display:inline-block;margin-bottom:15px;">
            ⏳ Your request for <strong>${existing.club}</strong> is pending review.
        </div>
    `;
}

document.getElementById("requestForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const club   = document.getElementById("clubSelect").value;
    const reason = document.getElementById("reason").value.trim();

    if (!club) { alert("Please select a club."); return; }

    const req = {
        id: Date.now(),
        userEmail: currentUser.email,
        userName: currentUser.name || currentUser.email,
        club,
        reason,
        status: "pending",
        submittedAt: new Date().toISOString()
    };

    const reqs = JSON.parse(localStorage.getItem("orgRequests")) || [];
    reqs.push(req);
    localStorage.setItem("orgRequests", JSON.stringify(reqs));

    // 🔔 Notify all faculty about new organizer request
    notifyFacultyOrgRequest(req);

    alert("Request submitted! Faculty will review it shortly.");
    location.reload();
});
