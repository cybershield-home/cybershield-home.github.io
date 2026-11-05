// DARMOWA BAZA DANYCH ONLINE DLA CYBERSHIELD (Działa 24/7 bez konta Google)
const CLOUD_URL = "https://jsonbin.io";
const MASTER_KEY = "$2a$10$7vH8b6gVvJ8Y6tO6YFqNze6zH1.8Ld9B3yA4C3f5E6g7h8i9j0k1l"; // Klucz dostępu do chmury

// Dane autoryzacyjne administratora Twojej strony
const ADM_USER = "Ignacyadm";
const ADM_PASS = "Password123@$-+";

// Globalny stan zalogowania admina
let isAdminLoggedIn = false;

// Rutowanie panelu po zmianie skrótu adresu URL (#/admin)
window.addEventListener('hashchange', checkUrlRoute);
window.addEventListener('load', () => {
    checkUrlRoute();
    loadStoredData(); // Pobieranie danych z chmury przy uruchomieniu strony
});

function checkUrlRoute() {
    if (window.location.hash === '#/admin' || window.location.pathname.endsWith('/admin')) {
        switchPage('admin');
    }
}

// Obsługa przełączania podstron menu głównego
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    document.getElementById('navLinks').classList.remove('open');
    loadStoredData();
}

// Rozwijanie mobilnego menu 3 kresek
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
}

// Logowanie użytkownika do panelu administracyjnego
function handleLogin() {
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;
    const errorMsg = document.getElementById('login-error');

    if (user === ADM_USER && pass === ADM_PASS) {
        isAdminLoggedIn = true;
        if (errorMsg) errorMsg.style.display = 'none';
        document.getElementById('admin-login-box').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        loadStoredData();
    } else {
        if (errorMsg) errorMsg.style.display = 'block';
    }
}

// Obsługa zakładek wewnątrz panelu admina
function switchAdminTab(tabId) {
    document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.remove('active-tab'));
    document.getElementById(`adm-tab-${tabId}`).classList.add('active-tab');
}

// Pobieranie danych z niezależnej chmury i renderowanie strony
function loadStoredData() {
    const showDeleteBtn = isAdminLoggedIn;

    fetch(CLOUD_URL, {
        method: 'GET',
        headers: {
            'X-Master-Key': MASTER_KEY
        }
    })
    .then(response => response.json())
    .then(resData => {
        let database = resData.record || { home: [], warnings: [], programs: [] };
        if (!database.home) database.home = [];
        if (!database.warnings) database.warnings = [];
        if (!database.programs) database.programs = [];

        // 1. Renderowanie Strony Głównej
        const homeCont = document.getElementById('home-content');
        if (homeCont) {
            if (database.home.length > 0) {
                homeCont.innerHTML = '';
                database.home.forEach((item, index) => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.onclick = () => openModal(item.title, item.text);
                    let imgUrl = item.cover || 'https://placeholder.com';
                    let htmlContent = `<img src="${imgUrl}" alt="okładka"><h3>${item.title}</h3>`;
                    if (showDeleteBtn) {
                        htmlContent += `<button class="delete-btn" onclick="event.stopPropagation(); deleteItem('home', ${index}, ${JSON.stringify(database)})">❌ Usuń kafelek</button>`;
                    }
                    card.innerHTML = htmlContent;
                    homeCont.appendChild(card);
                });
            } else {
                homeCont.innerHTML = `<p class="empty-msg">Brak wiadomości na stronie głównej.</p>`;
            }
        }
        // 2. Renderowanie Ostrzeżeń
        const warnCont = document.getElementById('warnings-content');
        const warnEmpty = document.getElementById('warn-empty');
        if (warnCont) {
            if (database.warnings.length > 0) {
                if (warnEmpty) warnEmpty.style.display = 'none';
                warnCont.innerHTML = '';
                database.warnings.forEach((item, index) => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.onclick = () => openModal(item.title, item.text);
                    let imgUrl = item.cover || 'https://placeholder.com';
                    let htmlContent = `<img src="${imgUrl}" alt="okładka"><h3>${item.title}</h3>`;
                    if (showDeleteBtn) {
                        htmlContent += `<button class="delete-btn" onclick="event.stopPropagation(); deleteItem('warnings', ${index}, ${JSON.stringify(database)})">❌ Usuń ostrzeżenie</button>`;
                    }
                    card.innerHTML = htmlContent;
                    warnCont.appendChild(card);
                });
            } else {
                warnCont.innerHTML = '';
                if (warnEmpty) warnEmpty.style.display = 'block';
            }
        }

        // 3. Renderowanie Programów
        const progCont = document.getElementById('programs-content');
        const progEmpty = document.getElementById('prog-empty');
        if (progCont) {
            if (database.programs.length > 0) {
                if (progEmpty) progEmpty.style.display = 'none';
                progCont.innerHTML = database.programs.map((item, index) => `
                    <div class="program-item">
                        <a href="${item.fileData}" download="${item.name}" class="download-link">💾 Pobierz: ${item.name}</a>
                        ${showDeleteBtn ? `<button class="delete-btn-inline" onclick="deleteItem('programs', ${index}, ${JSON.stringify(database)})">❌ Usuń plik</button>` : ''}
                    </div>
                `).join('');
            } else {
                progCont.innerHTML = '';
                if (progEmpty) progEmpty.style.display = 'block';
            }
        }
    })
    .catch(error => console.error("Błąd pobierania danych z chmury:", error));
}

