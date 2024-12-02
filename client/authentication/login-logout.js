document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector(".login-form form");
    const signupForm = document.querySelector(".signup-form form");

    async function apiCall(url, method, data) {
        Swal.fire({
            title: "Processing...",
            text: "Please wait while we process your request.",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include',
            });

            if (!response.ok) {
                let errorMessage = "Something went wrong!";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                    console.warn("Could not parse error response as JSON.");
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();

            // Simulate processing time
            return new Promise((resolve) => {
                setTimeout(() => resolve(result), 1000); // Adds a 1-second delay for smoother feedback
            });
        } catch (err) {
            console.error("API error:", err);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: err.message,
            });
            return null;
        }
    }

    // Signup Form Submission
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const emailId = document.getElementById("emailIds").value;
        const password = document.getElementById("passwords").value;
        const data = { firstName, lastName, emailId, password };

        const response = await apiCall("https://home-mate-server-ekkv.onrender.com/api/signup", "POST", data);

        if (response) {
            Swal.fire({
                icon: "success",
                title: "Signup Successful!",
                text: "Please log in with your new credentials.",
                timer: 3000,
                showConfirmButton: false,
            });
            document.getElementById("flip").checked = false;
        } else {
            Swal.fire({
                icon: "error",
                title: "Signup Failed",
                text: "Please try again.",
            });
        }
    });

    // Login Form Submission
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const emailId = document.getElementById("emailId").value;
        const password = document.getElementById("password").value;
        const data = { emailId, password };

        const response = await apiCall("https://home-mate-server-ekkv.onrender.com/api/login", "POST", data);

        if (response && response.token && response.firstName && response._id) {
            localStorage.setItem('authToken', response.token); // Store token
            localStorage.setItem('userId', response._id);
            const userData = {
                firstName: response.firstName,
                lastName: response.lastName,
                emailId: response.emailId,
            };
            localStorage.setItem('userData', JSON.stringify(userData));
            
            Swal.fire({
                icon: "success",
                title: `Welcome, ${response.firstName}!`,
                text: "Redirecting to your dashboard...",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => {
                window.location.href = `./Home.html?userId=${response._id}`; // Redirect to Home
            });
        } else if (response) {
            Swal.fire({
                icon: "warning",
                title: "Login Successful!",
                text: "But user details are incomplete in the response.",
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: "Please check your credentials and try again.",
            });
        }
    });
});
