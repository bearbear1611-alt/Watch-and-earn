let coins = localStorage.getItem('userCoins') ? parseInt(localStorage.getItem('userCoins')) : 0;
let totalPoolEstimate = 50.00; 
let totalGlobalCoins = 1500000; 

function updateInterface() {
    document.getElementById('user-coins').innerText = coins.toLocaleString();
    
    let userShare = totalGlobalCoins > 0 ? (coins / totalGlobalCoins) : 0;
    let estimatedPayout = userShare * totalPoolEstimate;
    document.getElementById('est-cash').innerText = "£" + estimatedPayout.toFixed(2);
    
    localStorage.setItem('userCoins', coins);
}

function simulateAdWatch() {
    coins += 5000;
    totalGlobalCoins += 5000;
    updateInterface();
    alert("Ad complete! 5,000 coins added to your cycle.");
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

updateInterface();
