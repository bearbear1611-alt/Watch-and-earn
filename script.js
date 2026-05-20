// Base configuration keys
const SUPABASE_URL = "https://supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoYWp0YmVtZHl5aXdoZG5veXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzI3NTMsImV4cCI6MjA5NDcwODc1M30.YDZG5w9m54H3j4RTMjld3HGYa8JhL6jKHhDWq5eYvCM";

// Global app variables
let coins = 0;
let userEmail = "";
const COINS_PER_AD = 5000;
const REAL_CASH_PER_AD = 0.002;      
const YOUR_PROFIT_MARGIN = 0.10;    

// 1. SIGN UP LOGIC (Requires Email Confirmation)
function handleSignUp() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const msg = document.getElementById('auth-message');

    if (!email || !password) return alert("Please fill out both fields.");

    msg.innerText = "Registering...";
    
    fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(res => {
        if (!res.ok) throw new Error("Registration failed.");
        msg.innerText = "Check your email for a verification link!";
    })
    .catch(err => { msg.innerText = err.message; });
}

// 2. LOGIN LOGIC
function handleLogin() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const msg = document.getElementById('auth-message');

    msg.innerText = "Logging in...";

    fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            msg.innerText = data.error_description || "Confirm your email first.";
        } else {
            userEmail = data.user.email;
            loadUserCoins();
        }
    })
    .catch(() => { msg.innerText = "Login failed."; });
}

// 3. LOAD PROFILE COINS FROM CLOUD
function loadUserCoins() {
    fetch(`${SUPABASE_URL}/rest/v1/profiles?username=eq.${userEmail}`, {
        method: "GET",
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
    })
    .then(res => res.json())
    .then(data => {
        coins = (data && data.length > 0) ? data[0].coins : 0;
        
        // Hide authentication UI, show game engine UI
        document.getElementById('auth-panel').style.display = "none";
        document.getElementById('main-panel').style.display = "block";
        document.getElementById('welcome-user').innerText = `Logged in as: ${userEmail}`;
        
        updateInterface();
    });
}

// 4. SAVE PROFILE COINS TO CLOUD
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
    let estimatedPayout = coins * exchangeRatePerCoin;
    
    document.getElementById('est-cash').innerText = "£" + estimatedPayout.toFixed(2);
    
    saveToDatabase(coins);
}

function simulateAdWatch() {
    coins += COINS_PER_AD;
    updateInterface();
    alert("Ad complete! 5,000 coins added to your profile.");
}

function handleLogout() {
    location.reload(); // Quick reset back to the login wall
}

// 3-Hour Countdown Clock
let duration = 3 * 60 * 60; 
setInterval(function () {
    let hours = Math.floor(duration / 3600);
    let minutes = Math.floor((duration % 3600) / 60);
    let seconds = duration % 60;
    document.getElementById("countdown").textContent = 
        (hours < 10 ? "0" : "") + hours + ":" + 
        (minutes < 10 ? "0" : "") + minutes + ":" + 
        (seconds < 10 ? "0" : "") + seconds;
    if (--duration < 0) duration = 3 * 60 * 60; 
}, 1000);

