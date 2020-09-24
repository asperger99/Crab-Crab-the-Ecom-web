
function validatePassword() {
  var p=document.getElementById("password").value;
  console.log(p);
    if (p.length < 6) {
        var v1="Your password must contain at least 6 characters";
        document.getElementById("message").innerHTML=v1;
       return false;
    }
    if (p.search(/[a-z]/g) < 0) {
        var v1="Your password must contain at least one alphabet.";
        document.getElementById("message").innerHTML=v1;
       return false;
    }
    if (p.search(/[0-9]/g) < 0) {
        var v1="Your password must contain at least one digit.";
        document.getElementById("message").innerHTML=v1;
       return false;
    }
    if(p.search(/[!@#$%^&*]/g)< 0){
    var v1="Your password must contain at least one special character.";
      document.getElementById("message").innerHTML=v1;
     return false;
    }
    return true;
}

function clearErrors(){

    errors = document.getElementsByClassName('formerror');
    for(let item of errors)
    {
        item.innerHTML = "";
    }
}
function seterror(id, error){
    //sets error inside tag of id
    element = document.getElementById(id);
    element.getElementsByClassName('formerror')[0].innerHTML = error;

}

function validateOrderData(){
    var returnval = true;
    clearErrors();

    //perform validation and if validation fails, set the value of returnval to false
    var fname = document.forms['myForm']["firstname"].value;
    // if (fname.length<5){
    //     seterror("fname", "*Length of first name is too short");
    //     returnval = false;
    // }

    if (fname.length == 0){
        seterror("fname", "*Length of first name cannot be zero!");
        returnval = false;
    }
    var lname = document.forms['myForm']["lastname"].value;
    // if (lname.length<5){
    //     seterror("lname", "*Length of last name is too short");
    //     returnval = false;
    // }

    if (lname.length == 0){
        seterror("lname", "*Length of last name cannot be zero!");
        returnval = false;
    }

    // var email = document.forms['myForm']["femail"].value;
    // if (email.length>15){
    //     seterror("email", "*Email length is too long");
    //     returnval = false;
    // }

    var phone = document.forms['myForm']["mobile"].value;
    if (phone.length != 10){
        seterror("mobileNo", "*Phone number should be of 10 digits!");
        returnval = false;
    }

    var address = document.forms['myForm']["address"].value;
    if (address.length < 5){
        seterror("Address", "*provide suffecient address!");
        returnval = false;
    }
    var quantity = document.forms['myForm']["quantity"].value;
    // console.log(quantity);
    if (quantity <1){
        seterror("Quan", "*quantity must be more than zero!!!");
        returnval = false;
    }

    // var password = document.forms['myForm']["fpass"].value;
    // if (password.length < 6){
    //
    //     // Quiz: create a logic to allow only those passwords which contain atleast one letter, one number and one special character and one uppercase letter
    //     seterror("pass", "*Password should be atleast 6 characters long!");
    //     returnval = false;
    // }
    //
    // var cpassword = document.forms['myForm']["fcpass"].value;
    // if (cpassword != password){
    //     seterror("cpass", "*Password and Confirm password should match!");
    //     returnval = false;
    // }

    return returnval;
}
