const canvas = document.getElementById('canvas');
let selectedEl = null;
let dragEl = null;
let offset = { x: 0, y: 0 };
let canvasHeight = 500;
let canvasWidth = 1200;
let currentView = 'desktop';

let stateBg = {
    desktop: { type: 'bg-white', col1: '#ffffff', col2: '#ffffff', url: '', zoom: 100, x: 50, y: 50, op: 0, opCol: 'black' },
    mobile: { type: 'bg-white', col1: '#ffffff', col2: '#ffffff', url: '', zoom: 100, x: 50, y: 50, op: 0, opCol: 'black' }
};

window.setView = function(mode) {
    currentView = mode;
    document.getElementById('btn-desktop').classList.remove('active');
    document.getElementById('btn-mobile').classList.remove('active');
    document.getElementById('btn-' + mode).classList.add('active');
    if(mode === 'mobile') canvas.classList.add('mobile-view');
    else canvas.classList.remove('mobile-view');
    applyBgStyles();
};

window.setCanvasSize = function(dim, val) {
    if(dim === 'h') { canvasHeight = val; canvas.style.height = val + 'px'; }
    if(dim === 'w') { canvasWidth = val; canvas.style.width = val + 'px'; }
};

function applyBgStyles() {
    let bg = stateBg[currentView];
    canvas.style.background = (bg.type === 'bg-dark') ? '#0f1115' : '#ffffff';
}

window.addEl = function(type) {
    const el = document.createElement('div');
    el.classList.add('el', 'el-' + type);
    el.style.left = '50px'; el.style.top = '50px';
    el.innerHTML = (type === 'h') ? '<h2>Τίτλος</h2>' : '<div>Κείμενο</div>';
    el.addEventListener('mousedown', (e) => { e.stopPropagation(); selectEl(el); dragEl = el; });
    canvas.appendChild(el);
    selectEl(el);
};

window.selectEl = function(el) {
    document.querySelectorAll('.el').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    selectedEl = el;
    document.getElementById('inspector').style.display = 'block';
};

window.deselectAll = function(e) {
    if (!e || e.target === canvas) {
        document.querySelectorAll('.el').forEach(e => e.classList.remove('selected'));
        selectedEl = null;
        document.getElementById('inspector').style.display = 'none';
    }
};

window.deleteEl = function() { if(selectedEl) { selectedEl.remove(); deselectAll(null); } };
window.toggleFullScreen = function() { document.body.classList.toggle('is-fullscreen'); };

window.exportCode = function() {
    document.getElementById('exportOutput').value = canvas.innerHTML;
    document.getElementById('exportModal').classList.add('open');
};

window.copyToClip = function() {
    document.getElementById('exportOutput').select();
    document.execCommand('copy');
    alert('Αντιγράφηκε!');
};

window.addEventListener('mousemove', (e) => {
    if(dragEl) {
        const rect = canvas.getBoundingClientRect();
        dragEl.style.left = (e.clientX - rect.left - 20) + 'px';
        dragEl.style.top = (e.clientY - rect.top - 10) + 'px';
    }
});
window.addEventListener('mouseup', () => { dragEl = null; });
