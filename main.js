import './style.css';
const canvas = document.getElementById('canvas');
let selectedEl = null;
let dragEl = null;
let offset = { x: 0, y: 0 };
let canvasHeight = 500;
let canvasWidth = 1200;
let currentView = 'desktop';

// Mobile Background States
let stateBg = {
    desktop: { type: 'bg-white', col1: '#ffffff', col2: '#ffffff', url: '', zoom: 100, x: 50, y: 50, op: 0, opCol: 'black' },
    mobile: { type: 'bg-white', col1: '#ffffff', col2: '#ffffff', url: '', zoom: 100, x: 50, y: 50, op: 0, opCol: 'black' }
};

window.setView = function(mode) {
    currentView = mode;
    document.getElementById('btn-desktop').classList.remove('active');
    document.getElementById('btn-mobile').classList.remove('active');
    document.getElementById('btn-' + mode).classList.add('active');
    
    if(mode === 'mobile') {
        canvas.classList.add('mobile-view');
        document.getElementById('mob-bg-alert').style.display = 'block';
    } else {
        canvas.classList.remove('mobile-view');
        document.getElementById('mob-bg-alert').style.display = 'none';
    }
    
    let bg = stateBg[mode];
    document.getElementById('bg-select').value = bg.type;
    document.getElementById('bg-col-1').value = bg.col1;
    document.getElementById('bg-col-2').value = bg.col2;
    document.getElementById('bg-img-url').value = bg.url;
    sync('bg-zoom', bg.zoom); sync('inp-bg-zoom', bg.zoom);
    sync('bg-x', bg.x); sync('inp-bg-x', bg.x);
    sync('bg-y', bg.y); sync('inp-bg-y', bg.y);
    sync('bg-overlay-op', bg.op); sync('inp-bg-op', bg.op);
    document.getElementById('bg-overlay-color').value = bg.opCol;
    
    applyBgStyles();
};

window.switchTab = function(tab) {
    document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel-section').forEach(s => s.classList.remove('active'));
    if(tab === 'build') {
         document.querySelector('.sidebar-tab:first-child').classList.add('active');
         document.getElementById('tab-build').classList.add('active');
    } else {
         document.querySelector('.sidebar-tab:last-child').classList.add('active');
         document.getElementById('tab-layers').classList.add('active');
    }
};

window.setCanvasSize = function(dim, val) {
    if(dim === 'h') { canvasHeight = val; canvas.style.height = val + 'px'; }
    if(dim === 'w') { canvasWidth = val; canvas.style.width = val + 'px'; }
};

window.setCanvasBg = function() {
    let bg = stateBg[currentView];
    bg.type = document.getElementById('bg-select').value;
    bg.col1 = document.getElementById('bg-col-1').value;
    bg.col2 = document.getElementById('bg-col-2').value;
    bg.url = document.getElementById('bg-img-url').value;
    bg.zoom = document.getElementById('bg-zoom').value;
    bg.x = document.getElementById('bg-x').value;
    bg.y = document.getElementById('bg-y').value;
    bg.op = document.getElementById('bg-overlay-op').value;
    bg.opCol = document.getElementById('bg-overlay-color').value;
    
    applyBgStyles();
};

function applyBgStyles() {
    let bg = stateBg[currentView];
    document.getElementById('custom-bg-controls').style.display = bg.type === 'custom' ? 'block' : 'none';
    document.getElementById('bg-img-controls').style.display = bg.type === 'bg-img' ? 'block' : 'none';
    
    canvas.className = '';
    if(currentView === 'mobile') canvas.classList.add('mobile-view');
    canvas.style.backgroundImage = '';

    if(bg.type === 'custom') {
        canvas.style.background = `linear-gradient(135deg, ${bg.col1}, ${bg.col2})`;
    } else if(bg.type === 'bg-img') {
        if(bg.url) {
            const overlayCol = bg.opCol === 'white' ? '255,255,255' : '0,0,0';
            const opacity = bg.op / 100;
            const grad = `linear-gradient(rgba(${overlayCol}, ${opacity}), rgba(${overlayCol}, ${opacity}))`;
            canvas.style.backgroundImage = `${grad}, url(${bg.url})`;
            canvas.style.backgroundSize = `${bg.zoom}%`; 
            canvas.style.backgroundPosition = `${bg.x}% ${bg.y}%`;
        }
    } else if (bg.type === 'transparent') {
        canvas.style.background = 'transparent';
    } else {
        canvas.style.background = '';
        canvas.classList.add(bg.type);
    }
}

function attachEvents(el) {
    el.addEventListener('mousedown', (e) => {
        if(document.body.classList.contains('is-fullscreen')) return;
        e.stopPropagation();
        selectEl(el);
        dragEl = el;
        const rect = el.getBoundingClientRect();
        offset.x = e.clientX - rect.left;
        offset.y = e.clientY - rect.top;
    });
}

