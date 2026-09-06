"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "./language-provider";

/**
 * Miran Studio — "Finance for Non-Financials" (المالية لغير الماليين).
 *
 * Phase 2 migration: this is an independent rebuild of the 7-day course
 * that used to live on a separate hosted page, now brought fully inside
 * bxbii (own route, own components, own design tokens — brand/accent/
 * surface from tailwind.config.ts) so bxbii.com never has to send anyone
 * to an outside link for it. The course content (objectives, worked
 * examples, exercises, quizzes) is bxbii's own — written for this program,
 * in Arabic, matching how the program was always delivered.
 *
 * Progress is stored per-browser in localStorage only (no account/login
 * needed to work through the material) — matches the original program's
 * "your progress is saved on this device" model.
 */

type Quiz = { question: string; options: string[]; correctIndex: number };
type Example = { title: string; body: string; conclusion: string };
type Apply = { prompt: string; hint?: string };

type Day = {
  id: number;
  duration: string;
  title: string;
  summary: string;
  objectives: string[];
  video: { title: string; channel: string; bullets: string[] };
  sections: { heading: string; body: string }[];
  deepDive: string[];
  example: Example;
  apply: Apply;
  managerQuestions: string[];
  quiz: Quiz;
};

const DAYS: Day[] = [
  {
    id: 1,
    duration: "35 دقيقة",
    title: "لغة المال التي يحتاجها كل مدير",
    summary:
      "ابدأ بالمفردات التي تظهر في الاجتماعات والتقارير، وافهم لماذا لا تعني حركة النقد دائمًا إيرادًا أو مصروفًا.",
    objectives: [
      "التمييز بين الإيراد والمصروف والأصل والالتزام وحقوق الملكية.",
      "فهم المعادلة المحاسبية والفرق بين الاستحقاق والأساس النقدي.",
    ],
    video: {
      title: "القوائم المالية ببساطة",
      channel: "The Swedish Investor · عرض تمهيدي",
      bullets: [
        "كيف تتحول العمليات اليومية إلى أرقام في القوائم.",
        "الفرق بين نتيجة الفترة والمركز المالي في تاريخ محدد.",
        "كيف ترتبط القوائم الثلاث بدل قراءتها منفصلة.",
      ],
    },
    sections: [
      {
        heading: "المصطلحات المالية الأساسية",
        body: "الإيراد هو قيمة السلع أو الخدمات التي قدمتها المنشأة خلال فترة، سواء تم التحصيل فورًا أم لاحقًا. المصروف هو تكلفة الموارد التي استُهلكت لتوليد ذلك الإيراد، مثل الرواتب والإيجار والكهرباء.\n\nالأصل مورد تملكه أو تسيطر عليه المنشأة ويتوقع أن يحقق منفعة مستقبلية، مثل النقد والمخزون والمعدات والذمم. الالتزام مبلغ أو واجب تجاه طرف آخر. أما حقوق الملكية فهي ما يتبقى للملاك بعد طرح الالتزامات من الأصول.\n\nمثال: شراء جهاز سيُستخدم ثلاث سنوات لا يُسجل كله كمصروف فوري؛ يصبح أصلًا ثم توزع تكلفته عبر الإهلاك.",
      },
      {
        heading: "المعادلة المحاسبية",
        body: "كل معاملة مالية تؤثر في جانبين على الأقل وتحافظ على توازن المعادلة. شراء جهاز نقدًا يزيد المعدات ويخفض النقدية، بينما شراء مخزون بالآجل يزيد المخزون ومستحقات الموردين معًا.\n\nتحقيق الربح يزيد صافي الأصول وحقوق الملكية، وسداد مورد يخفض النقدية والالتزامات بالقيمة نفسها.\n\nالأصول = الالتزامات + حقوق الملكية",
      },
      {
        heading: "الاستحقاق مقابل النقد",
        body: "في أساس الاستحقاق يُسجل الإيراد عند تقديم الخدمة أو تسليم السلعة، ويُسجل المصروف عند استهلاك المورد، لا عند تحرك النقد بالضرورة.\n\nلهذا قد تحقق المنشأة ربحًا دون أن تدخل الأموال إلى حسابها بعد، وقد تدفع نقدًا لشراء أصل دون أن يظهر المبلغ كله كمصروف في الشهر نفسه.\n\nمثال: خدمة بقيمة 10,000 ر.ع قُدمت في ديسمبر وتُحصّل في يناير: الإيراد والذمة يسجلان في ديسمبر، والنقدية تدخل في يناير.",
      },
    ],
    deepDive: [
      "يفصل أساس الاستحقاق بين توقيت تنفيذ النشاط وتوقيت حركة النقد، لذلك يجب مراجعة الذمم والمصروفات المستحقة بدل الاعتماد على رصيد البنك وحده.",
      "المورد الذي يقدم منفعة لأكثر من فترة قد يسجل أصلًا ثم توزع تكلفته، بينما المورد المستهلك في التشغيل اليومي يظهر مصروفًا في الفترة.",
      "الإهلاك مصروف غير نقدي يوزع تكلفة الأصل عبر عمره الإنتاجي، ويعكس قدرة الأصل ويساعد على تسعير يغطي تكلفة التجديد مستقبلًا.",
    ],
    example: {
      title: "عقد صيانة سنوي مدفوع مقدمًا",
      body: "دفعت شركة عُمانية 12,000 ر.ع في أول يناير مقابل عقد صيانة يغطي اثني عشر شهرًا.\n\n- عند الدفع يسجل أصل مدفوع مقدمًا بقيمة 12,000 ر.ع وتنخفض النقدية بالقيمة نفسها.\n- يسجل مصروف صيانة 1,000 ر.ع كل شهر مع استهلاك الخدمة.\n- بعد ثلاثة أشهر يكون المصروف 3,000 ر.ع والرصيد المتبقي كأصل 9,000 ر.ع.",
      conclusion: "خرج النقد كاملًا في يناير، لكن أثر العقد على الربح يوزع على الأشهر المستفيدة.",
    },
    apply: {
      prompt:
        "صنّف البنود التالية: نقد بالبنك 25,000 ر.ع، فاتورة مورد غير مدفوعة 4,000 ر.ع، خدمة مقدمة 12,000 ر.ع، رواتب الشهر 7,000 ر.ع، ذمم العملاء 9,000 ر.ع، وجهاز للاستخدام ثلاث سنوات 15,000 ر.ع.",
      hint: "صنّف كل بند إلى: أصل، التزام، أم مصروف — واسأل: هل يمثل منفعة مستقبلية أم واجبًا تجاه طرف آخر أم موردًا استُهلك؟",
    },
    managerQuestions: [
      "هل الرقم حركة نقدية أم إيراد أو مصروف على أساس الاستحقاق؟",
      "هل المنفعة تخص هذا الشهر أم تمتد إلى فترات لاحقة؟",
      "ما السياسة التي تحدد توقيت الاعتراف بهذا البند؟",
    ],
    quiz: {
      question: "قدمت الشركة خدمة اليوم على أن يدفع العميل بعد 30 يومًا. ماذا يحدث وفق أساس الاستحقاق؟",
      options: ["لا يسجل شيء حتى التحصيل", "يسجل الإيراد وذمة على العميل", "يسجل الإيراد والنقدية", "يسجل مصروف"],
      correctIndex: 1,
    },
  },
  {
    id: 2,
    duration: "40 دقيقة",
    title: "كيف تقرأ قائمة الدخل؟",
    summary:
      "انتقل من رقم المبيعات إلى فهم مستويات الربح والهوامش، واربط تغير الأرقام بالأسباب التشغيلية.",
    objectives: [
      "قراءة بنود قائمة الدخل والتمييز بين مستويات الربح.",
      "حساب هامش الربح الإجمالي وهامش التشغيل وتفسير تغيرهما.",
    ],
    video: {
      title: "شرح قائمة الدخل",
      channel: "Accounting Stuff · درس تطبيقي",
      bullets: [
        "تسلسل الإيراد والتكلفة ومجمل الربح والربح التشغيلي.",
        "لماذا لا يكفي رقم المبيعات للحكم على الأداء.",
        "مواضع الأسئلة التي يجب أن يطرحها المدير.",
      ],
    },
    sections: [
      {
        heading: "من الإيراد إلى صافي الربح",
        body: "تبدأ قائمة الدخل بالإيرادات، ثم تطرح تكلفة المبيعات للوصول إلى مجمل الربح. بعد طرح المصروفات التشغيلية نصل إلى الربح التشغيلي، ثم إلى صافي الربح بعد البنود الأخرى والضرائب.\n\nتكلفة المبيعات ترتبط مباشرة بما بيع، مثل المواد أو تكلفة البضاعة. المصروفات التشغيلية تشمل الرواتب الإدارية والتسويق والإيجار.\n\nالإيرادات − تكلفة المبيعات = مجمل الربح",
      },
      {
        heading: "الهوامش أهم من الرقم وحده",
        body: "الهامش يحول الربح إلى نسبة من الإيراد، فيسمح بالمقارنة بين فترات أو فروع مختلفة الحجم. نمو المبيعات قد يخفي تراجعًا إذا جاءت الزيادة من خصومات كبيرة أو منتجات منخفضة الهامش.\n\nراقب هامش الربح الإجمالي لفهم التسعير وتكلفة المبيعات، وهامش التشغيل لفهم كفاءة النشاط بعد المصروفات التشغيلية.\n\nهامش الربح الإجمالي = مجمل الربح ÷ الإيرادات × 100\nمثال: إيرادات 120,000 وتكلفة مبيعات 72,000: مجمل الربح 48,000، والهامش 40٪.",
      },
      {
        heading: "كيف تفسر التغير؟",
        body: "عند مقارنة شهرين اسأل: هل تغير الحجم أم السعر أم مزيج المنتجات؟ هل ارتفعت تكلفة الوحدة؟ هل زادت الخصومات أو المرتجعات؟ وهل المصروف مؤقت أم متكرر؟\n\nالتحليل الجيد لا يكرر الرقم؛ بل يربطه بسبب تشغيلي وإجراء يمكن للإدارة اتخاذه.",
      },
    ],
    deepDive: [
      "حلّل تغير الإيراد بجسر السعر والحجم والمزيج: هل جاء النمو من وحدات أكثر أم سعر أعلى أم منتجات مختلفة؟",
      "هامش الربح الإجمالي يقيس ما يتبقى بعد تكلفة المبيعات، بينما هامش المساهمة يركز على الإيراد بعد التكاليف المتغيرة.",
      "كلما زادت التكاليف الثابتة ازدادت حساسية الربح لتغير المبيعات؛ وهي الرافعة التشغيلية التي تضخم الصعود والهبوط معًا.",
    ],
    example: {
      title: "نمو المبيعات مع تراجع الهامش",
      body: "باع فرع في مسقط 10,000 اشتراك بسعر 8 ر.ع وتكلفة 4.800 ر.ع، ثم باع 11,000 اشتراك بمتوسط 7.500 ر.ع وتكلفة 5 ر.ع.\n\n- الشهر الأول: الإيراد 80,000 ر.ع، مجمل الربح 32,000 ر.ع، والهامش 40٪.\n- الشهر الثاني: الإيراد 82,500 ر.ع، مجمل الربح 27,500 ر.ع، والهامش 33.3٪ تقريبًا.\n- زاد الإيراد 3.1٪ تقريبًا، لكن مجمل الربح انخفض 4,500 ر.ع بسبب السعر والتكلفة.",
      conclusion: "نمو الإيراد ليس نجاحًا مكتملًا ما لم يحافظ النشاط على الهامش وجودة التحصيل.",
    },
    apply: {
      prompt: "فرع حقق إيرادات 200,000 ر.ع، وتكلفة مبيعات 130,000، ومصروفات تشغيلية 50,000. احسب مجمل الربح والربح التشغيلي وهامشيهما.",
      hint: "مجمل الربح = الإيرادات − تكلفة المبيعات. الربح التشغيلي = مجمل الربح − المصروفات التشغيلية.",
    },
    managerQuestions: [
      "كم من تغير الإيراد سببه الحجم وكم سببه السعر أو المزيج؟",
      "هل الخصم صنع حجمًا مربحًا أم نقل القيمة إلى العميل؟",
      "أي تكلفة وحدة ارتفعت، وهل السبب مؤقت أم هيكلي؟",
    ],
    quiz: {
      question: "بلغت الإيرادات 100,000 ر.ع وتكلفة المبيعات 60,000. ما هامش الربح الإجمالي؟",
      options: ["20٪", "40٪", "60٪", "160٪"],
      correctIndex: 1,
    },
  },
  {
    id: 3,
    duration: "40 دقيقة",
    title: "الميزانية العمومية وصحة المنشأة",
    summary: "اقرأ صورة المركز المالي، ثم استخدم رأس المال العامل لفهم مرونة التشغيل والسيولة القريبة.",
    objectives: [
      "قراءة الأصول والالتزامات وحقوق الملكية في تاريخ محدد.",
      "استخدام رأس المال العامل والنسبة المتداولة دون الوقوع في استنتاجات سطحية.",
    ],
    video: {
      title: "كيف تقرأ الميزانية العمومية؟",
      channel: "The Finance Storyteller · شرح بصري",
      bullets: [
        "معنى الأصول والالتزامات وحقوق الملكية.",
        "لماذا تعد الميزانية لقطة في تاريخ محدد.",
        "كيف تختبر السيولة والملاءة من الأرصدة.",
      ],
    },
    sections: [
      {
        heading: "ماذا تعرض الميزانية العمومية؟",
        body: "الميزانية العمومية صورة للمركز المالي في تاريخ معين. الأصول المتداولة تتحول عادة إلى نقد أو تُستهلك خلال دورة التشغيل، مثل النقد والذمم والمخزون. الأصول غير المتداولة تخدم المنشأة لفترة أطول، مثل المعدات.\n\nالالتزامات المتداولة تستحق غالبًا خلال سنة، بينما تمتد الالتزامات طويلة الأجل لفترة أطول. حقوق الملكية تمثل ما يتبقى للملاك.",
      },
      {
        heading: "رأس المال العامل والسيولة",
        body: "رأس المال العامل الموجب يوفر هامشًا لتغطية الالتزامات القريبة، لكنه لا يكفي وحده للحكم؛ فقد يكون معظم الأصل مخزونًا بطيء الحركة أو ذممًا متأخرة.\n\nالنسبة المتداولة تساعد في المقارنة، لكن جودة الأصول وسرعة تحولها إلى نقد أهم من الرقم منفردًا.\n\nصافي رأس المال العامل = الأصول المتداولة − الالتزامات المتداولة\nمثال: أصول متداولة 100,000 والتزامات متداولة 50,000: رأس المال العامل 50,000 والنسبة المتداولة 2.",
      },
      {
        heading: "قرارات التشغيل تظهر في الميزانية",
        body: "شراء كميات أكبر من الحاجة يرفع المخزون ويجمّد النقد. منح العملاء آجالًا أطول يرفع الذمم ويؤخر التحصيل. تأخير الصيانة قد يخفض المصروف مؤقتًا لكنه يرفع مخاطر الأعطال.\n\nقرارات المبيعات والمشتريات والتشغيل ليست بعيدة عن المالية؛ كل واحد منها يغير الأصول أو الالتزامات أو جودة السيولة.",
      },
    ],
    deepDive: [
      "جودة رأس المال العامل أهم من قيمته المجردة؛ فالذمم القديمة والمخزون الراكد قد يرفعان الأصول دون توفير سيولة حقيقية.",
      "النسبة المتداولة تشمل المخزون، بينما النسبة السريعة تستبعده غالبًا، والفرق بينهما يكشف الاعتماد على بيع المخزون.",
      "اقرأ الميزانية مع اتجاه عدة أشهر وأعمار الذمم والمخزون والالتزامات التعاقدية، لا كلقطة منفردة.",
    ],
    example: {
      title: "سيولة تبدو قوية ظاهريًا",
      body: "لدى شركة نقدية 12,000 ر.ع، وذمم 36,000، ومخزون 52,000، مقابل التزامات متداولة 50,000 ر.ع.\n\n- النسبة المتداولة تساوي 2 وتبدو مريحة عند النظر إليها وحدها.\n- النسبة السريعة تساوي 0.96، ما يكشف اعتماد الشركة على المخزون للوفاء بالتزاماتها.",
      conclusion: "افحص قابلية تحصيل الذمم وسرعة حركة المخزون قبل وصف السيولة بأنها قوية.",
    },
    apply: {
      prompt: "لدى شركة نقد 20,000، ذمم 30,000، مخزون 50,000، ومعدات 100,000. التزاماتها المتداولة 50,000 وطويلة الأجل 60,000. احسب رأس المال العامل وحقوق الملكية.",
      hint: "رأس المال العامل = الأصول المتداولة − الالتزامات المتداولة. حقوق الملكية = إجمالي الأصول − إجمالي الالتزامات.",
    },
    managerQuestions: [
      "ما نسبة الذمم المتأخرة والمخزون الراكد؟",
      "هل تحسن رأس المال العامل بسبب أداء حقيقي أم تأخير الموردين؟",
      "ما الذي يمكن تحويله إلى نقد خلال 30 يومًا فعليًا؟",
    ],
    quiz: {
      question: "شراء مخزون بالآجل يؤدي فورًا إلى:",
      options: ["زيادة المخزون والنقدية", "انخفاض المخزون وزيادة الالتزامات", "زيادة المخزون ومستحقات الموردين", "تسجيل كامل القيمة كمصروف"],
      correctIndex: 2,
    },
  },
  {
    id: 4,
    duration: "35 دقيقة",
    title: "النقد ليس هو الربح",
    summary: "افهم أين دخل النقد وأين خرج، ولماذا قد تكون الشركة رابحة ومع ذلك تواجه ضغطًا في السيولة.",
    objectives: [
      "تصنيف التدفقات إلى تشغيلية واستثمارية وتمويلية.",
      "تشخيص أسباب نقص النقد رغم ظهور أرباح محاسبية.",
    ],
    video: {
      title: "قائمة التدفق النقدي للمبتدئين",
      channel: "Accounting Stuff · شرح شامل",
      bullets: ["الفرق بين الربح والتدفق النقدي.", "التشغيل والاستثمار والتمويل.", "كيف يستهلك نمو الذمم والمخزون النقد."],
    },
    sections: [
      {
        heading: "أنواع التدفقات النقدية",
        body: "الأنشطة التشغيلية تشمل التحصيل من العملاء والدفع للموردين والموظفين. الأنشطة الاستثمارية تشمل شراء أو بيع الأصول طويلة الأجل. الأنشطة التمويلية تشمل الحصول على تمويل أو سداده.\n\nالتصنيف يوضح مصدر النقد واستخدامه، لا مجرد مقدار الرصيد النهائي.",
      },
      {
        heading: "لماذا يختلف الربح عن النقد؟",
        body: "قد تكون الشركة رابحة لكن نقدها منخفض لأن المبيعات لم تُحصّل، أو المخزون ارتفع، أو دُفعت التزامات قديمة، أو اشتُريت معدات. وقد يتحسن النقد دون تحسن الربح بسبب تحصيل ذمم قديمة أو تمويل جديد.\n\nالإهلاك مصروف يخفض الربح لكنه لا يخرج نقدًا في الفترة نفسها؛ لذلك يُضاف عند تحويل الربح إلى تدفق نقدي تشغيلي مبسط.\n\nمثال: ربح 30,000 − زيادة ذمم 20,000 − زيادة مخزون 15,000 + زيادة موردين 8,000 + إهلاك 5,000 = تدفق تشغيلي 8,000 ر.ع.",
      },
      {
        heading: "دورة تحويل النقد",
        body: "كلما بقي المخزون أطول أو تأخر العملاء في السداد، احتاجت المنشأة إلى تمويل تشغيلي أكبر. آجال الموردين تخفف الضغط، لكن إدارتها يجب ألا تضر بالعلاقة أو استمرارية التوريد.\n\nتقليل الدورة هدف تشغيلي مشترك بين المبيعات والمشتريات والمخزون والمالية.\n\nدورة تحويل النقد = أيام المخزون + أيام تحصيل العملاء − أيام سداد الموردين",
      },
    ],
    deepDive: [
      "التدفق التشغيلي غير المباشر يبدأ من الربح ثم يعدله للبنود غير النقدية وتغيرات رأس المال العامل.",
      "قد يستهلك النمو النقد عندما تسبق مشتريات المخزون وتكاليف التنفيذ تحصيل المبيعات.",
      "ابنِ توقعًا نقديًا أسبوعيًا على توقيت التحصيل والدفع الفعلي، واختبر سيناريو تأخر العملاء أو مصروف طارئ.",
    ],
    example: {
      title: "ربح جيد وتدفق محدود",
      body: "حققت شركة ربحًا 25,000 ر.ع، وزادت الذمم 18,000، والمخزون 9,000، ومستحقات الموردين 6,000، والإهلاك 4,000 ر.ع.\n\n- التدفق التشغيلي المبسط = 25,000 − 18,000 − 9,000 + 6,000 + 4,000 = 8,000 ر.ع.\n- إذا اشترت معدات نقدًا بقيمة 12,000 ر.ع يصبح صافي الحركة قبل التمويل سالب 4,000 ر.ع.\n- النقد احتُجز لدى العملاء وفي المخزون بالتزامن مع شراء أصل جديد.",
      conclusion: "أدر توقيت النقد بالتوازي مع إدارة الربح.",
    },
    apply: {
      prompt: "شركة رابحة تعاني ضغطًا نقديًا. رتّب الفحوصات الأولى التي ستجريها: تغير الذمم المدينة، تغير المخزون، سداد الموردين، شراء الأصول، التمويل الجديد.",
      hint: "ابدأ بالبند الذي يستهلك أكبر قدر من النقد دون أن يظهر كمصروف في قائمة الدخل.",
    },
    managerQuestions: [
      "أين تحول الربح إلى نقد وأين بقي محجوزًا؟",
      "ما أكبر التحصيلات والمدفوعات خلال 13 أسبوعًا؟",
      "كيف يتغير الرصيد الأدنى إذا تأخر أكبر العملاء أسبوعين؟",
    ],
    quiz: {
      question: "أي معاملة تُصنف عادة ضمن التدفق النقدي الاستثماري؟",
      options: ["دفع الرواتب", "تحصيل فاتورة عميل", "شراء آلة إنتاج", "دفع فاتورة كهرباء"],
      correctIndex: 2,
    },
  },
  {
    id: 5,
    duration: "45 دقيقة",
    title: "الميزانية والتوقعات ونقطة التعادل",
    summary: "ابنِ ميزانية تشغيلية مرتبطة بمحركات النشاط الفعلية، واستخدم تحليل التعادل وهامش المساهمة لتقييم القرارات.",
    objectives: [
      "بناء ميزانية تشغيلية مرتبطة بمحركات النشاط الفعلية.",
      "استخدام تحليل التعادل وهامش المساهمة لتقييم القرارات.",
    ],
    video: {
      title: "نقطة التعادل وهامش الأمان",
      channel: "Business 101",
      bullets: [
        "الفرق بين التكلفة الثابتة والمتغيرة وشبه المتغيرة.",
        "كيف تُشتق نقطة التعادل من هامش المساهمة.",
        "لماذا تتغير النتيجة مع تغير حجم النشاط والطاقة المتاحة.",
      ],
    },
    sections: [
      {
        heading: "أنواع التكاليف",
        body: "التكلفة الثابتة لا تتغير مع حجم النشاط ضمن مدى معقول، مثل الإيجار. التكلفة المتغيرة ترتفع مع كل وحدة إضافية، مثل المواد. التكلفة شبه المتغيرة تجمع بين الاثنين، مثل فاتورة كهرباء بحد أدنى ثابت واستهلاك متغير.",
      },
      {
        heading: "هامش المساهمة ونقطة التعادل",
        body: "هامش المساهمة = السعر − التكلفة المتغيرة للوحدة. نقطة التعادل = التكلفة الثابتة ÷ هامش المساهمة. بعد تجاوز نقطة التعادل تساهم كل وحدة إضافية بمقدار هامش المساهمة كاملًا في الربح، بعد أن كانت تغطي التكلفة الثابتة فقط بنسبة موحدة.\n\nالميزانية المرنة تعيد حساب التكلفة المتوقعة عند حجم النشاط الفعلي، فتفصل أثر الحجم عن السعر أو ضعف الكفاءة.",
      },
      {
        heading: "حدود التحليل",
        body: "تحليل التعادل يفترض ثبات السعر وتكلفة الوحدة ضمن نطاق معين؛ وقد تظهر تكلفة ثابتة مرحلية عند تجاوز الطاقة الحالية.",
      },
    ],
    deepDive: [
      "راجع نقطة التعادل كلما تغير السعر أو تكلفة الوحدة أو التكلفة الثابتة — هي رقم متحرك لا يُحسب مرة واحدة.",
      "هامش الأمان هو المسافة بين المبيعات الفعلية ونقطة التعادل، ويقيس مدى تحمل النشاط لتراجع الطلب.",
      "عند الاقتراب من حد الطاقة، افحص التكلفة الثابتة الإضافية (وردية جديدة، إيجار مساحة) قبل قبول حجم أكبر.",
    ],
    example: {
      title: "مبيعات أكثر وربح أقل من الخطة",
      body: "خطط مركز خدمة لـ2,400 معاملة بسعر 25 ر.ع وتكلفة متغيرة 15 ر.ع وتكلفة ثابتة 18,000، ونفذ 2,600 معاملة بتكلفة متغيرة 16 ر.ع ووردية إضافية 3,000 ر.ع.\n\n- الربح المخطط = 2,400 × (25 − 15) − 18,000 = 6,000 ر.ع.\n- الربح الفعلي = 2,600 × (25 − 16) − 21,000 = 2,400 ر.ع.\n- زاد الحجم 8.3٪ لكن الربح انخفض 3,600 ر.ع بسبب تكلفة الوحدة والطاقة الإضافية.",
      conclusion: "حلل الحجم والسعر والكفاءة والطاقة معًا قبل تقييم الأداء.",
    },
    apply: {
      prompt: "خدمة سعرها 80 ر.ع، تكلفتها المتغيرة 50 ر.ع، والتكلفة الثابتة الشهرية 24,000 ر.ع. احسب نقطة التعادل والربح عند 1,000 وحدة.",
      hint: "هامش المساهمة = السعر − التكلفة المتغيرة. نقطة التعادل = التكلفة الثابتة ÷ هامش المساهمة.",
    },
    managerQuestions: [
      "ما المحركات التشغيلية التي بنيت عليها الميزانية؟",
      "كم من الانحراف سببه الحجم وكم سببه السعر أو الكفاءة؟",
      "متى نصل إلى حد الطاقة الذي يضيف تكلفة ثابتة؟",
    ],
    quiz: {
      question: "إذا زادت التكلفة المتغيرة للوحدة وبقي السعر والتكلفة الثابتة دون تغيير، فإن نقطة التعادل:",
      options: ["تنخفض", "ترتفع", "لا تتغير", "تصبح صفرًا"],
      correctIndex: 1,
    },
  },
  {
    id: 6,
    duration: "40 دقيقة",
    title: "اتخاذ قرارات تجارية أفضل بالأرقام",
    summary: "ركّز على الأرقام التي تتغير بين البدائل، واستخدم السيناريوهات بدل الاعتماد على توقع واحد متفائل.",
    objectives: [
      "تحديد التكاليف والإيرادات ذات الصلة واستبعاد التكاليف الغارقة.",
      "تقييم المبادرات بالعائد وفترة الاسترداد والعوامل النوعية.",
    ],
    video: {
      title: "كيف تحلل البدائل قبل القرار؟",
      channel: "GreggU · درس إداري",
      bullets: [
        "مقارنة التكلفة والمنفعة بين البدائل.",
        "إدخال المخاطر والاحتمالات في القرار.",
        "عدم فصل الأرقام عن الأثر على أصحاب المصلحة.",
      ],
    },
    sections: [
      {
        heading: "التكلفة ذات الصلة",
        body: "التكلفة ذات الصلة مستقبلية وتتغير بين البدائل. التكلفة الغارقة حدثت بالفعل ولا يمكن استردادها، فلا ينبغي أن تحدد القرار التالي.\n\nتكلفة الفرصة البديلة هي المنفعة التي نتخلى عنها عند اختيار بديل، مثل استخدام مساحة لمشروع ومنع نشاط أكثر قيمة.",
      },
      {
        heading: "أدوات تقييم المبادرة",
        body: "صافي المنفعة يطرح التكلفة من المنافع القابلة للقياس. العائد يقارن صافي المنفعة بالتكلفة. فترة الاسترداد تقدّر الوقت اللازم لاسترجاع الاستثمار الأولي.\n\nهذه مؤشرات مساعدة ولا تحل محل الحكم الإداري عند قرارات الصنع أو التعهيد؛ ركز على التكلفة التي ستتغير فعلًا، فتوزيع التكاليف المشتركة لا يعني أنها ستختفي. وعند وجود مورد نادر مثل ساعات آلة أو وقت متخصص، قارن هامش المساهمة لكل وحدة من المورد المقيد.",
      },
      {
        heading: "بوابات نوعية قبل القرار",
        body: "ضع بوابات نوعية قبل القرار: الجودة وحماية البيانات والاعتماد على مورد واحد وقابلية التراجع والامتثال.",
      },
    ],
    deepDive: [
      "لا تُقارن أرقامًا فقط — قارن معها المخاطر التشغيلية والاعتماد على طرف واحد وسهولة التراجع عن القرار.",
      "التكلفة الغارقة تظهر أحيانًا كـ«لقد استثمرنا فيه الكثير بالفعل» — وهذا بالضبط سبب استبعادها من القرار المقبل.",
      "قارن السيناريوهات (متفائل، أساسي، متحفظ) بدل رقم واحد، خصوصًا حين يعتمد القرار على افتراض غير مؤكد.",
    ],
    example: {
      title: "التنفيذ الداخلي أم مورد خارجي؟",
      body: "تحتاج الشركة 8,000 وحدة. التكلفة المتغيرة داخليًا 2.400 ر.ع للوحدة وإشراف قابل للتجنب 4,000 ر.ع، بينما الإيجار 6,000 سيستمر. عرض المورد 3.100 ر.ع للوحدة.\n\n- التكلفة الداخلية ذات الصلة = 8,000 × 2.400 + 4,000 = 23,200 ر.ع.\n- تكلفة المورد = 8,000 × 3.100 = 24,800 ر.ع.\n- التنفيذ الداخلي أقل 1,600 ر.ع، ولا يدخل الإيجار لأنه غير قابل للتجنب.",
      conclusion: "يبقى القرار مشروطًا بالطاقة والجودة والمخاطر، لا بفارق التكلفة وحده.",
    },
    apply: {
      prompt: "أداة تكلف 18,000 ر.ع وتدريبها 2,000 ر.ع، وتتوقع توفير 1,000 ر.ع شهريًا. سبق دفع 3,000 ر.ع لدراسة قديمة. قيّم القرار مبدئيًا.",
      hint: "استبعد الـ3,000 ر.ع (تكلفة غارقة). التكلفة المستقبلية ذات الصلة 20,000 ر.ع مقابل توفير سنوي 12,000 ر.ع.",
    },
    managerQuestions: [
      "أي تكاليف ستختفي فعلًا إذا اخترنا البديل الآخر؟",
      "ما تكلفة الفرصة البديلة للطاقة أو الوقت؟",
      "ما الافتراض الذي إذا تغير سيقلب القرار؟",
    ],
    quiz: {
      question: "أي عنصر يجب استبعاده عند مقارنة بديلين مستقبليين؟",
      options: ["تكلفة تشغيل تختلف بين البديلين", "إيراد إضافي متوقع", "مبلغ دُفع سابقًا ولا يمكن استرداده", "تكلفة تدريب لازمة لأحد البديلين"],
      correctIndex: 2,
    },
  },
  {
    id: 7,
    duration: "40 دقيقة",
    title: "المؤشرات والرقابة والقصة المالية",
    summary: "اختم المسار بتحويل الأرقام إلى لوحة قيادة، وضوابط موثوقة، ورسالة إدارية تقود إلى قرار.",
    objectives: [
      "اختيار مؤشرات تربط النشاط التشغيلي بالنتيجة المالية.",
      "تطبيق ضوابط أساسية وعرض قصة مالية واضحة للإدارة.",
    ],
    video: {
      title: "النسب المالية وتحليل الأداء",
      channel: "Accounting Stuff · دليل عملي",
      bullets: [
        "مجموعات الربحية والسيولة والكفاءة والرفع المالي.",
        "كيف تقارن النسبة عبر الزمن وبالمعيار المناسب.",
        "لماذا تحتاج النسبة إلى تفسير وإجراء.",
      ],
    },
    sections: [
      {
        heading: "مؤشر جيد بدل كثرة الأرقام",
        body: "المؤشر الجيد مرتبط بهدف واضح، وله تعريف ومصدر ثابت، ويمكن للفريق التأثير فيه. اجمع بين مؤشرات تقود النتيجة وأخرى تقيسها.\n\nمثال: زمن الاستجابة يؤثر في رضا العميل، والرضا يؤثر في الاحتفاظ، والاحتفاظ يؤثر في الإيراد. لا تحسن مؤشرًا منفردًا على حساب الجودة أو السلامة.",
      },
      {
        heading: "الضوابط الداخلية",
        body: "من الضوابط: فصل طلب الشراء عن اعتماده والدفع، تحديد الصلاحيات، مطابقة الفاتورة بأمر الشراء والاستلام، مراجعة الاستثناءات، وتوثيق الموافقات.\n\nالرقابة ليست مسؤولية المالية وحدها؛ كل مدير مسؤول عن صحة البيانات والموافقات في نطاقه.",
      },
      {
        heading: "كيف تعرض القصة المالية؟",
        body: "ابدأ بما حدث، ثم حجم الانحراف، ثم السبب، ثم الأثر المتوقع، وأخيرًا الإجراء والمسؤول والموعد.\n\nالرسالة الجيدة قصيرة وقابلة للتصرف: لا تقل فقط إن المصروف ارتفع، بل وضّح أين ولماذا وما الذي سيتغير ومتى.\n\nمثال: انخفض الهامش من 38٪ إلى 34٪ بسبب خصومات منتج محدد. سنراجع صلاحيات الخصم هذا الأسبوع، والمالك مدير المبيعات، والمتابعة أسبوعية.",
      },
    ],
    deepDive: [
      "اربط المؤشرات القائدة مثل زمن الاستجابة بالمؤشرات المتأخرة مثل الاحتفاظ والإيراد، وأضف مؤشر حماية للجودة.",
      "تصميم الرقابة يبدأ من الخطر: ما الذي قد يحدث وما أثره ومن يستطيع منعه أو كشفه، مع دليل قابل للمراجعة.",
      "القصة المالية التنفيذية تعرض الحقيقة ثم السبب والأثر المقبل، وتنتهي بإجراء له مالك وموعد ومقياس نجاح.",
    ],
    example: {
      title: "إيراد أعلى لكن جودة النمو أضعف",
      body: "بلغت المبيعات 90,000 ر.ع مقابل خطة 84,000، لكن الهامش 32٪ مقابل 37٪، وارتفعت الذمم المتأخرة من 12٪ إلى 22٪.\n\n- المبيعات أعلى من الخطة 6,000 ر.ع، أي نحو 7.1٪.\n- مجمل الربح الفعلي 28,800 ر.ع مقابل 31,080 ر.ع مخططًا؛ أي أقل 2,280 ر.ع.\n- تجمع اللوحة الإيراد والهامش ومتوسط الخصم والذمم المتأخرة مع مراجعة أسبوعية.",
      conclusion: "الحجم نما، لكن الخصومات والتحصيل أضعفا قيمته ويحتاجان إلى إجراء محدد.",
    },
    apply: {
      prompt: "المبيعات أعلى من الخطة 10٪، لكن الهامش أقل بثلاث نقاط والذمم المتأخرة أعلى 25٪. ابنِ لوحة من أربعة مؤشرات وإجراءين: الإيراد مقابل الخطة، هامش الربح، متوسط الخصم، الذمم المتأخرة.",
      hint: "لكل مؤشر ضع الاتجاه المطلوب (ارتفاع/انخفاض) ثم إجراءً واحدًا محددًا بمالك وموعد.",
    },
    managerQuestions: [
      "ما المؤشر القائد الذي ينبهنا قبل ظهور الأثر المالي؟",
      "ما الخطر الذي تعالجه كل رقابة وما دليل تنفيذها؟",
      "من يملك الإجراء ومتى ينتهي وكيف نقيس نجاحه؟",
    ],
    quiz: {
      question: "ما الضابط الأقوى لتقليل خطر إنشاء فاتورة مزيفة ودفعها؟",
      options: [
        "أن ينشئ الشخص نفسه المورد ويعتمد ويدفع",
        "فصل إنشاء المورد واعتماد الفاتورة والدفع",
        "مراجعة المصروفات مرة سنويًا فقط",
        "حذف سجلات الموافقة بعد الدفع",
      ],
      correctIndex: 1,
    },
  },
];

