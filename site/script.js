/** sections/ は site/ 直下に配置（Vercel配信対応） */
const SECTIONS_BASE = './sections/';

const SECTION_TYPES = [
  { id: 'fv', label: 'FV（ファーストビュー）' },
  { id: 'intro', label: 'イントロダクション' },
  { id: 'pain', label: '課題・悩み提起' },
  { id: 'benefit', label: 'ベネフィット' },
  { id: 'service', label: 'サービス・商品紹介' },
  { id: 'testimonial', label: '実績・事例' },
  { id: 'voice', label: 'お客様の声' },
  { id: 'media', label: 'メディア・権威性' },
  { id: 'flow', label: 'ご利用の流れ' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'cta', label: 'CTA' },
  { id: 'footer', label: 'フッター' },
  { id: 'price', label: '料金' },
  { id: 'instructor', label: '講師実績' },
  { id: 'impact', label: 'インパクト訴求' },
];

let sectionData = {};
let currentSection = 'fv';
let selectedParts = []; // { sectionId, sectionLabel, variantId, variantName }
let currentModalVariant = null;

// --- Init ---
async function init() {
  renderTabs();
  await loadAllMeta();
  switchTab('fv');
  renderBottomBar();
}

// --- Tabs ---
function renderTabs() {
  const tabs = document.getElementById('tabs');
  tabs.innerHTML = SECTION_TYPES.map(s =>
    `<button class="tab-btn" data-id="${s.id}">${s.label}</button>`
  ).join('');
  tabs.addEventListener('click', e => {
    if (e.target.classList.contains('tab-btn')) {
      switchTab(e.target.dataset.id);
    }
  });
}

function switchTab(id) {
  currentSection = id;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.id === id);
  });
  renderCards();
}

