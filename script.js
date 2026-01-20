/* Version: #7 */

// === GLOBALE KONSTANTER OG STATE ===
const AppState = {
    currentView: 'view-home',
    isNightMode: false,
    userLevel: 'standard', // 'standard' eller 'advanced'
    currentMarchStep: 'M', // M, A, R, C, H
    version: '1.0.7',
    // Pasientdata som skal bygges opp underveis
    patientData: {
        startTime: null,
        tourniquets: [],
        respirationRate: null,
        consciousness: null, // AVPU
        interventions: []
    }
};

// === DOM ELEMENTER ===
const body = document.body;
const debugLogContent = document.getElementById('debug-log-content');
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');
const fieldDynamicContent = document.getElementById('field-dynamic-content');
const displayLevelSpan = document.getElementById('display-level');

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

// === NIVÅ-HÅNDTERING ===
/**
 * Setter brukerens kompetansenivå og oppdaterer UI.
 * @param {string} level - 'standard' eller 'advanced'
 */
function setLevel(level) {
    AppState.userLevel = level;
    sysLog(`Kompetansenivå satt til: ${level.toUpperCase()}`);

    // Oppdater knapper i UI
    document.getElementById('btn-level-standard').classList.toggle('active', level === 'standard');
    document.getElementById('btn-level-advanced').classList.toggle('active', level === 'advanced');

    // Lagre valget
    localStorage.setItem('hv_user_level', level);
}

// === MARCH MOTOR (LOGIKK) ===

/**
 * Initialiserer en ny MARCH-sesjon
 */
function startMarchSession() {
    sysLog("Starter ny MARCH-sesjon...");
    AppState.patientData.startTime = new Date();
    AppState.currentMarchStep = 'M';
    
    if (displayLevelSpan) {
        displayLevelSpan.textContent = AppState.userLevel === 'advanced' ? 'AVANSERT' : 'STANDARD';
    }

    renderMarchStep('M');
}

/**
 * Renderer innholdet for et spesifikt MARCH-steg basert på nivå
 * @param {string} step - M, A, R, C, eller H
 */
function renderMarchStep(step) {
    AppState.currentMarchStep = step;
    sysLog(`Renderer MARCH steg: ${step} (${AppState.userLevel})`);

    // Oppdater stepper-visningen (prikkene) i index.html
    const dots = document.querySelectorAll('#march-stepper-dots .dot');
    dots.forEach(dot => {
        dot.classList.toggle('active', dot.getAttribute('data-step') === step);
    });

    // Generer innhold dynamisk
    let html = '';

    switch(step) {
        case 'M':
            html = `
                <div class="march-card">
                    <h3 class="step-title">MASSIVE HEMORRHAGE</h3>
                    <p class="step-instruction">Stans store blødninger umiddelbart!</p>
                    
                    <div class="illustration-placeholder">
                        <!-- Her kommer SVG Illustrasjon av Tourniquet-plassering -->
                        <div class="svg-container" id="svg-m-step">
                             <span style="font-size: 3rem;">🩹</span>
                             <p>(Illustrasjon: Høyt og stramt)</p>
                        </div>
                    </div>

                    <div class="action-buttons-grid">
                        <button class="march-action-btn pulse" onclick="handleTourniquetAction()">
                            PÅSATT TOURNIQUET
                        </button>
                    </div>

                    ${AppState.userLevel === 'advanced' ? 
                        `<div class="advanced-section">
                            <p class="adv-label">AVANSERT TILTAK:</p>
                            <button class="march-action-btn secondary" onclick="sysLog('Sårpakking logget')">SÅRPAKKING (Hemostatika)</button>
                         </div>` : ''
                    }

                    <button class="next-step-btn" onclick="renderMarchStep('A')">NESTE: AIRWAY →</button>
                </div>
            `;
            break;
        
        case 'A':
            html = `
                <div class="march-card">
                    <h3 class="step-title">AIRWAY (LUFTVEIER)</h3>
                    <p class="step-instruction">Sikre frie luftveier.</p>
                    
                    <div class="check-list">
                        <label class="check-item"><input type="checkbox"> Snakker pasienten?</label>
                        <label class="check-item"><input type="checkbox"> Sjekk munn/fremmedlegemer</label>
                    </div>

                    <div class="action-buttons-grid">
                        <button class="march-action-btn" onclick="sysLog('Stabilt sideleie logget')">STABILT SIDELEIE</button>
                    </div>

                    ${AppState.userLevel === 'advanced' ? 
                        `<div class="advanced-section">
                            <p class="adv-label">AVANSERT TILTAK:</p>
                            <button class="march-action-btn secondary" onclick="sysLog('NPA logget')">SETT NESEKANTARELL (NPA)</button>
                         </div>` : ''
                    }

                    <div class="nav-buttons">
                        <button class="back-step-btn" onclick="renderMarchStep('M')">← TILBAKE</button>
                        <button class="next-step-btn" onclick="renderMarchStep('R')">NESTE: RESPIRATION →</button>
                    </div>
                </div>
            `;
            break;

        default:
            html = `<div class="march-card"><p>Innhold for ${step} kommer i neste oppdatering.</p>
                    <button class="back-step-btn" onclick="renderMarchStep('M')">← TILBAKE</button></div>`;
    }

    fieldDynamicContent.innerHTML = html;
}

