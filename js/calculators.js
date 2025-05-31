// --- START OF FILE calculator.js ---

document.addEventListener('DOMContentLoaded', function () {
    initializeInputLabelAnimations();
    updateYear();
    backToTopButton();
    initializeCalculators(); // Initializes calculator-specific event listeners AND data-href buttons

    // Navigation for data-href buttons (primarily for index.html card buttons)
    // Moved here from initializeCalculators to ensure it's always set up if DOMContentLoaded fires
    document.querySelectorAll('button.btn[data-href]').forEach(button => {
        button.addEventListener('click', function() {
            const href = this.dataset.href;
            if (href) {
                window.location.href = href;
            }
        });
    });
});

// Function to initialize animated labels for inputs
function initializeInputLabelAnimations() {
    const formInputs = document.querySelectorAll(
        '.form-group input[type="text"], .form-group input[type="number"], .form-group input[type="date"], .form-group select, ' +
        '.contact-form-container input[type="text"], .contact-form-container input[type="email"], .contact-form-container textarea'
    );

    formInputs.forEach(input => {
        const checkValue = (el) => {
            // Check for placeholder attribute to ensure it's a floating label input
            if (el.placeholder === ' ' || (el.tagName === 'SELECT' && !el.querySelector('option[value=""][selected]'))) {
                if (el.value && el.value.trim() !== '') {
                    el.classList.add('has-value');
                } else {
                    el.classList.remove('has-value');
                }
            }
        };
        checkValue(input); // Check on load
        input.addEventListener('input', function() { checkValue(this); });
        if (input.tagName === 'SELECT' || input.type === 'date') { // Date input also needs change
            input.addEventListener('change', function() { checkValue(this); });
        }
    });
}


