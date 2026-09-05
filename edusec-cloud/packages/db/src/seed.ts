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
  console.log("Seeding EduSec Cloud foundation data...");

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
  const superAdminEmail = "admin@edusec.local";
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

  console.log("Seed complete.");
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

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