// --- Fallback meta data (file:// protocol cannot use fetch) ---
const FALLBACK_META = {
  "fv": { "section_type": "fv", "section_label": "FV（ファーストビュー）", "variants": [
    { "id": "fv_a", "name": "FV_A", "file": "fv_a.html", "description": "" },
    { "id": "fv_b", "name": "FV_B", "file": "fv_b.html", "description": "" },
    { "id": "fv_c", "name": "FV_C", "file": "fv_c.html", "description": "" }
  ]},
  "intro": { "section_type": "intro", "section_label": "イントロダクション", "variants": [
    { "id": "intro_a", "name": "INTRO_A", "file": "intro_a.html", "description": "" },
    { "id": "intro_b", "name": "INTRO_B", "file": "intro_b.html", "description": "" },
    { "id": "intro_c", "name": "INTRO_C", "file": "intro_c.html", "description": "" },
    { "id": "intro_d", "name": "INTRO_D", "file": "intro_d.html", "description": "" },
    { "id": "intro_e", "name": "INTRO_E", "file": "intro_e.html", "description": "" },
    { "id": "intro_f", "name": "INTRO_F", "file": "intro_f.html", "description": "" },
    { "id": "intro_g", "name": "INTRO_G", "file": "intro_g.html", "description": "" }
  ]},
  "pain": { "section_type": "pain", "section_label": "課題・悩み提起", "variants": [
    { "id": "pain_a", "name": "PAIN_A", "file": "pain_a.html", "description": "" },
    { "id": "pain_b", "name": "PAIN_B", "file": "pain_b.html", "description": "" },
    { "id": "pain_c", "name": "PAIN_C", "file": "pain_c.html", "description": "" },
    { "id": "pain_d", "name": "PAIN_D", "file": "pain_d.html", "description": "" },
    { "id": "pain_e", "name": "PAIN_E", "file": "pain_e.html", "description": "" },
    { "id": "pain_f", "name": "PAIN_F", "file": "pain_f.html", "description": "" },
    { "id": "pain_g", "name": "PAIN_G", "file": "pain_g.html", "description": "" },
    { "id": "pain_h", "name": "PAIN_H", "file": "pain_h.html", "description": "" }
  ]},
  "benefit": { "section_type": "benefit", "section_label": "ベネフィット", "variants": [
    { "id": "benefit_a", "name": "BENEFIT_A", "file": "benefit_a.html", "description": "" },
    { "id": "benefit_b", "name": "BENEFIT_B", "file": "benefit_b.html", "description": "" },
    { "id": "benefit_c", "name": "BENEFIT_C", "file": "benefit_c.html", "description": "" },
    { "id": "benefit_d", "name": "BENEFIT_D", "file": "benefit_d.html", "description": "" },
    { "id": "benefit_e", "name": "BENEFIT_E", "file": "benefit_e.html", "description": "" },
    { "id": "benefit_f", "name": "BENEFIT_F", "file": "benefit_f.html", "description": "" },
    { "id": "benefit_g", "name": "BENEFIT_G", "file": "benefit_g.html", "description": "" },
    { "id": "benefit_h", "name": "BENEFIT_H", "file": "benefit_h.html", "description": "" },
    { "id": "benefit_i", "name": "BENEFIT_I", "file": "benefit_i.html", "description": "" }
  ]},
  "service": { "section_type": "service", "section_label": "サービス・商品紹介", "variants": [
    { "id": "service_a", "name": "SERVICE_A", "file": "service_a.html", "description": "" },
    { "id": "service_b", "name": "SERVICE_B", "file": "service_b.html", "description": "" },
    { "id": "service_c", "name": "SERVICE_C", "file": "service_c.html", "description": "" },
    { "id": "service_d", "name": "SERVICE_D", "file": "service_d.html", "description": "" },
    { "id": "service_e", "name": "SERVICE_E", "file": "service_e.html", "description": "" },
    { "id": "service_f", "name": "SERVICE_F", "file": "service_f.html", "description": "大見出し+シーン写真縦積み型 — h2大見出し＋4枚のシーン写真＋ラベルオーバーレイ（左上/右下交互）、SP・iPad同一1カラム" }
  ]},
  "testimonial": { "section_type": "testimonial", "section_label": "実績・事例", "variants": [
    { "id": "testimonial_a", "name": "TESTIMONIAL_A", "file": "testimonial_a.html", "description": "" },
    { "id": "testimonial_b", "name": "TESTIMONIAL_B", "file": "testimonial_b.html", "description": "" },
    { "id": "testimonial_c", "name": "TESTIMONIAL_C", "file": "testimonial_c.html", "description": "" }
  ]},
  "voice": { "section_type": "voice", "section_label": "お客様の声", "variants": [
    { "id": "voice_a", "name": "VOICE_A", "file": "voice_a.html", "description": "" },
    { "id": "voice_b", "name": "VOICE_B", "file": "voice_b.html", "description": "" },
    { "id": "voice_c", "name": "VOICE_C", "file": "voice_c.html", "description": "" },
    { "id": "voice_d", "name": "VOICE_D", "file": "voice_d.html", "description": "" },
    { "id": "voice_e", "name": "VOICE_E", "file": "voice_e.html", "description": "" }
  ]},
  "media": { "section_type": "media", "section_label": "メディア・権威性", "variants": [

  ]},
  "flow": { "section_type": "flow", "section_label": "ご利用の流れ", "variants": [
    { "id": "flow_a", "name": "FLOW_A", "file": "flow_a.html", "description": "" },
    { "id": "flow_b", "name": "FLOW_B", "file": "flow_b.html", "description": "" }
  ]},
  "faq": { "section_type": "faq", "section_label": "よくある質問", "variants": [
    { "id": "faq_a", "name": "FAQ_A", "file": "faq_a.html", "description": "" },
    { "id": "faq_b", "name": "FAQ_B", "file": "faq_b.html", "description": "" },
    { "id": "faq_c", "name": "FAQ_C", "file": "faq_c.html", "description": "" }
  ]},
  "cta": { "section_type": "cta", "section_label": "CTA", "variants": [
    { "id": "cta_a", "name": "CTA_A", "file": "cta_a.html", "description": "" },
    { "id": "cta_b", "name": "CTA_B", "file": "cta_b.html", "description": "" },
    { "id": "cta_c", "name": "CTA_C", "file": "cta_c.html", "description": "" }
  ]},
  "footer": { "section_type": "footer", "section_label": "フッター", "variants": [
    { "id": "footer_a", "name": "FOOTER_A", "file": "footer_a.html", "description": "" },
    { "id": "footer_b", "name": "FOOTER_B", "file": "footer_b.html", "description": "" }
  ]},
  "price": { "section_type": "price", "section_label": "料金", "variants": [
    { "id": "price_a", "name": "PRICE_A", "file": "price_a.html", "description": "" },
    { "id": "price_b", "name": "PRICE_B", "file": "price_b.html", "description": "" },
    { "id": "price_c", "name": "PRICE_C", "file": "price_c.html", "description": "" }
  ]},
  "pricing": { "section_type": "pricing", "section_label": "料金（別バリアント）", "variants": [
    { "id": "pricing_a", "name": "PRICING_A", "file": "pricing_a.html", "description": "" },
    { "id": "pricing_b", "name": "PRICING_B", "file": "pricing_b.html", "description": "" },
    { "id": "pricing_c", "name": "PRICING_C", "file": "pricing_c.html", "description": "" }
  ]},
  "instructor": { "section_type": "instructor", "section_label": "講師実績", "variants": [
    { "id": "instructor_a", "name": "INSTRUCTOR_A", "file": "instructor_a.html", "description": "" }
  ]},
  "impact": { "section_type": "impact", "section_label": "インパクト訴求", "variants": [
    { "id": "impact_a", "name": "IMPACT_A", "file": "impact_a.html", "description": "" },
    { "id": "impact_b", "name": "IMPACT_B", "file": "impact_b.html", "description": "" }
  ]}
};

// --- Load Meta ---
async function loadAllMeta() {
  let fetchFailed = false;
  const promises = SECTION_TYPES.map(async s => {
    try {
      const res = await fetch(`${SECTIONS_BASE}${s.id}/meta.json`);
      if (res.ok) {
        sectionData[s.id] = await res.json();
      }
    } catch (e) {
      fetchFailed = true;
      console.warn(`Failed to load meta for ${s.id}`, e);
    }
  });
  await Promise.all(promises);

  // file:// fallback: if fetch failed, use inline data
  if (fetchFailed && Object.keys(sectionData).length === 0) {
    Object.assign(sectionData, FALLBACK_META);
    console.info('Using fallback meta data (file:// mode)');
  }
}