// Function to update the current year in the footer
function updateYear() {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// Back to Top Button Functionality
function backToTopButton() {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;

    window.onscroll = function () {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            // btn.style.display = 'block'; // Using class for smoother transitions
            btn.classList.add('show');
        } else {
            // btn.style.display = 'none';
            btn.classList.remove('show');
        }
    };

    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Function to initialize all calculator event listeners
function initializeCalculators() {
    // Age Calculator
    const ageForm = document.getElementById('ageCalculatorForm');
    if (ageForm) {
        const calculateAgeBtn = document.getElementById('calculateAgeBtn');
        if (calculateAgeBtn) calculateAgeBtn.addEventListener('click', calculateAge);
        addCopyToClipboardLogic('ageResult', getAgeResultText, 'Copy Age');
    }

    // BMI Calculator
    const bmiForm = document.getElementById('bmiCalculatorForm');
    if (bmiForm) {
        const calculateBmiBtn = document.getElementById('calculateBmiBtn');
        if (calculateBmiBtn) calculateBmiBtn.addEventListener('click', calculateBmi);
        addCopyToClipboardLogic('bmiResult', getBmiResultText, 'Copy BMI');
    }

    // Discount Calculator
    const discountForm = document.getElementById('discountCalculatorForm');
    if (discountForm) {
        const calculateDiscountBtn = document.getElementById('calculateDiscountBtn');
        if (calculateDiscountBtn) calculateDiscountBtn.addEventListener('click', calculateDiscount);
        addCopyToClipboardLogic('discountResult', getDiscountResultText, 'Copy Discount Info');
    }
    
    // EMI Calculator
    const emiForm = document.getElementById('emiCalculatorForm');
    if (emiForm) {
        const calculateEmiBtn = document.getElementById('calculateEmiBtn');
        if (calculateEmiBtn) calculateEmiBtn.addEventListener('click', calculateEmi);
        addCopyToClipboardLogic('emiResult', getEmiResultText, 'Copy EMI Details');
    }

    // Percentage Calculator
    const percentageForm = document.getElementById('percentageCalculatorForm');
    if (percentageForm) {
        const calculatePercBtn = document.getElementById('calculatePercBtn');
        if (calculatePercBtn) calculatePercBtn.addEventListener('click', calculatePercentage);
        addCopyToClipboardLogic('percentageResult', getPercentageResultText, 'Copy Percentage');
    }
}


// --- COPY TO CLIPBOARD LOGIC (Re-integrated) ---
function addCopyToClipboardLogic(resultAreaId, getTextToCopyFunction, buttonText = 'Copy Result') {
    const resultElement = document.getElementById(resultAreaId);
    if (!resultElement) return;

    let copyButton = resultElement.querySelector('.copy-btn');
    const initialButtonTextHTML = `<i class="fas fa-copy"></i> <span class="btn-text">${buttonText}</span>`;

    if (!copyButton) {
        copyButton = document.createElement('button');
        copyButton.type = 'button'; // Good practice for buttons not submitting forms
        copyButton.className = 'btn copy-btn'; // Simplified classes, rely on CSS for specific copy-btn styles
        resultElement.appendChild(copyButton);
    }
    copyButton.innerHTML = initialButtonTextHTML; // Always reset to initial text

    // Remove previous listener to avoid multiple attachments
    if (copyButton._clickHandler) {
        copyButton.removeEventListener('click', copyButton._clickHandler);
    }

    copyButton._clickHandler = () => {
        const textToCopy = getTextToCopyFunction();
        const btnTextSpan = copyButton.querySelector('.btn-text');
        const iconElement = copyButton.querySelector('i');

        const updateButtonState = (message, success = true, duration = 2000) => {
            copyButton.disabled = true;
            if (btnTextSpan && iconElement) {
                iconElement.className = success ? 'fas fa-check' : 'fas fa-times';
                btnTextSpan.textContent = message;
            } else { // Fallback if span structure isn't there
                copyButton.innerHTML = `<i class="fas ${success ? 'fa-check' : 'fa-times'}"></i> ${message}`;
            }
            copyButton.classList.add('is-changing');


            setTimeout(() => {
                copyButton.innerHTML = initialButtonTextHTML;
                copyButton.disabled = false;
                copyButton.classList.remove('is-changing');
            }, duration);
        };
        
        if (textToCopy && typeof textToCopy === 'string' && textToCopy.trim() !== "" && !resultElement.querySelector('p.error')) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    updateButtonState('Copied!', true);
                }).catch(err => {
                    console.error("Clipboard API copy failed:", err);
                    if (executeCopyFallback(textToCopy)) {
                        updateButtonState('Copied! (fb)', true);
                    } else {
                        updateButtonState('Copy Failed', false);
                    }
                });
            } else { // Fallback for older browsers
                if (executeCopyFallback(textToCopy)) {
                    updateButtonState('Copied! (fb)', true);
                } else {
                    updateButtonState('Copy Failed', false);
                }
            }
        } else {
            updateButtonState('Nothing to copy!', false, 1500);
        }
    };
    copyButton.addEventListener('click', copyButton._clickHandler);
    updateCopyButtonVisibility(resultElement, getTextToCopyFunction); // Initial state
}

function executeCopyFallback(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; 
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    let success = false;
    try {
        success = document.execCommand('copy');
    } catch (err) {
        console.error('Fallback execCommand copy failed:', err);
    }
    document.body.removeChild(textArea);
    return success;
}

function updateCopyButtonVisibility(resultElement, getTextFn) {
    if (!resultElement) return;
    const copyButton = resultElement.querySelector('.copy-btn');
    if (!copyButton) return;

    const textToCopy = getTextFn();
    const hasError = resultElement.querySelector('p.error');
    const shouldShow = !hasError && textToCopy && typeof textToCopy === 'string' && textToCopy.trim() !== "";

    copyButton.style.display = shouldShow ? 'inline-flex' : 'none'; // Use inline-flex to match .btn
    copyButton.disabled = !shouldShow;
}

