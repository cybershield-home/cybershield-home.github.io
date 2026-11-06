const ADM_USER = "Ignacyadm";
const ADM_PASS = "Password123@$-+";
let isAdminLoggedIn = false;

function checkUrlRoute() {
    const hash = window.location.hash;
    if (hash === '#/admin') {
        switchPage('admin');
    } else if (hash === '#/warnings') {
        switchPage('warnings');
    } else if (hash === '#/programs') {
        switchPage('programs');
    } else {
        switchPage('home');
    }
}

window.addEventListener('hashchange', checkUrlRoute);
window.addEventListener('load', () => {
    checkUrlRoute();
    renderAll();
});

function switchPage(p) {
    document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
    const target = document.getElementById('page-' + p);
    if (target) {
        target.classList.add('active');
    }
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

let db = JSON.parse(localStorage.getItem('cs_db')) || { home: [], warnings: [], programs: [] };

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
    
    cover = cover.replace(/\\/g, '');

    if(title && text) {
        if(!db.home) db.home = [];
        db.home.push({ title, cover, text });
        localStorage.setItem('cs_db', JSON.stringify(db));
        renderAll();
        alert('Dodano pomyślnie!');
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
        localStorage.setItem('cs_db', JSON.stringify(db));
        renderAll();
        alert('Dodano pomyślnie!');
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
            localStorage.setItem('cs_db', JSON.stringify(db));
            renderAll();
            alert('Wgrano pomyślnie!');
            document.getElementById('prog-name').value = '';
            document.getElementById('prog-file').value = '';
        };
        r.readAsDataURL(file);
    }
}

function del(cat, i) {
    if(confirm("Usunąć na stałe?")) {
        db[cat].splice(i, 1);
        localStorage.setItem('cs_db', JSON.stringify(db));
        renderAll();
    }
}

function openModal(t, b) {
    document.getElementById('modal-title').innerText = t;
    document.getElementById('modal-body').innerText = b;
    document.getElementById('modal').style.display = 'flex';
}
function closeModal() { document.getElementById('modal').style.display = 'none'; }
function toggleMenu() { document.getElementById('navLinks').classList.toggle('open'); }
