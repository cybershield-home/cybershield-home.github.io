// DARMOWA BAZA DANYCH ONLINE DLA CYBERSHIELD (W 100% AUTOMATYCZNA)
const BIN_ID = "055683b86267962bca57";
const CLOUD_URL = `https://npoint.io{BIN_ID}`;

const ADM_USER = "Ignacyadm";
const ADM_PASS = "Password123@$-+";
let isAdminLoggedIn = false;
let db = { home: [], warnings: [], programs: [] };

window.addEventListener('hashchange', () => {
    if (window.location.hash === '#/admin') switchPage('admin');
});
window.addEventListener('load', () => {
    if (window.location.hash === '#/admin') switchPage('admin');
    loadFromCloud();
});

function loadFromCloud() {
    fetch(CLOUD_URL)
        .then(res => res.json())
        .then(data => {
            db = data || { home: [], warnings: [], programs: [] };
            renderAll();
        })
        .catch(err => console.error("Błąd pobierania danych:", err));
}

function saveToCloud() {
    fetch(CLOUD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db)
    })
    .then(() => {
        loadFromCloud();
    })
    .catch(err => console.error("Błąd zapisu w chmurze:", err));
}

function switchPage(p) {
    document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
    document.getElementById('page-' + p).classList.add('active');
}

function handleLogin() {
    if (document.getElementById('admin-user').value === ADM_USER && document.getElementById('admin-pass').value === ADM_PASS) {
        isAdminLoggedIn = true;
        document.getElementById('admin-login-box').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        renderAll();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}
function switchAdminTab(t) {
    document.querySelectorAll('.admin-tab-content').forEach(x => x.classList.remove('active-tab'));
    document.getElementById('adm-tab-' + t).classList.add('active-tab');
}

function renderAll() {
    const showDeleteBtn = isAdminLoggedIn;

    const h = document.getElementById('home-content');
    if (h) {
        h.innerHTML = (db.home || []).map((x, i) => `
            <div class="card" onclick="openModal('${x.title ? x.title.replace(/'/g, "\\'") : ''}', '${x.text ? x.text.replace(/'/g, "\\'") : ''}')">
                <img src="${x.cover || ''}">
                <h3>${x.title || ''}</h3>
                ${showDeleteBtn ? `<button onclick="event.stopPropagation(); del('home', ${i})">❌ Usuń</button>` : ''}
            </div>
        `).join('');
    }

    const w = document.getElementById('warnings-content');
    if (w) {
        w.innerHTML = (db.warnings || []).map((x, i) => `
            <div class="card" onclick="openModal('${x.title ? x.title.replace(/'/g, "\\'") : ''}', '${x.text ? x.text.replace(/'/g, "\\'") : ''}')">
                <img src="${x.cover || ''}">
                <h3>${x.title || ''}</h3>
                ${showDeleteBtn ? `<button onclick="event.stopPropagation(); del('warnings', ${i})">❌ Usuń</button>` : ''}
            </div>
        `).join('');
    }

    const p = document.getElementById('programs-content');
    if (p) {
        p.innerHTML = (db.programs || []).map((x, i) => `
            <div>
                <a href="${x.file || '#'}" download="${x.name || 'plik'}" class="download-link">💾 Pobierz: ${x.name || 'plik'}</a>
                ${showDeleteBtn ? `<button onclick="event.stopPropagation(); del('programs', ${i})">❌ Usuń</button>` : ''}
            </div>
        `).join('');
    }
}

function addHomeCard() {
    const title = document.getElementById('home-title').value;
    let cover = document.getElementById('home-cover').value;
    const text = document.getElementById('home-text').value;
    
    cover = cover.replace(/\\/g, ''); // Czyszczenie linku z błędnych ukośników czatu

    if(title && text) {
        if(!db.home) db.home = [];
        db.home.push({ title, cover, text });
        saveToCloud();
        alert('Dodano pomyślnie do chmury!');
        document.getElementById('home-title').value = '';
        document.getElementById('home-cover').value = '';
        document.getElementById('home-text').value = '';
    }
}

function addWarningCard() {
    const title = document.getElementById('warn-title').value;
    let cover = document.getElementById('warn-cover').value;
    const text = document.getElementById('warn-text').value;
    
    cover = cover.replace(/\\/g, '');

    if(title && text) {
        if(!db.warnings) db.warnings = [];
        db.warnings.push({ title, cover, text });
        saveToCloud();
        alert('Dodano pomyślnie do chmury!');
        document.getElementById('warn-title').value = '';
        document.getElementById('warn-cover').value = '';
        document.getElementById('warn-text').value = '';
    }
}

function addProgramItem() {
    const name = document.getElementById('prog-name').value;
    const fileInput = document.getElementById('prog-file').files;
    
    if (name && fileInput && fileInput.length > 0) {
        const file = fileInput[0];
        const r = new FileReader();
        r.onload = function(e) {
            if(!db.programs) db.programs = [];
            db.programs.push({ name: name, file: e.target.result });
            saveToCloud();
            alert('Program wgrany pomyślnie!');
            document.getElementById('prog-name').value = '';
            document.getElementById('prog-file').value = '';
        };
        r.readAsDataURL(file);
    } else {
        alert('Wpisz nazwę i wybierz plik!');
    }
}

function del(cat, i) {
    if(confirm("Usunąć ten element na stałe?")) {
        db[cat].splice(i, 1);
        saveToCloud();
    }
}

function openModal(t, b) {
    document.getElementById('modal-title').innerText = t;
    document.getElementById('modal-body').innerText = b;
    document.getElementById('modal').style.display = 'flex';
}
function closeModal() { document.getElementById('modal').style.display = 'none'; }
function toggleMenu() { document.getElementById('navLinks').classList.toggle('open'); }