// --- STAR RATING FEEDBACK FUNCTIONS ---
// (Your existing appendStarRatingFeedbackUI and addStarRatingEventListeners functions go here - keep them as is from previous correct version)
function appendStarRatingFeedbackUI(resultAreaId, calculatorIdName) {
    const resultArea = document.getElementById(resultAreaId);
    if (!resultArea) return;

    const existingFeedbackUI = resultArea.querySelector('.star-rating-feedback-container');
    if (existingFeedbackUI) existingFeedbackUI.remove();

    const feedbackHtml = `
        <div class="star-rating-feedback-container">
            <p>Rate this calculator:</p>
            <div class="stars" data-calculator="${calculatorIdName}">
                <i class="fas fa-star" data-value="1"></i><i class="fas fa-star" data-value="2"></i><i class="fas fa-star" data-value="3"></i><i class="fas fa-star" data-value="4"></i><i class="fas fa-star" data-value="5"></i>
            </div>
            <div class="feedback-details-star" id="${calculatorIdName}FeedbackDetailsStar" style="display:none;">
                 <textarea id="${calculatorIdName}FeedbackTextStar" placeholder="Any additional comments? (Optional)"></textarea>
                <button type="button" class="btn btn-feedback-submit-star" data-calculator="${calculatorIdName}">Submit Comments</button>
            </div>
            <div class="feedback-thanks-star" id="${calculatorIdName}FeedbackThanksStar" style="display:none;">
                Thank you for your rating!
            </div>
        </div>
    `;
    resultArea.insertAdjacentHTML('beforeend', feedbackHtml);
    addStarRatingEventListeners(resultArea.querySelector('.star-rating-feedback-container'));
}

function addStarRatingEventListeners(feedbackContainer) {
    if (!feedbackContainer) return;
    const starsContainer = feedbackContainer.querySelector('.stars');
    if (!starsContainer) return;

    const stars = starsContainer.querySelectorAll('.fa-star');
    const calculatorId = starsContainer.dataset.calculator;
    const detailsDiv = feedbackContainer.querySelector(`#${calculatorId}FeedbackDetailsStar`);
    const thanksDiv = feedbackContainer.querySelector(`#${calculatorId}FeedbackThanksStar`);
    const submitCommentButton = feedbackContainer.querySelector('.btn-feedback-submit-star');
    let currentRating = 0; 

    const highlightStars = (rating) => {
        stars.forEach(star => {
            star.classList.toggle('selected', parseInt(star.dataset.value) <= rating);
        });
    };

    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            if (currentRating === 0) highlightStars(parseInt(this.dataset.value));
        });
        star.addEventListener('mouseout', function() {
            if (currentRating === 0) highlightStars(0);
            else highlightStars(currentRating);
        });
        star.addEventListener('click', function() {
            currentRating = parseInt(this.dataset.value);
            highlightStars(currentRating);
            console.log(`Calculator: ${calculatorId}, Rating: ${currentRating} stars`);
            starsContainer.style.pointerEvents = 'none';
            const promptText = feedbackContainer.querySelector('p');
            if(promptText) promptText.style.display = 'none';
            
            if (detailsDiv) detailsDiv.style.display = 'block';
            else if (thanksDiv) thanksDiv.style.display = 'block';
        });
    });

    if (submitCommentButton && detailsDiv && thanksDiv) {
        submitCommentButton.addEventListener('click', function() {
            const feedbackText = feedbackContainer.querySelector(`#${calculatorId}FeedbackTextStar`).value.trim();
            if (feedbackText) {
                console.log(`Calculator: ${calculatorId}, Star Rating: ${currentRating}, Comment: ${feedbackText}`);
            }
            detailsDiv.style.display = 'none';
            thanksDiv.style.display = 'block';
        });
    }
}


// --- CALCULATOR LOGIC AND DISPLAY FUNCTIONS ---

