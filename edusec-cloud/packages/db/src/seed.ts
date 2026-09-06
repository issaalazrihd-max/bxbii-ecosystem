import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import { PERMISSIONS } from "./permissions";
import { ROLE_TEMPLATES } from "./roles";

const prisma = new PrismaClient();

// Fixed single-tenant id for v1 (Multi-Branch doc, Section 13) — every
// branch belongs to this tenant until multi-tenant SaaS is switched on.
const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? "00000000-0000-0000-0000-000000000001";

const DEFAULT_BRANCHES = [
  { branchCode: "HO", branchName: "Head Office", branchType: "HEAD_OFFICE" as const },
  { branchCode: "MCT", branchName: "Muscat Branch", branchType: "BRANCH" as const },
  { branchCode: "SLL", branchName: "Salalah Branch", branchType: "BRANCH" as const },
  { branchCode: "SOH", branchName: "Sohar Branch", branchType: "BRANCH" as const },
];

async function main() {
  console.log("Seeding bxbii foundation data...");

  const tenant = await prisma.tenant.upsert({
    where: { id: DEFAULT_TENANT_ID },
    update: {},
    create: { id: DEFAULT_TENANT_ID, name: "Demo Institute" },
  });

  const branches: Record<string, { id: string }> = {};
  for (const b of DEFAULT_BRANCHES) {
    const branch = await prisma.branch.upsert({
      where: { tenantId_branchCode: { tenantId: tenant.id, branchCode: b.branchCode } },
      update: {},
      create: { tenantId: tenant.id, branchCode: b.branchCode, branchName: b.branchName, branchType: b.branchType },
    });
    branches[b.branchCode] = branch;
    console.log(`  branch ${b.branchCode} -> ${branch.id}`);
  }

  const permissionsByCode: Record<string, { id: string }> = {};
  for (const p of PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
    permissionsByCode[p.code] = permission;
  }
  console.log(`  ${PERMISSIONS.length} permissions seeded`);

  for (const template of ROLE_TEMPLATES) {
    const role = await prisma.role.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: template.code } },
      update: { name: template.name, description: template.description },
      create: {
        tenantId: tenant.id,
        code: template.code,
        name: template.name,
        description: template.description,
        isSystem: true,
      },
    });

    for (const code of template.permissions) {
      const permission = permissionsByCode[code];
      if (!permission) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }
  console.log(`  ${ROLE_TEMPLATES.length} role templates seeded`);

  // A Super Admin, based at Head Office, so there is somewhere to log in
  // from immediately after `pnpm db:migrate && pnpm db:seed`.
  const superAdminEmail = "admin@bxbii.local";
  const passwordHash = await argon2.hash("ChangeMe123!");

  const adminUser = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      tenantId: tenant.id,
      email: superAdminEmail,
      passwordHash,
      fullName: "System Administrator",
      primaryBranchId: branches.HO.id,
    },
  });

  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { tenantId_code: { tenantId: tenant.id, code: "SUPER_ADMIN" } },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: superAdminRole.id },
  });

  // Head Office access level = implicit access to ALL branches (Multi-Branch
  // doc, Section 4.1) — modeled as one grant row with a null branchId.
  const existingGrant = await prisma.userBranchAccess.findFirst({
    where: { userId: adminUser.id, branchId: null, accessLevel: "HEAD_OFFICE" },
  });
  if (!existingGrant) {
    await prisma.userBranchAccess.create({
      data: { userId: adminUser.id, branchId: null, accessLevel: "HEAD_OFFICE" },
    });
  }

  console.log(`  super admin ready: ${superAdminEmail} / ChangeMe123! (CHANGE THIS IMMEDIATELY IN ANY REAL DEPLOYMENT)`);

  await seedCms(tenant.id, adminUser.id);
  await seedPrograms(tenant.id);
  await seedDemoData(tenant.id, branches);

  console.log("Seed complete.");
}

/**
 * Fictional demo dataset (Institute Management System spec, Sections 28-37):
 * a fully-invented dataset so the platform looks operational immediately
 * after install. Every name, ID, email, and phone number below is made up —
 * none of it refers to a real person. Guarded by a one-time count check, the
 * same way seedCms is, so re-seeding never duplicates rows or clobbers
 * anything an admin has since edited by hand.
 *
 * Marked DEMO DATA in the fullName/notes fields is not applicable yet (no
 * notes field on Student in this phase) — the whole dataset is demo data by
 * construction, and a "Reset demo data" admin action is future scope
 * (Section 37) once real tenant data can coexist with it.
 */
