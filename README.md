# SafeReach 🛡️
### AI-Powered System for Real-Time Disaster Information and Relief Resource Matching

> **"The right information ... to the right people ... at the right time"**  
> مشروع أكاديمي متكامل يجمع بين مواد: **Information Retrieval (IR)** + **Design & Analysis of Algorithms** + **Pattern Recognition / Computer Vision**.

---

## 📌 فكرة المشروع ومكوناته (Project Overview)

أثناء الكوارث الطبيعية (السيول، الفيضانات، الزلازل)، يواجه المتضررون وفرق الإنقاذ 4 مشاكل رئيسية:
1. **انتشار الشائعات والأخبار المضللة على السوشيال ميديا.**
2. **صعوبة وبطء الوصول إلى الإغاثة والملاجئ بسبب الطرق المغمورة بالسيول.**
3. **عدم توزيع المساعدات بشكل عادل وفعال طبقاً لدرجة الخطورة.**
4. **صعوبة تقييم الأضرار في المناطق المنكوبة فور حدوثها.**

نظام **SafeReach** يقدم حلاً تكنولوجياً متكاملاً عبر 3 محاور علمية:

| المحور الأكاديمي | اسم الموديول | الوظيفة والخوارزمية المطبقة |
| :--- | :--- | :--- |
| **Information Retrieval (IR)** | `core/ir_engine.py` | محرك بحث واسترجاع للنصوص العربية والإنجليزية عبر **Inverted Index** و **Okapi BM25** مع فلتر تحقق من الشائعات (**Credibility Scoring**). |
| **Algorithms** | `core/algorithms_module.py` | حساب المسارات الآمنة وتفادي السيول بخوارزمية **Dijkstra و A\*** (مع أوزان أخطار حركية)، وتوزيع الموارد بخوارزمية **Maximum Bipartite Matching**. |
| **Pattern Recognition / CV** | `core/vision_module.py` | تحليل صور الكوارث بكشف الأجسام (**Object Detection / YOLO format**) وحساب مؤشر شدة الكارثة (**Damage Severity Index - DSI**). |

---

## 🗂️ هيكل مجلدات المشروع (Directory Structure)

```text
SafeReach/
│
├── run_safereach.bat         # ملف تشغيل الموقع بضغطة زر واحدة في المتصفح
├── README.md                 # دليل المشروع ودليل أسئلة المناقشة
│
├── web/                      # الواجهة التفاعلية الكاملة للمشروع (Web Application)
│   ├── index.html            # الصفحة الرئيسية ولوحة التحكم
│   ├── app.js                # منطق الربط والخريطة ومحرك الـ IR والـ CV
│   └── styles.css            # التصميم وتنسيقات منصة الطوارئ
│
├── core/                     # أكواد المواد الأكاديمية (Python Core)
│   ├── ir_engine.py          # [IR] Inverted Index + BM25 + TF-IDF + Credibility
│   ├── algorithms_module.py  # [Algorithms] Dijkstra Hazard Detour + Bipartite Matching
│   └── vision_module.py      # [Pattern/CV] Damage Detection + Severity Calculator
│
└── data/                     # البيانات والشبكات الجغرافية
    └── disaster_data.json    # داتا سيت المنشورات، شبكة الطرق، مراكز الإغاثة، المستغيثين
```

---

## 🚀 كيفية تشغيل المشروع (How to Run)

### 1. تشغيل موقع الويب التفاعلي (SafeReach Web Dashboard):
* ببساطة، اضغط دبل كليك على الملف: **`run_safereach.bat`**  
* أو افتح الملف **`web/index.html`** مباشرة في أي متصفح (Chrome, Edge, Firefox).
* سيعمل الموقع كاملاً بدون الحاجة لأي تثبيت أو سيرفرات معقدة!

### 2. تشغيل واختبار أكواد الـ Python (لو حبيت توري الدكتور المخرجات من الـ Terminal):
```bash
# اختبار موديول استرجاع المعلومات (IR)
python core/ir_engine.py

# اختبار موديول الخوارزميات وتفادي الطرق المغمورة وتوزيع الموارد
python core/algorithms_module.py

# اختبار موديول الرؤية الحاسوبية وتحديد شدة الضرر من الصور
python core/vision_module.py
```

