// Base configuration
let coins = 0;
const COINS_PER_AD = 5000;
const REAL_CASH_PER_AD = 0.01;      
const YOUR_PROFIT_MARGIN = 0.10;    

// Pushes data straight to your database table using a standard web request
function saveToDatabase(currentCoins) {
    const targetUrl = "https://supabase.co";
    
    fetch(targetUrl, {
        method: "POST",
        headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoYWp0YmVtZHl5aXdoZG5veXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzI3NTMsImV4cCI6MjA5NDcwODc1M30.YDZG5w9m54H3j4RTMjld3HGYa8JhL6jKHhDWq5eYvCM",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoYWp0YmVtZHl5aXdoZG5veXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzI3NTMsImV4cCI6MjA5NDcwODc1M30.YDZG5w9m54H3j4RTMjld3HGYa8JhL6jKHhDWq5eYvCM",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify({ username: "tester", coins: currentCoins })
    }).catch(err => console.log("Database update paused:", err));
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
    
    // Fire the save request
    saveToDatabase(coins);
}

function simulateAdWatch() {
    coins += COINS_PER_AD;
    updateInterface();
    alert("Ad complete! 5,000 coins tracked to the cloud.");
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