// --- Age Calculator ---
function getAgeResultText() { 
    const ageResultEl = document.getElementById('ageResult');
    if (!ageResultEl || ageResultEl.querySelector('p.error')) return ""; 
    const resultP = ageResultEl.querySelector('h3 + p:not(.error)'); 
    if (resultP && resultP.textContent.includes("Years")) { 
        return `My age is: ${resultP.textContent.replace("Your Age Is:", "").trim()}. Calculated using CalcTools Pro! https://calc-tools-pro.vercel.app/calculators/age-calculator.html`;
    }
    return ""; 
}
function calculateAge() {
    const dobInput = document.getElementById('dob');
    const resultArea = document.getElementById('ageResult');
    const calculateAgeButton = document.getElementById('calculateAgeBtn');
    const ageCalcBtnOriginalHTML = calculateAgeButton ? calculateAgeButton.querySelector('.btn-main-text')?.textContent || 'Calculate Age' : 'Calculate Age';
    const iconHTML = calculateAgeButton ? calculateAgeButton.querySelector('i')?.outerHTML || '' : '';


    if (calculateAgeButton) {
        calculateAgeButton.innerHTML = `${iconHTML} <span class="btn-main-text">Calculating...</span>`; 
        calculateAgeButton.disabled = true;
    }
    resultArea.innerHTML = `<p>Enter your date of birth to see your age.</p>`; 
    updateCopyButtonVisibility(resultArea, getAgeResultText);


    setTimeout(() => {
        const dobValue = dobInput.value;
        if (!dobValue) { 
            resultArea.innerHTML = `<h3>Result:</h3><p class="error">Please select your date of birth.</p>`; 
        } else {
            const dob = new Date(dobValue); const today = new Date();
            if (dob > today) { 
                resultArea.innerHTML = `<h3>Result:</h3><p class="error">Date of birth cannot be in the future.</p>`; 
            } else {
                let years = today.getFullYear() - dob.getFullYear(); 
                let months = today.getMonth() - dob.getMonth(); 
                let days = today.getDate() - dob.getDate();
                if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
                if (months < 0) { years--; months += 12; }
                resultArea.innerHTML = `<h3>Your Age Is:</h3><p><strong>${years}</strong> Years, <strong>${months}</strong> Months, <strong>${days}</strong> Days</p>`;
            }
        }
        addCopyToClipboardLogic('ageResult', getAgeResultText, 'Copy Age'); 
        appendStarRatingFeedbackUI('ageResult', 'age'); 
        
        if (calculateAgeButton) {
            calculateAgeButton.innerHTML = `${iconHTML} <span class="btn-main-text">${ageCalcBtnOriginalHTML}</span>`; 
            calculateAgeButton.disabled = false;
        }
    }, 150);
}

