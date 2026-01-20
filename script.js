/* Version: #13 */

// === GLOBALE KONSTANTER OG STATE ===
const AppState = {
    currentView: 'view-home',
    isNightMode: false,
    userLevel: 'standard',
    currentMarchStep: 'M',
    version: '1.0.13',
    patientData: {
        startTime: null,
        tourniquets: [], // { id, location, startTime, formattedTime }
        respirationRate: null,
        consciousness: null,
        interventions: []
    }
};

// === DOM ELEMENTER ===
const body = document.body;
const debugLogContent = document.getElementById('debug-log-content');
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');
const fieldDynamicContent = document.getElementById('field-dynamic-content');

// === LOGGING SYSTEM ===
function sysLog(message, level = 'INFO') {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;
    console.log(formattedMessage);
    if (debugLogContent) {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${level.toLowerCase()}`;
        logEntry.textContent = formattedMessage;
        debugLogContent.prepend(logEntry);
    }
}

// === HJELPEFUNKSJONER ===
function formatDuration(startTime) {
    if (!startTime) return "0:00";
    const now = new Date();
    const diff = Math.floor((now - startTime) / 1000);
    const min = Math.floor(diff / 60);
    const sec = diff % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

// === TOURNIQUET LOGIKK ===
window.addTourniquet = function(location) {
    const now = new Date();
    const id = Date.now();
    
    const newTQ = {
        id: id,
        location: location,
        startTime: now,
        formattedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    AppState.patientData.tourniquets.push(newTQ);
    sysLog(`TOURNIQUET PÅSATT: ${location} kl. ${newTQ.formattedTime}`, 'WARN');
    
    renderMarchStep('M');
};

// Timer-oppdatering (kjører i bakgrunnen)
setInterval(() => {
    const timerDisplays = document.querySelectorAll('.tq-duration');
    timerDisplays.forEach(display => {
        const id = display.getAttribute('data-tq-id');
        const tq = AppState.patientData.tourniquets.find(t => t.id == id);
        if (tq) {
            display.textContent = formatDuration(tq.startTime);
        }
    });
}, 1000);

// === MARCH MOTOR ===
function renderMarchStep(step) {
    AppState.currentMarchStep = step;
    sysLog(`Renderer MARCH steg: ${step} (${AppState.userLevel})`);

    // Oppdater stepper-prikker
    const dots = document.querySelectorAll('#march-stepper-dots .dot');
    dots.forEach(dot => {
        dot.classList.toggle('active', dot.getAttribute('data-step') === step);
    });

    const targetContainer = document.getElementById('field-dynamic-content');
    if (!targetContainer) {
        sysLog("FEIL: Fant ikke field-dynamic-content container!", "ERROR");
        return;
    }

    let html = '';

    if (step === 'M') {
        html = `
            <div class="march-card">
                <h3 class="step-title">MASSIVE HEMORRHAGE</h3>
                <p class="step-instruction">Stans store blødninger umiddelbart!</p>
                
                <div class="procedure-image-container">
                    <img src="image/tourniquet.png" alt="Instruksjon" class="procedure-img" onerror="this.parentElement.innerHTML='<p style=padding:20px;color:red;>Bilde ikke funnet: image/tourniquet.png</p>'">
                    <p class="img-caption">Instruksjon: High and Tight</p>
                </div>

                <div class="tq-selection-grid">
                    <button class="tq-btn" onclick="addTourniquet('Høyre Arm')">H. ARM</button>
                    <button class="tq-btn" onclick="addTourniquet('Venstre Arm')">V. ARM</button>
                    <button class="tq-btn" onclick="addTourniquet('Høyre Bein')">H. BEIN</button>
                    <button class="tq-btn" onclick="addTourniquet('Venstre Bein')">V. BEIN</button>
                </div>

                <div id="active-tourniquets">
                    ${AppState.patientData.tourniquets.length > 0 ? '<p class="list-label">AKTIVE TOURNIQUETER:</p>' : ''}
                    ${AppState.patientData.tourniquets.map(tq => `
                        <div class="tq-status-card">
                            <span class="tq-loc">${tq.location}</span>
                            <span class="tq-start">Satt: ${tq.formattedTime}</span>
                            <span class="tq-duration" data-tq-id="${tq.id}">0:00</span>
                        </div>
                    `).join('')}
                </div>

                ${AppState.userLevel === 'advanced' ? `
                    <div class="advanced-section">
                        <p class="adv-label">AVANSERT TILTAK:</p>
                        <button class="march-action-btn secondary" onclick="sysLog('Sårpakking logget')">SÅRPAKKING / TRYKK</button>
                    </div>
                ` : ''}

                <button class="next-step-btn" onclick="renderMarchStep('A')">NESTE: AIRWAY (A) →</button>
            </div>
        `;
    } else if (step === 'A') {
        html = `
            <div class="march-card">
                <h3 class="step-title">AIRWAY (A)</h3>
                <div class="check-list">
                    <label class="check-item"><input type="checkbox"> Snakker pasienten?</label>
                    <label class="check-item"><input type="checkbox"> Sjekk munn/svelg</label>
                </div>
                <button class="march-action-btn" onclick="sysLog('Sideleie utført')">STABILT SIDELEIE</button>
                <div class="nav-buttons">
                    <button class="back-step-btn" onclick="renderMarchStep('M')">← TILBAKE</button>
                    <button class="next-step-btn" onclick="renderMarchStep('R')">NESTE: RESPIRATION (R) →</button>
                </div>
            </div>
        `;
    } else {
        html = `<div class="march-card"><h3>Steg ${step}</h3><p>Kommer snart...</p><button class="back-step-btn" onclick="renderMarchStep('M')">← TILBAKE</button></div>`;
    }

    targetContainer.innerHTML = html;
}

// === NAVIGASJONS-LOGIKK ===
function switchView(viewId) {
    sysLog(`Navigerer til: ${viewId}`);
    
    let found = false;
    views.forEach(v => {
        if (v.id === viewId) {
            v.classList.add('active');
            found = true;
        } else {
            v.classList.remove('active');
        }
    });

    if (!found) {
        sysLog(`Kritisk feil: Visning ${viewId} finnes ikke!`, "ERROR");
        return;
    }

    navItems.forEach(i => i.classList.toggle('active', i.getAttribute('data-target') === viewId));
    AppState.currentView = viewId;

    if (viewId === 'view-field') {
        startMarchSession();
    }
}

function startMarchSession() {
    if (!AppState.patientData.startTime) {
        AppState.patientData.startTime = new Date();
        sysLog("Ny pasientbehandling startet.");
    }
    renderMarchStep('M');
}

// === GLOBALE FUNKSJONER ===
function setLevel(level) {
    AppState.userLevel = level;
    const btnStd = document.getElementById('btn-level-standard');
    const btnAdv = document.getElementById('btn-level-advanced');
    if (btnStd) btnStd.classList.toggle('active', level === 'standard');
    if (btnAdv) btnAdv.classList.toggle('active', level === 'advanced');
    localStorage.setItem('hv_user_level', level);
    sysLog(`Nivå endret til ${level}`);
}

function toggleNightMode() {
    AppState.isNightMode = !AppState.isNightMode;
    body.classList.toggle('night-mode', AppState.isNightMode);
    body.classList.toggle('day-mode', !AppState.isNightMode);
    localStorage.setItem('hv_night_mode', AppState.isNightMode);
    sysLog(`Nattmodus: ${AppState.isNightMode}`);
}

// === INITIALISERING ===
function setupEventListeners() {
    const nt = document.getElementById('night-mode-toggle');
    if (nt) nt.addEventListener('click', toggleNightMode);

    const bS = document.getElementById('btn-level-standard');
    const bA = document.getElementById('btn-level-advanced');
    if (bS) bS.addEventListener('click', () => setLevel('standard'));
    if (bA) bA.addEventListener('click', () => setLevel('advanced'));

    const bF = document.getElementById('btn-start-field');
    if (bF) bF.addEventListener('click', () => switchView('view-field'));

    const bT = document.getElementById('btn-start-training');
    if (bT) bT.addEventListener('click', () => switchView('view-training'));

    navItems.forEach(item => {
        item.addEventListener('click', () => switchView(item.getAttribute('data-target')));
    });

    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => switchView('view-home'));
    });
}

function initApp() {
    sysLog(`HV-SanApp v${AppState.version} starter...`);
    if (localStorage.getItem('hv_night_mode') === 'true') toggleNightMode();
    const savedLvl = localStorage.getItem('hv_user_level');
    setLevel(savedLvl || 'standard');
    setupEventListeners();
    switchView('view-home');
}

document.addEventListener('DOMContentLoaded', initApp);

/* Version: #13 */
