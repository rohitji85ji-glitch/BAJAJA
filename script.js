// ==================================================
// RELIANCE FINANCE - COMPLETE SCRIPT.JS
// ==================================================

"use strict";

// API URL
const API_BASE = "https://reliance-finance.onrender.com";

function apiUrl(path) {
    return ${API_BASE}${path};
}

// ==================================================
// API REQUEST HELPER
// ==================================================

async function apiFetch(path, options = {}) {
    const response = await fetch(apiUrl(path), options);

    let result;

    try {
        result = await response.json();
    } catch {
        throw new Error("Server se valid response nahi mila.");
    }

    if (!response.ok) {
        throw new Error(
            result.message || Server error: ${response.status}
        );
    }

    return result;
}

// ==================================================
// COMMON HELPERS
// ==================================================

function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
}

function showMessage(element, message, className = "") {
    if (!element) return;

    element.replaceChildren();

    const p = document.createElement("p");
    p.className = className;
    p.textContent = message;

    element.appendChild(p);
}

function displayDate(value) {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString("en-IN");
}

function addDetail(container, label, value) {
    if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
    ) {
        return;
    }

    const p = document.createElement("p");
    const strong = document.createElement("b");

    strong.textContent = `${label}: `;
    p.appendChild(strong);
    p.appendChild(document.createTextNode(String(value)));

    container.appendChild(p);
}

// ==================================================
// PART 1: APPLICATION FORM
// ==================================================

