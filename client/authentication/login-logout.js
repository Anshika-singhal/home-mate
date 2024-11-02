document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector(".login-form form");
    const signupForm = document.querySelector(".signup-form form");

    // Helper function to make API calls
    async function apiCall(url, method, data) {
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            if (!response.ok) {
                let errorMessage = "Something went wrong!";
                try {
                    // Try to parse JSON error message if available
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                    console.warn("Could not parse error response as JSON.");
                }
                throw new Error(errorMessage);
            }

            return await response.json(); // Correctly return JSON data on success
        } catch (err) {
            console.error("API error:", err);
            alert(`Error: ${err.message}`);
            return null; // Return null so it can be checked in calling functions
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

        const response = await apiCall("http://localhost:5000/api/signup", "POST", data);

        if (response) {
            alert("Signup successful! Please log in with your new credentials.");
            document.getElementById("flip").checked = false; // Flip back to login form
        } else {
            alert("Signup failed. Please try again.");
        }
    });

    // Login Form Submission
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const emailId = document.getElementById("emailId").value;
        const password = document.getElementById("password").value;
        const data = { emailId, password };

        const response = await apiCall("http://localhost:5000/api/login", "POST", data);

        // Display welcome message if login is successful
        if (response.ok && response.firstName) {
            const result=await response.json();
            localStorage.setItem('authToken',result.token)
            alert(`Welcome, ${response.firstName}`);
            window.location.href="../Home.html";
        } else if (response) {
            alert("Login successful, but user name is missing from response!");
        } else {
            alert("Login failed. Please check your credentials and try again.");
        }
        // if (window.location.pathname.includes('../Home.html')) {
        //     incompleteCountWrapper.style.display = 'block'; // Show the incomplete count on the home page
        // }
    });
});