async function seedDemoData(tenantId: string, branches: Record<string, { id: string }>) {
  const existingStudents = await prisma.student.count({ where: { tenantId } });
  if (existingStudents > 0) {
    console.log("  Demo dataset already seeded — skipping.");
    return;
  }

  const branchCodes = ["HO", "MCT", "SLL", "SOH"] as const;

  // -- Fictional employees (Section 31, 21) --------------------------------
  const EMPLOYEE_SEED: Array<{ first: string; last: string; position: string; branch: (typeof branchCodes)[number] }> = [
    { first: "Sultan", last: "Al-Harthy", position: "Branch Manager", branch: "HO" },
    { first: "Maryam", last: "Al-Balushi", position: "Academic Manager", branch: "HO" },
    { first: "Yousuf", last: "Al-Kindi", position: "Finance Officer", branch: "HO" },
    { first: "Fatma", last: "Al-Riyami", position: "HR Officer", branch: "HO" },
    { first: "Khalid", last: "Al-Mamari", position: "Branch Manager", branch: "MCT" },
    { first: "Aisha", last: "Al-Farsi", position: "Admissions Officer", branch: "MCT" },
    { first: "Salim", last: "Al-Hinai", position: "Receptionist", branch: "MCT" },
    { first: "Noora", last: "Al-Zadjali", position: "Branch Manager", branch: "SLL" },
    { first: "Hamed", last: "Al-Shukaili", position: "Student Affairs Officer", branch: "SLL" },
    { first: "Layla", last: "Al-Amri", position: "Branch Manager", branch: "SOH" },
    { first: "Rashid", last: "Al-Saadi", position: "Receptionist", branch: "SOH" },
  ];

  let employeeSeq = 1;
  for (const e of EMPLOYEE_SEED) {
    const employeeCode = `EMP-${String(employeeSeq).padStart(4, "0")}`;
    await prisma.employee.upsert({
      where: { tenantId_employeeCode: { tenantId, employeeCode } },
      update: {},
      create: {
        tenantId,
        employeeCode,
        firstName: e.first,
        lastName: e.last,
        position: e.position,
        email: `${e.first}.${e.last}@bxbii.local`.toLowerCase(),
        mobile: `+968 9${String(1000000 + employeeSeq).slice(-7)}`,
        status: "ACTIVE",
        primaryBranchId: branches[e.branch].id,
      },
    });
    employeeSeq += 1;
  }
  console.log(`  ${EMPLOYEE_SEED.length} fictional employees seeded`);

  // -- Fictional trainers (Section 32, 20) ---------------------------------
  const TRAINER_SEED: Array<{ first: string; last: string; specialization: string; branch: (typeof branchCodes)[number]; hours: number }> = [
    { first: "Omar", last: "Al-Lawati", specialization: "General English", branch: "HO", hours: 18 },
    { first: "Huda", last: "Al-Rawahi", specialization: "Business English", branch: "MCT", hours: 22 },
    { first: "Tariq", last: "Al-Habsi", specialization: "Information Technology", branch: "MCT", hours: 16 },
    { first: "Reem", last: "Al-Busaidi", specialization: "Digital Marketing", branch: "SLL", hours: 12 },
    { first: "Adil", last: "Al-Ghafri", specialization: "Project Management", branch: "SLL", hours: 20 },
    { first: "Shatha", last: "Al-Ismaili", specialization: "Professional Development", branch: "SOH", hours: 14 },
    { first: "Nasser", last: "Al-Wahaibi", specialization: "Vocational Training", branch: "SOH", hours: 24 },
  ];

  let trainerSeq = 1;
  for (const t of TRAINER_SEED) {
    const trainerCode = `TRN-${String(trainerSeq).padStart(4, "0")}`;
    await prisma.trainer.upsert({
      where: { tenantId_trainerCode: { tenantId, trainerCode } },
      update: {},
      create: {
        tenantId,
        trainerCode,
        fullName: `${t.first} ${t.last}`,
        specialization: t.specialization,
        email: `${t.first}.${t.last}@bxbii.local`.toLowerCase(),
        mobile: `+968 9${String(2000000 + trainerSeq).slice(-7)}`,
        teachingHours: t.hours,
        status: "ACTIVE",
        primaryBranchId: branches[t.branch].id,
      },
    });
    trainerSeq += 1;
  }
  console.log(`  ${TRAINER_SEED.length} fictional trainers seeded`);

  // -- 30+ fictional students (Sections 29, 9-10) --------------------------
  // Fully invented first/last name pools, combined programmatically, so the
  // dataset is obviously synthetic rather than resembling any real roster.
  const FIRST_NAMES = [
    "Ahmed", "Sara", "Mohammed", "Fatima", "Ali", "Mariam", "Hassan", "Zainab",
    "Ibrahim", "Noor", "Yousuf", "Amal", "Waleed", "Hind", "Faisal", "Latifa",
    "Saeed", "Buthaina", "Nasser", "Salma", "Bader", "Amina", "Talal", "Wafa",
    "Marwan", "Iman", "Adnan", "Rania", "Karim", "Dana",
  ];
  const LAST_NAMES = [
    "Al-Habsi", "Al-Farsi", "Al-Balushi", "Al-Riyami", "Al-Kindi", "Al-Hinai",
    "Al-Zadjali", "Al-Shukaili", "Al-Amri", "Al-Saadi", "Al-Ghafri", "Al-Busaidi",
  ];
  // Weighted so the dataset covers every scenario called out in Section 29
  // (active, new, outstanding balance, fully paid, high/low attendance,
  // completed, in exams, certificate-eligible, transferred) once Fees/Exam/
  // Certificate models exist — for now this drives StudentStatus + branch mix.
  const STATUS_CYCLE: Array<"LEAD" | "APPLICANT" | "PENDING" | "ACTIVE" | "ON_HOLD" | "SUSPENDED" | "WITHDRAWN" | "COMPLETED" | "GRADUATED"> = [
    "ACTIVE", "ACTIVE", "ACTIVE", "LEAD", "APPLICANT", "PENDING",
    "ACTIVE", "ON_HOLD", "ACTIVE", "COMPLETED", "GRADUATED", "ACTIVE",
    "SUSPENDED", "ACTIVE", "WITHDRAWN",
  ];

  let studentSeq = 1;
  const totalStudents = 32;
  for (let i = 0; i < totalStudents; i += 1) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[i % LAST_NAMES.length];
    const branchCode = branchCodes[i % branchCodes.length];
    const status = STATUS_CYCLE[i % STATUS_CYCLE.length];
    const studentCode = `STU-${String(studentSeq).padStart(5, "0")}`;
    // A handful of students (every 7th) are modeled as having transferred
    // in from another branch — current branch differs from primary branch,
    // matching the Student Transfer workflow's already-built data shape.
    const transferred = i % 7 === 0 && i > 0;
    const primaryBranchCode = transferred ? branchCodes[(i + 1) % branchCodes.length] : branchCode;

    await prisma.student.upsert({
      where: { tenantId_studentCode: { tenantId, studentCode } },
      update: {},
      create: {
        tenantId,
        studentCode,
        firstName: first,
        lastName: last,
        gender: i % 2 === 0 ? "MALE" : "FEMALE",
        dateOfBirth: new Date(1995 + (i % 15), i % 12, 1 + (i % 27)),
        email: `${first}.${last}${studentSeq}@bxbii-demo.local`.toLowerCase(),
        mobile: `+968 9${String(3000000 + studentSeq).slice(-7)}`,
        status,
        primaryBranchId: branches[primaryBranchCode].id,
        currentBranchId: branches[branchCode].id,
      },
    });
    studentSeq += 1;
  }
  console.log(`  ${totalStudents} fictional students seeded across ${branchCodes.length} branches (DEMO DATA)`);
}