// --- BMI Calculator ---
function getBmiResultText() { 
    const bmiResultEl = document.getElementById('bmiResult');
    if (!bmiResultEl || bmiResultEl.querySelector('p.error')) return "";
    const bmiValP = bmiResultEl.querySelector('h3 + p:not(.error)'); 
    const categoryStrong = bmiResultEl.querySelector('p:last-of-type:not(.error) strong'); 
    let text = "";
    if (bmiValP && bmiValP.textContent.includes("Your BMI is:")) { 
        text += `My BMI is ${bmiValP.querySelector('strong').textContent.trim()}`;
        if (categoryStrong) {
            text += ` (${categoryStrong.textContent.trim()}).`;
        }
        return text + " Calculated on CalcTools Pro! https://calc-tools-pro.vercel.app/calculators/bmi-calculator.html";
    }
    return "";
}
function calculateBmi() {
    const weightInput = document.getElementById('weight'); 
    const heightInput = document.getElementById('height');
    const resultArea = document.getElementById('bmiResult');
    const calculateBmiButton = document.getElementById('calculateBmiBtn');
    const bmiCalcBtnOriginalHTML = calculateBmiButton ? calculateBmiButton.querySelector('.btn-main-text')?.textContent || 'Calculate BMI' : 'Calculate BMI';
    const iconHTML = calculateBmiButton ? calculateBmiButton.querySelector('i')?.outerHTML || '' : '';


    if (calculateBmiButton) {
        calculateBmiButton.innerHTML = `${iconHTML} <span class="btn-main-text">Calculating...</span>`;
        calculateBmiButton.disabled = true;
    }
    resultArea.innerHTML = `<p>Enter your weight and height to see your BMI.</p>`;
    updateCopyButtonVisibility(resultArea, getBmiResultText);

    setTimeout(() => {
        const weight = parseFloat(weightInput.value); const heightCm = parseFloat(heightInput.value); 
        if (isNaN(weight) || weight <= 0 || isNaN(heightCm) || heightCm <= 0) { 
            resultArea.innerHTML = `<h3>Result:</h3><p class="error">Please enter valid positive weight and height.</p>`; 
        } else {
            const heightM = heightCm / 100;
            const bmi = weight / (heightM * heightM); let category = '', categoryClass = '';
            if (bmi < 18.5) { category = 'Underweight'; categoryClass = 'underweight'; }
            else if (bmi < 25) { category = 'Normal or Healthy Weight'; categoryClass = 'normal-weight'; }
            else if (bmi < 30) { category = 'Overweight'; categoryClass = 'overweight'; }
            else { category = 'Obesity'; categoryClass = 'obesity'; }
            resultArea.innerHTML = `<h3>Your BMI Result:</h3><p>Your BMI is: <strong>${bmi.toFixed(2)}</strong></p><p>Category: <strong class="${categoryClass}">${category}</strong></p>`;
        }
        addCopyToClipboardLogic('bmiResult', getBmiResultText, 'Copy Result');
        appendStarRatingFeedbackUI('bmiResult', 'bmi');
        if (calculateBmiButton) {
            calculateBmiButton.innerHTML = `${iconHTML} <span class="btn-main-text">${bmiCalcBtnOriginalHTML}</span>`;
            calculateBmiButton.disabled = false;
        }
    }, 150);
}

// --- Percentage Calculator ---
function getPercentageResultText() { 
    const percentageResultEl = document.getElementById('percentageResult');
    if (!percentageResultEl || percentageResultEl.querySelector('p.error')) return "";
    const resultP = percentageResultEl.querySelector('p:not(.error)');
    if (resultP && resultP.textContent.includes("is")) { 
        return `${resultP.textContent.trim()}. Calculated on CalcTools Pro! https://calc-tools-pro.vercel.app/calculators/percentage-calculator.html`;
    }
    return "";
}
function calculatePercentage() {
    const percValue1Input = document.getElementById('percValue1'); 
    const percValue2Input = document.getElementById('percValue2');
    const resultArea = document.getElementById('percentageResult');
    const calculatePercButton = document.getElementById('calculatePercBtn');
    const percCalcBtnOriginalHTML = calculatePercButton ? calculatePercButton.querySelector('.btn-main-text')?.textContent || 'Calculate Percentage' : 'Calculate Percentage';
    const iconHTML = calculatePercButton ? calculatePercButton.querySelector('i')?.outerHTML || '' : '';

    if (calculatePercButton) {
        calculatePercButton.innerHTML = `${iconHTML} <span class="btn-main-text">Calculating...</span>`;
        calculatePercButton.disabled = true;
    }
    resultArea.innerHTML = `<p>Enter values to calculate the percentage.</p>`;
    updateCopyButtonVisibility(resultArea, getPercentageResultText);

    setTimeout(() => {
        const perc = parseFloat(percValue1Input.value); const total = parseFloat(percValue2Input.value); 
        if (isNaN(perc) || perc < 0 || isNaN(total)) { 
            resultArea.innerHTML = `<h3>Result:</h3><p class="error">Please enter valid numbers. Percentage must be non-negative.</p>`; 
        } else {
            const result = (perc / 100) * total;
            resultArea.innerHTML = `<h3>Percentage Result:</h3><p><strong>${perc}%</strong> of 
                                  <strong>${total}</strong> is <strong style="font-size: 1.2em; color: var(--primary-color);">${result.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 4})}</strong></p>`;
        }
        addCopyToClipboardLogic('percentageResult', getPercentageResultText, 'Copy Result');
        appendStarRatingFeedbackUI('percentageResult', 'percentage');
        if (calculatePercButton) {
            calculatePercButton.innerHTML = `${iconHTML} <span class="btn-main-text">${percCalcBtnOriginalHTML}</span>`;
            calculatePercButton.disabled = false;
        }
    }, 150);
}