---

## 🎓 أهم أسئلة وإجابات مناقشة المشروع (Defense Cheatsheet)

### س1: إزاي الـ 3 مواد مربوطين ببعض؟ (The Core Architecture)
> **الإجابة:**  
> "نظامنا بيستقبل بيانات الكارثة في شكلين: **نصوص وصور**.  
> - **الـ Computer Vision** بيحلل صور الكارثة (زي صور شارع الجمهورية أو شارع الجيش) ويكتشف إن الطريق مغمور بمياه السيول بنسبة 68%.  
> - مخرجات الرؤية دي بتدخل فوراً لـ **الـ Algorithms Module**، فتقوم خوارزمية **Dijkstra** برفع وزن تكلفة شارع الجيش بـ 1000 ضعف (Hazard Penalty)، وترسم مسار بديل آمن 100% عبر طريق المشاية السفلي.  
> - في نفس الوقت، **الـ IR Engine** بيفلتر مئات الاستغاثات والمنشورات بالـ **BM25 و Inverted Index**، ويستبعد الشائعات (زي شائعة سقوط كوبري طلخا) ويوجه الناس للمنشورات الموثقة من الهلال الأحمر."

### س2: إيه الخوارزميات المطبقة في الـ IR بالتفصيل؟
> **الإجابة:**  
> 1. معالجة النصوص العربية: إزالة التشكيل، توحيد الألفات (إ، أ، آ -> ا)، الياء والتاء المربوطة، وتصفية الـ Stopwords.  
> 2. بناء **Inverted Index** يخزن تكرار الكلمات في كل وثيقة (Term Frequencies & Postings).  
> 3. الترتيب باستخدام **Okapi BM25** بالمعادلة:  
>    $$\text{Score}(D, Q) = \sum_{q \in Q} \text{IDF}(q) \cdot \frac{f(q, D) \cdot (k_1 + 1)}{f(q, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$  
> 4. دمج **Credibility Scoring** لضرب نتائج المنشورات المجهولة في عامل تصغير (0.25) لمنع انتشار الشائعات وقت الأزمات.

### س3: إيه خوارزميات الـ Algorithms وليه استخدمتوها؟
> **الإجابة:**  
> 1. **Dijkstra / A\* Algorithm:** لإيجاد أقصر مسار آمن. الفرق عندنا إن الـ Graph بياخد أوزان ديناميكية (`Effective_Cost = Distance * Hazard_Multiplier`).  
> 2. **Maximum Bipartite Matching:** لمطابقة مجموعتين منفصلتين (المتضررين ومراكز الدعم) مع مراعاة السعة ونوع الخدمة (مأوى، إسعاف، مياه) مع **Priority Queue** لمنح الحالات الحرجة الأولوية.

### س4: نموذج الـ Pattern Recognition بيشتغل إزاي؟
> **الإجابة:**  
> يعتمد على بنية **Object Detection (YOLO format)** للتعرف على كلاسات الكوارث:
> `flooded_area`, `damaged_building`, `person_in_need`, `emergency_vehicle`, `safe_zone`.  
> ويحسب مؤشر الخطورة **Damage Severity Index (DSI)**:  
> $$\text{DSI} = 0.40 \cdot \text{Flood\_Ratio} + 0.45 \cdot \text{Building\_Damage\_Ratio} + \text{People\_Penalty}$$  
> وبناء عليه يصدر النظام قراراً تكتيكياً فورياً (مثل: إرسال قوارب إغاثة مائية أو إخلاء المبنى).

---

## 🏆 مميزات المشروع أمام لجنة التحكيم:
* يغطي مشكلة واقعية تخدم أهداف التنمية المجتمعية والإنسانية.
* يجمع 3 مناهج في تطبيق واحد حي وشغال.
* واجهة مستخدم احترافية بالكامل بالخريطة الحية ومحرك البحث وأداة فحص الصور.