/**
 * Default bxbii site content (bxbii Ecosystem brief, Sections 1-2, 28-31):
 * the Home page, a stub page per top-level nav entry, and the nav tree
 * itself. Guarded by a one-time count check rather than per-row upserts —
 * pages/sections/nav items don't have a natural stable key to upsert
 * against, and an admin is expected to edit this starting content freely
 * afterwards, so re-running the seed must not clobber their edits or
 * duplicate rows.
 */
async function seedCms(tenantId: string, adminUserId: string) {
  const existingPages = await prisma.page.count({ where: { tenantId } });
  if (existingPages > 0) {
    console.log("  CMS content already seeded — skipping.");
    return;
  }

  const stubPage = (
    slug: string,
    arTitle: string,
    enTitle: string,
    body: { ar: string; en: string },
  ) =>
    prisma.page.create({
      data: {
        tenantId,
        slug,
        arTitle,
        enTitle,
        status: "PUBLISHED",
        isSystem: slug === "",
        createdById: adminUserId,
        sections: {
          create: [
            {
              tenantId,
              sectionType: "HEADING",
              position: 0,
              isVisible: true,
              enContent: { text: enTitle, level: "2" },
              arContent: { text: arTitle, level: "2" },
            },
            {
              tenantId,
              sectionType: "TEXT",
              position: 1,
              isVisible: true,
              enContent: { text: body.en },
              arContent: { text: body.ar },
            },
          ],
        },
      },
    });

  const home = await prisma.page.create({
    data: {
      tenantId,
      slug: "",
      arTitle: "الرئيسية",
      enTitle: "Home",
      status: "PUBLISHED",
      isSystem: true,
      createdById: adminUserId,
      sections: {
        create: [
          {
            tenantId,
            sectionType: "HERO",
            position: 0,
            isVisible: true,
            enContent: {
              eyebrow: "bxbii",
              title: "One platform for training, education, and business.",
              subtitle:
                "Training and Miran Studio, institute management, and the bxbii store — unified under one account, one login, one dashboard.",
              ctaLabel: "Explore Training",
              ctaHref: "/training",
            },
            arContent: {
              eyebrow: "bxbii",
              title: "منصة واحدة للتدريب والتعليم والأعمال",
              subtitle:
                "التدريب عبر مران ستوديو، وإدارة المعاهد، ومتجر bxbii — كلها موحّدة تحت حساب واحد وتسجيل دخول واحد ولوحة تحكم واحدة.",
              ctaLabel: "استكشف التدريب",
              ctaHref: "/training",
            },
          },
          {
            tenantId,
            sectionType: "TEXT",
            position: 1,
            isVisible: true,
            enContent: {
              text: "This home page, like every page on the site, is managed from the CMS — add, reorder, or hide sections without a code change.",
            },
            arContent: {
              text: "هذه الصفحة الرئيسية، ككل صفحات الموقع، تُدار من نظام إدارة المحتوى — يمكن إضافة الأقسام أو إعادة ترتيبها أو إخفاؤها دون الحاجة لتعديل الكود.",
            },
          },
        ],
      },
    },
  });

  const about = await stubPage(
    "about-us",
    "من نحن",
    "About Us",
    {
      en: "bxbii brings training, institute management, and e-commerce together under one platform. Full company profile coming soon.",
      ar: "تجمع bxbii بين التدريب وإدارة المعاهد والتجارة الإلكترونية في منصة واحدة. الملف التعريفي الكامل للشركة قريبًا.",
    },
  );

  const contact = await stubPage(
    "contact-us",
    "اتصل بنا",
    "Contact Us",
    {
      en: "Reach out to the bxbii team — a working contact form lands here in a follow-up phase.",
      ar: "تواصل مع فريق bxbii — سيتم إضافة نموذج تواصل فعّال هنا في مرحلة لاحقة.",
    },
  );

  // Training keeps the Miran Studio brand specifically, per the user's
  // explicit instruction: bxbii for the platform, Miran for Training.
  const training = await stubPage(
    "training",
    "التدريب — مران ستوديو",
    "Training — Miran Studio",
    {
      en: "Miran Studio powers bxbii's training programs. This page will carry the role- and enrollment-aware redirect into the training experience once the Institute Management module is wired up for it.",
      ar: "يشغّل مران ستوديو برامج التدريب في bxbii. ستحمل هذه الصفحة لاحقًا إعادة التوجيه المرتبطة بالدور والتسجيل نحو تجربة التدريب فور ربطها بوحدة إدارة المعاهد.",
    },
  );

  const study = await stubPage(
    "study",
    "الدراسة",
    "Study",
    {
      en: "The Study entry point — role, institute, branch, subscription, and enrollment-aware — following the same pattern as Training.",
      ar: "نقطة دخول الدراسة — المرتبطة بالدور والمعهد والفرع والاشتراك والتسجيل — بنفس نمط قسم التدريب.",
    },
  );

  const store = await stubPage(
    "store",
    "المتجر",
    "Store",
    {
      en: "The bxbii Store — products, cart, checkout, and a provider-agnostic payment gateway layer — lands in a dedicated e-commerce phase.",
      ar: "متجر bxbii — المنتجات وسلة الشراء والدفع وطبقة بوابات دفع متعددة المزودين — ستُضاف في مرحلة مخصصة للتجارة الإلكترونية.",
    },
  );

  const techProjects = await stubPage(
    "technology-projects",
    "المشاريع التقنية",
    "Technology Projects",
    {
      en: "Technology projects and products developed under bxbii.",
      ar: "المشاريع والمنتجات التقنية المطوّرة تحت مظلة bxbii.",
    },
  );

  const otherProjects = await stubPage(
    "other-projects",
    "مشاريع أخرى",
    "Other Projects",
    {
      en: "Other ventures and projects under the bxbii umbrella.",
      ar: "مشاريع ومبادرات أخرى تحت مظلة bxbii.",
    },
  );

  console.log("  8 CMS pages seeded (home + 7 stub pages)");

  const navEntry = (
    arLabel: string,
    enLabel: string,
    targetPageId: string | undefined,
    position: number,
    parentId?: string,
  ) =>
    prisma.navigationItem.create({
      data: { tenantId, arLabel, enLabel, linkType: "PAGE", targetPageId, position, parentId, isVisible: true },
    });

  await navEntry("الرئيسية", "Home", home.id, 0);
  await navEntry("من نحن", "About Us", about.id, 1);
  await navEntry("التدريب", "Training", training.id, 2);
  await navEntry("الدراسة", "Study", study.id, 3);
  await navEntry("المتجر", "Store", store.id, 4);
  // Pure grouping item — no target page of its own, just a submenu holder.
  const projectsParent = await navEntry("المشاريع", "Projects", undefined, 5);
  await navEntry("المشاريع التقنية", "Technology Projects", techProjects.id, 0, projectsParent.id);
  await navEntry("مشاريع أخرى", "Other Projects", otherProjects.id, 1, projectsParent.id);
  await navEntry("اتصل بنا", "Contact Us", contact.id, 6);

  console.log("  9 navigation items seeded (incl. Projects submenu)");
}

