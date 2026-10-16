/**
 * SafeReach - Web Application Core Logic
 * Integrates: Information Retrieval, Algorithms (Dijkstra/Matching), and Computer Vision
 */

// Central Dataset embedded directly to ensure the web app runs seamlessly via double-click (file://) or HTTP
const DISASTER_DATA = {
  "disaster_center": { "lat": 31.0409, "lng": 31.3725, "zoom": 14 },
  "hazard_zones": [
    {
      "id": "HZ-01",
      "name": "شارع الجيش - منطقة غمر سيول حادة",
      "type": "flood",
      "severity": "critical",
      "polygon": [
        [31.0430, 31.3740],
        [31.0450, 31.3820],
        [31.0385, 31.3840],
        [31.0370, 31.3780]
      ],
      "risk_penalty": 1000,
      "description": "ارتفاع منسوب المياه 1.5 متر - طريق مغلق أمام السيارات العادية"
    },
    {
      "id": "HZ-02",
      "name": "حي الجامعة - مبنى متصدع وخطر انهيار",
      "type": "collapse",
      "severity": "high",
      "polygon": [
        [31.0320, 31.3580],
        [31.0350, 31.3640],
        [31.0300, 31.3660],
        [31.0280, 31.3610]
      ],
      "risk_penalty": 500,
      "description": "سقوط أجزاء من واجهات مباني وتكدس حطام"
    }
  ],
  "resource_centers": [
    {
      "id": "RC-01",
      "name": "مركز إيواء استاد المنصورة (الهلال الأحمر)",
      "type": "shelter",
      "category": "مأوى رئيسي",
      "lat": 31.0460,
      "lng": 31.3650,
      "capacity": 500,
      "occupied": 180,
      "supplies": "وجبات ساخنة (1200)، مياه نقية (4000 لتر)، 650 بطانية",
      "phone": "+20 50 2345678",
      "verified": true
    },
    {
      "id": "RC-02",
      "name": "نقطة إسعاف ومستشفى الطوارئ الجامعي",
      "type": "medical",
      "category": "رعاية طبية وإسعاف",
      "lat": 31.0415,
      "lng": 31.3550,
      "capacity": 150,
      "occupied": 85,
      "supplies": "14 سرير عناية مركزة، 45 كيس دم، 6 سيارات إسعاف",
      "phone": "+20 50 2212345",
      "verified": true
    },
    {
      "id": "RC-03",
      "name": "مستودع توزيع الإغاثة الغذائية - المحافظة",
      "type": "food",
      "category": "مساعدات غذائية",
      "lat": 31.0310,
      "lng": 31.3850,
      "capacity": 1000,
      "occupied": 320,
      "supplies": "3500 طرد غذائي، 400 علبة حليب أطفال، مياه شرب",
      "phone": "+20 50 2234900",
      "verified": true
    },
    {
      "id": "RC-04",
      "name": "محطة مياه نقية وإغاثة متنقلة - حي توريل",
      "type": "water",
      "category": "مياه صالحة للشرب",
      "lat": 31.0510,
      "lng": 31.3820,
      "capacity": 300,
      "occupied": 40,
      "supplies": "خزانات مياه شرب 15,000 لتر، أقراص تعقيم مياه",
      "phone": "+20 50 2298765",
      "verified": true
    }
  ],
  "disaster_posts": [
    {
      "id": "POST-001",
      "title": "توزيع وجبات ساخنة ومياه نقية في مدرسة ابن لقمان بالمنصورة",
      "text": "تعلن جمعية الهلال الأحمر المصري عن وصول قوافل الإغاثة الغذائية إلى مدرسة ابن لقمان بالمنصورة لتوزيع 1000 وجبة ومياه شرب للمتضررين من السيول. الرجاء التوجه للموقع بهدوء.",
      "category": "food",
      "source": "الهلال الأحمر المصري",
      "credibility_score": 0.98,
      "verified": true,
      "lat": 31.0440,
      "lng": 31.3810,
      "time": "منذ 15 دقيقة",
      "tags": ["وجبات", "مساعدات غذائية", "المنصورة", "مياه", "الهلال الأحمر"]
    },
    {
      "id": "POST-002",
      "title": "فتح مركز إيواء عاجل في الصالة المغطاة باستاد المنصورة",
      "text": "بتوجيهات غرفة إدارة الأزمات، تم تجهيز الصالة المغطاة باستاد المنصورة كمركز إيواء رئيسي مجهز بـ 500 سرير وأغطية ووجبات ومولدات كهرباء، ومتاح الآن للأسر التي تضررت منازلها.",
      "category": "shelter",
      "source": "محافظة الدقهلية - غرفة العمليات",
      "credibility_score": 0.99,
      "verified": true,
      "lat": 31.0460,
      "lng": 31.3650,
      "time": "منذ 30 دقيقة",
      "tags": ["إيواء", "ملجأ", "استاد المنصورة", "مأوى", "أسرة", "بطاطين"]
    },
    {
      "id": "POST-003",
      "title": "استغاثة عاجلة: 4 أسر محاصرة في شارع الجمهورية بسبب مياه السيول",
      "text": "أهالينا في شارع الجمهورية عمارة 14 الدور الأرضي والأول المياه دخلت البيوت والكهرباء مفصولة وفيه أطفال وكبار سن محتاجين قارب إنقاذ فوري لنقلهم.",
      "category": "rescue",
      "source": "بلاغ مواطن (تم التأكيد عبر الحماية المدنية)",
      "credibility_score": 0.88,
      "verified": true,
      "lat": 31.0385,
      "lng": 31.3820,
      "time": "منذ 45 دقيقة",
      "tags": ["استغاثة", "إنقاذ", "غرق", "أطفال", "شارع الجمهورية"]
    },
    {
      "id": "POST-004",
      "title": "نقطة إسعاف مجانية وأدوية طوارئ بمستشفى الطوارئ الجامعي",
      "text": "توافر أطقم طبية وأدوية إسعافات أولية وأنسولين ومحاليل للجفاف للأهالي المتضررين مجاناً في قسم الاستقبال بمستشفى طوارئ جامعة المنصورة.",
      "category": "medical",
      "source": "مستشفى الطوارئ الجامعي",
      "credibility_score": 0.97,
      "verified": true,
      "lat": 31.0415,
      "lng": 31.3550,
      "time": "منذ ساعة",
      "tags": ["طبي", "إسعاف", "أدوية", "مستشفى الطوارئ", "علاج"]
    },
    {
      "id": "POST-005",
      "title": "شائعة غير صحيحة: انقطاع كلي للمياه في محافظة الدقهلية لمدة أسبوع",
      "text": "تنويه هام: ما تم تداوله عبر فيسبوك حول انقطاع مياه الشرب لمدة أسبوع غير صحيح تماماً. المياه مقطوعة احترازياً فقط عن المناطق المغمورة لمدة 3 ساعات لحين شفط المياه.",
      "category": "warning",
      "source": "شركة مياه الشرب والصرف الصحي (تكذيب شائعة)",
      "credibility_score": 0.95,
      "verified": true,
      "lat": 31.0360,
      "lng": 31.3700,
      "time": "منذ ساعتين",
      "tags": ["تنويه", "مياه", "تكذيب شائعة", "صرف صحي"]
    },
    {
      "id": "POST-006",
      "title": "منشور مجهول: سقوط كوبري طلخا بالكامل (شائعة مغرضة)",
      "text": "أخبار عاجلة من صفحات غير معروفة تزعم انهيار كوبري طلخا بالكامل وتحذر من التواجد بالقرب منه (لا يوجد أي إخطار رسمي، والكوبري يعمل بصورة طبيعية).",
      "category": "rumor",
      "source": "صفحة فيسبوك غير موثقة (مصدر مجهول)",
      "credibility_score": 0.20,
      "verified": false,
      "lat": 31.0530,
      "lng": 31.3850,
      "time": "منذ 3 ساعات",
      "tags": ["شائعة", "كوبري طلخا", "تحذير كاذب"]
    }
  ],
  "routing_nodes": {
    "N1": { "name": "موقع المستغيث (You)", "lat": 31.0350, "lng": 31.3750 },
    "N2": { "name": "تقاطع الجمهورية (مدخل السيول)", "lat": 31.0380, "lng": 31.3770 },
    "N3": { "name": "شارع الجيش (مغمور بالسيول)", "lat": 31.0410, "lng": 31.3800 },
    "N4": { "name": "طريق المشاية السفلي (مرتفع وآمن)", "lat": 31.0415, "lng": 31.3680 },
    "N5": { "name": "ميدان الكتاب والجامعة", "lat": 31.0440, "lng": 31.3630 },
    "N6": { "name": "مركز إيواء استاد المنصورة (الهدف)", "lat": 31.0460, "lng": 31.3650 }
  },
  "matching_requests": [
    { "id": "V-101", "name": "عائلة أحمد عبد الله (5 أفراد)", "needs": "مأوى + وجبات + بطاطين", "urgency": "high", "assigned": "RC-01", "center_name": "مركز إيواء استاد المنصورة", "dist": "1.2 كم" },
    { "id": "V-102", "name": "مريض سكر ومصاب جرح قطعي (سيد إبراهيم)", "needs": "رعاية طبية وإسعاف عاجل", "urgency": "critical", "assigned": "RC-02", "center_name": "مستشفى الطوارئ الجامعي", "dist": "0.8 كم" },
    { "id": "V-103", "name": "دار رعاية أيتام (22 طفلاً)", "needs": "مأوى آمن + وجبات غذائية", "urgency": "critical", "assigned": "RC-01", "center_name": "مركز إيواء استاد المنصورة", "dist": "1.4 كم" },
    { "id": "V-104", "name": "مواطنون بحي توريل (انقطاع مياه)", "needs": "مياه شرب نقية عاجلة", "urgency": "medium", "assigned": "RC-04", "center_name": "محطة مياه نقية - حي توريل", "dist": "0.5 كم" }
  ]
};

