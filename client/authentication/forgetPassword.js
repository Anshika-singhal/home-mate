const url = 'https://home-mate-server-ekkv.onrender.com/api';

// Show the forgot password form with smooth transition
function showForgotPassword() {
    document.getElementById('forgotPassword').style.display = 'block';
    document.getElementById('resetPassword').style.display = 'none';
    document.querySelector('button[onclick="forgotPassword()"]').disabled = false;
}

// Show the login form
function showLoginForm() {
    window.location.href = './index.html'; // Assuming you have a login page
}

// Forgot Password API Call
async function forgotPassword() {
    const email = document.getElementById('email').value.trim();
    
    // Client-side validation for email
    if (!email || !validateEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }
    
    document.querySelector('button[onclick="forgotPassword()"]').disabled = true; // Disable the button to prevent multiple clicks
    
    try {
        const response = await fetch(`${url}/forgotPassword`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'same-origin',
            body: JSON.stringify({ email: email }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        alert(result.message || "A reset password email has been sent.");

        // Hide the forgot password form, show reset password form
        document.getElementById('forgotPassword').style.display = 'none';
        document.getElementById('resetPassword').style.display = 'block';
    } catch (err) {
        console.error('Error in forgotPassword:', err);
        alert(`Error: ${err.message}`);
    }
}

// Reset Password API Call
async function resetPassword() {
    const newPassword = document.getElementById('newPassword').value.trim();
    const token = window.location.pathname.split('/')[2]; // Assuming the token is part of the URL path

    // Validate password length
    if (!newPassword || newPassword.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }

    if (!token || !newPassword) {
        alert("Token or new password is missing.");
        return;
    }

    try {
        const response = await fetch(`${url}/resetPassword/${token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ newPassword }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        alert(result.message || "Password has been reset successfully.");

        // Optionally, redirect to login page
        window.location.href = "/index.html";
    } catch (err) {
        console.error('Error in resetPassword:', err);
        alert(`Error: ${err.message}`);
    }
}

// Utility function to validate email format
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
}
