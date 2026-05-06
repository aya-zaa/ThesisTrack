const container = document.querySelector(".container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});
const loginForm = document.querySelector(".form-box.login form");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("Login form submitted");

    const email = loginForm.querySelector('input[name="email"]').value;
    const password = loginForm.querySelector('input[name="password"]').value;

    fetch("../api/login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server error: " + res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Login response:", data);
        if (data.success) {
          if (data.role === "student") {
            window.location.href = "../views/dashboard-student.html";
          } else {
            window.location.href = "../views/Dashboard-prof.html";
          }
        } else {
          alert(data.message || "Wrong email or password");
        }
      })
      .catch((err) => {
        console.error("Login fetch error:", err);
        alert("An error occurred during login. Please try again.");
      });
  });
}
