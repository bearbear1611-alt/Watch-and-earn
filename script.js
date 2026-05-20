const SUPABASE_URL = "https://whajtbemdyyiwhdnoyro.supabase.co";
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
    msg.innerText = "Registering...";

    fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(async res => {
        const data = await res.json();
        if (!res.ok) msg.innerText = "Error: " + (data.msg || data.error_description || "Try again.");
        else msg.innerText = "Account created! Check your email to verify.";
    })
    .catch(() => { msg.innerText = "Connection failed."; });
}

function handleLogin() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const msg = document.getElementById('auth-message');
    if (!email || !password) return alert("Please enter your details.");
    msg.innerText = "Logging in...";

    fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(async res => {
        const data = await res.json();
        if (data.error) msg.innerText = "Error: " + (data.error_description || "Check your details.");
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
        if (data && data.length > 0) coins = data[0].coins;
        else coins = 0;
        showMainPanel();
    })
    .catch(() => {
        coins = 0;
        showMainPanel();
    });
}

function showMainPanel() {
    document.body.classList.add('logged-in');
    document.getElementById('welcome-user').innerText = `Logged in as: ${userEmail}`;
    updateInterface();
}

function saveToDatabase(currentCoins) {
    if (!userEmail) return;
    fetch(`${SUPABASE_URL}/rest/v1/profiles?username=eq.${userEmail}`, {
        method: "PATCH",
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ coins: currentCoins })
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
    let percentage = Math.min((calculatedCashValue / 5.00) * 100, 100);
    document.getElementById('progress-bar').style.width = percentage + "%";
    document.getElementById('progress-text').innerText = `${Math.floor(percentage)}% to £5 Payout`;
    saveToDatabase(coins);
}

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
    if (!paypalEmail) return alert("Please enter your PayPal email.");

    const today = new Date();
    const currentDay = today.getDate();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    if (currentDay < (lastDay - 2)) {
        msg.style.color = "#ff3333";
        return msg.innerText = "Payouts open in the last 3 days of the month.";
    }
    if (calculatedCashValue < 1.00) {
        msg.style.color = "#ff3333";
        return msg.innerText = "You need at least £1.00 to cash out.";
    }

    msg.style.color = "#03dac6";
    msg.innerText = "Request logged! You'll be paid when ad revenue is received.";
}

function simulateAdWatch() {
    coins += COINS_PER_AD;
    updateInterface();
    alert("Ad complete! +5,000 coins added.");
}

function handleLogout() {
    document.body.classList.remove('logged-in');
    userEmail = "";
    coins = 0;
    calculatedCashValue = 0;
    document.getElementById('auth-email').value = "";
    document.getElementById('auth-password').value = "";
    document.getElementById('auth-message').innerText = "";
}

function updateMonthlyCountdown() {
    const today = new Date();
    const currentDay = today.getDate();
    let targetDay = currentDay > 15
        ? new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
        : 15;
    const target = new Date(today.getFullYear(), today.getMonth(), targetDay, 23, 59, 59);
    const secondsLeft = Math.floor((target - today) / 1000);
    if (secondsLeft <= 0) {
        document.getElementById("countdown").textContent = "PAYDAY RELEASED";
        return;
    }
    const d = Math.floor(secondsLeft / 86400);
    const h = Math.floor((secondsLeft % 86400) / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    const s = secondsLeft % 60;
    document.getElementById("countdown").textContent =
        `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
}

updateMonthlyCountdown();
setInterval(updateMonthlyCountdown, 1000);
