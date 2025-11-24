const API_BASE = "https://wedding-rsvp-backend-rho.vercel.app/api";
const email = document.getElementById("email-input").value.trim();

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

    /* ----- Render guests ----- */

    const guestsContainer = document.getElementById("guests-container");
    guestsContainer.innerHTML = "";

    data.guests.forEach(g => {
        const first = g.name.split(" ")[0];
        const last = g.name.split(" ").slice(1).join(" ");

        guestsContainer.innerHTML += `
            <div class="guest-block" data-guest="${g.id}" data-name="${g.name}">

                <div class="guest-left">
                    <div class="guest-first">${first}</div>
                    <div class="guest-last">${last}</div>
                </div>

                <div class="guest-right">

                <div class="sub-question">Will you attend the Welcome Dinner on April 25th, 2026?</div>
                    <div class="choice-row welcome-row">
                        <button class="choice-btn" data-type="welcome" data-choice="yes">Yes</button>
                        <button class="choice-btn" data-type="welcome" data-choice="no">No</button>
                    </div>

                    <div class="sub-question">Will you attend the wedding?</div>
                    <div class="choice-row wedding-row">
                        <button class="choice-btn" data-type="wedding" data-choice="yes">Yes</button>
                        <button class="choice-btn" data-type="wedding" data-choice="no">No</button>
                    </div>

                    <div class="dinner-section hidden">
                        <div class="sub-question">What would you like for dinner?</div>
                        <div class="choice-row dinner-choice-row">
                            <button class="choice-btn" data-type="dinner" data-choice="beef">Beef Cheek</button>
                            <button class="choice-btn" data-type="dinner" data-choice="seabass">Sea Bass</button>
                            <button class="choice-btn" data-type="dinner" data-choice="fowl">Guinea Fowl</button>
                            <button class="choice-btn" data-type="dinner" data-choice="parm">Eggplant Parmesean</button>

                        </div>

                        <div class="sub-question">Allergies or dietary preferences?</div>
                        <textarea
                            class="input allergy-input"
                            rows="2"
                            placeholder="e.g. no gluten, vegetarian, no shellfish"
                        ></textarea>
                    </div>

                    

                </div>
            </div>
        `;
    });

    document.querySelectorAll(".choice-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const row = btn.parentElement;

            row.querySelectorAll(".choice-btn").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");

            if (btn.dataset.type === "wedding") {
                const block = btn.closest(".guest-block");
                const dinnerSec = block.querySelector(".dinner-section");

                if (btn.dataset.choice === "yes") {
                    dinnerSec.classList.remove("hidden");
                } else {
                    dinnerSec.classList.add("hidden");
                    dinnerSec.querySelectorAll(".choice-btn").forEach(b => b.classList.remove("selected"));
                }
            }
        });
    });

    showStep("step-household");
});

/* ---------- SUBMIT ---------- */

document.getElementById("submit-btn").addEventListener("click", async () => {
    const error = document.getElementById("submit-error");
    error.textContent = "";

    const household = window.currentHousehold;

    const email = document.getElementById("email-input").value.trim();
    const comments = document.getElementById("comments-input").value.trim();
    const responses = [];

    document.querySelectorAll(".guest-block").forEach(block => {
        const guestId = block.dataset.guest;
        const name = block.dataset.name;

        const weddingChoice = block.querySelector('.wedding-row .selected')?.dataset.choice || null;
        const dinnerChoice = block.querySelector('.dinner-choice-row .selected')?.dataset.choice || null;
        const welcomeChoice = block.querySelector('.welcome-row .selected')?.dataset.choice || null;
        const allergies = block.querySelector('.allergy-input')?.value.trim() || "";

        responses.push({
            id: guestId,
            name,
            wedding: weddingChoice,
            dinner: dinnerChoice,
            welcome: welcomeChoice,
            allergies
        });
    });


    const res = await fetch(`${API_BASE}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            householdId: household.id,
            responses,
            email: email || null,
            comments: comments || ""
        })
    });

    const data = await res.json();

    if (data.error) {
        error.textContent = data.error;
        return;
    }

    showStep("step-success");
});