// --- EMI Calculator ---
function getEmiResultText() { 
    const emiResultEl = document.getElementById('emiResult');
    if (!emiResultEl || emiResultEl.querySelector('p.error')) return "";
    const emiP = emiResultEl.querySelector('p:nth-of-type(1) strong'); // Assuming first <p><strong> is EMI
    const interestP = emiResultEl.querySelector('p:nth-of-type(2)'); // Second <p>
    const totalP = emiResultEl.querySelector('p:nth-of-type(3)'); // Third <p>
            
    if (emiP && interestP && totalP && emiP.textContent.includes('₹')) { // Check if EMI value is present
        return `Monthly EMI: ${emiP.textContent.trim()}; ${interestP.textContent.trim()}; ${totalP.textContent.trim()}. Calculated on CalcTools Pro! https://calc-tools-pro.vercel.app/calculators/emi-calculator.html`;
    }
    return "";
}
function calculateEmi() {
    const principalInput = document.getElementById('principal'); 
    const rateInput = document.getElementById('annualRate'); 
    const tenureInput = document.getElementById('tenureMonths');
    const resultArea = document.getElementById('emiResult');
    const calculateEmiButton = document.getElementById('calculateEmiBtn');
    const emiCalcBtnOriginalHTML = calculateEmiButton ? calculateEmiButton.querySelector('.btn-main-text')?.textContent || 'Calculate EMI' : 'Calculate EMI';
    const iconHTML = calculateEmiButton ? calculateEmiButton.querySelector('i')?.outerHTML || '' : '';

    if (calculateEmiButton) {
        calculateEmiButton.innerHTML = `${iconHTML} <span class="btn-main-text">Calculating...</span>`;
        calculateEmiButton.disabled = true;
    }
    resultArea.innerHTML = `<p>Enter loan details to calculate your EMI.</p>`;
    updateCopyButtonVisibility(resultArea, getEmiResultText);

    setTimeout(() => {
        const P = parseFloat(principalInput.value); const annualRate = parseFloat(rateInput.value); const N = parseInt(tenureInput.value);
        if (isNaN(P) || P <= 0 || isNaN(annualRate) || annualRate < 0 || isNaN(N) || N <= 0) { 
            resultArea.innerHTML = `<h3>Result:</h3><p class="error">Please enter valid positive values for all fields.</p>`; 
        } else {
            let emi, totalInterest, totalPayment;
            if (annualRate === 0) { 
                emi = P / N; 
                totalInterest = 0;
                totalPayment = P;
            } else { 
                const r = annualRate / 12 / 100; 
                emi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
                totalPayment = emi * N; 
                totalInterest = totalPayment - P;
            }
            if (isNaN(emi) || !isFinite(emi) || emi < 0 ) { 
                resultArea.innerHTML = `<h3>Result:</h3><p class="error">Could not calculate EMI. Please check inputs.</p>`; 
            } else {
                resultArea.innerHTML = `<h3>Loan EMI Details:</h3>
                                      <p style="font-size: 1.3em; color: var(--primary-color); font-weight: bold;">Monthly EMI: <strong>₹${emi.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></p>
                                      <p>Total Interest Payable: ₹${totalInterest.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                      <p>Total Payment (Principal + Interest): ₹${totalPayment.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                      <hr style="margin: 10px 0;">
                                      <p style="font-size:0.9em;">Loan Amount: ₹${P.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}<br>
                                      Interest Rate: ${annualRate}% p.a.<br>
                                      Tenure: ${N} months</p>`;
            }
        }
        addCopyToClipboardLogic('emiResult', getEmiResultText, 'Copy Result');
        appendStarRatingFeedbackUI('emiResult', 'emi');
        if (calculateEmiButton) {
            calculateEmiButton.innerHTML = `${iconHTML} <span class="btn-main-text">${emiCalcBtnOriginalHTML}</span>`;
            calculateEmiButton.disabled = false;
        }
    }, 150);
}

