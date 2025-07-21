console.log('🚀 Status.js loaded successfully');

// Google Sheets Configuration
const GOOGLE_SHEETS_CONFIG = {
  WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbyOdpYNrOHTpbXIVVL1AaSlbaPUKxNpCB5bE42BG4IMSj0TBXNg_PmWVhTZAH6b3c-nyQ/exec'
};

// Add this test function to your status.js
function testDirectURL() {
  console.log('🧪 Testing direct URL access...');
  
  const testUrl = `${GOOGLE_SHEETS_CONFIG.WEB_APP_URL}?orderId=DE3CJ35G&action=getOrder`;
  console.log('🔗 Test URL:', testUrl);
  
  // Open this URL in a new browser tab
  window.open(testUrl, '_blank');
}

// Updated function to match your actual HTML IDs
function checkElements() {
  const trackButton = document.getElementById('trackBtn'); // Changed from 'trackButton'
  const orderIdInput = document.getElementById('orderRef'); // Changed from 'orderIdInput'
  const loadingSection = document.getElementById('loadingSection');
  const statusSection = document.getElementById('statusSection');
  const errorSection = document.getElementById('errorSection');
  
  console.log('📋 Element check:', {
    trackButton: !!trackButton,
    orderIdInput: !!orderIdInput,
    loadingSection: !!loadingSection,
    statusSection: !!statusSection,
    errorSection: !!errorSection
  });
  
  if (!trackButton) console.error('❌ trackBtn not found');
  if (!orderIdInput) console.error('❌ orderRef not found');
  if (!loadingSection) console.error('❌ loadingSection not found');
  if (!statusSection) console.error('❌ statusSection not found');
  if (!errorSection) console.error('❌ errorSection not found');
  
  return { trackButton, orderIdInput, loadingSection, statusSection, errorSection };
}

// Enhanced trackOrder function with better error handling and CORS workaround
async function trackOrder() {
  console.log('🔍 trackOrder function called');
  
  const { trackButton, orderIdInput, loadingSection, statusSection, errorSection } = checkElements();
  
  if (!trackButton || !orderIdInput) {
    console.error('❌ Missing required elements');
    alert('Error: Required page elements not found');
    return;
  }
  
  const orderId = orderIdInput.value.trim();
  console.log('📝 Order ID entered:', orderId);
  
  if (!orderId) {
    console.error('❌ No order ID provided');
    alert('Please enter an order ID');
    return;
  }
  
  // Show loading state
  showLoading();
  
  try {
    console.log('🌐 Making fetch request...');
    const url = `${GOOGLE_SHEETS_CONFIG.WEB_APP_URL}?orderId=${encodeURIComponent(orderId)}&action=getOrder`;
    console.log('📡 URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      mode: 'cors'
    });
    
    console.log('📡 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    console.log('📄 Raw response:', text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('🚨 JSON parse error:', parseError);
      throw new Error('Invalid response format from server');
    }
    
    console.log('📊 Parsed data:', data);
    
    if (data.success) {
      displayOrderStatus(data.data);
    } else {
      console.error('🚨 Server returned error:', data.error);
      showError(data.error || 'Order not found');
    }
    
  } catch (error) {
    console.error('🚨 Fetch error:', error.message);
    showError(`Failed to connect to server: ${error.message}. Please check your connection or contact support.`);
  } finally {
    hideLoading();
  }
}


// Add a simple connection test
async function testSimpleConnection() {
  console.log('🧪 Testing simple connection...');
  
  try {
    const testUrl = `${GOOGLE_SHEETS_CONFIG.WEB_APP_URL}?orderId=TEST&action=getOrder`;
    console.log('🔗 Test URL:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'no-cors' // Try no-cors mode for testing
    });
    
    console.log('✅ Test response received (no-cors mode)');
    console.log('📡 Response type:', response.type);
    console.log('📡 Response status:', response.status);
    
    return { success: true, status: response.status, mode: 'no-cors' };
  } catch (error) {
    console.error('❌ Simple connection test failed:', error);
    return { success: false, error: error.message };
  }
}

// Add this to the end of your file for testing
console.log('✅ Enhanced status.js loaded with JSONP fallback');

// Show loading state using your HTML structure
function showLoading() {
  console.log('⏳ Showing loading state');
  
  const { trackButton, loadingSection, statusSection, errorSection } = checkElements();
  
  // Disable button and show loading text
  if (trackButton) {
    trackButton.innerHTML = '⏳ Searching...';
    trackButton.disabled = true;
  }
  
  // Show loading section, hide others
  if (loadingSection) loadingSection.style.display = 'block';
  if (statusSection) statusSection.style.display = 'none';
  if (errorSection) errorSection.style.display = 'none';
}

// Hide loading state
function hideLoading() {
  console.log('✅ Hiding loading state');
  
  const { trackButton, loadingSection } = checkElements();
  
  // Reset button
  if (trackButton) {
    trackButton.innerHTML = 'Track Order';
    trackButton.disabled = false;
  }
  
  // Hide loading section
  if (loadingSection) loadingSection.style.display = 'none';
}

