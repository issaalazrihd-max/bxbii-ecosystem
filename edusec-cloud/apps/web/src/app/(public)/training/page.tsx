import type { Metadata } from "next";
import { TrainingCourse } from "@/components/public/training-course";

/**
 * Dedicated static route for /training (Phase 2 — Miran Studio migration).
 *
 * This sits as a literal sibling of the [slug] catch-all route, so Next.js
 * resolves an exact "/training" request here instead of falling through to
 * the generic CMS page lookup (which only ever had a short placeholder for
 * this slug — see cms/pages "Training — Miran Studio"). The interactive
 * 7-day "Finance for Non-Financials" course — content, structure, and
 * quizzes rebuilt independently for bxbii — lives entirely in code here
 * rather than as CMS sections, since the page builder's block palette
 * (Hero/Text/Image/...) has no block type that models day-by-day lessons,
 * quizzes, and per-visitor progress tracking.
 */
export const metadata: Metadata = {
  title: "التدريب — مِران ستوديو | bxbii",
  description:
    "مِران ستوديو: برنامج المالية لغير الماليين من bxbii — 7 أيام، فيديو وتمارين وأسئلة تحقق في كل يوم، لبناء فهم عملي للقوائم المالية واتخاذ القرار بالأرقام.",
};

export default function TrainingPage() {
  return <TrainingCourse />;
}
