// Status tracking JavaScript
// status.js

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx61GOdegtOaAnvQETgmYlTmX4Sp07gONlwwwikL0eFrvz-F9rWZCY80IXSvDNB19k1Eg/exec";

// DOM Elements
const orderRefInput = document.getElementById('orderRef');
const trackBtn = document.getElementById('trackBtn');
const refreshBtn = document.getElementById('refreshBtn');
const downloadReceiptBtn = document.getElementById('downloadReceiptBtn');

const lookupSection = document.getElementById('lookupSection');
const loadingSection = document.getElementById('loadingSection');
const statusSection = document.getElementById('statusSection');
const errorSection = document.getElementById('errorSection');
const paymentInstructions = document.getElementById('paymentInstructions');

// Status mapping with progress percentages
const statusMap = {
  'pending payment': { progress: 20, class: 'bg-warning', step: 1 },
  'payment received': { progress: 40, class: 'bg-info', step: 2 },
  'paid': { progress: 40, class: 'bg-info', step: 2 },
  'payment confirmed': { progress: 60, class: 'bg-primary', step: 3 },
  'processing': { progress: 60, class: 'bg-primary', step: 3 },
  'sent to beneficiary': { progress: 80, class: 'bg-success', step: 4 },
  'completed': { progress: 100, class: 'bg-success', step: 5 },
  'cancelled': { progress: 0, class: 'bg-danger', step: 0 }
};

let currentOrderData = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Check if order reference is in URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const refParam = urlParams.get('ref');
  if (refParam) {
    orderRefInput.value = refParam;
    trackOrder();
  }
});

trackBtn.addEventListener('click', trackOrder);
refreshBtn.addEventListener('click', () => trackOrder(currentOrderData?.orderRef));
downloadReceiptBtn.addEventListener('click', downloadReceipt);

orderRefInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    trackOrder();
  }
});

// Main tracking function
async function trackOrder(orderRef = null) {
  const ref = orderRef || orderRefInput.value.trim().toUpperCase();
  
  if (!ref) {
    showError('Please enter an order reference');
    return;
  }

  showLoading();

  try {
    const orderData = await fetchOrderStatus(ref);
    
    if (orderData) {
      currentOrderData = orderData;
      displayOrderStatus(orderData);
    } else {
      showError('Order not found');
    }
  } catch (error) {
    console.error('Error fetching order status:', error);
    showError('Unable to fetch order status. Please try again.');
  }
}