document.addEventListener("DOMContentLoaded", function () {
    const applyBtn = document.getElementById("applyBtn");
    const loanModal = document.getElementById("loanModal");
    const closeBtn = document.getElementById("closeBtn");

    const formStep1 = document.getElementById("formStep1");
    const formStep2 = document.getElementById("formStep2");
    const formStep3 = document.getElementById("formStep3");
    const formStep4 = document.getElementById("formStep4");

    const loanForm = document.getElementById("loanForm");
    const loanForm2 = document.getElementById("loanForm2");
    const loanForm3 = document.getElementById("loanForm3");

    const step1 = document.getElementById("step1");
    const step2 = document.getElementById("step2");
    const step3 = document.getElementById("step3");
    const step4 = document.getElementById("step4");

    const reviewDetails = document.getElementById("reviewDetails");
    const submitApplication = document.getElementById("submitApplication");

    // Open and close application modal
    if (applyBtn && loanModal) {
        applyBtn.addEventListener("click", function () {
            loanModal.style.display = "flex";
        });
    }

    if (closeBtn && loanModal) {
        closeBtn.addEventListener("click", function () {
            loanModal.style.display = "none";
        });
    }

    // Step navigation
    function activateStep(currentForm, nextForm, currentStep, nextStep) {
        if (currentForm) currentForm.style.display = "none";
        if (nextForm) nextForm.style.display = "block";

        if (currentStep) currentStep.classList.remove("active-step");
        if (nextStep) nextStep.classList.add("active-step");
    }

    // Customer photo
    let customerPhotoData = "";
    const customerPhotoInput = document.getElementById("customerPhoto");

    if (customerPhotoInput) {
        customerPhotoInput.addEventListener("change", function () {
            const file = customerPhotoInput.files &&
                customerPhotoInput.files[0];

            customerPhotoData = "";

            if (!file) return;

            if (!file.type.startsWith("image/")) {
                alert("Please select an image file.");
                customerPhotoInput.value = "";
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                alert("Please select an image smaller than 2 MB.");
                customerPhotoInput.value = "";
                return;
            }

            const reader = new FileReader();

            reader.onload = function (event) {
                customerPhotoData = String(event.target.result || "");
            };

            reader.onerror = function () {
                alert("Photo read nahi ho payi.");
                customerPhotoData = "";
            };

            reader.readAsDataURL(file);
        });
    }

    // Step 1 -> Step 2
    if (loanForm) {
        loanForm.addEventListener("submit", function (event) {
            event.preventDefault();
            activateStep(formStep1, formStep2, step1, step2);
        });
    }

    // Step 2 -> Step 3
    if (loanForm2) {
        loanForm2.addEventListener("submit", function (event) {
            event.preventDefault();
            activateStep(formStep2, formStep3, step2, step3);
        });
    }

    // Step 3 -> Review
    if (loanForm3) {
        loanForm3.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!reviewDetails || !formStep3 || !formStep4) {
                alert("Form ke required HTML elements nahi mile.");
                return;
            }

            if (
                customerPhotoInput &&
                customerPhotoInput.required &&
                !customerPhotoData
            ) {
                alert("Please customer photo select karein.");
                return;
            }

            const application = {
                name: getValue("name"),
                dob: getValue("dob"),
                mobile: getValue("mobile"),
                email: getValue("email"),
                address: getValue("address"),
                loanType: getValue("loanType"),
                loanAmount: getValue("loanAmount"),
                occupation: getValue("occupation"),
                income: getValue("income"),
                employment: getValue("employment"),
                city: getValue("city"),
                state: getValue("state")
            };

            reviewDetails.replaceChildren();

            if (customerPhotoData) {
                const photoBox = document.createElement("div");
                photoBox.style.textAlign = "center";
                photoBox.style.marginBottom = "20px";

                const image = document.createElement("img");
                image.src = customerPhotoData;
                image.alt = "Customer Photo";
                image.style.width = "110px";
                image.style.height = "110px";
                image.style.objectFit = "cover";
                image.style.borderRadius = "50%";

                photoBox.appendChild(image);
                reviewDetails.appendChild(photoBox);
            }

            const labels = {
                name: "Name",
                dob: "Date of Birth",
                mobile: "Mobile",
                email: "Email",
                address: "Address",
                loanType: "Loan Type",
                loanAmount: "Loan Amount",
                occupation: "Occupation",
                income: "Monthly Income",
                employment: "Employment",
                city: "City",
                state: "State"
            };

            Object.keys(labels).forEach(function (key) {
                let value = application[key];

                if (value !== "") {
                    if (key === "loanAmount" || key === "income") {
                        value = ₹${value};
                    }

                    addDetail(reviewDetails, labels[key], value);
                }
            });

            activateStep(formStep3, formStep4, step3, step4);
        });
    }

    // Submit application
    if (submitApplication) {
        submitApplication.addEventListener("click", async function () {
            const mobile = getValue("mobile");

            if (!/^[0-9]{10}$/.test(mobile)) {
                alert("Please enter a valid 10-digit mobile number.");
                return;
            }

            const application = {
                name: getValue("name"),
                dob: getValue("dob"),
                mobile: mobile,
                email: getValue("email"),
                address: getValue("address"),
                loanType: getValue("loanType"),
                loanAmount: getValue("loanAmount"),
                occupation: getValue("occupation"),
                income: getValue("income"),
                employment: getValue("employment"),
                city: getValue("city"),
                state: getValue("state"),
                customerPhoto: customerPhotoData || "",
                status: "Pending",
                submittedAt: new Date().toISOString()
            };

            const originalText = submitApplication.textContent;

            submitApplication.disabled = true;
            submitApplication.textContent = "Submitting...";

            try {
                const result = await apiFetch("/submit-application", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(application)
                });

                if (!result.success) {
                    throw new Error(
                        result.message || "Application save nahi hui."
                    );
                }

                alert("Application submitted successfully!");

                if (loanModal) {
                    loanModal.style.display = "none";
                }

                window.location.reload();
            } catch (error) {
                console.error("Application submission error:", error);

                alert(
                    error.message ||
                    "Server se connection nahi ho raha hai."
                );

                submitApplication.disabled = false;
                submitApplication.textContent =
                    originalText || "Submit Application";
            }
        });
    }
});

// ==================================================
// PART 2: CHECK APPLICATION STATUS
// ==================================================

