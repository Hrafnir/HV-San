/* Version: #9 */

// === GLOBALE KONSTANTER OG STATE ===
const AppState = {
    currentView: 'view-home',
    isNightMode: false,
    userLevel: 'standard',
    currentMarchStep: 'M',
    version: '1.0.9',
    patientData: {
        startTime: null,
        tourniquets: [], // Liste med { id, location, time, timerInterval }
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
    const now = new Date();
    const diff = Math.floor((now - startTime) / 1000);
    const min = Math.floor(diff / 60);
    const sec = diff % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

// === TOURNIQUET LOGIKK (MULTIPLE TIMERE) ===
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
    
    // Oppdater visningen umiddelbart
    renderMarchStep('M');
};

/**
 * Oppdaterer alle aktive timere i UI hvert sekund
 */
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

    const dots = document.querySelectorAll('#march-stepper-dots .dot');
    dots.forEach(dot => {
        dot.classList.toggle('active', dot.getAttribute('data-step') === step);
    });

    let html = '';

    switch(step) {
        case 'M':
            html = `
                <div class="march-card">
                    <h3 class="step-title">MASSIVE HEMORRHAGE</h3>
                    <p class="step-instruction">Sjekk ekstremiteter. Påfør tourniquet ved behov.</p>
                    
                    <div class="procedure-image-container">
                        <img src="/image/tourniquet.png" alt="Tourniquet Instruksjon" class="procedure-img">
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

                    ${AppState.userLevel === 'advanced' ? 
                        `<div class="advanced-section">
                            <p class="adv-label">AVANSERT (Nivå 3):</p>
                            <button class="march-action-btn secondary" onclick="sysLog('Sårpakking logget')">SÅRPAKKING / TRYKK</button>
                         </div>` : ''
                    }

                    <button class="next-step-btn" onclick="renderMarchStep('A')">NESTE: AIRWAY (A) →</button>
                </div>
            `;
            break;
        
        case 'A':
            html = `
                <div class="march-card">
                    <h3 class="step-title">AIRWAY (A)</h3>
                    <div class="check-list">
                        <label class="check-item"><input type="checkbox" onchange="sysLog('A: Snakker sjekket')"> Snakker pasienten?</label>
                        <label class="check-item"><input type="checkbox" onchange="sysLog('A: Munn sjekket')"> Sjekk munn for fremmedlegemer</label>
                    </div>
                    <div class="action-buttons-grid">
                        <button class="march-action-btn" onclick="sysLog('Stabilt sideleie utført')">STABILT SIDELEIE</button>
                    </div>
                    ${AppState.userLevel === 'advanced' ? 
                        `<div class="advanced-section">
                            <p class="adv-label">AVANSERT (Nivå 3):</p>
                            <button class="march-action-btn secondary" onclick="sysLog('NPA påsatt')">NESEKANTARELL (NPA)</button>
                         </div>` : ''
                    }
                    <div class="nav-buttons">
                        <button class="back-step-btn" onclick="renderMarchStep('M')">← TILBAKE</button>
                        <button class="next-step-btn" onclick="renderMarchStep('R')">NESTE: RESPIRATION (R) →</button>
                    </div>
                </div>
            `;
            break;

        default:
            html = `<div class="march-card">
                        <h3>Steg ${step}</h3>
                        <p>Under utvikling...</p>
                        <button class="back-step-btn" onclick="renderMarchStep('A')">← TILBAKE</button>
                    </div>`;
    }

    fieldDynamicContent.innerHTML = html;
}

// === NAVIGASJONS-LOGIKK ===
function switchView(viewId) {
    sysLog(`Navigerer til: ${viewId}`);
    views.forEach(v => v.classList.toggle('active', v.id === viewId));
    navItems.forEach(i => i.classList.toggle('active', i.getAttribute('data-target') === viewId));
    AppState.currentView = viewId;
    if (viewId === 'view-field') startMarchSession();
    document.getElementById('content-area').scrollTop = 0;
}

function startMarchSession() {
    if (!AppState.patientData.startTime) {
        AppState.patientData.startTime = new Date();
        sysLog("Ny pasientbehandling startet.");
    }
    renderMarchStep('M');
}

// === GENERELLE FUNKSJONER ===
function setLevel(level) {
    AppState.userLevel = level;
    document.getElementById('btn-level-standard').classList.toggle('active', level === 'standard');
    document.getElementById('btn-level-advanced').classList.toggle('active', level === 'advanced');
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

function setupEventListeners() {
    document.getElementById('night-mode-toggle').addEventListener('click', toggleNightMode);
    document.getElementById('btn-level-standard').addEventListener('click', () => setLevel('standard'));
    document.getElementById('btn-level-advanced').addEventListener('click', () => setLevel('advanced'));
    navItems.forEach(item => item.addEventListener('click', () => switchView(item.getAttribute('data-target'))));
    document.getElementById('btn-start-field').addEventListener('click', () => switchView('view-field'));
    document.getElementById('btn-start-training').addEventListener('click', () => switchView('view-training'));
    document.querySelectorAll('.back-btn').forEach(btn => btn.addEventListener('click', () => switchView('view-home')));
    document.getElementById('close-log').addEventListener('click', () => document.getElementById('debug-log-container').classList.add('hidden'));
}

function initApp() {
    sysLog(`HV-SanApp v${AppState.version} initialiserer...`);
    if (localStorage.getItem('hv_night_mode') === 'true') toggleNightMode();
    const savedLevel = localStorage.getItem('hv_user_level');
    setLevel(savedLevel || 'standard');
    setupEventListeners();
    switchView('view-home');
}

document.addEventListener('DOMContentLoaded', initApp);

/* Version: #9 */