// Fetch order status from Google Apps Script (dynamic, no mock)
async function fetchOrderStatus(orderRef) {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getStatus&orderRef=${orderRef}`);
    const result = await response.json();
    return result.success ? result : null;
  } catch (error) {
    console.error('Error fetching order status:', error);
    return null;
  }
}

// Display order status
function displayOrderStatus(data) {
  hideAllSections();
  statusSection.style.display = 'block';

  // Populate basic information
  document.getElementById('statusOrderRef').textContent = data.orderRef || '-';
  document.getElementById('statusCustomerName').textContent = data.customerName || '-';
  document.getElementById('statusEmail').textContent = data.email || '-';
  document.getElementById('statusUsdAmount').textContent = `$${data.usdAmount.toFixed(2)}` || '-';
  document.getElementById('statusZarTotal').textContent = `R ${data.zarTotal.toFixed(2)}` || '-';
  document.getElementById('statusRate').textContent = data.rate.toFixed(5) || '-';
  document.getElementById('statusBeneficiary').textContent = data.beneficiaryName || '-';
  document.getElementById('statusLocation').textContent = data.location || '-';
  document.getElementById('statusLastUpdated').textContent = formatDate(data.lastUpdated) || '-';

  // Update status badge and progress
  updateStatusDisplay(data.status);

  // Show payment instructions if pending
  if (data.status.toLowerCase().includes('pending')) {
    paymentInstructions.style.display = 'block';
    document.getElementById('paymentRef').textContent = data.orderRef;
  } else {
    paymentInstructions.style.display = 'none';
  }

  // Update page title
  document.title = `Order ${data.orderRef} - Payizi Global`;
}

// Update status display and progress
function updateStatusDisplay(status) {
  const statusLower = status.toLowerCase();
  const statusInfo = statusMap[statusLower] || { progress: 0, class: 'bg-secondary', step: 0 };

  // Update status badge
  const statusBadge = document.getElementById('statusBadge');
  statusBadge.textContent = status;
  statusBadge.className = `badge ${statusInfo.class}`;

  // Update progress bar
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  progressBar.style.width = `${statusInfo.progress}%`;
  progressBar.className = `progress-bar progress-bar-striped ${statusInfo.class}`;
  progressText.textContent = status;

  // Update timeline steps
  updateTimeline(statusInfo.step);
}

// Update timeline visualization
function updateTimeline(currentStep) {
  for (let i = 1; i <= 5; i++) {
    const step = document.getElementById(`step${i}`);
    if (i <= currentStep) {
      step.classList.add('timeline-active');
    } else {
      step.classList.remove('timeline-active');
    }
  }
}

// Show loading state
function showLoading() {
  hideAllSections();
  loadingSection.style.display = 'block';
}

// Show error message
function showError(message) {
  hideAllSections();
  errorSection.style.display = 'block';
  errorSection.querySelector('p').textContent = message;
}

// Hide all sections
function hideAllSections() {
  loadingSection.style.display = 'none';
  statusSection.style.display = 'none';
  errorSection.style.display = 'none';
}

// Download receipt as PDF
function downloadReceipt() {
  if (!currentOrderData) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Set font
  doc.setFont('helvetica');

  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 123, 255);
  doc.text('PAYIZI GLOBAL', 20, 30);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Order Receipt', 20, 45);

  // Order information
  doc.setFontSize(12);
  let y = 65;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Order Details:', 20, y);
  y += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Order Reference: ${currentOrderData.orderRef}`, 20, y);
  y += 8;
  doc.text(`Date: ${formatDate(currentOrderData.timestamp)}`, 20, y);
  y += 8;
  doc.text(`Status: ${currentOrderData.status}`, 20, y);
  y += 15;

  // Customer information
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Information:', 20, y);
  y += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${currentOrderData.customerName}`, 20, y);
  y += 8;
  doc.text(`Email: ${currentOrderData.email}`, 20, y);
  y += 15;

  // Transfer details
  doc.setFont('helvetica', 'bold');
  doc.text('Transfer Details:', 20, y);
  y += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`USD Amount: $${currentOrderData.usdAmount.toFixed(2)}`, 20, y);
  y += 8;
  doc.text(`Exchange Rate: ${currentOrderData.rate.toFixed(5)}`, 20, y);
  y += 8;
  doc.text(`Payizi Fee: R ${currentOrderData.payiziFee.toFixed(2)}`, 20, y);
  y += 8;
  doc.text(`Total ZAR: R ${currentOrderData.zarTotal.toFixed(2)}`, 20, y);
  y += 15;

  // Beneficiary information
  doc.setFont('helvetica', 'bold');
  doc.text('Beneficiary Information:', 20, y);
  y += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${currentOrderData.beneficiaryName}`, 20, y);
  y += 8;
  doc.text(`Location: ${currentOrderData.location}`, 20, y);
  y += 15;

  // Payment instructions (if applicable)
  if (currentOrderData.status.toLowerCase().includes('pending')) {
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Instructions:', 20, y);
    y += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Bank: First National Bank', 20, y);
    y += 8;
    doc.text('Account Name: Payizi Global', 20, y);
    y += 8;
    doc.text('Account Number: 63077437200', 20, y);
    y += 8;
    doc.text('Branch Code: 250655', 20, y);
    y += 8;
    doc.text(`Reference: ${currentOrderData.orderRef}`, 20, y);
  }

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for choosing Payizi Global', 20, 280);
  doc.text('For support: info@payizi.com | +27 123 456 789', 20, 290);

  // Save the PDF
  doc.save(`Payizi_Receipt_${currentOrderData.orderRef}.pdf`);
}

// Utility function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Auto-refresh functionality (optional)
function startAutoRefresh() {
  if (currentOrderData && !currentOrderData.status.toLowerCase().includes('completed')) {
    setInterval(() => {
      if (currentOrderData) {
        trackOrder(currentOrderData.orderRef);
      }
    }, 30000); // Refresh every 30 seconds for active orders
  }
}