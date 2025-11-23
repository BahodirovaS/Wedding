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
        body: JSON.stringify({ name: input.value })
    });

    const data = await res.json();

    if (data.error) {
        error.textContent = data.error;
        return;
    }

    window.currentHousehold = data;

    document.getElementById("household-name").textContent = data.id;

    const guestsContainer = document.getElementById("guests-container");
    guestsContainer.innerHTML = "";

    data.guests.forEach(g => {
        guestsContainer.innerHTML += `
            <div class="guest-block" data-guest="${g.id}" data-name="${g.name}">
                <div class="guest-left">
                    <div class="guest-first">${g.name.split(" ")[0]}</div>
                    <div class="guest-last">${g.name.split(" ").slice(1).join(" ")}</div>
                </div>

                <div class="guest-right">
                    <div class="sub-question">Will you attend the wedding?</div>
                    <div class="choice-row attend-row">
                        <button class="choice-btn" data-type="wedding" data-choice="yes">Yes</button>
                        <button class="choice-btn" data-type="wedding" data-choice="no">No</button>
                    </div>

                    <div class="dinner-section hidden">
                        <div class="sub-question">What would you like for dinner?</div>
                        <div class="choice-row dinner-choice-row">
                            <button class="choice-btn" data-type="dinner" data-choice="beef">Beef Cheek</button>
                            <button class="choice-btn" data-type="dinner" data-choice="seabass">Sea Bass</button>
                            <button class="choice-btn" data-type="dinner" data-choice="fowl">Guinea Fowl</button>
                        </div>
                    </div>

                    <div class="sub-question welcome-sub">
                        Will you attend the welcome dinner on April 25th, 2026?
                    </div>
                    <div class="choice-row welcome-row">
                        <button class="choice-btn" data-type="welcome" data-choice="yes">Yes</button>
                        <button class="choice-btn" data-type="welcome" data-choice="no">No</button>
                    </div>
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
            const parentRow = btn.parentElement;

            // Clear previous selection in that row
            parentRow.querySelectorAll(".choice-btn")
                .forEach(b => b.classList.remove("selected-yes", "selected-no"));

            // Apply new selection
            if (btn.dataset.choice === "yes") {
                btn.classList.add("selected-yes");
            } else {
                btn.classList.add("selected-no");
            }
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

    const responses = [];

        document.querySelectorAll(".guest-block").forEach(block => {
        const guestId = block.dataset.guest;
        const name = block.dataset.name;

        const weddingYes = block
            .querySelector('[data-type="wedding"][data-choice="yes"]')
            ?.classList.contains("selected-yes");
        const weddingNo = block
            .querySelector('[data-type="wedding"][data-choice="no"]')
            ?.classList.contains("selected-no");

        const dinnerOption = block.querySelector(".dinner-choice-row .selected-option");
        const dinner = dinnerOption ? dinnerOption.dataset.choice : null;

        const welcomeYes = block
            .querySelector('[data-type="welcome"][data-choice="yes"]')
            ?.classList.contains("selected-yes");
        const welcomeNo = block
            .querySelector('[data-type="welcome"][data-choice="no"]')
            ?.classList.contains("selected-no");

        responses.push({
            id: guestId,
            name,
            wedding: weddingYes ? true : weddingNo ? false : null,
            dinner,                     // "beef" | "seabass" | "fowl" | null
            welcomeDinner: welcomeYes ? true : welcomeNo ? false : null
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
            responses
        })
    });


    const data = await res.json();

    if (data.error) {
        error.textContent = data.error;
        return;
    }

    showStep("step-success");
});
