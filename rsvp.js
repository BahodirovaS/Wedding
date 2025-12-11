const API_BASE = "https://wedding-rsvp-backend-rho.vercel.app/api";

function showStep(id) {
    document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

/* ----------
 * SEARCH
 * ---------- */
document.getElementById("search-btn").addEventListener("click", async () => {
    const input = document.getElementById("search-input");
    const error = document.getElementById("search-error");
    error.textContent = "";

    const raw = input.value.trim();

    if (!raw) {
        error.textContent = "Please enter a name.";
        return;
    }
    const parts = raw.split(/\s+/);
    if (parts.length < 2) {
        error.textContent = "Please enter both first and last name.";
        return;
    }

    const res = await fetch(`${API_BASE}/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: raw })
    });

    const data = await res.json();
    if (data.error) {
        error.textContent = data.error;
        return;
    }

    window.currentHousehold = data;

    const guestsContainer = document.getElementById("guests-container");
    guestsContainer.innerHTML = "";

    /* ---------------------
     * RENDER GUEST BLOCKS
     * --------------------- */
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

                    <div class="sub-question">Will you attend the Welcome Dinner on April 25th?</div>
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
                        <div class="sub-question">Dinner preference</div>
                        <div class="choice-row dinner-choice-row">
                            <button class="choice-btn" data-type="dinner" data-choice="beef">Beef Fillet</button>
                            <button class="choice-btn" data-type="dinner" data-choice="seabass">Sea Bass</button>
                            <button class="choice-btn" data-type="dinner" data-choice="vegetarian">Vegetarian</button>
                        </div>

                        <div class="sub-question">Allergies or dietary needs?</div>
                        <textarea class="input allergy-input" rows="2"
                            placeholder="e.g. vegetarian, gluten-free"></textarea>
                    </div>

                </div>
            </div>
        `;
    });

    /* ------------------------
     * BUTTON SELECT LOGIC
     * ------------------------ */
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
                    block.querySelector(".allergy-input").value = "";
                }
            }
        });
    });

    /* --------------------------------------
     * PREFILL EXISTING RESPONSES
     * -------------------------------------- */
    if (data.existingResponses) {
        data.existingResponses.forEach(saved => {
            const block = document.querySelector(`.guest-block[data-guest="${saved.id}"]`);
            if (!block) return;

            if (saved.welcome) {
                const btn = block.querySelector(`.welcome-row [data-choice="${saved.welcome}"]`);
                if (btn) btn.classList.add("selected");
            }

            if (saved.wedding) {
                const btn = block.querySelector(`.wedding-row [data-choice="${saved.wedding}"]`);
                if (btn) btn.classList.add("selected");

                if (saved.wedding === "yes") {
                    const dinnerSec = block.querySelector(".dinner-section");
                    dinnerSec.classList.remove("hidden");
                }
            }

            if (saved.dinner) {
                const btn = block.querySelector(`.dinner-choice-row [data-choice="${saved.dinner}"]`);
                if (btn) btn.classList.add("selected");
            }

            if (saved.allergies) {
                block.querySelector(".allergy-input").value = saved.allergies;
            }
        });

        if (data.existingEmail) {
            document.getElementById("email-input").value = data.existingEmail;
        }
        if (data.existingComments) {
            document.getElementById("comments-input").value = data.existingComments;
        }
    }

    showStep("step-household");
});

/* ------------
 * SUBMIT
 * ----------- */
document.getElementById("submit-btn").addEventListener("click", async () => {
    const error = document.getElementById("submit-error");
    error.textContent = "";

    const household = window.currentHousehold;

    const email = document.getElementById("email-input").value.trim();
    if (!email) {
        error.textContent = "Please enter your email so we can send confirmation.";
        return;
    }

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
            email,
            comments
        })
    });

    const data = await res.json();

    if (data.error) {
        error.textContent = data.error;
        return;
    }

    showStep("step-success");
});
