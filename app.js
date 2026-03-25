let trades = JSON.parse(localStorage.getItem("trades")) || [];
let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
let challenges = JSON.parse(localStorage.getItem("challenges")) || [];

function saveData() {
    localStorage.setItem("trades", JSON.stringify(trades));
    localStorage.setItem("accounts", JSON.stringify(accounts));
    localStorage.setItem("challenges", JSON.stringify(challenges));
}

function showSection(id) {
    document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function toggleProfileMenu() {
    let menu = document.getElementById("profileMenu");
    menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

document.getElementById("accountForm").addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("accountName").value;
    const broker = document.getElementById("brokerName").value;
    const balance = Number(document.getElementById("startingBalance").value);

    accounts.push({
        id: Date.now(),
        name,
        broker,
        balance
    });

    saveData();
    renderAccounts();
    renderAccountOptions();
    closeAccountModal();
    e.target.reset();
});

document.getElementById("tradeForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const account = document.getElementById("accountSelect").value;
    const pair = document.getElementById("pair").value;
    const direction = document.getElementById("direction").value;
    const lot = document.getElementById("lot").value;
    const pl = document.getElementById("pl").value;

    trades.push({
        date: new Date().toLocaleDateString(),
        account: account,
        pair: pair,
        direction: direction,
        lot: lot,
        pl: Number(pl)
    });

    saveData();

    // Update everything instantly
    renderJournal();
    updateDashboard();
    loadRecentTrades();

    // ✅ CLEAR FORM
    this.reset();

    // ✅ SHOW SUCCESS MESSAGE
    alert("Trade saved successfully!");
});

function renderJournal() {
    journalTable.innerHTML = "";
    trades.forEach(t => {
        journalTable.innerHTML += `
        <tr>
        <td>${t.date}</td>
        <td>${t.account}</td>
        <td>${t.pair}</td>
        <td>${t.direction}</td>
        <td>${t.lot}</td>
        <td>${t.pl}</td>
        </tr>`;
    });
}

function renderAccounts() {
    accountCards.innerHTML = "";

    accounts.forEach(acc => {

        let accTrades = trades.filter(t => t.account === acc.name);
        let totalPL = accTrades.reduce((sum, t) => sum + t.pl, 0);
        let currentBalance = acc.balance + totalPL;

        let growthPercent = ((currentBalance - acc.balance) / acc.balance) * 100;

        accountCards.innerHTML += `
        <div class="card">
            <h3>${acc.name}</h3>
            <p>Broker: ${acc.broker}</p>
            <p>Start Balance: $${acc.balance}</p>
            <p>Current Balance: $${currentBalance.toFixed(2)}</p>
            <p>Total P/L: ${totalPL >= 0 ? "+" : ""}${totalPL}</p>
            <p style="color:${growthPercent >= 0 ? '#16A34A' : '#DC2626'}">Growth: ${growthPercent.toFixed(2)}% </p>
        </div>`;
    });
}

function renderAccountOptions() {
    accountSelect.innerHTML = "";
    challengeAccount.innerHTML = "";
    accounts.forEach(acc => {
        accountSelect.innerHTML += `<option value="${acc.name}">${acc.name}</option>`;
        challengeAccount.innerHTML += `<option value="${acc.name}">${acc.name}</option>`;
    });
}

function updateDashboard() {

    let totalPLValue = trades.reduce((sum, t) => sum + t.pl, 0);
    let totalStartBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    let totalEquityValue = totalStartBalance + totalPLValue;

    let wins = trades.filter(t => t.pl > 0).length;
    let losses = trades.filter(t => t.pl < 0).length;
    let winRateValue = trades.length ? ((wins / trades.length) * 100).toFixed(1) : 0;

    // === TOTAL EQUITY ===
    document.getElementById("totalEquity").textContent =
        "$" + totalEquityValue.toFixed(2);

    const equityChange = document.getElementById("equityChange");

    if (totalPLValue >= 0) {
        equityChange.innerHTML =
            `<span class="arrow-up">↑ +$${totalPLValue.toFixed(2)}</span>`;
    } else {
        equityChange.innerHTML =
            `<span class="arrow-down">↓ $${totalPLValue.toFixed(2)}</span>`;
    }

    // === WIN RATE ===
    document.getElementById("winRate").textContent =
        winRateValue + "%";

    const winDetails = document.getElementById("winDetails");

    if (wins >= losses) {
        winDetails.innerHTML =
            `<span class="arrow-up">↑ ${wins}W / ${losses}L</span>`;
    } else {
        winDetails.innerHTML =
            `<span class="arrow-down">↓ ${wins}W / ${losses}L</span>`;
    }

    // === TOTAL TRADES ===
    document.getElementById("totalTrades").textContent =
        trades.length;

    // === ACTIVE CHALLENGES ===
    document.getElementById("activeChallenges").textContent =
        challenges.length;

    renderDashboardAccounts();
    renderDashboardChallenges();
}

function openChallengeModal() {
    document.getElementById("challengeModal").style.display = "flex";
}

function closeChallengeModal() {
    document.getElementById("challengeModal").style.display = "none";
}

function openAccountModal() {
    document.getElementById("accountModal").style.display = "flex";
}

function closeAccountModal() {
    document.getElementById("accountModal").style.display = "none";
}

function renderChallenges() {
    challengeCards.innerHTML = "";
    challenges.forEach(ch => {
        let accTrades = trades.filter(t => t.account === ch.account);
        let profit = accTrades.reduce((s, t) => s + t.pl, 0);
        let progress = Math.min((profit / ch.target) * 100, 100);
        challengeCards.innerHTML += `
        <div class="card">
        <h3>${ch.name}</h3>
        <p>${progress.toFixed(1)}% Complete</p>
        </div>`;
    });
}

function loadRecentTrades() {
    const tableBody = document.getElementById("recentTradesBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    const recentTrades = trades.slice(-5).reverse();

    recentTrades.forEach(trade => {

        const row = document.createElement("tr");

        const directionClass =
            trade.direction.toLowerCase() === "buy" ? "buy" : "sell";

        const profitClass =
            trade.pl >= 0 ? "profit" : "loss";

        row.innerHTML = `
            <td>${trade.date}</td>
            <td>${trade.pair}</td>
            <td class="${directionClass}">
                ${trade.direction.toUpperCase()}
            </td>
            <td>${trade.lot}</td>
            <td class="${profitClass}">
                ${trade.pl >= 0 ? "+" : ""}
                ${trade.pl}
            </td>
        `;

        tableBody.appendChild(row);
    });
}

document.getElementById("challengeForm").addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("challengeName").value;
    const account = document.getElementById("challengeAccount").value;
    const start = Number(document.getElementById("startBalance").value);
    const target = Number(document.getElementById("targetBalance").value);

    challenges.push({
        id: Date.now(),
        name,
        account,
        startBalance: start,
        targetBalance: target
    });

    saveData();
    renderChallenges();
    closeChallengeModal();
    e.target.reset();
});

document.addEventListener("DOMContentLoaded", function() {
    loadRecentTrades();
});

renderAccounts();
renderJournal();
renderChallenges();
renderAccountOptions();
updateDashboard();