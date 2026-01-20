/* Version: #6 */

// === GLOBALE KONSTANTER OG STATE ===
const AppState = {
    currentView: 'view-home',
    isNightMode: false,
    version: '1.0.6'
};

// === DOM ELEMENTER ===
const body = document.body;
const debugLogContent = document.getElementById('debug-log-content');
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');

// === LOGGING SYSTEM ===
/**
 * Skriver loggmeldinger til både konsoll og debug-overlay i appen.
 * @param {string} message - Meldingen som skal logges
 * @param {string} level - 'INFO', 'WARN', eller 'ERROR'
 */
function sysLog(message, level = 'INFO') {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;
    
    // Logg til konsoll for utvikling
    console.log(formattedMessage);

    // Oppdater debug-overlay i UI
    if (debugLogContent) {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${level.toLowerCase()}`;
        logEntry.textContent = formattedMessage;
        debugLogContent.prepend(logEntry); // Nyeste øverst
    }
}

// === NAVIGASJONS-LOGIKK ===
/**
 * Bytter mellom ulike visninger/skjermer i appen.
 * @param {string} viewId - IDen til seksjonen som skal vises
 */
function switchView(viewId) {
    sysLog(`Bytter visning til: ${viewId}`);
    
    let viewFound = false;

    views.forEach(view => {
        if (view.id === viewId) {
            view.classList.add('active');
            viewFound = true;
        } else {
            view.classList.remove('active');
        }
    });

    if (!viewFound) {
        sysLog(`Feil: Fant ikke visning med ID ${viewId}`, 'ERROR');
        return;
    }

    // Oppdater aktiv tilstand i bunn-navigasjon
    navItems.forEach(item => {
        if (item.getAttribute('data-target') === viewId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    AppState.currentView = viewId;
    
    // Scroll til toppen ved bytte av skjerm
    document.getElementById('content-area').scrollTop = 0;
}

// === NATTMODUS LOGIKK ===
/**
 * Veksler mellom dagslys og taktisk nattmodus (rødt lys).
 */
function toggleNightMode() {
    AppState.isNightMode = !AppState.isNightMode;
    
    if (AppState.isNightMode) {
        body.classList.remove('day-mode');
        body.classList.add('night-mode');
        sysLog('Aktiverte Taktisk Nattmodus');
    } else {
        body.classList.remove('night-mode');
        body.classList.add('day-mode');
        sysLog('Aktiverte Dagmodus');
    }

    // Lagre preferanse lokalt
    localStorage.setItem('hv_night_mode', AppState.isNightMode);
}

// === EVENT LISTENERS ===
function setupEventListeners() {
    sysLog('Setter opp event listeners...');

    // Nattmodus-knapp
    const nightToggle = document.getElementById('night-mode-toggle');
    if (nightToggle) {
        nightToggle.addEventListener('click', toggleNightMode);
    }

    // Bunn-navigasjon
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            switchView(target);
        });
    });

    // Hovedknapper på dashbordet
    const btnField = document.getElementById('btn-start-field');
    if (btnField) {
        btnField.addEventListener('click', () => switchView('view-field'));
    }

    const btnTraining = document.getElementById('btn-start-training');
    if (btnTraining) {
        btnTraining.addEventListener('click', () => switchView('view-training'));
    }

    // "Tilbake"-knapper i de ulike modusene
    const backButtons = document.querySelectorAll('.back-btn');
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => switchView('view-home'));
    });

    // Lukke debug-logg (valgfritt)
    const closeLogBtn = document.getElementById('close-log');
    if (closeLogBtn) {
        closeLogBtn.addEventListener('click', () => {
            document.getElementById('debug-log-container').classList.add('hidden');
        });
    }

    sysLog('Alle event listeners er aktive.');
}

// === INITIALISERING ===
function initApp() {
    sysLog(`Starter HV-SanApp versjon ${AppState.version}`);

    // Last lagret nattmodus-innstilling
    const savedNightMode = localStorage.getItem('hv_night_mode') === 'true';
    if (savedNightMode) {
        toggleNightMode();
    }

    setupEventListeners();
    
    // Vis hjemskjermen som standard
    switchView('view-home');

    sysLog('Applikasjonen er klar til bruk.');
}

// Start appen når DOM er ferdig lastet
document.addEventListener('DOMContentLoaded', initApp);

/* Version: #6 */
