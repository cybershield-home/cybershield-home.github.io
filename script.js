// Dane autoryzacyjne administratora
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

// Zarządzanie lokalną bazą danych przeglądarki (localStorage)
let database = JSON.parse(localStorage.getItem('site_db')) || { home: [], warnings: [], programs: [] };

function saveData() {
    localStorage.setItem('site_db', JSON.stringify(database));
    loadStoredData();
}

// Dynamiczne renderowanie elementów na podstronach użytkowników i admina
function loadStoredData() {
    const showDeleteBtn = isAdminLoggedIn;

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
                    htmlContent += `<button class="delete-btn" onclick="event.stopPropagation(); deleteItem('home', ${index})">❌ Usuń kafelek</button>`;
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
                    htmlContent += `<button class="delete-btn" onclick="event.stopPropagation(); deleteItem('warnings', ${index})">❌ Usuń ostrzeżenie</button>`;
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
                    ${showDeleteBtn ? `<button class="delete-btn-inline" onclick="deleteItem('programs', ${index})">❌ Usuń plik</button>` : ''}
                </div>
            `).join('');
        } else {
            progCont.innerHTML = '';
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

// Formularze administratora: Dodawanie treści
function addHomeCard() {
    const title = document.getElementById('home-title').value;
    const cover = document.getElementById('home-cover').value;
    const text = document.getElementById('home-text').value;
    if (title && text) {
        database.home.push({ title, cover, text });
        saveData();
        alert('Pomyślnie dodano kafelek na Stronę Główną!');
        document.getElementById('home-title').value = '';
        document.getElementById('home-cover').value = '';
        document.getElementById('home-text').value = '';
    } else {
        alert('Tytuł i treść kafelka są wymagane!');
    }
}

function addWarningCard() {
    const title = document.getElementById('warn-title').value;
    const cover = document.getElementById('warn-cover').value;
    const text = document.getElementById('warn-text').value;
    if (title && text) {
        database.warnings.push({ title, cover, text });
        saveData();
        alert('Pomyślnie dodano nowe ostrzeżenie!');
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
            const originalName = file.name;
            const extension = originalName.substring(originalName.lastIndexOf('.'));
            database.programs.push({ 
                name: name + extension, 
                fileData: e.target.result 
            });
            saveData();
            alert('Plik został wgrany do systemu!');
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
