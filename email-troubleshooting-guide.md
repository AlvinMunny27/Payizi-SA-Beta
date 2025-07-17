# Email Troubleshooting Guide - Payizi Order System

## 🚨 Quick Diagnosis Checklist

**If you're not receiving emails, follow these steps in order:**

### Step 1: Check Your SendGrid Setup
1. **Verify SendGrid API Key**
   - Go to your Google Apps Script project
   - Click the ⚙️ gear icon (Project Settings)
   - Scroll to "Script Properties"
   - Check if `SENDGRID_API_KEY` exists and starts with `SG.`

2. **Verify Sender Authentication**
   - Log into your SendGrid account
   - Go to Settings → Sender Authentication
   - Ensure `alvin@payizi.io` is verified (green checkmark)

### Step 2: Run Diagnostic Functions
Add these functions to your Google Apps Script and run them:

```javascript
// RUN THIS FIRST - Complete Email Diagnosis
function runEmailDiagnosis() {
  console.log('🔍 Starting Email Diagnosis...');
  
  // Check 1: API Key Configuration
  const apiKey = PropertiesService.getScriptProperties().getProperty('SENDGRID_API_KEY');
  console.log('✅ API Key exists:', !!apiKey);
  console.log('✅ API Key format correct:', apiKey && apiKey.startsWith('SG.'));
  
  if (!apiKey) {
    console.log('❌ CRITICAL: SendGrid API key missing!');
    console.log('   → Go to Project Settings → Script Properties');
    console.log('   → Add: Key="SENDGRID_API_KEY", Value="your_sendgrid_api_key"');
    return;
  }
  
  // Check 2: Configuration
  console.log('📧 FROM_EMAIL:', FROM_EMAIL);
  console.log('📧 ADMIN_EMAIL:', ADMIN_EMAIL);
  
  // Check 3: Test Gmail (fallback)
  console.log('\n🧪 Testing Gmail fallback...');
  try {
    GmailApp.sendEmail(
      ADMIN_EMAIL,
      '✅ TEST: Gmail Working',
      'If you receive this email, Gmail integration is working properly.'
    );
    console.log('✅ Gmail test sent successfully');
  } catch (error) {
    console.log('❌ Gmail failed:', error.message);
  }
  
  // Check 4: Test SendGrid
  console.log('\n🧪 Testing SendGrid...');
  const sendGridResult = testSendGridAPI();
  console.log('SendGrid result:', sendGridResult);
  
  console.log('\n✅ Diagnosis complete! Check the logs above for issues.');
}

// Test SendGrid API directly
function testSendGridAPI() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('SENDGRID_API_KEY');
  
  const payload = {
    personalizations: [{
      to: [{ email: ADMIN_EMAIL }],
      subject: '✅ TEST: SendGrid API Working'
    }],
    from: { email: FROM_EMAIL, name: FROM_NAME },
    content: [{
      type: "text/html",
      value: '<h2>SendGrid Test Successful!</h2><p>Your SendGrid integration is working properly.</p>'
    }]
  };
  
  const response = UrlFetchApp.fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();
  
  console.log('📨 SendGrid Response Code:', responseCode);
  if (responseCode !== 202) {
    console.log('❌ SendGrid Error Response:', responseText);
  }
  
  return {
    success: responseCode === 202,
    code: responseCode,
    response: responseText
  };
}

// Test a complete order submission
function testCompleteOrderFlow() {
  console.log('🧪 Testing complete order flow...');
  
  const testOrder = {
    reference: 'TEST' + Date.now(),
    name: 'Test Customer',
    email: ADMIN_EMAIL, // Send to your email for testing
    mobile: '+27123456789',
    beneficiaryName: 'Test Beneficiary',
    beneficiaryMobile: '+263123456789',
    beneficiaryId: 'ID123456',
    country: 'Zimbabwe',
    usdAmount: '100',
    zarTotal: '1850',
    timestamp: new Date().toISOString()
  };
  
  try {
    // Test saving to sheet
    const saveResult = saveToSheet(testOrder);
    console.log('✅ Sheet save result:', saveResult);
    
    // Test sending email
    const emailResult = sendConfirmationEmailSendGrid(testOrder);
    console.log('✅ Email result:', emailResult);
    
    console.log('🎉 Complete order flow test successful!');
    return { success: true, orderRef: testOrder.reference };
    
  } catch (error) {
    console.log('❌ Order flow test failed:', error.message);
    return { success: false, error: error.message };
  }
}
```

### Step 3: Fix Common Issues

#### Issue 1: Missing API Key
**Solution:**
1. Go to your Google Apps Script project
2. Click ⚙️ (Project Settings)
3. Scroll to "Script Properties"
4. Click "Add script property"
5. Key: `SENDGRID_API_KEY`
6. Value: Your SendGrid API key (starts with `SG.`)
7. Click "Save"

#### Issue 2: Sender Not Verified
**Solution:**
1. Go to SendGrid Dashboard
2. Settings → Sender Authentication
3. Click "Verify a Single Sender"
4. Use email: `alvin@payizi.io`
5. Complete verification process

#### Issue 3: Wrong Email Configuration
**Current config in your script:**
```javascript
const FROM_EMAIL = 'alvin@payizi.io';
const ADMIN_EMAIL = 'alvin@payizi.io';
```

**Make sure:**
- `alvin@payizi.io` is verified in SendGrid
- You have access to this email inbox
- Check spam/junk folder

#### Issue 4: Gmail Permissions
If Gmail fallback is failing:
1. Go to Google Apps Script project
2. Click "Authorize" when prompted
3. Grant Gmail permissions

### Step 4: Test Results Interpretation

**Response Code 202 ✅**
- Email sent successfully
- Check inbox (including spam)

**Response Code 401 ❌**
- Invalid API key
- Re-check Script Properties

**Response Code 403 ❌**
- Sender not verified
- Complete sender authentication

**Response Code 400 ❌**
- Malformed request
- Check email format

### Step 5: Production Checklist

Once emails are working:

1. **Security**
   - ✅ API key in Script Properties (not hardcoded)
   - ✅ Sender authentication complete

2. **Testing**
   - ✅ Test order submission
   - ✅ Test email delivery
   - ✅ Test status tracking

3. **Monitoring**
   - ✅ Set up SendGrid activity monitoring
   - ✅ Check Google Apps Script logs regularly

## 🛠️ How to Run Diagnostics

1. Open your Google Apps Script project
2. Paste the diagnostic functions above into your script
3. Save the script
4. Run `runEmailDiagnosis()` function
5. Check the execution log for results
6. Fix any issues identified
7. Run `testCompleteOrderFlow()` to test everything

## 📞 Still Need Help?

If emails still aren't working after following this guide:

1. **Check the diagnostic function results** - they'll show exactly what's wrong
2. **Verify your SendGrid account status** - make sure it's not suspended
3. **Check your domain reputation** - new accounts may have delivery delays
4. **Test with a different email provider** - try Gmail as recipient

## 🔧 Quick Fixes

**Gmail not working?**
```javascript
// Test Gmail permissions
function testGmail() {
  GmailApp.sendEmail('your-email@gmail.com', 'Test', 'Gmail working!');
}
```

**SendGrid not working?**
```javascript
// Check API key format
function checkApiKey() {
  const key = PropertiesService.getScriptProperties().getProperty('SENDGRID_API_KEY');
  console.log('Key exists:', !!key);
  console.log('Key format:', key ? key.substring(0, 10) + '...' : 'MISSING');
}
```

Follow this guide step by step, and your email delivery should work perfectly! 🎯