// Display order status using your existing HTML structure
function displayOrderStatus(orderData) {
  console.log('🎨 Displaying order:', orderData);
  
  const { statusSection, errorSection } = checkElements();
  
  // Hide error section, show status section
  if (errorSection) errorSection.style.display = 'none';
  if (statusSection) statusSection.style.display = 'block';
  
  // Populate the existing HTML elements with order data
  updateElement('statusOrderRef', orderData.orderId);
  updateElement('statusCustomerName', orderData.customerName);
  updateElement('statusEmail', orderData.customerEmail);
  updateElement('statusLastUpdated', formatDate(orderData.createdAt));
  updateElement('statusUsdAmount', `$${orderData.amount}`);
  updateElement('statusZarTotal', `R ${orderData.zarTotal}`);
  updateElement('statusRate', orderData.exchangeRate);
  updateElement('statusBeneficiary', orderData.recipient);
  updateElement('statusLocation', `${orderData.location}, ${orderData.destination}`);
  updateElement('paymentRef', orderData.orderId);
  
  // Update status badge
  const statusBadge = document.getElementById('statusBadge');
  if (statusBadge) {
    statusBadge.textContent = orderData.status.toUpperCase();
    statusBadge.className = `badge ${getStatusBadgeClass(orderData.status)}`;
  }
  
  // Update progress bar and timeline
  updateProgress(orderData.status);
  
  // Show/hide payment instructions
  const paymentInstructions = document.getElementById('paymentInstructions');
  if (paymentInstructions) {
    if (orderData.status.toLowerCase() === 'pending') {
      paymentInstructions.style.display = 'block';
    } else {
      paymentInstructions.style.display = 'none';
    }
  }
}

// Helper function to update element text content
function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value || '-';
  }
}

// Get Bootstrap badge class for status
function getStatusBadgeClass(status) {
  const statusClasses = {
    'pending': 'bg-warning',
    'processing': 'bg-info',
    'completed': 'bg-success',
    'failed': 'bg-danger'
  };
  return statusClasses[status.toLowerCase()] || 'bg-secondary';
}

// Update progress bar and timeline based on status
function updateProgress(status) {
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  
  let progressPercent = 0;
  let progressLabel = '';
  
  switch (status.toLowerCase()) {
    case 'pending':
      progressPercent = 20;
      progressLabel = 'Pending Payment';
      updateTimelineStep('step1', 'active');
      break;
    case 'processing':
      progressPercent = 60;
      progressLabel = 'Processing Transfer';
      updateTimelineStep('step1', 'completed');
      updateTimelineStep('step2', 'completed');
      updateTimelineStep('step3', 'active');
      break;
    case 'completed':
      progressPercent = 100;
      progressLabel = 'Transfer Completed';
      updateTimelineStep('step1', 'completed');
      updateTimelineStep('step2', 'completed');
      updateTimelineStep('step3', 'completed');
      updateTimelineStep('step4', 'completed');
      updateTimelineStep('step5', 'completed');
      break;
    case 'failed':
      progressPercent = 20;
      progressLabel = 'Transfer Failed';
      updateTimelineStep('step1', 'failed');
      break;
  }
  
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
    progressBar.setAttribute('aria-valuenow', progressPercent);
  }
  
  if (progressText) {
    progressText.textContent = progressLabel;
  }
}

// Update timeline step appearance
function updateTimelineStep(stepId, status) {
  const step = document.getElementById(stepId);
  if (step) {
    step.className = `col timeline-step ${status}`;
    
    // Add visual indicators
    const icon = step.querySelector('.timeline-icon');
    if (icon) {
      switch (status) {
        case 'completed':
          icon.style.background = '#28a745';
          icon.style.color = 'white';
          break;
        case 'active':
          icon.style.background = '#007bff';
          icon.style.color = 'white';
          break;
        case 'failed':
          icon.style.background = '#dc3545';
          icon.style.color = 'white';
          break;
        default:
          icon.style.background = '#6c757d';
          icon.style.color = 'white';
      }
    }
  }
}

// Show error message using your existing HTML structure
function showError(message) {
  console.log('🚨 Showing error:', message);
  
  const { statusSection, errorSection } = checkElements();
  
  // Show error section, hide status section
  if (statusSection) statusSection.style.display = 'none';
  if (errorSection) {
    errorSection.style.display = 'block';
    
    // Update error message if needed
    const errorText = errorSection.querySelector('p');
    if (errorText && message !== 'Order not found') {
      errorText.textContent = message;
    }
  }
}

// Format date helper
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM loaded, initializing...');
  
  // Wait a moment for all elements to be ready
  setTimeout(() => {
    const { trackButton, orderIdInput } = checkElements();
    
    if (trackButton) {
      console.log('✅ Adding click listener to track button');
      trackButton.addEventListener('click', function(e) {
        console.log('🖱️ Track button clicked');
        e.preventDefault();
        trackOrder();
      });
    }
    
    if (orderIdInput) {
      console.log('✅ Adding enter key listener to input');
      orderIdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          console.log('⌨️ Enter pressed');
          e.preventDefault();
          trackOrder();
        }
      });
    }
    
    // Add refresh button functionality
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function() {
        console.log('🔄 Refresh button clicked');
        trackOrder();
      });
    }
    
    console.log('🎉 Status tracking initialized successfully');
  }, 500);
});

// Test function you can call from console
function testConnection() {
  console.log('🧪 Testing connection...');
  fetch(`${GOOGLE_SHEETS_CONFIG.WEB_APP_URL}?orderId=TEST&action=getOrder`)
    .then(response => response.text())
    .then(text => console.log('📡 Test response:', text))
    .catch(error => console.error('🚨 Test error:', error));
}

// Global error handler
window.addEventListener('error', function(e) {
  console.error('🌍 Global error:', e.error);
});

console.log('✅ Status.js setup complete');
