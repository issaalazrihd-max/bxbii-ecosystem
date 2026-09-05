/**
 * Pre-built role templates (EduSec Cloud brief, Section 43). Every EduSec
 * Cloud tenant gets these out of the box — the opposite of the legacy Yii
 * "Rights" engine, which shipped with an empty user_type/AuthAssignment
 * table and left every institute to build roles from scratch (Phase 1
 * Analysis, Section 2.7).
 *
 * Permission lists here only cover what this foundation scaffold actually
 * implements (Branches, Students + transfer workflow, CMS/Navigation). As Phase 4+ modules
 * land (Admissions/CRM, Finance, HR, Inventory, Facilities, ...), extend
 * each role's permission list — the role and its code/name never need to
 * change, just what it's allowed to do.
 */
export const ROLE_TEMPLATES: Array<{
  code: string;
  name: string;
  description: string;
  permissions: string[];
}> = [
  {
    code: "SUPER_ADMIN",
    name: "Super Administrator",
    description: "Full system access across every module, branch, and the platform website/CMS.",
    permissions: ["branches.list", "branches.create", "students.list", "students.view", "students.create", "students.transfer.request", "students.transfer.review", "students.transfer.approve", "cms.pages.view", "cms.pages.create", "cms.pages.update", "cms.pages.delete", "cms.navigation.view", "cms.navigation.manage"],
  },
  {
    code: "PLATFORM_ADMIN",
    name: "Platform Administrator",
    description: "Manages the public website: pages, the page builder, navigation, and site-wide settings (bxbii Ecosystem brief, Section 32) — distinct from Institute Admin, which manages one institute's operations.",
    permissions: ["cms.pages.view", "cms.pages.create", "cms.pages.update", "cms.pages.delete", "cms.navigation.view", "cms.navigation.manage"],
  },
  {
    code: "INSTITUTE_ADMIN",
    name: "Institute Administrator",
    description: "Institute-wide management across all branches.",
    permissions: ["branches.list", "branches.create", "students.list", "students.view", "students.create", "students.transfer.request", "students.transfer.review", "students.transfer.approve", "cms.pages.view", "cms.navigation.view"],
  },
  {
    code: "BRANCH_MANAGER",
    name: "Branch Manager",
    description: "Manages their assigned branch's day-to-day operations.",
    permissions: ["branches.list", "students.list", "students.view", "students.create", "students.transfer.request", "students.transfer.review"],
  },
  {
    code: "ACADEMIC_MANAGER",
    name: "Academic Manager",
    description: "Manages academic operations (programs, courses, timetable — Phase 4).",
    permissions: ["branches.list", "students.list", "students.view", "students.transfer.review"],
  },
  {
    code: "ADMISSIONS_OFFICER",
    name: "Admissions Officer",
    description: "Manages leads and admissions (full CRM lands in Phase 4).",
    permissions: ["branches.list", "students.list", "students.view", "students.create", "students.transfer.request"],
  },
  {
    code: "FINANCE_OFFICER",
    name: "Finance Officer",
    description: "Manages invoices and student finance (Phase 5).",
    permissions: ["branches.list", "students.list", "students.view"],
  },
  {
    code: "ACCOUNTANT",
    name: "Accountant",
    description: "Manages the general ledger and accounting (Phase 5).",
    permissions: ["branches.list", "students.view"],
  },
  {
    code: "HR_MANAGER",
    name: "HR Manager",
    description: "Manages HR and payroll (Phase 5).",
    permissions: ["branches.list"],
  },
  {
    code: "INVENTORY_OFFICER",
    name: "Inventory Officer",
    description: "Manages stock and assets, including inter-branch transfers (Phase 5).",
    permissions: ["branches.list"],
  },
  {
    code: "FACILITY_MANAGER",
    name: "Facility Manager",
    description: "Manages halls, classrooms, and bookings (Phase 6).",
    permissions: ["branches.list"],
  },
  {
    code: "SECURITY_MANAGER",
    name: "Security Manager",
    description: "Manages security and authorized camera monitoring (Phase 6).",
    permissions: ["branches.list"],
  },
  {
    code: "TRAINING_MANAGER",
    name: "Training Manager",
    description: "Manages the Training/LMS catalog and the Miran Studio training brand (Phase 4 — bxbii Ecosystem brief, Sections 5, 12-13).",
    permissions: ["cms.pages.view"],
  },
  {
    code: "INSTRUCTOR",
    name: "Instructor",
    description: "Delivers Study-side academic content within the LMS (Phase 4) — distinct from Trainer, which covers Training-side courses.",
    permissions: ["students.list", "students.view"],
  },
  {
    code: "TRAINER",
    name: "Trainer",
    description: "Manages assigned courses and students, possibly across multiple branches (Section 7).",
    permissions: ["students.list", "students.view"],
  },
  {
    code: "EMPLOYEE",
    name: "Employee",
    description: "General staff access to the platform, scoped up by additional role assignment (Phase 5 — HR module).",
    permissions: [],
  },
  {
    code: "PARTNER",
    name: "Partner",
    description: "External business partner with access to shared reporting or co-branded content (Phase 5+ — bxbii Ecosystem brief, Section 4).",
    permissions: [],
  },
  {
    code: "CUSTOMER",
    name: "Customer",
    description: "Store customer: purchase history, digital product access, invoices (Phase 5 — Store & Payments).",
    permissions: [],
  },
  {
    code: "STUDENT",
    name: "Student",
    description: "Access to the personal student portal (Phase 4).",
    permissions: [],
  },
];
