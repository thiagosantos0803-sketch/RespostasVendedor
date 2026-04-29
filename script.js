// ═══════════════════════════════════════════════════════════════
//  KG SORENSEN — LP Suporte ao Vendedor
//  script.js — Lógica do formulário + integração Google Sheets
// ═══════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────
//  CONFIGURAÇÃO — SUBSTITUA APENAS ESTA URL
//  1. Abra o Google Sheets → Extensões → Apps Script
//  2. Cole o código do arquivo apps-script.gs
//  3. Implante como App da Web:
//     - Executar como: Eu (sua conta)
//     - Quem tem acesso: Qualquer pessoa
//  4. Copie a URL gerada e cole aqui abaixo
// ──────────────────────────────────────────────────────────────
// CATALOG LOCK (SAFE)
let catalogoLiberadoMemoria = false;
function safeGetStorage(key) {
    try { return window.safeGetStorage(key); } catch (e) { return null; }
    }
    function safeSetStorage(key, value) {
        try { window.localStorage.setItem(key, value); return true; } catch (e) { return false; }
        }


const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyCxxM8xuQZNMJHjVje25flc6-WGhh9Hsak147FUWz4XTGI8e7ydTqqI0X52fAD1P-xkA/exec';
// ──────────────────────────────────────────────────────────────
//  CATALOG LOCK
// ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'kg_form_respondido';

function catalogoLiberado() {
  return safeGetStorage(STORAGE_KEY) === '1';
}

function liberarCatalogo() {
  const persisted = safeSetStorage(STORAGE_KEY, '1'); if (!persisted) catalogoLiberadoMemoria = true;
  const catalogo = document.getElementById('catalogo');
  if (catalogo) catalogo.classList.remove('locked');
  }

function handleCatalogNav(e) {
  e.preventDefault();
  if (catalogoLiberado()) {
    document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    document.getElementById('feedback').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Aplica estado ao carregar
if (!catalogoLiberado()) {
  const catalogo = document.getElementById('catalogo');
  if (catalogo) catalogo.classList.add('locked');
}

// ──────────────────────────────────────────────────────────────
//  FORMULÁRIO — estado das respostas
// ──────────────────────────────────────────────────────────────
const answers = { 0: null, 1: null, 2: null, 3: '', 4: null };
const totalSteps = 5;

function showStep(idx) {
  for (let i = 0; i < totalSteps; i++) {
    const el = document.getElementById('step-' + i);
    if (el) el.style.display = (i === idx) ? 'block' : 'none';
  }
  for (let i = 0; i < totalSteps; i++) {
    const d = document.getElementById('dot-' + i);
    if (!d) continue;
    d.className = 'dot';
    if (i < idx) d.classList.add('done');
    else if (i === idx) d.classList.add('active');
  }
  const card = document.getElementById('formContent');
  if (card) {
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = 'fadeSlide 0.3s ease both';
  }
}

function nextStep(current) { showStep(current + 1); }
function prevStep(current)  { showStep(current - 1); }

function selectOption(el, stepIdx, triggerField) {
  const step = document.getElementById('step-' + stepIdx);
  if (!step) return;
  step.querySelectorAll('.option-row').forEach(r => r.classList.remove('selected'));
  el.classList.add('selected');
  answers[stepIdx] = el.textContent.trim().replace(/^[✓\s]+/, '');
  step.querySelectorAll('.outro-input').forEach(f => {
    f.classList.remove('visible');
    f.querySelectorAll('input').forEach(i => i.value = '');
  });
  if (triggerField) {
    const f = document.getElementById(triggerField);
    if (f) f.classList.add('visible');
  }
}

// ──────────────────────────────────────────────────────────────
//  SUBMIT
// ──────────────────────────────────────────────────────────────
function submitForm() {
  const data = {
    timestamp:    new Date().toISOString(),
    dificuldade:  answers[0] || document.getElementById('outro0-val')?.value || '',
    ajuda:        answers[1] || document.getElementById('outro1-val')?.value || '',
    frequencia:   answers[2] || '',
    observacao:   document.getElementById('obs')?.value || '',
    quer_contato: answers[4] || '',
    nome:         document.getElementById('contato-nome')?.value   || '',
    telefone:     document.getElementById('contato-tel')?.value    || '',
    dental:       document.getElementById('contato-dental')?.value || ''
  };

  console.log('Feedback KG Sorensen:', data);

  if (APPS_SCRIPT_URL && APPS_SCRIPT_URL !== 'COLE_AQUI_A_URL_DO_APPS_SCRIPT') {
    fetch(APPS_SCRIPT_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data)
    })
    .then(() => console.log('Dados enviados ao Google Sheets'))
    .catch(err => console.warn('Erro ao enviar para Sheets:', err));
  } else {
    console.warn('APPS_SCRIPT_URL nao configurada. Configure em script.js');
  }

  liberarCatalogo();

  const formContent = document.getElementById('formContent');
  if (formContent) formContent.style.display = 'none';

  const successMsg = document.getElementById('successMsg');
  if (successMsg) {
    successMsg.classList.add('visible');
    successMsg.style.display = 'block';
  }
}

// ──────────────────────────────────────────────────────────────
//  SMOOTH SCROLL
// ──────────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      try {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      } catch(err) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});