window.addEl = function(type) {
    const el = document.createElement('div');
    el.classList.add('el', 'el-' + type);
    el.style.left = '50px'; el.style.top = '50px';
    el.style.width = type === 'img' ? '300px' : '400px';
    el.dataset.type = type;
    
    if(type === 'h') el.innerHTML = '<h2>Νέος Τίτλος</h2>';
    if(type === 'p') el.innerHTML = '<div>Γράψτε κείμενο...</div>';
    if(type === 'img') {
        el.innerHTML = '<img src="https://via.placeholder.com/600x400">';
        el.style.height = '250px';
    }
    attachEvents(el);
    canvas.appendChild(el);
    selectEl(el);
};

window.cloneEl = function() {
    if(!selectedEl) return;
    const clone = selectedEl.cloneNode(true);
    clone.classList.remove('selected');
    let l = parseInt(clone.style.left) + 20;
    let t = parseInt(clone.style.top) + 20;
    clone.style.left = l + 'px';
    clone.style.top = t + 'px';
    canvas.appendChild(clone);
    attachEvents(clone);
    selectEl(clone);
};

window.addCard = function() {
    const el = document.createElement('div');
    el.classList.add('el', 'el-card', 'layout-top');
    el.style.left = '50px'; el.style.top = '50px';
    el.style.width = '300px'; 
    el.dataset.type = 'card';
    el.innerHTML = `<div class="card-img"><img src="https://via.placeholder.com/600x400"><div class="card-overlay"></div></div><div class="card-content"><h3>Τίτλος</h3><p>Περιγραφή...</p><a href="#" class="c-btn">Κουμπί</a></div>`;
    attachEvents(el);
    canvas.appendChild(el);
    selectEl(el);
};

window.selectEl = function(el) {
    document.querySelectorAll('.el').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    selectedEl = el;
    document.getElementById('inspector').style.display = 'block';
    document.getElementById('global-controls').style.display = 'none';

    if(el.classList.contains('el-card')) {
         document.getElementById('card-controls').style.display = 'block';
         document.getElementById('std-controls').style.display = 'none';
    } else {
         document.getElementById('card-controls').style.display = 'none';
         document.getElementById('std-controls').style.display = 'block';
    }
    updateSliders(el);
};

function updateSliders(el) {
   const isCard = el.classList.contains('el-card');
   const xPct = (parseInt(el.style.left) / canvasWidth) * 100 || 0;
   const yPct = (parseInt(el.style.top) / canvasHeight) * 100 || 0;
   let wPct = el.style.width === 'auto' ? 5 : (parseInt(el.style.width) / canvasWidth) * 100;

   if(isCard) {
       sync('c-x', xPct); sync('inp-c-x', Math.round(xPct));
       sync('c-y', yPct); sync('inp-c-y', Math.round(yPct));
       sync('c-w', wPct); sync('inp-c-w', Math.round(wPct));
   } else {
       sync('sl-x', xPct); sync('inp-x', Math.round(xPct));
       sync('sl-y', yPct); sync('inp-y', Math.round(yPct));
       sync('sl-w', wPct); sync('inp-w', Math.round(wPct));
   }
}

window.updateEl = function(mode) {
    if(!selectedEl) return;
    if(mode === 'layout') {
        const px = document.getElementById('sl-x').value;
        const py = document.getElementById('sl-y').value;
        const pw = document.getElementById('sl-w').value;
        selectedEl.style.left = (px * (canvasWidth/100)) + 'px'; 
        selectedEl.style.top = (py * (canvasHeight/100)) + 'px';
        selectedEl.style.width = (pw * (canvasWidth/100)) + 'px';
    }
};

window.updateCard = function(mode) {
    if(!selectedEl) return;
    if(mode === 'pos') {
         const px = document.getElementById('c-x').value;
         const py = document.getElementById('c-y').value;
         const pw = document.getElementById('c-w').value;
         selectedEl.style.left = (px * (canvasWidth/100)) + 'px'; 
         selectedEl.style.top = (py * (canvasHeight/100)) + 'px';
         selectedEl.style.width = (pw * (canvasWidth/100)) + 'px';
    }
    if(mode === 'layout') {
        selectedEl.classList.remove('layout-top', 'layout-side', 'layout-overlay');
        selectedEl.classList.add(document.getElementById('card-layout').value);
    }
};

window.deselectAll = function(e) {
    if (!e || e.target === canvas || e.target.id === 'canvas') {
        document.querySelectorAll('.el').forEach(e => e.classList.remove('selected'));
        selectedEl = null;
        document.getElementById('inspector').style.display = 'none';
        document.getElementById('global-controls').style.display = 'block';
    }
};

window.deleteEl = function() { 
    if(selectedEl) { selectedEl.remove(); deselectAll(null); } 
};

window.toggleFullScreen = function() { 
    document.body.classList.toggle('is-fullscreen'); 
};

