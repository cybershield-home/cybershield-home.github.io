const ADM_USER = "Ignacyadm";
const ADM_PASS = "Password123@$-+";
let isAdminLoggedIn = false;

// Funkcja pobierająca bazę danych bezpośrednio z Twojego pliku na GitHubie
let db = { home: [], warnings: [], programs: [] };

window.addEventListener('hashchange', () => {
    if (window.location.hash === '#/admin') switchPage('admin');
});
window.addEventListener('load', () => {
    if (window.location.hash === '#/admin') switchPage('admin');
    fetchDataFromGitHub();
});

function fetchDataFromGitHub() {
    fetch('dane.json')
        .then(response => response.json())
        .then(data => {
            db = data;
            renderAll();
        })
        .catch(err => {
            console.log("Ładowanie z pamięci lokalnej (brak pliku dane.json)");
            db = JSON.parse(localStorage.getItem('cs_db')) || { home: [], warnings: [], programs: [] };
            renderAll();
        });
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
    const h = document.getElementById('home-content');
    if (h) {
        h.innerHTML = (db.home || []).map((x, i) => `
            <div class="card" onclick="openModal('${x.title}', '${x.text}')">
                <img src="${x.cover}">
                <h3>${x.title}</h3>
                ${isAdminLoggedIn ? `<button onclick="event.stopPropagation(); del('home', ${i})">Usuń</button>` : ''}
            </div>
        `).join('');
    }

    const w = document.getElementById('warnings-content');
    if (w) {
        w.innerHTML = (db.warnings || []).map((x, i) => `
            <div class="card" onclick="openModal('${x.title}', '${x.text}')">
                <img src="${x.cover}">
                <h3>${x.title}</h3>
                ${isAdminLoggedIn ? `<button onclick="event.stopPropagation(); del('warnings', ${i})">Usuń</button>` : ''}
            </div>
        `).join('');
    }

    const p = document.getElementById('programs-content');
    if (p) {
        p.innerHTML = (db.programs || []).map((x, i) => `
            <div>
                <a href="${x.file}" download="${x.name}" class="download-link">💾 Pobierz: ${x.name}</a>
                ${isAdminLoggedIn ? `<button onclick="del('programs', ${i})">Usuń</button>` : ''}
            </div>
        `).join('');
    }
}

function addHomeCard() {
    const title = document.getElementById('home-title').value;
    const cover = document.getElementById('home-cover').value;
    const text = document.getElementById('home-text').value;
    db.home.push({ title, cover, text });
    showExportData();
}

function addWarningCard() {
    const title = document.getElementById('warn-title').value;
    const cover = document.getElementById('warn-cover').value;
    const text = document.getElementById('warn-text').value;
    db.warnings.push({ title, cover, text });
    showExportData();
}

function addProgramItem() {
    const name = document.getElementById('prog-name').value;
    const fileInput = document.getElementById('prog-file').files[0];
    if (fileInput) {
        const r = new FileReader();
        r.onload = function(e) {
            db.programs.push({ name, file: e.target.result });
            showExportData();
        };
        r.readAsDataURL(fileInput);
    }
}

function del(cat, i) {
    db[cat].splice(i, 1);
    showExportData();
}

// Ta funkcja wygeneruje gotowy kod do wklejenia na GitHuba
function showExportData() {
    renderAll();
    const finalJson = JSON.stringify(db, null, 2);
    
    // Tworzy okienko z kodem, który kopiujesz i wklejasz do pliku dane.json na GitHubie
    const promptWindow = window.open("", "_blank");
    promptWindow.document.write("<h3>ZAPISANO W PRZEGLĄDARCE!</h3><p>Aby posty zapisały się na stałe i były widoczne na telefonie, skopiuj poniższy tekst i wklej go do swojego pliku <b>dane.json</b> na GitHubie:</p><textarea style='width:100%;height:300px;'>" + finalJson + "</textarea>");
}

function openModal(t, b) {
    document.getElementById('modal-title').innerText = t;
    document.getElementById('modal-body').innerText = b;
    document.getElementById('modal').style.display = 'flex';
}
function closeModal() { document.getElementById('modal').style.display = 'none'; }
function toggleMenu() { document.getElementById('navLinks').classList.toggle('open'); }
