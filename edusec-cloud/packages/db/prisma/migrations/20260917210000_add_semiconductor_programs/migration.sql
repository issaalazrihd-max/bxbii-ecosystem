-- bxbii semiconductor training programs
-- Keep the titles tightly aligned with the visual identity used on the public catalog.

INSERT INTO "programs" (
  "id", "tenant_id", "slug",
  "ar_domain", "en_domain",
  "ar_name", "en_name",
  "ar_description", "en_description",
  "ar_duration", "en_duration",
  "ar_format", "en_format",
  "status", "href_override", "position", "is_visible", "updated_at"
)
SELECT
  'bxbii-semiconductor-design-20260917',
  t."id",
  'semiconductor-design-fundamentals',
  'أشباه الموصلات',
  'Semiconductors',
  'أساسيات تصميم أشباه الموصلات',
  'Semiconductor Design Fundamentals',
  'برنامج عملي يعرّف المتدربين بأساسيات تصميم الشرائح، بنية الدوائر المتكاملة، تدفق التصميم ومفاهيم تطوير الأنظمة القائمة على أشباه الموصلات.',
  'A practical program covering chip-design fundamentals, integrated-circuit architecture, design flow and the foundations of semiconductor system development.',
  '6 أسابيع',
  '6 weeks',
  'برنامج تدريبي عملي',
  'Practical training program',
  'COMING_SOON',
  '/programs/semiconductor-design-fundamentals',
  COALESCE((SELECT MAX(p."position") + 1 FROM "programs" p WHERE p."tenant_id" = t."id"), 0),
  true,
  CURRENT_TIMESTAMP
FROM "tenants" t
WHERE NOT EXISTS (
  SELECT 1 FROM "programs" p WHERE p."tenant_id" = t."id" AND p."slug" = 'semiconductor-design-fundamentals'
)
LIMIT 1;

INSERT INTO "programs" (
  "id", "tenant_id", "slug",
  "ar_domain", "en_domain",
  "ar_name", "en_name",
  "ar_description", "en_description",
  "ar_duration", "en_duration",
  "ar_format", "en_format",
  "status", "href_override", "position", "is_visible", "updated_at"
)
SELECT
  'bxbii-semiconductor-packaging-20260917',
  t."id",
  'advanced-semiconductor-packaging',
  'أشباه الموصلات',
  'Semiconductors',
  'تغليف وتجميع أشباه الموصلات المتقدم',
  'Advanced Semiconductor Packaging & Assembly',
  'برنامج عملي يركز على تغليف الشرائح وتجميعها، الربط السلكي، التوصيل بالركيزة، تقنيات التغليف المتقدم ومفاهيم الاختبار والاعتمادية.',
  'A practical program focused on chip packaging and assembly, wire bonding, substrate interconnects, advanced packaging concepts, testing and reliability.',
  '6 أسابيع',
  '6 weeks',
  'برنامج تدريبي عملي',
  'Practical training program',
  'COMING_SOON',
  '/programs/advanced-semiconductor-packaging',
  COALESCE((SELECT MAX(p."position") + 1 FROM "programs" p WHERE p."tenant_id" = t."id"), 0),
  true,
  CURRENT_TIMESTAMP
FROM "tenants" t
WHERE NOT EXISTS (
  SELECT 1 FROM "programs" p WHERE p."tenant_id" = t."id" AND p."slug" = 'advanced-semiconductor-packaging'
)
LIMIT 1;