const STORAGE_KEY = "bxbii.training.miran.progress";

function useProgress() {
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setCompleted(JSON.parse(raw));
    } catch {
      // localStorage unavailable — progress just won't persist this session.
    }
  }, []);

  const markComplete = (dayId: number) => {
    setCompleted((prev) => {
      if (prev.includes(dayId)) return prev;
      const next = [...prev, dayId];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Non-fatal.
      }
      return next;
    });
  };

  return { completed, markComplete };
}

export function TrainingCourse() {
  const { lang } = useLanguage();
  const { completed, markComplete } = useProgress();
  const [openDay, setOpenDay] = useState<number | null>(null);
  const progressPct = Math.round((completed.length / DAYS.length) * 100);

  useEffect(() => {
    if (openDay === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDay(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openDay]);

  const activeDay = useMemo(() => DAYS.find((d) => d.id === openDay) ?? null, [openDay]);

  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);

  return (
    // Was hardcoded dir="rtl" regardless of the language toggle, so switching
    // to English on this page left every translated string (the hero copy,
    // stat labels, "Open lesson", etc.) rendered in a right-to-left block —
    // English paragraphs came out right-aligned with bidi-reordered
    // punctuation. Now the direction follows the same `lang` the rest of the
    // page already uses to choose Arabic vs. English text.
    <div dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Hero */}
      <section className="bg-brand text-white">
        {/* Typography/spacing pass (Task #41 follow-up): py-20 and the h1's
            sm:text-5xl step now match every other page hero on the site
            (the CMS Hero block and /programs) instead of drifting slightly
            smaller; the eyebrow's font-medium matches the same pattern too. */}
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-accent-light">
            {t("مِران ستوديو · Miran Studio", "Miran Studio · مِران ستوديو")}
          </p>
          <h1 className="max-w-2xl text-3xl font-bold sm:text-5xl">المالية لغير الماليين</h1>
          <p className="mt-4 max-w-2xl text-white/80 sm:text-lg">
            {t(
              "افهم المال. قُد القرار. برنامج تدريبي من bxbii — 7 أيام، شرح عربي واضح، فيديو وتمرين وسؤال تحقق في كل يوم، من أول مصطلح إلى القصة المالية الكاملة.",
              "Understand the numbers. Lead the decision. A 7-day bxbii program — clear explanations, a video, an exercise, and a check-in every day.",
            )}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5 sm:gap-6">
            {[
              [7, t("أيام عملية", "days")],
              [21, t("درسًا مفصلًا", "lessons")],
              [7, t("مقاطع فيديو", "videos")],
              [7, t("حالات عُمانية", "cases")],
              [7, t("أسئلة تحقق", "quizzes")],
            ].map(([num, label], i) => (
              <div key={i}>
                <div className="text-2xl font-bold text-accent-light sm:text-3xl">{num}</div>
                <div className="text-xs text-white/70 sm:text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Progress + day grid */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col gap-3 rounded-lg border border-surface-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand">
              {t("تقدمك محفوظ على هذا الجهاز", "Your progress is saved on this device")}
            </p>
            <p className="text-xs text-slate-500">
              {completed.length} / {DAYS.length} {t("أيام مكتملة", "days completed")}
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-border sm:w-64">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DAYS.map((day) => {
            const done = completed.includes(day.id);
            return (
              <div
                key={day.id}
                className="flex flex-col justify-between rounded-lg border border-surface-border bg-surface p-5 shadow-sm"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      {t(`اليوم ${day.id}`, `Day ${day.id}`)} · {day.duration}
                    </span>
                    {done && (
                      <span className="rounded-full bg-status-success/10 px-2 py-0.5 text-xs font-semibold text-status-success">
                        ✓ {t("مكتمل", "Done")}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-brand">{day.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{day.summary}</p>
                </div>
                <button
                  onClick={() => setOpenDay(day.id)}
                  className="mt-5 w-full rounded bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  {t("افتح الدرس", "Open lesson")}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {activeDay && (
        <DayModal
          day={activeDay}
          lang={lang}
          isDone={completed.includes(activeDay.id)}
          onComplete={() => markComplete(activeDay.id)}
          onClose={() => setOpenDay(null)}
        />
      )}
    </div>
  );
}

function DayModal({
  day,
  lang,
  isDone,
  onComplete,
  onClose,
}: {
  day: Day;
  lang: "en" | "ar";
  isDone: boolean;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const answered = selected !== null;
  const correct = selected === day.quiz.correctIndex;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-10"
      onClick={onClose}
    >
      <div
        // Same fix as the page shell above: this modal has its own `lang`
        // prop already, so use it instead of forcing rtl regardless of the
        // active language toggle.
        dir={lang === "ar" ? "rtl" : "ltr"}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-2xl rounded-lg bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between rounded-t-lg bg-brand px-6 py-4 text-white">
          <div>
            <p className="text-xs text-white/70">
              {t(`اليوم ${day.id} من 7`, `Day ${day.id} of 7`)} · {day.duration}
            </p>
            <h2 className="text-xl font-bold">{day.title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label={t("إغلاق", "Close")}
            className="rounded text-2xl leading-none text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
          >
            ×
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          <p className="mb-4 text-slate-700">{day.summary}</p>
          <ul className="mb-6 space-y-1">
            {day.objectives.map((o, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-600">
                <span className="text-status-success">✓</span> {o}
              </li>
            ))}
          </ul>

          <div className="mb-6 rounded-lg border border-surface-border bg-surface-subtle p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("دليل المشاهدة", "Watch")}
            </p>
            <p className="font-semibold text-brand">{day.video.title}</p>
            <p className="mb-2 text-xs text-slate-500">{day.video.channel}</p>
            <ul className="space-y-1">
              {day.video.bullets.map((b, i) => (
                <li key={i} className="text-sm text-slate-600">
                  • {b}
                </li>
              ))}
            </ul>
          </div>

          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand">
            {t("الشرح الأساسي", "Core lesson")}
          </h3>
          {day.sections.map((s, i) => (
            <div key={i} className="mb-4">
              <p className="mb-1 font-semibold text-slate-800">
                {String(i + 1).padStart(2, "0")}. {s.heading}
              </p>
              {s.body.split("\n\n").map((para, j) => (
                <p key={j} className="mb-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {para}
                </p>
              ))}
            </div>
          ))}

          <h3 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide text-brand">
            {t("تعمّق أكثر", "Go deeper")}
          </h3>
          <ol className="mb-6 list-inside list-decimal space-y-2 text-sm text-slate-600">
            {day.deepDive.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ol>

          <div className="mb-6 rounded-lg border border-accent/20 bg-accent/5 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent">
              {t("مثال بالريال العُماني", "Worked example")}
            </p>
            <p className="mb-2 font-semibold text-brand">{day.example.title}</p>
            {day.example.body.split("\n\n").map((para, i) => (
              <p key={i} className="mb-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {para}
              </p>
            ))}
            <p className="mt-2 text-sm font-semibold text-brand">
              {t("الخلاصة الإدارية: ", "Takeaway: ")}
              {day.example.conclusion}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-brand">
              {t("طبّق بنفسك", "Apply it")}
            </h3>
            <p className="mb-2 text-sm text-slate-700">{day.apply.prompt}</p>
            {day.apply.hint && (
              <details className="text-sm text-slate-600">
                <summary className="cursor-pointer rounded font-medium text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
                  {t("اعرض الحل المشروح", "Show the worked solution")}
                </summary>
                <p className="mt-2">{day.apply.hint}</p>
              </details>
            )}
          </div>

          <div className="mb-6 rounded-lg border border-surface-border p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("أسئلة المدير الذكي", "Questions a sharp manager asks")}
            </p>
            <ul className="space-y-1 text-sm text-slate-600">
              {day.managerQuestions.map((q, i) => (
                <li key={i}>• {q}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-surface-border bg-surface-subtle p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("تحقق من فهمك", "Check your understanding")}
            </p>
            <p className="mb-3 font-medium text-slate-800">{day.quiz.question}</p>
            <div className="space-y-2">
              {day.quiz.options.map((opt, i) => {
                const isSelected = selected === i;
                const showCorrect = answered && i === day.quiz.correctIndex;
                const showWrong = answered && isSelected && i !== day.quiz.correctIndex;
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className={`block w-full rounded border px-3 py-2 text-start text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle ${
                      showCorrect
                        ? "border-status-success bg-status-success/10 text-status-success"
                        : showWrong
                          ? "border-status-danger bg-status-danger/10 text-status-danger"
                          : "border-surface-border bg-surface hover:bg-surface-subtle"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {answered && !correct && (
              <p className="mt-2 text-sm text-status-danger">{t("حاول مرة أخرى.", "Try again.")}</p>
            )}
            {answered && correct && (
              <p className="mt-2 text-sm text-status-success">{t("صحيح!", "Correct!")}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-b-lg border-t border-surface-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded text-sm text-slate-500 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            {t("إغلاق", "Close")}
          </button>
          <button
            disabled={!correct && !isDone}
            onClick={() => {
              onComplete();
              onClose();
            }}
            className="rounded bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            {isDone ? t("مكتمل ✓", "Completed ✓") : t("تحقق وأكمل اليوم", "Confirm & complete day")}
          </button>
        </div>
      </div>
    </div>
  );
}
