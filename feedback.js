document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedbackForm');
    const productNameInput = document.getElementById('productName');
    const userEmailInput = document.getElementById('userEmail');
    const feedbackCommentsInput = document.getElementById('feedbackComments');
    const productRatingDiv = document.getElementById('productRating');
    const stars = productRatingDiv.querySelectorAll('.star');
    const selectedRatingInput = document.getElementById('selectedRating'); // Hidden input
    const recommendRadios = document.querySelectorAll('input[name="recommend"]');

    // Error message spans
    const productNameError = document.getElementById('productNameError');
    const userEmailError = document.getElementById('userEmailError');
    const ratingError = document.getElementById('ratingError');
    const feedbackCommentsError = document.getElementById('feedbackCommentsError');
    const recommendError = document.getElementById('recommendError');

    const submissionSummaryDiv = document.getElementById('submissionSummary');
    const submissionListDiv = document.getElementById('submissionList');
    const noSubmissionsMessage = document.getElementById('noSubmissionsMessage');

    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i'); // Get the icon within the toggle button

    let currentRating = 0; // To store the selected rating value

    // --- Theme Toggle Functionality ---
    const applyTheme = (theme) => {
        document.body.classList.remove('light-theme', 'dark-theme'); // Remove existing
        document.body.classList.add(theme); // Add new theme class
        localStorage.setItem('theme', theme); // Save preference

        // Update the icon based on the current theme
        if (theme === 'dark-theme') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    };

    // Check for saved theme preference on page load
    const savedTheme = localStorage.getItem('theme') || 'light-theme'; // Default to light
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('dark-theme')) {
            applyTheme('light-theme');
        } else {
            applyTheme('dark-theme');
        }
    });

    // --- Star Rating Functionality ---
    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            resetStars();
            highlightStars(star.dataset.value);
        });

        star.addEventListener('mouseout', () => {
            resetStars();
            highlightStars(currentRating); // Go back to selected rating
        });

        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.value);
            selectedRatingInput.value = currentRating; // Update hidden input
            highlightStars(currentRating);
            clearError(productRatingDiv, ratingError); // Clear error once a rating is selected
        });
    });

    function highlightStars(ratingValue) {
        stars.forEach(star => {
            if (parseInt(star.dataset.value) <= ratingValue) {
                star.classList.add('selected');
                star.classList.replace('far', 'fas'); // Fill the star
            } else {
                star.classList.remove('selected');
                star.classList.replace('fas', 'far'); // Unfill the star
            }
        });
    }

    function resetStars() {
        stars.forEach(star => {
            star.classList.remove('selected');
            star.classList.replace('fas', 'far');
        });
    }

    // Initialize stars based on any pre-selected value (if applicable, though not used here)
    if (selectedRatingInput.value) {
        currentRating = parseInt(selectedRatingInput.value);
        highlightStars(currentRating);
    }

    // --- Form Validation Functions ---
    const showError = (inputElement, errorElement, message) => {
        errorElement.textContent = message;
        inputElement.classList.add('invalid');
    };

    const clearError = (inputElement, errorElement) => {
        errorElement.textContent = '';
        inputElement.classList.remove('invalid');
    };

    const isValidEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validateField = (inputElement, errorElement, validationFn) => {
        let isValid = validationFn(inputElement.value.trim());
        if (!isValid) {
            showError(inputElement, errorElement, 'This field is required.');
        } else {
            clearError(inputElement, errorElement);
        }
        return isValid;
    };

    const validateEmailField = (inputElement, errorElement) => {
        let isValid = true;
        if (inputElement.value.trim() === '') {
            showError(inputElement, errorElement, 'Email is required.');
            isValid = false;
        } else if (!isValidEmail(inputElement.value.trim())) {
            showError(inputElement, errorElement, 'Invalid email format.');
            isValid = false;
        } else {
            clearError(inputElement, errorElement);
        }
        return isValid;
    };

    const validateRating = () => {
        if (currentRating === 0) {
            showError(productRatingDiv, ratingError, 'Please select a rating.'); // Use productRatingDiv for invalid class
            return false;
        }
        clearError(productRatingDiv, ratingError);
        return true;
    };

    const validateRadioGroup = (radioElements, errorElement) => {
        let isChecked = Array.from(radioElements).some(radio => radio.checked);
        if (!isChecked) {
            showError(radioElements[0], errorElement, 'Please select an option.'); // Use first radio for invalid class
            return false;
        }
        clearError(radioElements[0], errorElement);
        return true;
    };

    // --- Event Listeners for Live Validation ---
    productNameInput.addEventListener('input', () => validateField(productNameInput, productNameError, (val) => val !== ''));
    userEmailInput.addEventListener('input', () => validateEmailField(userEmailInput, userEmailError));
    feedbackCommentsInput.addEventListener('input', () => validateField(feedbackCommentsInput, feedbackCommentsError, (val) => val !== ''));
    
    recommendRadios.forEach(radio => {
        radio.addEventListener('change', () => validateRadioGroup(recommendRadios, recommendError));
    });


    // --- Form Submission Handler ---
    feedbackForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission

        // Run all validations
        const isProductNameValid = validateField(productNameInput, productNameError, (val) => val !== '');
        const isEmailValid = validateEmailField(userEmailInput, userEmailError);
        const isRatingValid = validateRating();
        const isCommentsValid = validateField(feedbackCommentsInput, feedbackCommentsError, (val) => val !== '');
        const isRecommendValid = validateRadioGroup(recommendRadios, recommendError);

        // If all fields are valid, process submission
        if (isProductNameValid && isEmailValid && isRatingValid && isCommentsValid && isRecommendValid) {
            const formData = {
                productName: productNameInput.value.trim(),
                userEmail: userEmailInput.value.trim(),
                rating: currentRating,
                comments: feedbackCommentsInput.value.trim(),
                recommend: document.querySelector('input[name="recommend"]:checked').value,
                updatesOptIn: document.getElementById('updatesOptIn').checked ? 'Yes' : 'No',
                timestamp: new Date().toLocaleString()
            };

            displaySubmission(formData);
            feedbackForm.reset(); // Clear the form
            currentRating = 0; // Reset rating
            selectedRatingInput.value = ''; // Clear hidden input
            resetStars(); // Reset star appearance
            alert('Thank you for your feedback!'); // Simple success message
        } else {
            // Focus on the first invalid field
            const firstInvalidInput = document.querySelector('.invalid');
            if (firstInvalidInput) {
                firstInvalidInput.focus();
            }
            alert('Please correct the errors in the form.');
        }
    });

    // --- Display Submission Function ---
    const displaySubmission = (data) => {
        if (noSubmissionsMessage) {
            noSubmissionsMessage.style.display = 'none';
        }

        const submissionItem = document.createElement('div');
        submissionItem.classList.add('submitted-feedback-item');

        const ratingStarsHtml = `<div class="submitted-rating">${'<i class="fas fa-star star"></i>'.repeat(data.rating)}</div>`;

        submissionItem.innerHTML = `
            <p><strong>Product:</strong> ${data.productName}</p>
            <p><strong>Email:</strong> ${data.userEmail}</p>
            <p><strong>Rating:</strong> ${ratingStarsHtml}</p>
            <p><strong>Comments:</strong> ${data.comments}</p>
            <p><strong>Recommended:</strong> ${data.recommend}</p>
            <p><strong>Receive Updates:</strong> ${data.updatesOptIn}</p>
            <p><small>Submitted on: ${data.timestamp}</small></p>
            <button class="delete-submission-btn">Delete</button>
        `;

        const deleteButton = submissionItem.querySelector('.delete-submission-btn');
        deleteButton.addEventListener('click', () => {
            submissionListDiv.removeChild(submissionItem);
            if (submissionListDiv.children.length === 0) {
                noSubmissionsMessage.style.display = 'block';
            }
        });

        submissionListDiv.prepend(submissionItem);
    };
});