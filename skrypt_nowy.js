// WSTAW tu Project URL oraz Publishable key z Supabase > Project Settings > API Keys.
// Publishable key (sb_publishable_...) jest przeznaczony do strony publicznej.
// NIGDY nie wstawiaj tutaj Secret key (sb_secret_...) ani klucza service_role.
const SUPABASE_URL = "WSTAW_TUTAJ_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "WSTAW_TUTAJ_PUBLISHABLE_KEY";

const supabaseClient =
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("WSTAW_TUTAJ") &&
    !SUPABASE_PUBLISHABLE_KEY.includes("WSTAW_TUTAJ") &&
    window.supabase
        ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
        : null;

let isAdminLoggedIn = false;
let db = { home: [], warnings: [], programs: [] };

try {
    const savedDb = JSON.parse(localStorage.getItem("cs_db") || "{}");
    // Zachowujemy dotychczasowe programy na tym urządzeniu; kafelki będą ładowane z bazy.
    db.programs = Array.isArray(savedDb.programs) ? savedDb.programs : [];
} catch (error) {
    console.warn("Nie udało się odczytać lokalnych programów.", error);
}

function checkUrlRoute() {
    const hash = window.location.hash;
    if (hash === "#/admin") switchPage("admin");
    else if (hash === "#/warnings") switchPage("warnings");
    else if (hash === "#/programs") switchPage("programs");
    else switchPage("home");
}

window.addEventListener("hashchange", checkUrlRoute);
window.addEventListener("load", initializeSite);

async function initializeSite() {
    checkUrlRoute();
    if (!supabaseClient) {
        console.error("Uzupełnij SUPABASE_URL i SUPABASE_PUBLISHABLE_KEY w skrypt_nowy.js.");
        renderAll();
        return;
    }

    const { data, error } = await supabaseClient.auth.getSession();
    if (error) console.error("Nie udało się sprawdzić sesji administratora:", error.message);
    isAdminLoggedIn = Boolean(data && data.session);
    updateAdminView();
    await loadCards();

    supabaseClient.auth.onAuthStateChange((_event, session) => {
        isAdminLoggedIn = Boolean(session);
        updateAdminView();
        renderAll();
    });
}

function switchPage(page) {
    document.querySelectorAll(".page").forEach(element => element.classList.remove("active"));
    const target = document.getElementById("page-" + page);
    if (target) target.classList.add("active");
}

function updateAdminView() {
    const loginBox = document.getElementById("admin-login-box");
    const dashboard = document.getElementById("admin-dashboard");
    if (loginBox) loginBox.style.display = isAdminLoggedIn ? "none" : "block";
    if (dashboard) dashboard.style.display = isAdminLoggedIn ? "block" : "none";
}

async function handleLogin() {
    const email = document.getElementById("admin-user").value.trim();
    const password = document.getElementById("admin-pass").value;
    const errorBox = document.getElementById("login-error");
    if (!supabaseClient) {
        errorBox.textContent = "Najpierw trzeba skonfigurować Supabase w skrypt_nowy.js.";
        errorBox.style.display = "block";
        return;
    }
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        errorBox.textContent = "Nie udało się zalogować. Sprawdź e-mail i hasło konta Supabase.";
        errorBox.style.display = "block";
        console.error("Błąd logowania:", error.message);
        return;
    }
    errorBox.style.display = "none";
    document.getElementById("admin-pass").value = "";
    isAdminLoggedIn = true;
    updateAdminView();
    renderAll();
}

async function handleLogout() {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error("Nie udało się wylogować:", error.message);
    isAdminLoggedIn = false;
    updateAdminView();
    renderAll();
}

function switchAdminTab(tab) {
    document.querySelectorAll(".admin-tab-content").forEach(element => element.classList.remove("active-tab"));
    const target = document.getElementById("adm-tab-" + tab);
    if (target) target.classList.add("active-tab");
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    })[character]);
}

function renderCards(containerId, cards, category) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = cards.map(card => `
        <div class="card" data-card-category="${category}" data-card-title="${escapeHtml(card.title)}" data-card-text="${escapeHtml(card.text)}">
            ${card.cover ? `<img src="${escapeHtml(card.cover)}" alt="">` : ""}
            <h3>${escapeHtml(card.title)}</h3>
            ${isAdminLoggedIn ? `<button type="button" data-delete-category="${category}" data-delete-id="${escapeHtml(card.id)}">❌ Usuń</button>` : ""}
        </div>
    `).join("");
}

