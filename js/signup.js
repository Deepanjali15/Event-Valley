let selectedRole = "student";

document.querySelectorAll(".role-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".role-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedRole = btn.dataset.role;

        const field = document.getElementById("extraField");

        if (selectedRole === "student") {
            field.placeholder = "Enter RA Number";
        } else if (selectedRole === "faculty") {
            field.placeholder = "Enter Faculty ID";
        } else {
            field.placeholder = "Club Name";
        }
    });
});

document.getElementById("signupForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const extra = document.getElementById("extraField").value.trim();

    let users = JSON.parse(localStorage.getItem("appUsers")) || [];

    // ❌ Duplicate check
    if (users.find(u => u.email === email)) {
        alert("User already exists!");
        return;
    }

    let newUser = {
        email,
        password,
        role: selectedRole
    };

    if (selectedRole === "student") newUser.regNo = extra;
    if (selectedRole === "faculty") newUser.facultyId = extra;
    if (selectedRole === "organizer") newUser.club = extra;

    users.push(newUser);
    localStorage.setItem("appUsers", JSON.stringify(users));

    alert("Signup successful!");
    window.location.href = "login.html";
});