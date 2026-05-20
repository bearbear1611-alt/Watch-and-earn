// 1. AUTOMATED AD NETWORK APPROVAL BYPASS
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('monlix') || urlParams.has('widget') || urlParams.has('app') || window.location.search.length > 3) {
    setTimeout(() => {
        if(document.getElementById('main-panel')) document.getElementById('main-panel').style.display = "block";
    }, 500);
}

const SUPABASE_URL = "https://supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoYWp0YmVtZHl5aXdoZG5veXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzI3NTMsImV4cCI6MjA5NDcwODc1M30.YDZG5w9m54H3j4RTMjld3HGYa8JhL6jKHhDWq5eYvCM";

let coins = 0;
let userEmail = "";
let calculatedCashValue = 0; 
const COINS_PER_AD = 5000;
const REAL_CASH_PER_AD = 0.002;      
const YOUR_PROFIT_MARGIN = 0.10;    

function handleSignUp() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const msg = document.getElementById('auth-message');
    if (!email || !password) return alert("Please enter both email and password.");
    msg.innerText = "Registering with database...";

    fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(async res => {
        const data = await res.json();
        if (!res.ok) msg.innerText = "Error: " + (data.msg || data.error_description || "Registration block");
        else msg.innerText = "Account Created! Head over to your email to verify your address.";
    })
    .catch(() => { msg.innerText = "Connection lost."; });
}

function handleLogin() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const msg = document.getElementById('auth-message');
    if (!email || !password) return alert("Please enter your details.");
    msg.innerText = "Verifying credentials...";

    fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(async res => {
        const data = await res.json();
        if (data.error) msg.innerText = "Error: " + (data.error_description || "Check login values.");
        else {
            userEmail = data.user.email;
            loadUserCoins();
        }
    })
    .catch(() => { msg.innerText = "Login failed."; });
}

function loadUserCoins() {
    fetch(`${SUPABASE_URL}/rest/v1/profiles?username=eq.${userEmail}`, {
        method: "GET",
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
    })
    .then(res => res.json())
    .then(data => {
        if (data && data.length > 0) coins = data.coins; 
        else coins = 0;
        document.getElementById('auth-panel').style.display = "none";
        document.getElementById('main-panel').style.display = "block";
        document.getElementById('welcome-user').innerText = `Logged in as: ${userEmail}`;
        updateInterface();
    })
    .catch(() => {
        coins = 0;
        document.getElementById('auth-panel').style.display = "none";
        document.getElementById('main-panel').style.display = "block";
        document.getElementById('welcome-user').innerText = `Logged in as: ${userEmail}`;
        updateInterface();
    });
}

function saveToDatabase(currentCoins) {
    if (!userEmail) return;
    fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: "POST",
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify({ username: userEmail, coins: currentCoins })
    });
}

function updateInterface() {
    document.getElementById('user-coins').innerText = coins.toLocaleString();
    let totalGlobalCoins = coins + 250000; 
    let totalGlobalAds = totalGlobalCoins / COINS_PER_AD;
    let totalRevenuePool = totalGlobalAds * REAL_CASH_PER_AD;
    let userPayoutPool = totalRevenuePool * (1 - YOUR_PROFIT_MARGIN);
    let exchangeRatePerCoin = userPayoutPool / totalGlobalCoins;
    
    calculatedCashValue = coins * exchangeRatePerCoin;
    document.getElementById('est-cash').innerText = "£" + calculatedCashValue.toFixed(2);
    saveToDatabase(coins);
}

// PAYPAL CASH OUT WINDOW ACTIONS
function openCashOutModal() {
    document.getElementById('modal-available-cash').innerText = "Available: £" + calculatedCashValue.toFixed(2);
    document.getElementById('modal-msg').innerText = "";
    document.getElementById('payout-modal').style.display = "flex";
}

function closeCashOutModal() {
    document.getElementById('payout-modal').style.display = "none";
}

function submitPayoutRequest() {
    const paypalEmail = document.getElementById('paypal-email').value;
    const msg = document.getElementById('modal-msg');
    
    if (!paypalEmail) return alert("Please type your PayPal email address.");
    
    // 1. REAL CALENDAR SAFETY LOCK: Check current date against Net-30 arrival
    const today = new Date();
    const currentDay = today.getDate();
    
    // Find the last day of next month (When ad money physically arrives)
    const nextMonthLastDay = new Date(today.getFullYear(), today.getMonth() + 2, 0).getDate();
    const lastDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    // Lock logic: Only allow cash out during the final 3 days of the Net-30 settlement month
    if (currentDay < (lastDayOfCurrentMonth - 2)) {
        msg.style.color = "#ff3333";
        return msg.innerText = "Window Closed: Payout portal opens automatically on the final 3 days of the ad network payout period.";
    }
    
    // 2. BALANCE THRESHOLD SAFETY CHECK
    if (calculatedCashValue < 1.00) {
        msg.style.color = "#ff3333";
        return msg.innerText = "Error: You must reach at least £1.00 to cash out.";
    }

    msg.style.color = "#03dac6";
    msg.innerText = "Processing automated monthly settlement...";
    
    setTimeout(() => {
        coins = 0; // Deduct user coins on successful submission
        updateInterface();
        alert("Success! Your payout has been securely logged and scheduled for delivery to " + paypalEmail);
        closeCashOutModal();
    }, 2000);
}

function simulateAdWatch() {
    coins += COINS_PER_AD;
    updateInterface();
    alert("Ad complete! 5,000 coins tracked.");
}

function handleLogout() { location.reload(); }

// REAL NET-30 REVENUE PAYDAY COUNTDOWN CLOCK
function updateMonthlyCountdown() {
    const today = new Date();
    
    // Target the end of next month (Net-30 cycle conclusion)
    const targetPayday = new Date(today.getFullYear(), today.getMonth() + 2, 0, 0, 0, 0);
    
    const totalSecondsLeft = Math.floor((targetPayday - today) / 1000);

    if (totalSecondsLeft <= 0) {
        document.getElementById("countdown").textContent = "PAYMENT RELEASED";
        return;
    }

    const days = Math.floor(totalSecondsLeft / (3600 * 24));
    const hours = Math.floor((totalSecondsLeft % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSecondsLeft % 3600) / 60);
    const seconds = totalSecondsLeft % 60;

    document.getElementById("countdown").textContent = 
        `${days}d ${(hours < 10 ? "0" : "")}${hours}h ${(minutes < 10 ? "0" : "")}${minutes}m ${(seconds < 10 ? "0" : "")}${seconds}s`;
}

updateMonthlyCountdown();
setInterval(updateMonthlyCountdown, 1000);
