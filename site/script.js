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
    { "id": "fv_a", "name": "FV_A", "file": "fv_a.html", "description": "フルスクリーン画像+中央テキスト" },
    { "id": "fv_b", "name": "FV_B", "file": "fv_b.html", "description": "左テキスト+右画像の2カラム" },
    { "id": "fv_c", "name": "FV_C", "file": "fv_c.html", "description": "テキスト中心・ミニマル型" }
  ]},
  "intro": { "section_type": "intro", "section_label": "イントロダクション", "variants": [
    { "id": "intro_a", "name": "Intro_A", "file": "intro_a.html", "description": "セリフ体見出し+写真2枚+About説明文 — ブランド紹介型" },
    { "id": "intro_b", "name": "Intro_B", "file": "intro_b.html", "description": "明朝体ポエム+写真コラージュ — クリニック・サロン向き" },
    { "id": "intro_c", "name": "Intro_C", "file": "intro_c.html", "description": "写真左+テキスト右の2カラム — SP時写真1枚に切替・オンライン系サービス向き" },
    { "id": "intro_d", "name": "Intro_D", "file": "intro_d.html", "description": "明朝体キャッチ+散らし写真型 — 左大写真+右テキスト+サブ写真2枚、上質感・クリニック向き" },
    { "id": "intro_e", "name": "Intro_E", "file": "intro_e.html", "description": "ダーク帯+セリフ見出し+レタースペース広め本文 — ブランドコンセプト詩型（フルブリード背景・800px列・OopsWOMB系）" },
    { "id": "intro_f", "name": "Intro_F", "file": "intro_f.html", "description": "サブタイトル+大見出し+本文2段+画像（動画置換可）— 中央1カラム・白背景（きかせてジャーニー系）" },
    { "id": "intro_g", "name": "Intro_G", "file": "intro_g.html", "description": "背景フルブリード写真+暗オーバーレイ+左寄せ白文字（見出し・リード・本文）— コンセプト型（〆切手帳系）" }
  ]},
  "pain": { "section_type": "pain", "section_label": "課題・悩み提起", "variants": [
    { "id": "pain_a", "name": "Pain_A", "file": "pain_a.html", "description": "縦リスト型 — 項目数自由、テキスト量自由、最も汎用" },
    { "id": "pain_b", "name": "Pain_B", "file": "pain_b.html", "description": "カードグリッド型 — 3〜6項目の並列表示、等価な悩みの一覧" },
    { "id": "pain_c", "name": "Pain_C", "file": "pain_c.html", "description": "左右交互型 — 画像差し込み可、長文説明向き" },
    { "id": "pain_d", "name": "Pain_D", "file": "pain_d.html", "description": "吹き出し型 — CSS only吹き出しで悩み列挙、PC3+2配置・SP左右交互" },
    { "id": "pain_e", "name": "Pain_E", "file": "pain_e.html", "description": "アイコン+吹き出し型 — 人物アイコン左+枠線吹き出し右、長文対応・縦並び" },
    { "id": "pain_f", "name": "Pain_F", "file": "pain_f.html", "description": "人物+雲吹き出し型 — 中央人物画像の周囲にモクモク雲型吹き出し5つ配置、ダーク背景+波型区切り" },
    { "id": "pain_g", "name": "Pain_G", "file": "pain_g.html", "description": "人物+モクモク雲型v2 — box-shadow多重で有機的雲形状、CSS変数+フィルター/ブレンドモード対応、波線デコ付き" },
    { "id": "pain_h", "name": "Pain_H", "file": "pain_h.html", "description": "写真交互型 — 55%写真+45%テキスト左右交互、ダークフィルター+オーバーレイ自動適用、CSS変数対応" }
  ]},
  "benefit": { "section_type": "benefit", "section_label": "ベネフィット", "variants": [
    { "id": "benefit_a", "name": "Benefit_A", "file": "benefit_a.html", "description": "カードグリッド型 — SVGアイコン+タイトル+説明、3〜6項目対応" },
    { "id": "benefit_b", "name": "Benefit_B", "file": "benefit_b.html", "description": "左右交互型 — 画像差し込み可、長文説明向き" },
    { "id": "benefit_c", "name": "Benefit_C", "file": "benefit_c.html", "description": "数字強調リスト型 — 統計・実績数値の訴求に最適" },
    { "id": "benefit_d", "name": "Benefit_D", "file": "benefit_d.html", "description": "横スクロール型 — カード+画像を横スワイプ、項目数自由" },
    { "id": "benefit_e", "name": "Benefit_E", "file": "benefit_e.html", "description": "フルワイド交互ブロック型 — 明暗切替の全幅レイアウト、スクロールにリズムを出す" },
    { "id": "benefit_f", "name": "Benefit_F", "file": "benefit_f.html", "description": "ポイント連続型 — 左右反転なし、Point番号+タイトル+写真+説明を縦に連続配置" },
    { "id": "benefit_g", "name": "Benefit_G", "file": "benefit_g.html", "description": "3カラム特徴型 — 画像上+番号被り+マーカー下線タイトル、SP縦積み" },
    { "id": "benefit_h", "name": "Benefit_H", "file": "benefit_h.html", "description": "ダーク特典カード型 — 3+2グリッド、番号飛び出し+コーナー装飾+ダーク背景タイトル" },
    { "id": "benefit_i", "name": "Benefit_I", "file": "benefit_i.html", "description": "画像+箇条書き型 — 左に画像・右にピル型番号リスト、SP縦積み" }
  ]},
  "service": { "section_type": "service", "section_label": "サービス・商品紹介", "variants": [
    { "id": "service_a", "name": "Service_A", "file": "service_a.html", "description": "カードグリッド型 — サムネイル+説明、商品数に応じて拡張" },
    { "id": "service_b", "name": "Service_B", "file": "service_b.html", "description": "ステップリスト型 — サービスフロー・導入手順の説明向き" },
    { "id": "service_c", "name": "Service_C", "file": "service_c.html", "description": "タブ切り替え型 — 複数サービスの詳細を省スペースで表示" },
    { "id": "service_d", "name": "Service_D", "file": "service_d.html", "description": "実績カードグリッド型 — SP2列/iPad3列、サムネイル+タグ+人名+タイトル、動画マーク対応" },
    { "id": "service_e", "name": "Service_E", "file": "service_e.html", "description": "左見出し固定＋右2列カードグリッド型 — 黒背景・英語ラベル+日本語見出し+説明+アイコン、SP縦積み/PC左右分割" }
  ]},
  "testimonial": { "section_type": "testimonial", "section_label": "実績・事例", "variants": [
    { "id": "testimonial_a", "name": "Testimonial_A", "file": "testimonial_a.html", "description": "ロゴグリッド型 — 導入企業数の訴求、信頼感の演出" },
    { "id": "testimonial_b", "name": "Testimonial_B", "file": "testimonial_b.html", "description": "ケーススタディ型 — 課題→成果の詳細事例紹介" },
    { "id": "testimonial_c", "name": "Testimonial_C", "file": "testimonial_c.html", "description": "数字ハイライト型 — 実績数値をインパクト重視で表示" }
  ]},
  "voice": { "section_type": "voice", "section_label": "お客様の声", "variants": [
    { "id": "voice_a", "name": "Voice_A", "file": "voice_a.html", "description": "カードグリッド型 — 複数の声を均等に並列表示" },
    { "id": "voice_b", "name": "Voice_B", "file": "voice_b.html", "description": "縦リスト型 — 長文の声を丁寧に紹介" },
    { "id": "voice_c", "name": "Voice_C", "file": "voice_c.html", "description": "フィーチャード型 — 1つを大きく+他を小さく表示" },
    { "id": "voice_d", "name": "Voice_D", "file": "voice_d.html", "description": "カード横スクロール型 — イラスト+年齢バッジ+カテゴリ+タイトル+本文、scroll-snap対応" },
    { "id": "voice_e", "name": "Voice_E", "file": "voice_e.html", "description": "画像カルーセル型 — 事例を1枚画像として配置、横スクロール+scroll-snap" }
  ]},
  "faq": { "section_type": "faq", "section_label": "よくある質問", "variants": [
    { "id": "faq_a", "name": "FAQ_A", "file": "faq_a.html", "description": "アコーディオン型 — クリックで開閉、省スペース" },
    { "id": "faq_b", "name": "FAQ_B", "file": "faq_b.html", "description": "2カラムQ&A型 — 左に質問、右に回答、常時表示" },
    { "id": "faq_c", "name": "FAQ_C", "file": "faq_c.html", "description": "カードグリッド型 — Q&Aをカードで並列表示" }
  ]},
  "cta": { "section_type": "cta", "section_label": "CTA", "variants": [
    { "id": "cta_a", "name": "CTA_A", "file": "cta_a.html", "description": "フルワイド型 — ダーク背景+大きなボタン、インパクト重視" },
    { "id": "cta_b", "name": "CTA_B", "file": "cta_b.html", "description": "フォーム埋め込み型 — 訴求テキスト+フォームの2カラム" },
    { "id": "cta_c", "name": "CTA_C", "file": "cta_c.html", "description": "2択カード型 — 資料請求と申込みの2つの導線" }
  ]},
  "footer": { "section_type": "footer", "section_label": "フッター", "variants": [
    { "id": "footer_a", "name": "Footer_A", "file": "footer_a.html", "description": "ミニマル型 — 社名+コピーライト+最小リンク" },
    { "id": "footer_b", "name": "Footer_B", "file": "footer_b.html", "description": "マルチカラム型 — 会社情報・サービス・サポートを整理表示" }
  ]},
  "instructor": { "section_type": "instructor", "section_label": "講師実績", "variants": [
    { "id": "instructor_a", "name": "Instructor_A", "file": "instructor_a.html", "description": "写真+プロフィール型 — 左テキスト(肩書き・名前・ローマ字・説明)+右人物写真、SP縦積み" }
  ]},
  "impact": { "section_type": "impact", "section_label": "インパクト訴求", "variants": [
    { "id": "impact_a", "name": "Impact_A", "file": "impact_a.html", "description": "縦書きキーワード+写真型 — ダーク背景に大きな縦書きテキスト+1枚画像、LP転換ポイント向き" },
    { "id": "impact_b", "name": "Impact_B", "file": "impact_b.html", "description": "ラベル+見出し+リード型 — 背景色+中央揃えテキスト、セクション転換・回答提示向き" }
  ]},
  "flow": { "section_type": "flow", "section_label": "ご利用の流れ", "variants": [
    { "id": "flow_a", "name": "Flow_A", "file": "flow_a.html", "description": "3ステップ円形型 — PC横並び3円+三角矢印、SP縦並び+下向き矢印" },
    { "id": "flow_b", "name": "Flow_B", "file": "flow_b.html", "description": "5ステップ縦リスト型 — 左:番号円アイコン+右:タイトル・説明、行間下向き矢印、下部吹き出しキャプション" }
  ]},
  "media": { "section_type": "media", "section_label": "メディア・権威性", "variants": [] },
  "price": { "section_type": "price", "section_label": "料金", "variants": [
    { "id": "price_a", "name": "Price_A", "file": "price_a.html", "description": "料金プランカード横並び型 — SP縦積み/PC3列、おすすめ強調（黒塗り）、特徴リスト+CTAボタン" },
    { "id": "price_b", "name": "Price_B", "file": "price_b.html", "description": "料金比較テーブル型 — 3プラン横並び比較表、✓/—で機能対応を可視化、SP横スクロール対応" },
    { "id": "price_c", "name": "Price_C", "file": "price_c.html", "description": "シンプル料金リスト型 — 項目名+説明+価格の縦リスト、注釈+CTAボタン付き" }
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
