// login-logout.js

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector(".login-form form");
    const signupForm = document.querySelector(".signup-form form");

    async function apiCall(url, method, data) {
        try{
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            credentials:'include'
        });
        if(!response.ok){
            const errorData = await response.json();
            throw new Error(errorData.message || "Something Wrong Happened !")
        }
        return response.json;
    }
    catch(err){
        console.error("API error",err);
        alert(`error:${err.message}`);
    }
}
    // Login Form Submission
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        
            const emailId = document.getElementById("emailId").value;
            const password = document.getElementById("password").value;
            const data = {emailId:emailId , password:password};
            const response = await apiCall("http://localhost:5000/api/login", "POST", data
            );
            console.log(response);

            // if (response.ok) {
            //     const data = await response.json();
            //     alert("Login successful!");
            //     // Optionally, store token or redirect to a dashboard
            // } else {
            //     alert("Invalid email or password. Please try again.");
            // }
         
            // console.error("Login error:", error);
            // alert("An error occurred. Please try again.");
            if(response){
                alert(`Welcome, ${response.emailId}`);
            }
    });

    // Signup Form Submission
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = signupForm.querySelector("input[placeholder='Enter your name']").value;
        const email = signupForm.querySelector("input[placeholder='Enter your email']").value;
        const password = signupForm.querySelector("input[placeholder='Enter your password']").value;

        try {
            const response = await fetch("/api/v1/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (response.ok) {
                alert("Signup successful! Please log in with your new credentials.");
                document.getElementById("flip").checked = false;
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Signup failed. Please try again.");
            }
        } catch (error) {
            console.error("Signup error:", error);
            alert("An error occurred. Please try again.");
        }
    });
});