document.addEventListener("DOMContentLoaded", function () {
    const statusBtn = document.getElementById("statusBtn");
    const statusModal = document.getElementById("statusModal");
    const closeStatusBtn = document.getElementById("closeStatusBtn");
    const checkStatusBtn = document.getElementById("checkStatusBtn");
    const statusMobile = document.getElementById("statusMobile");
    const statusResult = document.getElementById("statusResult");

    if (statusBtn && statusModal) {
        statusBtn.addEventListener("click", function () {
            statusModal.style.display = "flex";

            if (statusMobile) statusMobile.value = "";
            if (statusResult) statusResult.replaceChildren();
        });
    }

    if (closeStatusBtn && statusModal) {
        closeStatusBtn.addEventListener("click", function () {
            statusModal.style.display = "none";
        });
    }

    if (!checkStatusBtn) return;

    checkStatusBtn.addEventListener("click", async function () {
        if (!statusMobile || !statusResult) return;

        const mobile = statusMobile.value.trim();

        if (!/^[0-9]{10}$/.test(mobile)) {
            showMessage(
                statusResult,
                "Please enter a valid 10-digit mobile number.",
                "status-error"
            );
            return;
        }

        checkStatusBtn.disabled = true;
        showMessage(statusResult, "Checking application...");

        try {
            const result = await apiFetch(
                /check-application?mobile=${encodeURIComponent(mobile)}
            );

            if (!result.success || !result.application) {
                showMessage(
                    statusResult,
                    "No application found for this mobile number.",
                    "status-error"
                );
                return;
            }

            const app = result.application;
            const card = document.createElement("div");
            card.className = "status-card";

            const heading = document.createElement("h3");
            heading.textContent = "Application Status";
            card.appendChild(heading);

            addDetail(card, "Name", app.name);
            addDetail(card, "Mobile", app.mobile);
            addDetail(card, "Loan Type", app.loanType);

            if (app.loanAmount !== undefined && app.loanAmount !== "") {
                addDetail(card, "Loan Amount", ₹${app.loanAmount});
            }

            addDetail(card, "Occupation", app.occupation);
            addDetail(card, "Employment", app.employment);
            addDetail(card, "City", app.city);
            addDetail(card, "State", app.state);
            addDetail(card, "Submitted", displayDate(app.submittedAt));

            const status = String(app.status || "Pending");
            const statusP = document.createElement("p");
            const statusLabel = document.createElement("b");
            const statusSpan = document.createElement("span");

            statusLabel.textContent = "Status: ";
            statusSpan.textContent = status;

            if (status.toLowerCase() === "approved") {
                statusSpan.className = "status-approved";
            } else if (status.toLowerCase() === "rejected") {
                statusSpan.className = "status-rejected";
            } else {
                statusSpan.className = "status-pending";
            }

            statusP.appendChild(statusLabel);
            statusP.appendChild(statusSpan);
            card.appendChild(statusP);

            statusResult.replaceChildren(card);
        } catch (error) {
            console.error("Status check error:", error);

            showMessage(
                statusResult,
                error.message ||
                    "Server se connection nahi ho raha hai.",
                "status-error"
            );
        } finally {
            checkStatusBtn.disabled = false;
        }
    });
});

// ==================================================
// PART 3: PUBLIC CONTACT DETAILS
// ==================================================

async function loadWebsiteContactDetails() {
    const whatsapp = document.getElementById("websiteWhatsapp");
    const helpline = document.getElementById("websiteHelpline");
    const email = document.getElementById("websiteEmail");

    if (!whatsapp && !helpline && !email) return;

    try {
        const result = await apiFetch("/account-details");

        if (!result.success || !result.accountDetails) return;

        const account = result.accountDetails;

        if (whatsapp) {
            whatsapp.textContent =
                account.whatsappNumber || "Not available";
        }

        if (helpline) {
            helpline.textContent =
                account.helplineNumber || "Not available";
        }

        if (email) {
            email.textContent =
                account.contactEmail || "Not available";
        }
    } catch (error) {
        console.error("Contact details error:", error);
    }
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        loadWebsiteContactDetails
    );
} else {
    loadWebsiteContactDetails();
}