// --- Discount Calculator ---
function getDiscountResultText() { 
    const discountResultEl = document.getElementById('discountResult');
    if (!discountResultEl || discountResultEl.querySelector('p.error')) return "";
    const finalPriceP = discountResultEl.querySelector('p:nth-of-type(1) strong'); // Assuming first <p><strong> is Final Price
    const savedAmountP = discountResultEl.querySelector('p:nth-of-type(2) strong'); // Second <p><strong> is Amount Saved

    if (finalPriceP && savedAmountP && finalPriceP.textContent.includes('₹')) {
        return `Final Price: ${finalPriceP.textContent.trim()}; You Saved: ${savedAmountP.textContent.trim()}. Calculated on CalcTools Pro! https://calc-tools-pro.vercel.app/calculators/discount-calculator.html`;
    }
    return "";
}
function calculateDiscount() {
    const originalPriceInput = document.getElementById('originalPrice'); 
    const discountPercentageInput = document.getElementById('discountPercentage');
    const resultArea = document.getElementById('discountResult');
    const calculateDiscountButton = document.getElementById('calculateDiscountBtn');
    const discCalcBtnOriginalHTML = calculateDiscountButton ? calculateDiscountButton.querySelector('.btn-main-text')?.textContent || 'Calculate Discount' : 'Calculate Discount';
    const iconHTML = calculateDiscountButton ? calculateDiscountButton.querySelector('i')?.outerHTML || '' : '';

    if (calculateDiscountButton) {
        calculateDiscountButton.innerHTML = `${iconHTML} <span class="btn-main-text">Calculating...</span>`;
        calculateDiscountButton.disabled = true;
    }
    resultArea.innerHTML = `<p>Enter price and discount to see the final price.</p>`;
    updateCopyButtonVisibility(resultArea, getDiscountResultText);

    setTimeout(() => {
        const originalPrice = parseFloat(originalPriceInput.value); const discountPercentage = parseFloat(discountPercentageInput.value);
        if (isNaN(originalPrice) || originalPrice < 0 || isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) { 
            resultArea.innerHTML = `<h3>Result:</h3><p class="error">Enter valid price & discount % (0-100).</p>`; 
        } else {
            const amountSaved = (originalPrice * discountPercentage) / 100; const finalPrice = originalPrice - amountSaved;
            resultArea.innerHTML = `<h3>Price After Discount:</h3>
                                  <p>Final Price: <strong style="color: var(--success-color); font-size: 1.2em;">₹${finalPrice.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></p>
                                  <p>You Saved: <strong style="color: var(--error-color); font-weight: bold;">₹${amountSaved.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></p>`;
        }
        addCopyToClipboardLogic('discountResult', getDiscountResultText, 'Copy Result');
        appendStarRatingFeedbackUI('discountResult', 'discount');
        if (calculateDiscountButton) {
            calculateDiscountButton.innerHTML = `${iconHTML} <span class="btn-main-text">${discCalcBtnOriginalHTML}</span>`;
            calculateDiscountButton.disabled = false;
        }
    }, 150);
}

// --- END OF CALCULATOR LOGIC AND DISPLAY FUNCTIONS ---
// --- END OF FILE calculator.js ---