// EXPORT Logic
window.exportCode = function() {
    const uid = 'elvhx-' + Math.floor(Math.random() * 9999);
    
    // Desktop BG
    let deskStyle = '';
    if(stateBg.desktop.type === 'custom') deskStyle = `background: linear-gradient(135deg, ${stateBg.desktop.col1}, ${stateBg.desktop.col2});`;
    else if(stateBg.desktop.type === 'bg-img') {
        const oc = stateBg.desktop.opCol === 'white' ? '255,255,255' : '0,0,0';
        const op = stateBg.desktop.op / 100;
        deskStyle = `background-image: linear-gradient(rgba(${oc}, ${op}), rgba(${oc}, ${op})), url('${stateBg.desktop.url}'); background-size:${stateBg.desktop.zoom}%; background-position:${stateBg.desktop.x}% ${stateBg.desktop.y}%;`;
    }

    // Mobile BG
    let mobStyle = '';
    if(stateBg.mobile.type === 'custom') mobStyle = `background: linear-gradient(135deg, ${stateBg.mobile.col1}, ${stateBg.mobile.col2}) !important;`;
    else if(stateBg.mobile.type === 'bg-img') {
        const oc = stateBg.mobile.opCol === 'white' ? '255,255,255' : '0,0,0';
        const op = stateBg.mobile.op / 100;
        mobStyle = `background-image: linear-gradient(rgba(${oc}, ${op}), rgba(${oc}, ${op})), url('${stateBg.mobile.url}') !important; background-size:${stateBg.mobile.zoom}% !important; background-position:${stateBg.mobile.x}% ${stateBg.mobile.y}% !important;`;
    } else if(stateBg.mobile.type === 'transparent') {
        mobStyle = `background: transparent !important; background-image: none !important;`;
    } else {
        let presetHex = '#ffffff';
        if(stateBg.mobile.type === 'bg-gray') presetHex = '#e0e5ec';
        if(stateBg.mobile.type === 'bg-dark') presetHex = '#0f1115';
        mobStyle = `background: ${presetHex} !important; background-image: none !important;`;
    }

    let elementsHTML = '';
    document.querySelectorAll('.el').forEach(el => {
        const l = (parseInt(el.style.left)/canvasWidth)*100;
        const t = (parseInt(el.style.top)/canvasHeight)*100;
        const w = (parseInt(el.style.width)/canvasWidth)*100;
        elementsHTML += `<div class="elvhx-item" style="left:${l}%; top:${t}%; width:${w}%;">${el.innerHTML}</div>\n`;
    });

    const finalHTML = `
<div class="elvhx-wrapper ${stateBg.desktop.type} ${uid}" style="${deskStyle}">
<div class="elvhx-canvas">
${elementsHTML}
</div>
</div>
<style>
.${uid} { position:relative; overflow:hidden; padding: 30px 20px; font-family: inherit; width:100%; box-sizing:border-box; }
.${uid} .elvhx-canvas { position: relative; width: 100%; max-width: ${canvasWidth}px; margin: 0 auto; min-height: ${canvasHeight}px; z-index:1; }
.${uid} .elvhx-item { position: absolute; color: inherit; box-sizing:border-box; z-index:10; }

@media (max-width: 768px) {
.${uid} { 
  padding: 30px 15px !important; 
  height: auto !important; 
  ${mobStyle} 
}
.${uid} .elvhx-canvas { 
  display: flex !important; flex-direction: column !important; gap: 20px !important; 
  min-height: auto !important;
}
.${uid} .elvhx-item { 
  position: relative !important; left: auto !important; top: auto !important; 
  width: 100% !important; margin: 0 !important; transform: none !important;
}
}
</style>`;
    document.getElementById('exportOutput').value = finalHTML;
    document.getElementById('exportModal').classList.add('open');
};

window.copyToClip = function() {
    document.getElementById('exportOutput').select();
    document.execCommand('copy');
    alert('Αντιγράφηκε!');
};

// Constraint Drag & Drop
let isDragging = false;
window.addEventListener('mousemove', (e) => {
    if(dragEl && !isDragging) {
         window.requestAnimationFrame(() => { handleDrag(e); isDragging = false; });
         isDragging = true;
    }
});
window.addEventListener('mouseup', () => { dragEl = null; });
document.body.addEventListener('mouseleave', () => { if(dragEl) dragEl = null; });

function handleDrag(e) {
    const canvasRect = canvas.getBoundingClientRect();
    let x = e.clientX - canvasRect.left - offset.x;
    let y = e.clientY - canvasRect.top - offset.y;
    
    const maxX = canvasWidth - dragEl.offsetWidth;
    const maxY = canvasHeight - dragEl.offsetHeight;

    if (x < 0) x = 0;
    if (x > maxX) x = maxX;
    if (y < 0) y = 0;
    if (y > maxY) y = maxY;

    dragEl.style.left = x + 'px'; 
    dragEl.style.top = y + 'px';
    updateSliders(dragEl);
}