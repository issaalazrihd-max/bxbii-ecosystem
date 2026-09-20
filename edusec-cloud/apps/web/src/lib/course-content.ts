export type CourseLesson = {
  title: string;
  arTitle: string;
  summary: string;
  arSummary: string;
  topics: string[];
  arTopics: string[];
  free?: boolean;
};

export type CourseContent = {
  price: number;
  currency: "OMR";
  level: string;
  arLevel: string;
  outcomes: string[];
  arOutcomes: string[];
  lessons: CourseLesson[];
};

const L=(title:string,arTitle:string,summary:string,arSummary:string,topics:string[],arTopics:string[],free=false):CourseLesson=>({title,arTitle,summary,arSummary,topics,arTopics,...(free?{free:true}:{})});

export const courseContent: Record<string,CourseContent> = {
"physical-ai-fundamentals":{price:49,currency:"OMR",level:"Foundation",arLevel:"تأسيسي",outcomes:["Understand the Physical AI stack","Design perception-to-action workflows","Evaluate deployment and safety constraints"],arOutcomes:["فهم منظومة الذكاء الاصطناعي الفيزيائي","تصميم مسارات الإدراك إلى الفعل","تقييم متطلبات النشر والسلامة"],lessons:[
L("Free preview — What is Physical AI?","المقدمة المجانية — ما هو الذكاء الاصطناعي الفيزيائي؟","Understand systems that sense, reason and act in the physical world.","فهم الأنظمة التي تستشعر العالم الحقيقي وتفكر وتتصرف فيه.",["Embodied intelligence","Sensors","Actuators"],["الذكاء المتجسد","الحساسات","المشغلات"],true),
L("Perception and sensing","الإدراك والاستشعار","Turn cameras, depth and motion sensors into usable information.","تحويل الكاميرات والعمق وحساسات الحركة إلى معلومات قابلة للاستخدام.",["Sensor selection","Data pipelines","Uncertainty"],["اختيار الحساسات","مسارات البيانات","عدم اليقين"]),
L("Decision and control","القرار والتحكم","Connect AI decisions to safe physical actions.","ربط قرارات الذكاء الاصطناعي بأفعال فيزيائية آمنة.",["Policies","Feedback","Constraints"],["السياسات","التغذية الراجعة","القيود"]),
L("Simulation and digital twins","المحاكاة والتوائم الرقمية","Prototype physical behavior before deployment.","اختبار السلوك الفيزيائي قبل النشر.",["Simulation","Synthetic data","Digital twins"],["المحاكاة","البيانات الاصطناعية","التوائم الرقمية"]),
L("Edge deployment","النشر على الحافة","Move inference closer to machines and devices.","نقل الاستدلال إلى الأجهزة والمعدات.",["Latency","Compute","Optimization"],["زمن الاستجابة","الحوسبة","التحسين"]),
L("Industry capstone","المشروع الصناعي النهائي","Design a Physical AI concept for a real industrial use case.","تصميم تصور للذكاء الاصطناعي الفيزيائي لحالة صناعية حقيقية.",["Architecture","Safety","Deployment"],["البنية","السلامة","النشر"])
]},
"computer-vision-for-physical-ai":{price:59,currency:"OMR",level:"Intermediate",arLevel:"متوسط",outcomes:["Build a practical computer-vision pipeline","Understand detection and segmentation","Prepare vision for robotics"],arOutcomes:["بناء مسار عملي للرؤية الحاسوبية","فهم الكشف والتجزئة","تهيئة الرؤية للروبوتات"],lessons:[
L("Free preview — Vision for machines","المقدمة المجانية — الرؤية للآلات","Why computer vision is a core sensing layer for Physical AI.","لماذا تعد الرؤية الحاسوبية طبقة استشعار أساسية للذكاء الاصطناعي الفيزيائي.",["Cameras","Frames","Perception"],["الكاميرات","الإطارات","الإدراك"],true),
L("Image data and preprocessing","بيانات الصور والمعالجة المسبقة","Prepare consistent visual inputs for AI models.","تهيئة مدخلات بصرية متسقة للنماذج.",["Datasets","Augmentation","Normalization"],["البيانات","زيادة البيانات","التطبيع"]),
L("Detection and segmentation","الكشف والتجزئة","Identify objects and regions in real scenes.","تحديد العناصر ومناطقها في المشاهد الحقيقية.",["Detection","Segmentation","Confidence"],["الكشف","التجزئة","الثقة"]),
L("Depth and 3D perception","العمق والإدراك ثلاثي الأبعاد","Use depth and point clouds for physical interaction.","استخدام العمق والسحب النقطية للتفاعل الفيزيائي.",["Depth","Point clouds","3D coordinates"],["العمق","السحب النقطية","الإحداثيات ثلاثية الأبعاد"]),
L("Vision for robotics","الرؤية للروبوتات","Connect visual outputs to navigation and manipulation.","ربط مخرجات الرؤية بالملاحة والمناولة.",["Tracking","Pose","Visual feedback"],["التتبع","الوضعية","التغذية البصرية"]),
L("Inspection project","مشروع الفحص","Build an inspection or robotics vision workflow.","بناء مسار رؤية للفحص أو الروبوتات.",["Metrics","Error analysis","Deployment"],["المقاييس","تحليل الأخطاء","النشر"])
]},
"edge-ai-embedded-intelligence":{price:69,currency:"OMR",level:"Intermediate",arLevel:"متوسط",outcomes:["Understand edge-AI architecture","Optimize models for constrained devices","Plan reliable deployment"],arOutcomes:["فهم بنية الذكاء الاصطناعي الطرفي","تحسين النماذج للأجهزة محدودة الموارد","تخطيط نشر موثوق"],lessons:[
L("Free preview — Edge AI","المقدمة المجانية — الذكاء الاصطناعي الطرفي","Why inference at the edge matters for latency, privacy and industry.","لماذا يهم الاستدلال على الحافة في زمن الاستجابة والخصوصية والصناعة.",["Cloud vs edge","Latency","Constraints"],["السحابة مقابل الحافة","زمن الاستجابة","القيود"],true),
L("Embedded AI architecture","بنية الذكاء الاصطناعي المضمن","Map sensors, compute, models and outputs.","ربط الحساسات والحوسبة والنماذج والمخرجات.",["MCU/MPU","Memory","Interfaces"],["المتحكمات","الذاكرة","الواجهات"]),
L("Model optimization","تحسين النماذج","Reduce model cost while protecting useful accuracy.","تقليل تكلفة النموذج مع الحفاظ على الدقة العملية.",["Quantization","Pruning","Compression"],["التكميم","التقليم","الضغط"]),
L("Real-time inference","الاستدلال الفوري","Design predictable inference pipelines.","تصميم مسارات استدلال ذات أداء متوقع.",["Throughput","Latency budgets","Scheduling"],["معدل المعالجة","ميزانيات الزمن","الجدولة"]),
L("Connected edge systems","الأنظمة الطرفية المتصلة","Connect devices to industrial platforms securely.","ربط الأجهزة بالمنصات الصناعية بأمان.",["Telemetry","Protocols","Device management"],["القياسات","البروتوكولات","إدارة الأجهزة"]),
L("Deployment project","مشروع النشر","Create an edge-AI deployment plan for a real use case.","إعداد خطة نشر لحالة استخدام حقيقية.",["Architecture","Testing","Operations"],["البنية","الاختبار","التشغيل"])
]},
"robotics-perception-and-control":{price:69,currency:"OMR",level:"Intermediate",arLevel:"متوسط",outcomes:["Understand robot sensing","Explain feedback control","Plan a practical robotics system"],arOutcomes:["فهم استشعار الروبوتات","فهم التحكم بالتغذية الراجعة","تخطيط نظام روبوتي عملي"],lessons:[
L("Free preview — How robots sense the world","المقدمة المجانية — كيف تستشعر الروبوتات العالم","A practical overview of sensors, state and action.","نظرة عملية على الحساسات والحالة والفعل.",["Sensors","State","Actuation"],["الحساسات","الحالة","التشغيل"],true),
L("Robot perception","إدراك الروبوت","Turn sensor data into useful state estimates.","تحويل بيانات الحساسات إلى تقديرات مفيدة للحالة.",["Localization","Tracking","Fusion"],["تحديد الموقع","التتبع","دمج البيانات"]),
L("Kinematics","الحركيات","Understand position and motion relationships.","فهم العلاقات بين الموضع والحركة.",["Frames","Joints","End effectors"],["الأطر","المفاصل","نهايات الأذرع"]),
L("Feedback control","التحكم بالتغذية الراجعة","Connect desired behavior to measured behavior.","ربط السلوك المطلوب بالسلوك المقاس.",["Feedback","PID","Stability"],["التغذية الراجعة","PID","الاستقرار"]),
L("Navigation and manipulation","الملاحة والمناولة","Apply perception and control to movement and interaction.","تطبيق الإدراك والتحكم على الحركة والتفاعل.",["Planning","Obstacle avoidance","Manipulation"],["التخطيط","تجنب العوائق","المناولة"]),
L("Robotics capstone","المشروع النهائي للروبوتات","Design a complete workflow for an industrial scenario.","تصميم مسار متكامل لروبوت في سيناريو صناعي.",["Architecture","Safety","Demo"],["البنية","السلامة","العرض"])
]},
"semiconductor-ic-design-fundamentals":{price:79,currency:"OMR",level:"Foundation",arLevel:"تأسيسي",outcomes:["Understand the IC design flow","Connect RTL to verification","Understand tape-out stages"],arOutcomes:["فهم دورة تصميم الدوائر المتكاملة","ربط RTL بالتحقق","فهم مراحل الوصول إلى التصنيع"],lessons:[
L("Free preview — From idea to chip","المقدمة المجانية — من الفكرة إلى الشريحة","Understand the major stages of modern IC development.","فهم المراحل الرئيسية لتطوير الدوائر المتكاملة.",["Specification","RTL","Verification","Physical design"],["المواصفات","RTL","التحقق","التصميم الفيزيائي"],true),
L("Digital design foundations","أساسيات التصميم الرقمي","Logic, state and timing concepts used in chip design.","مفاهيم المنطق والحالة والتوقيت المستخدمة في تصميم الشرائح.",["Combinational","Sequential","Timing"],["توافقي","تتابعي","توقيت"]),
L("RTL design","تصميم RTL","Translate behavior into synthesizable hardware.","تحويل السلوك إلى وصف عتادي قابل للتوليف.",["RTL","Synthesis","Constraints"],["RTL","التوليف","القيود"]),
L("Verification flow","مسار التحقق","Plan proof that the design meets its specification.","تخطيط إثبات مطابقة التصميم للمواصفات.",["Testbenches","Assertions","Coverage"],["بيئات الاختبار","التوكيدات","التغطية"]),
L("Physical design overview","نظرة على التصميم الفيزيائي","Understand placement, routing and timing closure.","فهم التوزيع والتوصيل وإغلاق التوقيت.",["Floorplan","Place & route","Signoff"],["المخطط الأرضي","التوزيع والتوصيل","الاعتماد"]),
L("Tape-out case study","دراسة حالة Tape-out","Follow a chip from specification to manufacturing handoff.","تتبع الشريحة من المواصفات إلى التسليم للتصنيع.",["Signoff","Foundry handoff","Risks"],["الاعتماد","التسليم للمسبك","المخاطر"])
]},
"digital-ic-design-rtl":{price:69,currency:"OMR",level:"Intermediate",arLevel:"متوسط",outcomes:["Write structured RTL","Understand synchronous design","Prepare RTL for verification"],arOutcomes:["كتابة RTL منظم","فهم التصميم المتزامن","تهيئة RTL للتحقق"],lessons:[
L("Free preview — RTL in practice","المقدمة المجانية — RTL عمليًا","What RTL represents and why it matters in digital hardware.","ما الذي يمثله RTL ولماذا يعد مهمًا في العتاد الرقمي.",["Hardware description","Clocked logic","Intent"],["وصف العتاد","المنطق المتزامن","نية التصميم"],true),
L("Combinational RTL","RTL التوافقي","Build clean combinational logic.","بناء منطق توافقي واضح.",["Operators","Muxes","Decoders"],["المعاملات","المبدلات","فك الترميز"]),
L("Sequential RTL","RTL التتابعي","Design registers, counters and state machines.","تصميم السجلات والعدادات وآلات الحالات.",["Registers","FSMs","Reset"],["السجلات","آلات الحالات","إعادة الضبط"]),
L("Interfaces and protocols","الواجهات والبروتوكولات","Structure hardware blocks around clear interfaces.","تنظيم وحدات العتاد حول واجهات واضحة.",["Handshaking","Streaming","Bus"],["المصافحة","التدفق","الناقل"]),
L("Synthesis and timing","التوليف والتوقيت","Understand what synthesis does to RTL.","فهم ما يفعله التوليف مع RTL.",["Inference","Timing paths","Constraints"],["الاستدلال","مسارات التوقيت","القيود"]),
L("RTL project","مشروع RTL","Design a small reusable hardware subsystem.","تصميم نظام عتادي صغير قابل لإعادة الاستخدام.",["Architecture","RTL","Verification plan"],["البنية","RTL","خطة التحقق"])
]},
"systemverilog-functional-verification":{price:79,currency:"OMR",level:"Intermediate",arLevel:"متوسط",outcomes:["Understand verification planning","Write SystemVerilog test components","Use assertions and coverage"],arOutcomes:["فهم تخطيط التحقق","كتابة مكونات اختبار بـ SystemVerilog","استخدام التوكيدات والتغطية"],lessons:[
L("Free preview — Why verification matters","المقدمة المجانية — لماذا التحقق مهم؟","How verification reduces risk before silicon exists.","كيف يقلل التحقق المخاطر قبل تصنيع الشريحة.",["Bugs","Verification plan","Coverage"],["الأخطاء","خطة التحقق","التغطية"],true),
L("SystemVerilog testbench","بيئة اختبار SystemVerilog","Build a structured test environment.","بناء بيئة اختبار منظمة.",["Stimulus","Monitor","Scoreboard"],["المحفزات","المراقب","لوحة المقارنة"]),
L("Assertions","التوكيدات","Express expected hardware behavior clearly.","صياغة السلوك المتوقع للعتاد بوضوح.",["Properties","Temporal behavior","Debugging"],["الخصائص","السلوك الزمني","التصحيح"]),
L("Functional coverage","التغطية الوظيفية","Measure whether important scenarios were exercised.","قياس اختبار السيناريوهات المهمة.",["Covergroups","Bins","Cross coverage"],["مجموعات التغطية","الحاويات","التغطية المتقاطعة"]),
L("Verification strategy","استراتيجية التحقق","Connect tests, assertions and coverage to requirements.","ربط الاختبارات والتوكيدات والتغطية بالمتطلبات.",["Requirements","Regression","Metrics"],["المتطلبات","الاختبارات المتكررة","المقاييس"]),
L("Verification project","مشروع التحقق","Create a verification plan for a realistic RTL block.","إعداد خطة تحقق لوحدة RTL واقعية.",["Test matrix","Coverage goals","Signoff"],["مصفوفة الاختبار","أهداف التغطية","الاعتماد"])
]},
"semiconductor-packaging-fundamentals":{price:79,currency:"OMR",level:"Foundation",arLevel:"تأسيسي",outcomes:["Understand semiconductor packaging","Compare package architectures","Map the packaging flow"],arOutcomes:["فهم تغليف أشباه الموصلات","مقارنة بنى التغليف","فهم مسار التغليف"],lessons:[
L("Free preview — Why packaging matters","المقدمة المجانية — لماذا التغليف مهم؟","Packaging connects silicon to the real system and influences performance and reliability.","التغليف يربط السيليكون بالنظام الحقيقي ويؤثر في الأداء والموثوقية.",["Package role","Signal integrity","Thermal path"],["دور التغليف","سلامة الإشارة","المسار الحراري"],true),
L("Package architectures","بنى التغليف","Explore common package families and trade-offs.","استكشاف عائلات التغليف ومفاضلاتها.",["QFN/BGA","Flip-chip","Fan-out"],["QFN/BGA","Flip-chip","Fan-out"]),
L("Assembly flow","مسار التجميع","Follow die attach, bonding and molding at a high level.","فهم تثبيت القالب والربط والتغليف.",["Die attach","Bonding","Molding"],["تثبيت القالب","الربط","التغليف"]),
L("Thermal and mechanical design","التصميم الحراري والميكانيكي","Understand heat flow and package stress.","فهم انتقال الحرارة وإجهادات الحزمة.",["Thermal resistance","CTE","Warpage"],["المقاومة الحرارية","معامل التمدد","الالتواء"]),
L("Reliability","الموثوقية","Identify common package reliability mechanisms.","التعرف على آليات موثوقية التغليف.",["Thermal cycling","Moisture","Fatigue"],["الدورات الحرارية","الرطوبة","الإجهاد"]),
L("Packaging case study","دراسة حالة التغليف","Select a package architecture for a target product.","اختيار بنية تغليف لمنتج مستهدف.",["Requirements","Trade-offs","Recommendation"],["المتطلبات","المفاضلات","التوصية"])
]},
"advanced-semiconductor-packaging":{price:99,currency:"OMR",level:"Advanced",arLevel:"متقدم",outcomes:["Understand chiplet architectures","Compare 2.5D and 3D integration","Evaluate interconnect trade-offs"],arOutcomes:["فهم معماريات Chiplet","مقارنة التكامل 2.5D و3D","تقييم مفاضلات الربط البيني"],lessons:[
L("Free preview — Why chiplets?","المقدمة المجانية — لماذا Chiplets؟","Understand why advanced packaging is becoming a system-design strategy.","فهم لماذا أصبح التغليف المتقدم جزءًا من استراتيجية تصميم النظام.",["Monolithic vs chiplet","Yield","Scalability"],["التصميم الأحادي مقابل Chiplet","العائد التصنيعي","قابلية التوسع"],true),
L("2.5D and 3D integration","التكامل 2.5D و3D","Compare interposers, stacked dies and package-level integration.","مقارنة Interposer وتكديس الشرائح والتكامل على مستوى الحزمة.",["2.5D","3D stacking","Interposers"],["2.5D","التكديس ثلاثي الأبعاد","Interposer"]),
L("Die-to-die interconnect","الربط بين الشرائح","Understand bandwidth, latency and power trade-offs.","فهم مفاضلات عرض النطاق وزمن الاستجابة والطاقة.",["Bandwidth","Latency","Power"],["عرض النطاق","زمن الاستجابة","الطاقة"]),
L("Thermal co-design","التصميم الحراري المشترك","Treat thermal behavior as a system-level design constraint.","التعامل مع الحرارة كقيد على مستوى النظام.",["Hotspots","Cooling","Thermal budgets"],["النقاط الساخنة","التبريد","الميزانيات الحرارية"]),
L("Manufacturing and yield","التصنيع والعائد","Connect architecture choices to manufacturability.","ربط اختيارات المعمارية بقابلية التصنيع.",["Yield","Known-good-die","Test"],["العائد","القالب السليم","الاختبار"]),
L("Chiplet architecture project","مشروع معمارية Chiplet","Develop a concept architecture for a heterogeneous package.","تطوير تصور معماري لحزمة غير متجانسة.",["Partitioning","Interconnect","Package concept"],["تقسيم النظام","الربط البيني","تصور الحزمة"])
]},
"semiconductor-assembly-testing-reliability":{price:89,currency:"OMR",level:"Intermediate",arLevel:"متوسط",outcomes:["Understand assembly and test stages","Map quality checkpoints","Explain reliability screening"],arOutcomes:["فهم مراحل التجميع والاختبار","تحديد نقاط الجودة","شرح فحوصات الموثوقية"],lessons:[
L("Free preview — From package to qualified device","المقدمة المجانية — من الحزمة إلى المنتج المؤهل","See how assembly, test and reliability create a qualified product.","فهم كيف تحول التجميع والاختبار والموثوقية المنتج إلى جهاز مؤهل.",["Assembly","Test","Qualification"],["التجميع","الاختبار","التأهيل"],true),
L("Assembly operations","عمليات التجميع","Map the main assembly stages and quality controls.","تحديد مراحل التجميع وضوابط الجودة.",["Die attach","Bonding","Molding"],["تثبيت القالب","الربط","التغليف"]),
L("Electrical test","الاختبار الكهربائي","Understand how devices are screened and characterized.","فهم فحص الأجهزة وتوصيفها.",["ATE","Parametric test","Yield"],["ATE","الاختبار البارامتري","العائد"]),
L("Reliability testing","اختبارات الموثوقية","Explore environmental and accelerated reliability tests.","استكشاف اختبارات الموثوقية البيئية والمسرعة.",["Temperature","Humidity","Life tests"],["الحرارة","الرطوبة","اختبارات العمر"]),
L("Failure analysis","تحليل الأعطال","Use evidence to trace package and device failures.","استخدام الأدلة لتتبع أعطال الحزمة والجهاز.",["Root cause","Cross-section","Corrective action"],["السبب الجذري","المقطع التحليلي","الإجراء التصحيحي"]),
L("Operations capstone","المشروع التشغيلي النهائي","Create an assembly-test-reliability control plan.","إعداد خطة تحكم للتجميع والاختبار والموثوقية.",["Control plan","KPIs","Escalation"],["خطة التحكم","المؤشرات","التصعيد"])
]}
};

export function getCourseContent(slug:string){return courseContent[slug]??null;}
