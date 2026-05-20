// Connected to your personal Supabase database
const SUPABASE_URL = "https://supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoYWp0YmVtZHl5aXdoZG5veXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzI3NTMsImV4cCI6MjA5NDcwODc1M30.YDZG5w9m54H3j4RTMjld3HGYa8JhL6jKHhDWq5eYvCM";

// FIXED: Capital S ensures the browser connects properly without crashing
const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Balance and math rules
let coins = 0;
const COINS_PER_AD = 5000;
const REAL_CASH_PER_AD = 0.01;      
const YOUR_PROFIT_MARGIN = 0.10;    

// Automatically sends your coins to the cloud database
async function saveToDatabase(currentCoins) {
    try {
        await supabase
            .from('profiles')
            .upsert({ username: 'tester', coins: currentCoins });
    } catch (err) {
        console.error("Database connection issue:", err);
    }
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
    
    // Trigger database cloud save
    saveToDatabase(coins);
}

function simulateAdWatch() {
    coins += COINS_PER_AD;
    updateInterface();
    alert("Ad complete! 5,000 coins saved to the cloud database.");
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

updateInterface();

