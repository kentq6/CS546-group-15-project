/* validation functions for form input fields
 * each function takes a string input and returns true/false
 * based on regex patterns that match database schema requirements
 */
function validateUsername(username) {
    const usernameRegex = /^[A-Za-z0-9_]{5,30}$/;
    return usernameRegex.test(username);
}

/* password must contain:
 * - at least one uppercase letter
 * - at least one number
 * - at least one special character
 * - between 8-30 characters total
 */
function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,30}$/;
    return passwordRegex.test(password);
}

/* company title validation
 * allows letters, numbers and spaces
 * must be 2-30 characters
 */
function validateCompanyTitle(title) {
    const regex = /^[A-Za-z0-9\s]{2,30}$/;
    return regex.test(title);
}

/* location must be in format: "city, state"
 * each part can contain letters, spaces, hyphens and apostrophes
 * each part must be 2-30 characters
 */
function validateLocation(location) {
    const regex = /^[A-Za-z\s\-']{2,30}, [A-Za-z\s\-']{2,30}$/;
    return regex.test(location);
}

/* industry validation
 * letters and spaces only
 * must be 2-30 characters
 */
function validateIndustry(industry) {
    const regex = /^[A-Za-z\s]{2,30}$/;
    return regex.test(industry);
}

/* name validation for first/last names
 * letters only
 * must be 1-30 characters
 */
function validateName(name) {
    const regex = /^[A-Za-z]{1,30}$/;
    return regex.test(name);
}

/* signup form initialization and validation
 * - sets up event listeners for form submission and input changes
 * - validates all fields on submit
 * - updates progress bar and indicators in real-time
 */
function initSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;

    /* array of field configurations for validation
     * each field has an id and corresponding validator function
     */
    
    const fields = [
        { id: 'companyTitle', validator: validateCompanyTitle },
        { id: 'location', validator: validateLocation },
        { id: 'industry', validator: validateIndustry },
        { id: 'username', validator: validateUsername },
        { id: 'password', validator: validatePassword },
        { id: 'firstname', validator: validateName },
        { id: 'lastname', validator: validateName }
    ];

    /* form submission handler
     * validates all fields and prevents submission if any are invalid
     * updates visual indicators for each field's status
     */
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

    /* real-time validation on input
     * updates progress dots and progress bar as user types
     */
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

/* updates the signup progress bar and field indicators
 * called whenever a field value changes
 */
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
        } else if (value) { 
            progressDot.classList.remove('complete');
            progressDot.classList.add('error');
        }
    });
    
    const progressPercentage = (completedFields / 7) * 100;
    document.getElementById('signupProgressFill').style.width = `${progressPercentage}%`;
}

/* login form initialization
 * currently no client-side validation
 * server handles all login validation
 */
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function(e) {
        return true;
    });
}

/* initialize all forms when dom content loads */
document.addEventListener('DOMContentLoaded', function() {
    initSignupForm();
    initLoginForm();
});