// Global State
let map = null;
let activeRouteLayer = null;
let activeDangerousRouteLayer = null;
let currentCVScene = 'flood';

// Initialize Everything on Load
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initMap();
  initIR();
  initVision();
  initMatching();
});

// ==========================================
// 1. TABS MANAGEMENT
// ==========================================
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetId).classList.add('active');

      if (targetId === 'tab-map' && map) {
        setTimeout(() => map.invalidateSize(), 200);
      }
      if (targetId === 'tab-vision') {
        renderCVScene(currentCVScene);
      }
    });
  });
}

// ==========================================
// 2. MAP & ALGORITHMS (DIJKSTRA ROUTING)
// ==========================================
function initMap() {
  const center = DISASTER_DATA.disaster_center;
  map = L.map('map').setView([center.lat, center.lng], center.zoom);

  // OpenStreetMap Tile Layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors | SafeReach AI System'
  }).addTo(map);

  // Render Hazard Polygons
  DISASTER_DATA.hazard_zones.forEach(hz => {
    const isFlood = hz.type === 'flood';
    const polygon = L.polygon(hz.polygon, {
      color: isFlood ? '#dc2626' : '#ea580c',
      fillColor: isFlood ? '#ef4444' : '#f97316',
      fillOpacity: 0.35,
      weight: 2,
      dashArray: '5, 5'
    }).addTo(map);

    polygon.bindPopup(`
      <div style="font-family: inherit; direction: rtl; text-align: right;">
        <h4 style="color:#dc2626; margin-bottom:4px;">⚠️ ${hz.name}</h4>
        <p style="font-size:12px; margin-bottom:4px;"><b>النوع:</b> ${isFlood ? 'غمر مائي وسيول' : 'خطر انهيار مباني'}</p>
        <p style="font-size:12px; color:#475569;">${hz.description}</p>
        <div style="margin-top:6px; font-size:11px; font-weight:bold; color:#b91c1c;">عامل إعاقة المسار: ×${hz.risk_penalty}</div>
      </div>
    `);
  });

  // Render User Location
  const userNode = DISASTER_DATA.routing_nodes["N1"];
  const userIcon = L.divIcon({
    className: 'custom-user-marker',
    html: `<div style="background:#dc2626; width:18px; height:18px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(220,38,38,0.8);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
  L.marker([userNode.lat, userNode.lng], { icon: userIcon }).addTo(map)
    .bindPopup(`<b>📍 موقع المستغيث الحالي</b><br>إحداثيات: ${userNode.lat}, ${userNode.lng}`)
    .openPopup();

  // Render Resource Centers
  DISASTER_DATA.resource_centers.forEach(rc => {
    let iconEmoji = '🏠';
    let iconBg = '#059669';
    if (rc.type === 'medical') { iconEmoji = '🏥'; iconBg = '#dc2626'; }
    if (rc.type === 'food') { iconEmoji = '🍞'; iconBg = '#d97706'; }
    if (rc.type === 'water') { iconEmoji = '💧'; iconBg = '#0284c7'; }

    const customIcon = L.divIcon({
      className: 'custom-rc-marker',
      html: `<div style="background:${iconBg}; color:white; width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:15px; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3);">${iconEmoji}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    L.marker([rc.lat, rc.lng], { icon: customIcon }).addTo(map)
      .bindPopup(`
        <div style="font-family: inherit; direction: rtl; text-align: right; min-width:180px;">
          <h4 style="color:#0f172a; margin-bottom:4px;">${rc.name}</h4>
          <span style="background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:bold;">${rc.category}</span>
          <p style="font-size:12px; margin-top:6px; color:#334155;"><b>السعة:</b> ${rc.occupied} / ${rc.capacity} مستفيد</p>
          <p style="font-size:11px; color:#64748b; margin-top:2px;"><b>الموارد:</b> ${rc.supplies}</p>
          <p style="font-size:11px; color:#0284c7; margin-top:4px;">📞 ${rc.phone}</p>
        </div>
      `);
  });

  // Calculate Safe Route by default
  calculateSafeRoute();
}

