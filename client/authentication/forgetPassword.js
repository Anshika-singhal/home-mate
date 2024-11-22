const url='https://home-mate-server-ekkv.onrender.com/api';
async function forgotPassword(){
    const email=document.getElementById('email').value;
    if(!email){
        alert("Enter valid emailId");
    }
    try{
        const response = await fetch(`${url}/forgotPassword`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'same-origin', // Ensures cookies and CORS settings are sent
            body: JSON.stringify({ email: emailId }),
        });        
        
        // Check for HTTP errors
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        alert(result.message || "Reset password email sent successfully!");

        // Hide the forgot password form, show reset password form if necessary
        document.getElementById('forgotPassword').style.display = 'none';
        document.getElementById('resetPassword').style.display = 'block';
    }
    catch(err){
        console.error('Error in forgotPassword:', err);
        alert(`Error: ${err.message}`);
    }
}

async function resetPassword(){
    const newPassword=document.getElementById('newPassword').value;
    const token =window.location.pathname.split('/')[2];

    if (!token || !newPassword) {
        alert('Invalid input. Token or password is missing.');
        return;
    }

    try{
        const response = await fetch(`${url}/resetPassword/${token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ newPassword }),
        });
        
        // Check for HTTP errors
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        alert(result.message || "Password reset successfully!");

        // Optionally, redirect to login page
        window.location.href = "/index.html";

    }
    catch(err){
        console.error('Error in resetPassword:', err);
        alert(`Error: ${err.message}`);
    }
}