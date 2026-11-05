// Dane dostępowe administratora
const ADM_USER = "Ignacyadm";
const ADM_PASS = "Password123@$-+";

// Nasłuchiwanie dopisania /admin w adresie URL
window.addEventListener('hashchange', checkUrlRoute);
window.addEventListener('load', () => {
    checkUrlRoute();
    loadStoredData();
});

function checkUrlRoute() {
    if (window.location.hash === '#/admin' || window.location.pathname.endsWith('/admin')) {
        switchPage('admin');
    }
}

// Nawigacja stronami
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');
    document.getElementById('navLinks').classList.remove('open');
}

// Menu 3 kresek
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
}

// Logowanie do panelu
function handleLogin() {
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;
    if (user === ADM_USER && pass === ADM_PASS) {
        document.getElementById('admin-login-box').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

// Zakładki wewnątrz panelu admina
function switchAdminTab(tabId) {
    document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.remove('active-tab'));
    document.getElementById(`adm-tab-${tabId}`).classList.add('active-tab');
}

// Funkcje zapisu i odczytu bazy kafelków (localStorage)
let database = JSON.parse(localStorage.getItem('site_db')) || { home: [], warnings: [], programs: [] };

function saveData() {
    localStorage.setItem('site_db', JSON.stringify(database));
    loadStoredData();
}

function loadStoredData() {
    // Renderowanie strony głównej
    const homeCont = document.getElementById('home-content');
    homeCont.innerHTML = database.home.map(item => `
        <div class="card" onclick="openModal('${item.title}', '${item.text}')">
            <img src="${item.cover || 'https://placeholder.com'}" alt="okładka">
            <h3>${item.title}</h3>
        </div>
    `).join('');

    // Renderowanie ostrzeżeń
    const warnCont = document.getElementById('warnings-content');
    const warnEmpty = document.getElementById('warn-empty');
    if(database.warnings.length > 0) {
        warnEmpty.style.display = 'none';
        warnCont.innerHTML = database.warnings.map(item => `
            <div class="card" onclick="openModal('${item.title}', '${item.text}')">
                <img src="${item.cover || 'https://placeholder.com'}" alt="okładka">
                <h3>${item.title}</h3>
            </div>
        `).join('');
    } else { warnEmpty.style.display = 'block'; }

    // Renderowanie programów
    const progCont = document.getElementById('programs-content');
    const progEmpty = document.getElementById('prog-empty');
    if(database.programs.length > 0) {
        progEmpty.style.display = 'none';
        progCont.innerHTML = database.programs.map(item => `
            <div><a href="${item.fileData}" download="${item.name}" class="download-link">💾 Pobierz: ${item.name}</a></div>
        `).join('');
    } else { progEmpty.style.display = 'block'; }
}

// Dodawanie elementów przez Admina
function addHomeCard() {
    const title = document.getElementById('home-title').value;
    const cover = document.getElementById('home-cover').value;
    const text = document.getElementById('home-text').value;
    if(title && text) {
        database.home.push({title, cover, text});
        saveData();
        alert('Dodano kafelek!');
    }
}

function addWarningCard() {
    const title = document.getElementById('warn-title').value;
    const cover = document.getElementById('warn-cover').value;
    const text = document.getElementById('warn-text').value;
    if(title && text) {
        database.warnings.push({title, cover, text});
        saveData();
        alert('Dodano ostrzeżenie!');
    }
}

function addProgramItem() {
    const name = document.getElementById('prog-name').value;
    const fileInput = document.getElementById('prog-file');
    if(name && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            database.programs.push({ name: name + (file.name.substring(file.name.lastIndexOf('.'))), fileData: e.target.result });
            saveData();
            alert('Wgrano plik!');
        };
        reader.readAsDataURL(file);
    }
}

// Obsługa okienka Modal (wyświetlanie treści wiadomości)
function openModal(title, text) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerText = text;
    document.getElementById('modal').style.display = 'flex';
}
function closeModal() { document.getElementById('modal').style.display = 'none'; }