// --- Cards ---
function renderCards() {
  const grid = document.getElementById('cardGrid');
  const data = sectionData[currentSection];
  if (!data || !data.variants) {
    grid.innerHTML = '<p style="color:#666;padding:20px;">パーツがありません</p>';
    return;
  }
  grid.innerHTML = data.variants.map(v => `
    <div class="card" data-id="${v.id}" onclick="openModal('${currentSection}', '${v.id}')">
      <div class="card-thumbnail">
        <iframe src="${SECTIONS_BASE}${currentSection}/${v.file}" loading="lazy" tabindex="-1"></iframe>
      </div>
      <div class="card-info">
        <div class="name">${v.name}</div>
        <div class="desc">${v.description}</div>
      </div>
    </div>
  `).join('');
}

// --- Modal ---
function openModal(sectionId, variantId) {
  const data = sectionData[sectionId];
  const variant = data.variants.find(v => v.id === variantId);
  if (!variant) return;

  currentModalVariant = { sectionId, sectionLabel: data.section_label, variantId, variantName: variant.name };

  document.getElementById('modalIframe').src = `${SECTIONS_BASE}${sectionId}/${variant.file}`;
  document.getElementById('modalLabel').textContent = `${data.section_label} / ${variant.name} — ${variant.description}`;
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('modalIframe').src = 'about:blank';
  document.body.style.overflow = '';
  currentModalVariant = null;
  // Reset to PC view
  setView('pc');
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
document.getElementById('modalSelectBtn').addEventListener('click', () => {
  if (currentModalVariant) {
    addSelection(currentModalVariant);
    closeModal();
  }
});

// --- PC/SP View Toggle ---
document.getElementById('viewPc').addEventListener('click', () => setView('pc'));
document.getElementById('viewSp').addEventListener('click', () => setView('sp'));

function setView(mode) {
  const body = document.querySelector('.modal-body');
  const pcBtn = document.getElementById('viewPc');
  const spBtn = document.getElementById('viewSp');
  if (mode === 'sp') {
    body.classList.add('sp-view');
    pcBtn.classList.remove('active');
    spBtn.classList.add('active');
  } else {
    body.classList.remove('sp-view');
    pcBtn.classList.add('active');
    spBtn.classList.remove('active');
  }
}

// --- Selection ---
function addSelection(item) {
  // Replace if same section type already selected
  const idx = selectedParts.findIndex(p => p.sectionId === item.sectionId);
  if (idx !== -1) {
    selectedParts[idx] = item;
  } else {
    selectedParts.push(item);
  }
  renderBottomBar();
  showToast(`${item.sectionLabel}: ${item.variantName} を選択しました`);
}

function removeSelection(variantId) {
  selectedParts = selectedParts.filter(p => p.variantId !== variantId);
  renderBottomBar();
}

function clearSelection() {
  selectedParts = [];
  renderBottomBar();
}

function renderBottomBar() {
  const bar = document.getElementById('bottomBar');
  const chips = document.getElementById('selectedChips');

  if (selectedParts.length === 0) {
    bar.className = 'bottom-bar empty';
    chips.innerHTML = '<span style="color:#555;font-size:12px;">パーツを選択してください</span>';
    return;
  }

  bar.className = 'bottom-bar has-items';
  chips.innerHTML = selectedParts.map((p, i) => `
    <div class="chip" draggable="true" data-index="${i}">
      <span>${p.sectionLabel}: ${p.variantName}</span>
      <button class="chip-remove" onclick="event.stopPropagation();removeSelection('${p.variantId}')">&times;</button>
    </div>
  `).join('');

  // Drag & Drop
  const chipEls = chips.querySelectorAll('.chip');
  chipEls.forEach(chip => {
    chip.addEventListener('dragstart', handleDragStart);
    chip.addEventListener('dragover', handleDragOver);
    chip.addEventListener('drop', handleDrop);
    chip.addEventListener('dragend', handleDragEnd);
  });
}

// --- Drag & Drop ---
let dragIndex = null;

function handleDragStart(e) {
  dragIndex = parseInt(e.currentTarget.dataset.index);
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
  e.preventDefault();
  const dropIndex = parseInt(e.currentTarget.dataset.index);
  if (dragIndex === null || dragIndex === dropIndex) return;

  const item = selectedParts.splice(dragIndex, 1)[0];
  selectedParts.splice(dropIndex, 0, item);
  renderBottomBar();
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  dragIndex = null;
}

// --- Copy ---
function copySelection() {
  if (selectedParts.length === 0) return;
  const text = selectedParts.map(p => `${p.sectionLabel}: ${p.variantName}`).join(' → ');
  navigator.clipboard.writeText(text).then(() => {
    showToast('組み合わせをコピーしました');
  });
}

// --- Toast ---
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// --- Start ---
init();
