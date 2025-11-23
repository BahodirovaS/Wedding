const API_BASE = "https://wedding-rsvp-backend-rho.vercel.app/api";

function showStep(id) {
    document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

/* ---------- SEARCH ---------- */

document.getElementById("search-btn").addEventListener("click", async () => {
    const input = document.getElementById("search-input");
    const error = document.getElementById("search-error");

    error.textContent = "";

    if (!input.value.trim()) {
        error.textContent = "Please enter a name.";
        return;
    }

    const res = await fetch(`${API_BASE}/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input.value })
    });

    const data = await res.json();

    if (data.error) {
        error.textContent = data.error;
        return;
    }

    window.currentHousehold = data;

    document.getElementById("household-name").textContent = data.id;

    // Render guests
    const guestsContainer = document.getElementById("guests-container");
    guestsContainer.innerHTML = "";

    data.guests.forEach(g => {
        guestsContainer.innerHTML += `
            <div class="guest-block" data-guest="${g.id}">
                <div class="guest-name">${g.name}</div>
                <div class="choice-row">
                    <button class="choice-btn" data-choice="yes">Yes</button>
                    <button class="choice-btn" data-choice="no">No</button>
                </div>
            </div>
        `;
    });

    // Dinner question
    document.getElementById("welcome-dinner-container").innerHTML = `
        <p>Will you attend the welcome dinner on April 25?</p>
        <div class="choice-row">
            <button class="choice-btn" id="dinner-yes">Yes</button>
            <button class="choice-btn" id="dinner-no">No</button>
        </div>
    `;

    // Button selection logic
    document.querySelectorAll(".choice-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const parent = btn.parentElement;
            parent.querySelectorAll(".choice-btn").forEach(b => b.classList.remove("selected-yes", "selected-no"));

            if (btn.dataset.choice === "yes") btn.classList.add("selected-yes");
            else btn.classList.add("selected-no");
        });
    });

    // Move to step 2
    showStep("step-household");
});

/* ---------- SUBMIT ---------- */

document.getElementById("submit-btn").addEventListener("click", async () => {
    const error = document.getElementById("submit-error");
    error.textContent = "";

    const household = window.currentHousehold;
    if (!household) return;

    const guests = [];
    document.querySelectorAll(".guest-block").forEach(block => {
        const guestId = block.dataset.guest;
        const yes = block.querySelector('[data-choice="yes"]').classList.contains("selected-yes");
        const no = block.querySelector('[data-choice="no"]').classList.contains("selected-no");

        guests.push({
            id: guestId,
            attending: yes ? true : no ? false : null
        });
    });

    const dinnerYes = document.getElementById("dinner-yes").classList.contains("selected-yes");
    const dinnerNo = document.getElementById("dinner-no").classList.contains("selected-no");

    const dinner = dinnerYes ? true : dinnerNo ? false : null;

    const res = await fetch(`${API_BASE}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            householdId: household.id,
            guests,
            dinner
        })
    });

    const data = await res.json();

    if (data.error) {
        error.textContent = data.error;
        return;
    }

    showStep("step-success");
});