/**
 * Placeholder for Tourniquet-logikk
 */
window.handleTourniquetAction = function() {
    const now = new Date().toLocaleTimeString();
    sysLog(`Tourniquet logget kl: ${now}`, 'WARN');
    AppState.patientData.tourniquets.push({ time: now, location: 'Ukjent' });
    alert(`Tourniquet logget kl. ${now}. Husk å merke pasienten!`);
};

// === NAVIGASJONS-LOGIKK ===
function switchView(viewId) {
    sysLog(`Bytter visning til: ${viewId}`);
    
    views.forEach(view => {
        view.classList.toggle('active', view.id === viewId);
    });

    navItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-target') === viewId);
    });

    AppState.currentView = viewId;

    // Spesialhåndtering når vi går inn i Feltmodus
    if (viewId === 'view-field') {
        startMarchSession();
    }
    
    document.getElementById('content-area').scrollTop = 0;
}

// === NATTMODUS LOGIKK ===
function toggleNightMode() {
    AppState.isNightMode = !AppState.isNightMode;
    body.classList.toggle('night-mode', AppState.isNightMode);
    body.classList.toggle('day-mode', !AppState.isNightMode);
    sysLog(`Aktiverte ${AppState.isNightMode ? 'Taktisk Nattmodus' : 'Dagmodus'}`);
    localStorage.setItem('hv_night_mode', AppState.isNightMode);
}

// === EVENT LISTENERS ===
function setupEventListeners() {
    sysLog('Setter opp event listeners...');

    document.getElementById('night-mode-toggle').addEventListener('click', toggleNightMode);

    // Nivå-knapper
    document.getElementById('btn-level-standard').addEventListener('click', () => setLevel('standard'));
    document.getElementById('btn-level-advanced').addEventListener('click', () => setLevel('advanced'));

    navItems.forEach(item => {
        item.addEventListener('click', () => switchView(item.getAttribute('data-target')));
    });

    document.getElementById('btn-start-field').addEventListener('click', () => switchView('view-field'));
    document.getElementById('btn-start-training').addEventListener('click', () => switchView('view-training'));

    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => switchView('view-home'));
    });

    document.getElementById('close-log').addEventListener('click', () => {
        document.getElementById('debug-log-container').classList.add('hidden');
    });

    sysLog('Event listeners aktive.');
}

// === INITIALISERING ===
function initApp() {
    sysLog(`Starter HV-SanApp v${AppState.version}`);

    // Last lagrede innstillinger
    if (localStorage.getItem('hv_night_mode') === 'true') toggleNightMode();
    const savedLevel = localStorage.getItem('hv_user_level');
    if (savedLevel) setLevel(savedLevel); else setLevel('standard');

    setupEventListeners();
    switchView('view-home');
}

document.addEventListener('DOMContentLoaded', initApp);

/* Version: #7 */