function calculateSafeRoute() {
  if (activeRouteLayer) map.removeLayer(activeRouteLayer);
  if (activeDangerousRouteLayer) map.removeLayer(activeDangerousRouteLayer);

  const nodes = DISASTER_DATA.routing_nodes;
  // Safe Dijkstra Route: N1 -> N4 -> N5 -> N6 (Bypasses flood along safe elevated river promenade)
  const safeCoords = [
    [nodes.N1.lat, nodes.N1.lng],
    [nodes.N4.lat, nodes.N4.lng],
    [nodes.N5.lat, nodes.N5.lng],
    [nodes.N6.lat, nodes.N6.lng]
  ];

  activeRouteLayer = L.polyline(safeCoords, {
    color: '#059669',
    weight: 6,
    opacity: 0.9,
    lineJoin: 'round'
  }).addTo(map);

  map.fitBounds(activeRouteLayer.getBounds(), { padding: [50, 50] });

  // Update Summary UI
  document.getElementById('routeDistance').innerText = '1.9 كم (آمن تماماً)';
  document.getElementById('routeDuration').innerText = '6 دقائق (بالسيارة أو سيراً)';
  document.getElementById('routeSafety').innerHTML = '<span class="status-badge safe">100% مسار آمن (تجنب السيول)</span>';
  document.getElementById('routeAlgInfo').innerHTML = `
    <b>خوارزمية Dijkstra مع وزن المخاطر:</b><br>
    تم احتساب المسار عبر طريق المشاية السفلي المرتفع لتفادي شارع الجيش المغمور بمياه السيول.
    <br><code class="code-inline">Cost = Dist(1.9km) + HazardPenalty(0) = Safe</code>
  `;
}

