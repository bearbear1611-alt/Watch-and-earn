// Official Supabase SDK initialization
const SUPABASE_URL = "https://supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoYWp0YmVtZHl5aXdoZG5veXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzI3NTMsImV4cCI6MjA5NDcwODc1M30.YDZG5w9m54H3j4RTMjld3HGYa8JhL6jKHhDWq5eYvCM";

// FIXED: Capital S ensures the background library connects properly without crashing
const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let coins = 0;
let userEmail = "";
const COINS_PER_AD = 5000;
const REAL_CASH_PER_AD = 0.002;      
const YOUR_PROFIT_MARGIN = 0.10;    

// 1. SECURE SIGN UP
async function handleSignUp() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const msg = document.getElementById('auth-message');

    if (!email || !password) return alert("Please enter an email and password.");
    msg.innerText = "Processing Sign Up...";

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        msg.innerText = "Error: " + error.message;
    } else {
        msg.innerText = "Account Created! Check your email inbox & spam folder to verify.";
    }
}

// 2. SECURE LOGIN
async function handleLogin() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const msg = document.getElementById('auth-message');

    if (!email || !password) return alert("Please enter your details.");
    msg.innerText = "Logging in...";

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        msg.innerText = "Error: " + error.message;
    } else {
        userEmail = data.user.email;
        loadUserCoins();
    }
}

// 3. LOAD PROFILE COINS FROM CLOUD
async function loadUserCoins() {
    const { data, error } = await supabase
        .from('profiles')
        .select('coins')
        .eq('username', userEmail)
        .single();

    if (data) {
        coins = data.coins;
    } else {
        coins = 0;
    }

    document.getElementById('auth-panel').style.display = "none";
    document.getElementById('main-panel').style.display = "block";
    document.getElementById('welcome-user').innerText = `Logged in as: ${userEmail}`;
    updateInterface();
}

// 4. SAVE PROFILE COINS TO CLOUD
async function saveToDatabase(currentCoins) {
    if (!userEmail) return;
    await supabase
        .from('profiles')
        .upsert({ username: userEmail, coins: currentCoins });
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
    alert("Ad complete! 5,000 coins added.");
}

function handleLogout() { location.reload(); }

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
