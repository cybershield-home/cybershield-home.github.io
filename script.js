// Dane autoryzacyjne administratora Twojej strony
const ADM_USER = "Ignacyadm";
const ADM_PASS = "Password123@$-+";

// Globalny stan zalogowania admina
let isAdminLoggedIn = false;

// Rutowanie panelu po zmianie skrótu adresu URL (#/admin)
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

// Pobieranie danych z lokalnej pamięci
let database = { home: [], warnings: [], programs: [] };

if(localStorage.getItem('cybershield_local_db')) {
    database = JSON.parse(localStorage.getItem('cybershield_local_db'));
}

function saveData() {
    localStorage.setItem('cybershield_local_db', JSON.stringify(database));
    loadStoredData();
    showBackupData();
}

function showBackupData() {
    const backupText = JSON.stringify(database, null, 2);
    alert("ZAPISANO POMYŚLNIE!\n\nSkopiuj ten tekst i wklej go do pliku 'dane.json' na GitHubie, aby działał też na innych urządzeniach:\n\n" + backupText);
}

// Dynamiczne renderowanie elementów na podstronach
function loadStoredData() {
    const showDeleteBtn = isAdminLoggedIn;

    // 1. Renderowanie Strony Głównej
    const homeCont = document.getElementById('home-content');
    if (homeCont) {
        homeCont.innerHTML = '';
        if (database.home && database.home.length > 0) {
            database.home.forEach((item, index) => {
                const card = document.createElement('div');
                card.className = 'card';
                card.onclick = () => openModal(item.title, item.text);
                
                let imgUrl = item.cover || 'https://placeholder.com';
                
                // Bezpieczne wstrzykiwanie czystego tekstu bez psucia struktury HTML
                const imgNode = document.createElement('img');
                imgNode.src = imgUrl;
                imgNode.alt = "okładka";
                
                const titleNode = document.createElement('h3');
                titleNode.innerText = item.title;
                
                card.appendChild(imgNode);
                card.appendChild(titleNode);
                
                if (showDeleteBtn) {
                    const btn = document.createElement('button');
                    btn.className = 'delete-btn';
                    btn.innerText = '❌ Usuń kafelek';
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        deleteItem('home', index);
                    };
                    card.appendChild(btn);
                }
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
            warnCont.innerHTML = '';
            if (database.warnings && database.warnings.length > 0) {
                if (warnEmpty) warnEmpty.style.display = 'none';
                database.warnings.forEach((item, index) => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.onclick = () => openModal(item.title, item.text);
                    
                    let imgUrl = item.cover || 'https://placeholder.com';
                    
                    const imgNode = document.createElement('img');
                    imgNode.src = imgUrl;
                    imgNode.alt = "okładka";
                    
                    const titleNode = document.createElement('h3');
                    titleNode.innerText = item.title;
                    
                    card.appendChild(imgNode);
                    card.appendChild(titleNode);
                    
                    if (showDeleteBtn) {
                        const btn = document.createElement('button');
                        btn.className = 'delete-btn';
                        btn.innerText = '❌ Usuń ostrzeżenie';
                        btn.onclick = (e) => {
                            e.stopPropagation();
                            deleteItem('warnings', index);
                        };
                        card.appendChild(btn);
                    }
                    warnCont.appendChild(card);
                });
            } else {
                if (warnEmpty) warnEmpty.style.display = 'block';
            }
        }

        // 3. Renderowanie Programów
        const progCont = document.getElementById('programs-content');
        const progEmpty = document.getElementById('prog-empty');
        if (progCont) {
            progCont.innerHTML = '';
            if (database.programs && database.programs.length > 0) {
                if (progEmpty) progEmpty.style.display = 'none';
                database.programs.forEach((item, index) => {
                    const div = document.createElement('div');
                    div.className = 'program-item';
                    
                    const a = document.createElement('a');
                    a.href = item.fileData;
                    a.download = item.name;
                    a.className = 'download-link';
                    a.innerText = `💾 Pobierz: ${item.name}`;
                    
                    div.appendChild(a);
                    
                    if (showDeleteBtn) {
                        const btn = document.createElement('button');
                        btn.className = 'delete-btn-inline';
                        btn.innerText = '❌ Usuń plik';
                        btn.onclick = () => deleteItem('programs', index);
                        div.appendChild(btn);
                    }
                    progCont.appendChild(div);
                });
            } else {
                if (progEmpty) progEmpty.style.display = 'block';
            }
        }
}

// Funkcja usuwająca wybrany wpis
function deleteItem(category, index) {
    if (confirm("Czy na pewno chcesz bezpowrotnie usunąć ten element?")) {
        database[category].splice(index, 1);
        saveData();
    }
}

function addHomeCard() {
    const title = document.getElementById('home-title').value;
    let cover = document.getElementById('home-cover').value;
    const text = document.getElementById('home-text').value;
    
    // Oczyszczanie linku z ewentualnych ukośników ucieczki dodawanych przez komunikatory
    cover = cover.replace(/\\/g, '');

    if (title && text) {
        if(!database.home) database.home = [];
        database.home.push({ title, cover, text });
        saveData();
        document.getElementById('home-title').value = '';
        document.getElementById('home-cover').value = '';
        document.getElementById('home-text').value = '';
    } else {
        alert('Tytuł i treść kafelka są wymagane!');
    }
}

function addWarningCard() {
    const title = document.getElementById('warn-title').value;
    let cover = document.getElementById('warn-cover').value;
    const text = document.getElementById('warn-text').value;
    
    cover = cover.replace(/\\/g, '');

    if (title && text) {
        if(!database.warnings) database.warnings = [];
        database.warnings.push({ title, cover, text });
        saveData();
        document.getElementById('warn-title').value = '';
        document.getElementById('warn-cover').value = '';
        document.getElementById('warn-text').value = '';
    } else {
        alert('Tytuł i treść ostrzeżenia są wymagane!');
    }
}

function addProgramItem() {
    const name = document.getElementById('prog-name').value;
    const fileInput = document.getElementById('prog-file');
    
    if (name && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            if(!database.programs) database.programs = [];
            const originalName = file.name;
            const extension = originalName.substring(originalName.lastIndexOf('.'));
            database.programs.push({ 
                name: name + extension, 
                fileData: e.target.result 
            });
            saveData();
            document.getElementById('prog-name').value = '';
            fileInput.value = '';
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