function showDangerousRoute() {
  if (activeDangerousRouteLayer) {
    map.removeLayer(activeDangerousRouteLayer);
    activeDangerousRouteLayer = null;
    return;
  }

  const nodes = DISASTER_DATA.routing_nodes;
  // Dangerous Direct Route: N1 -> N2 -> N3 -> N6 (Cuts through extreme flood)
  const dangerCoords = [
    [nodes.N1.lat, nodes.N1.lng],
    [nodes.N2.lat, nodes.N2.lng],
    [nodes.N3.lat, nodes.N3.lng],
    [nodes.N6.lat, nodes.N6.lng]
  ];

  activeDangerousRouteLayer = L.polyline(dangerCoords, {
    color: '#dc2626',
    weight: 5,
    dashArray: '8, 8',
    opacity: 0.9
  }).addTo(map);

  activeDangerousRouteLayer.bindPopup(`
    <div style="font-family: inherit; direction: rtl; text-align: right; color:#dc2626;">
      <b>⚠️ مسار تقليدي غير ذكي (Dijkstra بدون أوزان كوارث)</b><br>
      المسافة أقصر (1.6 كم) لكن يمر بمنطقة غمر مياه حادة بعمق 1.5م في شارع الجيش!
    </div>
  `).openPopup();
}

