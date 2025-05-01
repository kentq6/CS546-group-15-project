// validation functions used across forms
function validateUsername(username) {
    const usernameRegex = /^[a-z0-9_]{5,30}$/;
    return usernameRegex.test(username);
}

function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,30}$/;
    return passwordRegex.test(password);
}

function validateCompanyTitle(title) {
    const regex = /^[A-Za-z0-9\s]{2,30}$/;
    return regex.test(title);
}

function validateLocation(location) {
    const regex = /^[A-Za-z\s\-']{2,30}, [A-Za-z\s\-']{2,30}$/;
    return regex.test(location);
}

function validateIndustry(industry) {
    const regex = /^[A-Za-z\s]{2,30}$/;
    return regex.test(industry);
}

function validateName(name) {
    const regex = /^[A-Za-z]{1,30}$/;
    return regex.test(name);
}

// signup form handling
function initSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;

    const fields = [
        { id: 'companyTitle', validator: validateCompanyTitle },
        { id: 'location', validator: validateLocation },
        { id: 'industry', validator: validateIndustry },
        { id: 'username', validator: validateUsername },
        { id: 'password', validator: validatePassword },
        { id: 'firstname', validator: validateName },
        { id: 'lastname', validator: validateName }
    ];

    signupForm.addEventListener('submit', function(e) {
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
        });

        let isValid = true;
        let completedFields = 0;

        fields.forEach(field => {
            const value = document.getElementById(field.id).value;
            const progressDot = document.getElementById(`${field.id}Progress`);
            
            if (field.validator(value)) {
                progressDot.classList.remove('error');
                progressDot.classList.add('complete');
                completedFields++;
            } else {
                progressDot.classList.remove('complete');
                progressDot.classList.add('error');
                document.getElementById(`${field.id}Error`).textContent = document.getElementById(field.id).title;
                document.getElementById(`${field.id}Error`).style.display = 'block';
                isValid = false;
            }
        });

        const progressPercentage = (completedFields / 7) * 100;
        document.getElementById('signupProgressFill').style.width = `${progressPercentage}%`;

        if (!isValid) {
            e.preventDefault();
        }
    });

    fields.forEach(field => {
        document.getElementById(field.id)?.addEventListener('input', function() {
            const progressDot = document.getElementById(`${field.id}Progress`);
            if (field.validator(this.value)) {
                progressDot.classList.remove('error');
                progressDot.classList.add('complete');
            } else {
                progressDot.classList.remove('complete');
                progressDot.classList.add('error');
            }
            updateSignupProgress();
        });
    });
}

function updateSignupProgress() {
    const fields = [
        { id: 'companyTitle', validator: validateCompanyTitle },
        { id: 'location', validator: validateLocation },
        { id: 'industry', validator: validateIndustry },
        { id: 'username', validator: validateUsername },
        { id: 'password', validator: validatePassword },
        { id: 'firstname', validator: validateName },
        { id: 'lastname', validator: validateName }
    ];

    let completedFields = 0;
    fields.forEach(field => {
        const value = document.getElementById(field.id).value;
        const progressDot = document.getElementById(`${field.id}Progress`);
        
        if (field.validator(value)) {
            progressDot.classList.remove('error');
            progressDot.classList.add('complete');
            completedFields++;
        } else if (value) { // Only show error if there's some input
            progressDot.classList.remove('complete');
            progressDot.classList.add('error');
        }
    });
    
    const progressPercentage = (completedFields / 7) * 100;
    document.getElementById('signupProgressFill').style.width = `${progressPercentage}%`;
}

// login form handling
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    const fields = [
        { id: 'username', validator: validateUsername },
        { id: 'password', validator: validatePassword }
    ];

    loginForm.addEventListener('submit', function(e) {
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
        });

        let isValid = true;

        fields.forEach(field => {
            const value = document.getElementById(field.id).value;
            if (!field.validator(value)) {
                isValid = false;
                document.getElementById(`${field.id}Error`).textContent = "Invalid username or password.";
                document.getElementById(`${field.id}Error`).style.display = 'block';
            }
        });

        if (!isValid) {
            e.preventDefault();  
        }
    });

    fields.forEach(field => {
        document.getElementById(field.id)?.addEventListener('input', function() {
            const errorElement = document.getElementById(`${field.id}Error`);
            if (field.validator(this.value)) {
                errorElement.style.display = 'none';
            } else {
                errorElement.style.display = 'block';
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initSignupForm();
    initLoginForm();
});
