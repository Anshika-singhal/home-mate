const url='http://localhost:5000/api';
async function forgotPassword(){
    const email=document.getElementById('email').value;
    if(!email){
        alert("Enter valid emailId");
    }
    try{
        const response = await fetch(`${url}/forgotPassword`,{})
    }
    catch(err){}
}