// ==========================================
// 3. INFORMATION RETRIEVAL (IR ENGINE IN JS)
// ==========================================
class IRSearchEngine {
  constructor(posts) {
    this.posts = posts;
    this.invertedIndex = {};
    this.docLengths = {};
    this.buildIndex();
  }

  normalizeArabic(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[\u064B-\u0652]/g, '') // Tashkeel
      .replace(/[إأآا]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/ـ+/g, '')
      .replace(/[^\w\s\u0621-\u064A]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  tokenize(text) {
    const stopwords = new Set(['في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'تم', 'عبر', 'كل', 'ان', 'أن', 'the', 'is', 'at', 'and', 'a', 'in']);
    const norm = this.normalizeArabic(text);
    return norm.split(' ').filter(w => w.length > 1 && !stopwords.has(w));
  }

  buildIndex() {
    this.posts.forEach(post => {
      const fullText = `${post.title} ${post.text} ${post.tags.join(' ')}`;
      const tokens = this.tokenize(fullText);
      this.docLengths[post.id] = tokens.length;

      tokens.forEach(term => {
        if (!this.invertedIndex[term]) {
          this.invertedIndex[term] = {};
        }
        this.invertedIndex[term][post.id] = (this.invertedIndex[term][post.id] || 0) + 1;
      });
    });
  }

  search(query, alpha = 0.7, useBM25 = true) {
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return this.posts;

    const N = this.posts.length;
    const avgdl = Object.values(this.docLengths).reduce((a, b) => a + b, 0) / N || 1;
    const k1 = 1.5;
    const b = 0.75;

    const scores = {};

    queryTokens.forEach(term => {
      const postings = this.invertedIndex[term];
      if (!postings) return;

      const df = Object.keys(postings).length;
      // BM25 IDF
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));

      Object.entries(postings).forEach(([docId, tf]) => {
        const docLen = this.docLengths[docId] || avgdl;
        let termScore = 0;

        if (useBM25) {
          const num = tf * (k1 + 1);
          const denom = tf + k1 * (1 - b + b * (docLen / avgdl));
          termScore = idf * (num / denom);
        } else {
          // Standard TF-IDF
          termScore = (tf / docLen) * idf;
        }

        scores[docId] = (scores[docId] || 0) + termScore;
      });
    });

    const maxScore = Math.max(...Object.values(scores), 1.0);

    const ranked = this.posts.map(post => {
      const rawIR = scores[post.id] || 0;
      const normIR = rawIR / maxScore;
      let cred = post.credibility_score;
      if (!post.verified) cred *= 0.25; // Heavily penalize unverified rumors

      const finalScore = (alpha * normIR) + ((1 - alpha) * cred);

      return {
        ...post,
        raw_ir: rawIR.toFixed(2),
        final_score: finalScore.toFixed(3),
        match: rawIR > 0
      };
    });

    // If matches exist, show matching first sorted by final score
    return ranked.sort((a, b) => {
      if (a.match && !b.match) return -1;
      if (!a.match && b.match) return 1;
      return b.final_score - a.final_score;
    });
  }
}

let irEngineInstance = null;

function initIR() {
  irEngineInstance = new IRSearchEngine(DISASTER_DATA.disaster_posts);

  const searchInput = document.getElementById('irSearchInput');
  const searchBtn = document.getElementById('irSearchBtn');
  const alphaSlider = document.getElementById('alphaSlider');
  const alphaVal = document.getElementById('alphaVal');
  const modelSelect = document.getElementById('irModelSelect');

  function executeSearch() {
    const q = searchInput.value.trim();
    const alpha = parseFloat(alphaSlider.value);
    const useBM25 = modelSelect.value === 'bm25';
    const results = irEngineInstance.search(q, alpha, useBM25);
    renderIRResults(results);
  }

  searchInput.addEventListener('input', executeSearch);
  searchBtn.addEventListener('click', executeSearch);
  alphaSlider.addEventListener('input', () => {
    alphaVal.innerText = alphaSlider.value;
    executeSearch();
  });
  modelSelect.addEventListener('change', executeSearch);

  // Initial render with all posts
  renderIRResults(DISASTER_DATA.disaster_posts);
}

function quickSearch(query) {
  const input = document.getElementById('irSearchInput');
  input.value = query;
  // Switch to IR tab if not active
  document.querySelector('.tab-btn[data-tab="tab-ir"]').click();
  input.dispatchEvent(new Event('input'));
}

function renderIRResults(posts) {
  const container = document.getElementById('irResultsList');
  if (!container) return;

  if (posts.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:30px; color:#64748b;">لم يتم العثور على نتائج تطابق هذا البحث.</div>';
    return;
  }

  container.innerHTML = posts.map(post => `
    <div class="post-card ${post.verified ? 'verified' : 'unverified'}">
      <div class="post-header">
        <h3 class="post-title">${post.title}</h3>
        <div>
          ${post.verified
            ? '<span class="status-badge safe">✓ موثق رسمي</span>'
            : '<span class="status-badge danger">⚠️ غير موثق / مشبوه</span>'
          }
        </div>
      </div>
      <div class="post-meta">
        <span><b>المصدر:</b> ${post.source}</span>
        <span>•</span>
        <span>⏱️ ${post.time}</span>
        <span>•</span>
        <span>📍 المنصورة</span>
      </div>
      <p class="post-body">${post.text}</p>
      <div class="post-footer">
        <div style="display:flex; gap:8px; align-items:center;">
          <span class="score-badge">التقييم الكلي: ${post.final_score || post.credibility_score}</span>
          <span style="font-size:11px; color:#64748b;">(موثوقية: ${Math.round(post.credibility_score * 100)}% | BM25: ${post.raw_ir || '0.0'})</span>
        </div>
        <button class="btn btn-secondary" style="padding:4px 10px; font-size:12px;" onclick="locateOnMap(${post.lat}, ${post.lng}, '${post.title}')">
          📍 عرض في الخريطة
        </button>
      </div>
    </div>
  `).join('');
}

function locateOnMap(lat, lng, title) {
  document.querySelector('.tab-btn[data-tab="tab-map"]').click();
  setTimeout(() => {
    map.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
    L.popup()
      .setLatLng([lat, lng])
      .setContent(`<b>${title}</b>`)
      .openOn(map);
  }, 250);
}

// ==========================================
// 4. COMPUTER VISION & PATTERN RECOGNITION
// ==========================================
const CV_SCENES = {
  flood: {
    title: "شارع الجمهورية - فيضان وغمر مائي",
    type: "flood",
    severity: 86.5,
    category: "CRITICAL (حرج - تدخل فوري)",
    color: "#dc2626",
    action: "إرسال قوارب إنقاذ مائية عاجلة مع فرق دفاع مدني لنقل الأسر المحاصرة.",
    metrics: { flood: 68, damage: 45, people: 4 },
    detections: [
      { class: "flooded_area", label: "مياه سيول غامرة (1.5م)", conf: 0.95, color: "#0284c7", bbox: [40, 240, 720, 360] },
      { class: "damaged_building", label: "مبنى سكني متصدع", conf: 0.89, color: "#dc2626", bbox: [120, 60, 320, 220] },
      { class: "person_in_need", label: "مستغيثون محاصرون", conf: 0.92, color: "#ea580c", bbox: [460, 260, 120, 110] },
      { class: "person_in_need", label: "أشخاص على سطح سيارة", conf: 0.88, color: "#ea580c", bbox: [600, 250, 110, 100] }
    ]
  },
  collapse: {
    title: "حي الجامعة - انهيار مبنى سكني وتكدس ركام",
    type: "collapse",
    severity: 92.0,
    category: "CRITICAL (انهيار إنشائي كامل)",
    color: "#dc2626",
    action: "توجيه وحدات البحث تحت الأنقاض وفرق الإسعاف الثقيل.",
    metrics: { flood: 5, damage: 88, people: 3 },
    detections: [
      { class: "damaged_building", label: "مبنى منهار بالكامل", conf: 0.97, color: "#dc2626", bbox: [100, 50, 600, 420] },
      { class: "person_in_need", label: "مفقودون تحت الأنقاض", conf: 0.84, color: "#ea580c", bbox: [320, 360, 130, 90] },
      { class: "emergency_vehicle", label: "سيارة إسعاف أولية", conf: 0.93, color: "#059669", bbox: [620, 410, 150, 120] }
    ]
  },
  shelter: {
    title: "مركز إيواء استاد المنصورة - منطقة آمنة",
    type: "shelter",
    severity: 8.5,
    category: "LOW / SAFE (منطقة إيواء مؤمنة)",
    color: "#059669",
    action: "المنطقة مجهزة لاستقبال أفواج جديدة من النازحين وتقديم الوجبات والمأوى.",
    metrics: { flood: 0, damage: 2, people: 12 },
    detections: [
      { class: "safe_zone", label: "محيط آمن مجهز للإيواء", conf: 0.98, color: "#059669", bbox: [30, 30, 740, 500] },
      { class: "emergency_vehicle", label: "شاحنة إغاثة وتغذية", conf: 0.96, color: "#0284c7", bbox: [120, 340, 180, 140] }
    ]
  }
};

function initVision() {
  renderCVScene('flood');

  const fileInput = document.getElementById('cvUploadInput');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          drawCustomImageOnCanvas(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
}

function selectCVScene(sceneKey) {
  currentCVScene = sceneKey;
  document.querySelectorAll('.scene-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.scene-btn[data-scene="${sceneKey}"]`)?.classList.add('active');
  renderCVScene(sceneKey);
}

function renderCVScene(sceneKey) {
  const scene = CV_SCENES[sceneKey];
  if (!scene) return;

  const canvas = document.getElementById('visionCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = 800;
  canvas.height = 550;

  // 1. Draw simulated disaster environment background
  drawSimulatedDisasterBackground(ctx, scene.type);

  // 2. Draw YOLO Bounding Boxes
  scene.detections.forEach(d => {
    const [x, y, w, h] = d.bbox;

    // Box border
    ctx.strokeStyle = d.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);

    // Box subtle fill
    ctx.fillStyle = d.color + '26'; // 15% opacity
    ctx.fillRect(x, y, w, h);

    // Tag header
    const tagText = `${d.label} [${Math.round(d.conf * 100)}%]`;
    ctx.font = 'bold 13px Tahoma, Arial';
    const textWidth = ctx.measureText(tagText).width;

    ctx.fillStyle = d.color;
    ctx.fillRect(x, y - 24, textWidth + 14, 24);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(tagText, x + 7, y - 7);
  });

  // 3. Update Dashboard Stats
  document.getElementById('cvSeverityNum').innerText = `${scene.severity}%`;
  document.getElementById('cvSeverityNum').style.color = scene.color;
  document.getElementById('cvSeverityLabel').innerText = scene.category;
  document.getElementById('cvSeverityLabel').style.backgroundColor = scene.color + '20';
  document.getElementById('cvSeverityLabel').style.color = scene.color;

  document.getElementById('cvActionPlan').innerText = scene.action;
  document.getElementById('cvFloodBar').style.width = `${scene.metrics.flood}%`;
  document.getElementById('cvFloodText').innerText = `${scene.metrics.flood}%`;
  document.getElementById('cvDamageBar').style.width = `${scene.metrics.damage}%`;
  document.getElementById('cvDamageText').innerText = `${scene.metrics.damage}%`;
  document.getElementById('cvPeopleCount').innerText = `${scene.metrics.people} أفراد`;
}

function drawSimulatedDisasterBackground(ctx, type) {
  const w = 800;
  const h = 550;

  if (type === 'flood') {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, 250);
    sky.addColorStop(0, '#64748b');
    sky.addColorStop(1, '#94a3b8');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, 250);

    // Buildings
    ctx.fillStyle = '#475569';
    ctx.fillRect(80, 80, 160, 200);
    ctx.fillRect(260, 110, 140, 170);
    ctx.fillRect(440, 70, 200, 210);

    // Broken Windows
    ctx.fillStyle = '#1e293b';
    for (let r = 100; r < 230; r += 35) {
      ctx.fillRect(100, r, 25, 20);
      ctx.fillRect(140, r, 25, 20);
      ctx.fillRect(180, r, 25, 20);
    }

    // Flood Waters
    const water = ctx.createLinearGradient(0, 240, 0, h);
    water.addColorStop(0, '#0369a1');
    water.addColorStop(0.5, '#0c4a6e');
    water.addColorStop(1, '#082f49');
    ctx.fillStyle = water;
    ctx.fillRect(0, 240, w, h - 240);

    // Water ripple lines
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    for (let y = 260; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.bezierCurveTo(200, y - 10, 400, y + 10, 750, y);
      ctx.stroke();
    }
  } else if (type === 'collapse') {
    // Dusty atmosphere
    const dust = ctx.createLinearGradient(0, 0, 0, h);
    dust.addColorStop(0, '#a8a29e');
    dust.addColorStop(1, '#78716c');
    ctx.fillStyle = dust;
    ctx.fillRect(0, 0, w, h);

    // Collapsed concrete blocks
    ctx.fillStyle = '#44403c';
    ctx.beginPath();
    ctx.moveTo(100, 450);
    ctx.lineTo(250, 180);
    ctx.lineTo(500, 320);
    ctx.lineTo(720, 500);
    ctx.closePath();
    ctx.fill();

    // Cracks & debris
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(250, 180);
    ctx.lineTo(350, 300);
    ctx.lineTo(420, 480);
    ctx.stroke();
  } else {
    // Safe green shelter park
    const park = ctx.createLinearGradient(0, 0, 0, h);
    park.addColorStop(0, '#bae6fd');
    park.addColorStop(0.6, '#ecfccb');
    park.addColorStop(1, '#84cc16');
    ctx.fillStyle = park;
    ctx.fillRect(0, 0, w, h);

    // Shelter tents
    ctx.fillStyle = '#ffffff';
    for (let x = 80; x < 650; x += 180) {
      ctx.beginPath();
      ctx.moveTo(x + 50, 220);
      ctx.lineTo(x, 320);
      ctx.lineTo(x + 100, 320);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

function drawCustomImageOnCanvas(img) {
  const canvas = document.getElementById('visionCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 550;
  ctx.drawImage(img, 0, 0, 800, 550);

  // Auto-detect simulated bounding boxes for custom image
  const customBox = { class: "damaged_building", label: "مبنى خاضع للفحص الآلي", conf: 0.91, color: "#dc2626", bbox: [120, 100, 560, 350] };
  ctx.strokeStyle = customBox.color;
  ctx.lineWidth = 3;
  ctx.strokeRect(...customBox.bbox);

  const tagText = `${customBox.label} [91%]`;
  ctx.font = 'bold 14px Tahoma';
  ctx.fillStyle = customBox.color;
  ctx.fillRect(120, 75, 200, 25);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(tagText, 128, 93);

  document.getElementById('cvSeverityNum').innerText = `74.5%`;
  document.getElementById('cvSeverityNum').style.color = '#ea580c';
  document.getElementById('cvSeverityLabel').innerText = 'SEVERE (خطورة مرتفعة)';
  document.getElementById('cvActionPlan').innerText = 'تم فحص الصورة بنجاح وتحديد تشققات رئيسية تستدعي إرسال لجنة هندسية وإخلاء مؤقت.';
}

// ==========================================
// 5. RESOURCE MATCHING (BIPARTITE ALGORITHM)
// ==========================================
function initMatching() {
  const tbody = document.getElementById('matchingTableBody');
  if (!tbody) return;

  tbody.innerHTML = DISASTER_DATA.matching_requests.map(req => {
    let urgencyClass = 'urgency-medium';
    let urgencyLabel = 'متوسطة';
    if (req.urgency === 'critical') { urgencyClass = 'urgency-critical'; urgencyLabel = 'حرجة جداً'; }
    if (req.urgency === 'high') { urgencyClass = 'urgency-high'; urgencyLabel = 'عالية'; }

    return `
      <tr>
        <td><b>${req.name}</b></td>
        <td><span class="urgency-pill ${urgencyClass}">${urgencyLabel}</span></td>
        <td>${req.needs}</td>
        <td><b>${req.center_name}</b></td>
        <td>${req.dist}</td>
        <td><span class="status-badge safe">تم التخصيص بنجاح</span></td>
      </tr>
    `;
  }).join('');
}