function renderAll() {
    renderCards("home-content", db.home, "home");
    renderCards("warnings-content", db.warnings, "warnings");

    const programs = document.getElementById("programs-content");
    if (programs) {
        programs.innerHTML = db.programs.map((program, index) => `
            <div>
                <a href="${escapeHtml(program.file || "#")}" download="${escapeHtml(program.name || "plik")}" class="download-link">💾 Pobierz: ${escapeHtml(program.name || "plik")}</a>
                ${isAdminLoggedIn ? `<button type="button" data-delete-category="programs" data-delete-id="${index}">❌ Usuń</button>` : ""}
            </div>
        `).join("");
    }
}

// Obsługa kliknięć kafelków i przycisków usuwania bez wstawiania danych użytkownika do kodu JavaScript.
document.addEventListener("click", event => {
    const deleteButton = event.target.closest("[data-delete-category]");
    if (deleteButton) {
        event.stopPropagation();
        del(deleteButton.dataset.deleteCategory, deleteButton.dataset.deleteId);
        return;
    }
    const card = event.target.closest(".card[data-card-category]");
    if (card && !event.target.closest("button")) {
        openModal(card.dataset.cardTitle, card.dataset.cardText);
    }
});

async function loadCards() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
        .from("cards")
        .select("id, category, title, text, cover, created_at")
        .order("created_at", { ascending: false });
    if (error) {
        console.error("Nie udało się pobrać kafelków z Supabase:", error.message);
        return;
    }
    db.home = data.filter(card => card.category === "home");
    db.warnings = data.filter(card => card.category === "warnings");
    renderAll();
}

async function addCard(category, titleId, coverId, textId) {
    if (!supabaseClient || !isAdminLoggedIn) {
        alert("Zaloguj się na konto administratora.");
        return;
    }
    const title = document.getElementById(titleId).value.trim();
    const cover = document.getElementById(coverId).value.trim();
    const text = document.getElementById(textId).value.trim();
    if (!title || !text) {
        alert("Wpisz tytuł i treść.");
        return;
    }
    const { error } = await supabaseClient.from("cards").insert({ category, title, cover, text });
    if (error) {
        console.error("Nie udało się dodać kafelka:", error.message);
        alert("Nie udało się dodać. Sprawdź logowanie i ustawienia dostępu w Supabase.");
        return;
    }
    document.getElementById(titleId).value = "";
    document.getElementById(coverId).value = "";
    document.getElementById(textId).value = "";
    await loadCards();
    alert("Dodano pomyślnie!");
}

function addHomeCard() {
    return addCard("home", "home-title", "home-cover", "home-text");
}

function addWarningCard() {
    return addCard("warnings", "warn-title", "warn-cover", "warn-text");
}

function addProgramItem() {
    const name = document.getElementById("prog-name").value.trim();
    const fileInput = document.getElementById("prog-file").files;
    if (!name || !fileInput || fileInput.length === 0) {
        alert("Wpisz nazwę i wybierz plik.");
        return;
    }
    const reader = new FileReader();
    reader.onload = event => {
        db.programs.push({ name, file: event.target.result });
        localStorage.setItem("cs_db", JSON.stringify(db));
        renderAll();
        alert("Wgrano pomyślnie na tym urządzeniu. Programy nie są jeszcze synchronizowane z Supabase.");
        document.getElementById("prog-name").value = "";
        document.getElementById("prog-file").value = "";
    };
    reader.readAsDataURL(fileInput[0]);
}

async function del(category, id) {
    if (!isAdminLoggedIn || !confirm("Usunąć na stałe?")) return;
    if (category === "programs") {
        db.programs.splice(Number(id), 1);
        localStorage.setItem("cs_db", JSON.stringify(db));
        renderAll();
        return;
    }
    const { error } = await supabaseClient.from("cards").delete().eq("id", id);
    if (error) {
        console.error("Nie udało się usunąć kafelka:", error.message);
        alert("Nie udało się usunąć kafelka. Sprawdź ustawienia dostępu w Supabase.");
        return;
    }
    await loadCards();
}

function openModal(title, body) {
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-body").innerText = body;
    document.getElementById("modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

function toggleMenu() {
    document.getElementById("navLinks").classList.toggle("open");
}