/**
 * Programs catalog (bxbii Ecosystem brief — Programs module), backing the
 * public /programs page. Seeded with exactly the same three entries that
 * were hardcoded in components/public/programs-page.tsx before this module
 * existed, so switching the page over to real data does not change what
 * visitors see: one real open program (Finance for Non-Financials, linking
 * to /training) plus two honestly-labeled "coming soon" domains with no
 * fake dates or links. Guarded by a one-time count check, same pattern as
 * seedCms, so re-running the seed never duplicates rows or overwrites an
 * admin's edits.
 */
async function seedPrograms(tenantId: string) {
  const existingPrograms = await prisma.program.count({ where: { tenantId } });
  if (existingPrograms > 0) {
    console.log("  Programs catalog already seeded — skipping.");
    return;
  }

  const PROGRAM_SEED: Array<{
    slug: string;
    arDomain: string;
    enDomain: string;
    arName: string;
    enName: string;
    arDescription: string;
    enDescription: string;
    arDuration: string;
    enDuration: string;
    arFormat: string;
    enFormat: string;
    status: "OPEN" | "COMING_SOON";
    hrefOverride: string | null;
  }> = [
    {
      slug: "finance-non-financials",
      arDomain: "الأعمال والمالية",
      enDomain: "Business & Finance",
      arName: "المالية لغير الماليين",
      enName: "Finance for Non-Financials",
      arDescription:
        "برنامج تفاعلي من مِران ستوديو مدته 7 أيام، لبناء فهم عملي للقوائم المالية واتخاذ القرار بالأرقام — دون الحاجة لخلفية مالية مسبقة.",
      enDescription:
        "A 7-day interactive program by Miran Studio that builds a practical understanding of financial statements and number-driven decision-making — no finance background required.",
      arDuration: "7 أيام، بالسرعة التي تناسبك",
      enDuration: "7 days, self-paced",
      arFormat: "عن بُعد",
      enFormat: "Online",
      status: "OPEN",
      hrefOverride: "/training",
    },
    {
      slug: "technology-digital",
      arDomain: "التقنية والمهارات الرقمية",
      enDomain: "Technology & Digital Skills",
      arName: "مسار التقنية والمهارات الرقمية",
      enName: "Technology & Digital Skills Track",
      arDescription: "مسار تدريبي متخصص في التقنية قيد الإعداد حالياً.",
      enDescription: "A dedicated technology training track is in development.",
      arDuration: "يُعلن لاحقاً",
      enDuration: "To be announced",
      arFormat: "عن بُعد",
      enFormat: "Online",
      status: "COMING_SOON",
      hrefOverride: null,
    },
    {
      slug: "leadership-management",
      arDomain: "القيادة والإدارة",
      enDomain: "Leadership & Management",
      arName: "مسار القيادة والإدارة",
      enName: "Leadership & Management Track",
      arDescription: "برنامج في القيادة وإدارة الفرق قيد الإعداد حالياً.",
      enDescription: "A leadership and people-management program is in development.",
      arDuration: "يُعلن لاحقاً",
      enDuration: "To be announced",
      arFormat: "عن بُعد",
      enFormat: "Online",
      status: "COMING_SOON",
      hrefOverride: null,
    },
  ];

  let position = 0;
  for (const p of PROGRAM_SEED) {
    await prisma.program.create({ data: { tenantId, position, ...p } });
    position += 1;
  }
  console.log(`  ${PROGRAM_SEED.length} programs seeded`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
