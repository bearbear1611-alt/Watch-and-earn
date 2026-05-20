const SUPABASE_URL = "https://supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoYWp0YmVtZHl5aXdoZG5veXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzI3NTMsImV4cCI6MjA5NDcwODc1M30.YDZG5w9m54H3j4RTMjld3HGYa8JhL6jKHhDWq5eYvCM";

// Initialize with window library object
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let coins = 0;
let userEmail = "";
const COINS_PER_AD = 5000;
const REAL_CASH_PER_AD = 0.002;      
const YOUR_PROFIT_MARGIN = 0.10;    

function initAuthUI() {
    const authUiDiv = document.getElementById('supabase-auth-ui');
    if (!authUiDiv) return;

    authUiDiv.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px; text-align:left;">
            <label style="font-size:0.9rem;">Email Address</label>
            <input type="email" id="ui-email" placeholder="you@example.com" style="width:100%; padding:12px; border-radius:8px; border:1px solid #333; background:#26262b; color:white; box-sizing:border-box;">
            <label style="font-size:0.9rem;">Password</label>
            <input type="password" id="ui-password" placeholder="••••••••" style="width:100%; padding:12px; border-radius:8px; border:1px solid #333; background:#26262b; color:white; box-sizing:border-box;">
            <button onclick="submitAuth('signin')" style="margin-top:10px; background:#03dac6; color:#000;">Sign In</button>
            <button onclick="submitAuth('signup')" style="background:#6200ee; color:#fff;">Register Account</button>
            <p id="ui-msg" style="color:#03dac6; font-size:0.85rem; text-align:center; margin-top:5px;"></p>
        </div>
    `;
}

async function submitAuth(type) {
    const email = document.getElementById('ui-email').value;
    const password = document.getElementById('ui-password').value;
    const msg = document.getElementById('ui-msg');

    if (!email || !password) return alert("Please enter both email and password.");
    msg.innerText = "Connecting to cloud securely...";

    if (type === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) msg.innerText = "Error: " + error.message;
        else msg.innerText = "Account created! Check your email inbox/spam folder to confirm your profile link.";
    } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            msg.innerText = "Error: " + error.message;
        } else {
            userEmail = data.user.email;
            checkLoginState();
        }
    }
}

async function checkLoginState() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        userEmail = session.user.email;
        loadUserCoins();
    } else {
        initAuthUI();
    }
}

async function loadUserCoins() {
    const { data, error } = await supabase
        .from('profiles')
        .select('coins')
        .eq('username', userEmail);

    if (data && data.length > 0) {
        coins = data[0].coins; // FIXED: Grab correct array row position index
    } else {
        coins = 0;
    }

    document.getElementById('auth-container').style.display = "none";
    document.getElementById('main-panel').style.display = "block";
    document.getElementById('welcome-user').innerText = `Logged in as: ${userEmail}`;
    updateInterface();
}

async function saveToDatabase(currentCoins) {
    if (!userEmail) return;
    await supabase
        .from('profiles')
        .upsert({ username: userEmail, coins: currentCoins }, { onConflict: 'username' });
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
    alert("Ad complete! 5,000 coins tracked securely.");
}

async function handleLogout() {
    await supabase.auth.signOut();
    location.reload();
}

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

// FIXED: Perfectly matches function casing
window.onload = checkLoginState;
