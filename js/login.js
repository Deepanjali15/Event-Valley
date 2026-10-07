// ===== BASE DEMO USERS =====
const baseUsers = [
    { email: "student@test.com",  password: "123", role: "student",   name: "Alex Student"   },
    { email: "org@test.com",      password: "123", role: "organizer", name: "Sam Organizer"  },
    { email: "faculty@test.com",  password: "123", role: "faculty",   name: "Dr. Faculty"    },
    { email: "student2@test.com", password: "123", role: "student",   name: "Jordan Student" }
];

// Merge with any dynamically registered users
function getUsers() {
    const stored = JSON.parse(localStorage.getItem("appUsers")) || [];
    const merged = [...baseUsers];
    stored.forEach(su => {
        if (!merged.find(u => u.email === su.email)) merged.push(su);
    });
    return merged;
}

// ===== ROLE SELECTION =====
let selectedRole = "student";

const roleButtons = document.querySelectorAll(".role-btn");
const demoHint    = document.getElementById("demoHint");

const hints = {
    student:   "Demo: student@test.com / 123",
    organizer: "Demo: org@test.com / 123",
    faculty:   "Demo: faculty@test.com / 123"
};

roleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        roleButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedRole = btn.dataset.role;
        demoHint.textContent = hints[selectedRole] || "";
    });
});

// ===== LOGIN =====
document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const email    = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();
    const users    = getUsers();

    // Check if this user has a faculty-granted role override
    const roleOverrides = JSON.parse(localStorage.getItem("roleOverrides")) || {};
    const overrideRole  = roleOverrides[email];

    let user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        alert("Invalid email or password!");
        return;
    }

    // Apply role override if exists (e.g. student promoted to organizer by faculty)
    const effectiveRole = overrideRole || user.role;

    if (effectiveRole !== selectedRole) {
        alert(`Please select the correct role tab.`);
        return;
    }

    const sessionUser = { ...user, role: effectiveRole };
    localStorage.setItem("currentUser", JSON.stringify(sessionUser));

    if (effectiveRole === "student") {
        window.location.href = "pages/student/student_dash.html";
    } else if (effectiveRole === "organizer") {
        window.location.href = "pages/organizer/organizer_dash.html";
    } else if (effectiveRole === "faculty") {
        window.location.href = "pages/faculty/faculty_dash.html";
    }
});

// ===== PASSWORD TOGGLE =====
function togglePassword() {
    const pwd  = document.getElementById("password");
    const icon = document.querySelector(".toggle-password");
    if (pwd.type === "password") { pwd.type = "text";     icon.textContent = "🙈"; }
    else                         { pwd.type = "password"; icon.textContent = "👁️"; }
}