// Zapisywanie zaktualizowanych danych z powrotem do chmury
function saveToCloud(updatedDatabase) {
    fetch(CLOUD_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': MASTER_KEY
        },
        body: JSON.stringify(updatedDatabase)
    })
    .then(() => loadStoredData())
    .catch(error => console.error("Błąd zapisu danych w chmurze:", error));
}

// Funkcja usuwająca wybrany wpis
function deleteItem(category, index, currentDatabase) {
    if (confirm("Czy na pewno chcesz bezpowrotnie usunąć ten element?")) {
        currentDatabase[category].splice(index, 1);
        saveToCloud(currentDatabase);
    }
}

// Pobieranie aktualnego stanu chmury przed dodaniem nowej zawartości
function getCloudDataAndAdd(callback) {
    fetch(CLOUD_URL, {
        method: 'GET',
        headers: {
            'X-Master-Key': MASTER_KEY
        }
    })
    .then(response => response.json())
    .then(resData => {
        let db = resData.record || { home: [], warnings: [], programs: [] };
        if (!db.home) db.home = [];
        if (!db.warnings) db.warnings = [];
        if (!db.programs) db.programs = [];
        callback(db);
    });
}

function addHomeCard() {
    const title = document.getElementById('home-title').value;
    const cover = document.getElementById('home-cover').value;
    const text = document.getElementById('home-text').value;
    
    if (title && text) {
        getCloudDataAndAdd((db) => {
            db.home.push({ title, cover, text });
            saveToCloud(db);
            alert('Pomyślnie dodano kafelek na Stronę Główną!');
            document.getElementById('home-title').value = '';
            document.getElementById('home-cover').value = '';
            document.getElementById('home-text').value = '';
        });
    } else {
        alert('Tytuł i treść kafelka są wymagane!');
    }
}

function addWarningCard() {
    const title = document.getElementById('warn-title').value;
    const cover = document.getElementById('warn-cover').value;
    const text = document.getElementById('warn-text').value;
    
    if (title && text) {
        getCloudDataAndAdd((db) => {
            db.warnings.push({ title, cover, text });
            saveToCloud(db);
            alert('Pomyślnie dodano nowe ostrzeżenie!');
            document.getElementById('warn-title').value = '';
            document.getElementById('warn-cover').value = '';
            document.getElementById('warn-text').value = '';
        });
    } else {
        alert('Tytuł i treść ostrzeżenia są wymagane!');
    }
}

function addProgramItem() {
    const name = document.getElementById('prog-name').value;
    const fileInput = document.getElementById('prog-file');
    
    if (name && fileInput.files.length > 0) {
        const file = fileInput.files;
        const reader = new FileReader();
        reader.onload = function(e) {
            getCloudDataAndAdd((db) => {
                const originalName = file.name;
                const extension = originalName.substring(originalName.lastIndexOf('.'));
                db.programs.push({ 
                    name: name + extension, 
                    fileData: e.target.result 
                });
                saveToFirebase(db); // Używa zapisu do chmury przez bazy powiązane
                alert('Plik został wgrany do systemu!');
                document.getElementById('prog-name').value = '';
                fileInput.value = '';
            });
        };
        reader.readAsDataURL(file);
    } else {
        alert('Wpisz nazwę oraz wybierz plik z dysku!');
    }
}

// Obsługa okna szczegółowego (Modal Popup)
function openModal(title, text) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerText = text;
    document.getElementById('modal').style.display = 'flex';
}
function closeModal() { 
    document.getElementById('modal').style.display = 'none'; 
}
