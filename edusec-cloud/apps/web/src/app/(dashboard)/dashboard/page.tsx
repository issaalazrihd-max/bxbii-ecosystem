import { Card, CardTitle, CardValue } from "@/components/ui/card";

/**
 * Executive dashboard shell (brief Section 4). Widgets are static
 * placeholders here — wiring them to real numbers depends on modules
 * (Finance, HR, Inventory, Facilities) that land in later phases. The point
 * of this scaffold is the layout and the branch-filter pattern, not the data.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <select className="rounded border border-surface-border px-3 py-1.5 text-sm">
          <option>All branches</option>
          <option>Head Office</option>
          <option>Muscat</option>
          <option>Salalah</option>
          <option>Sohar</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardTitle>Total Students</CardTitle>
          <CardValue>—</CardValue>
        </Card>
        <Card>
          <CardTitle>Active Courses</CardTitle>
          <CardValue>—</CardValue>
        </Card>
        <Card>
          <CardTitle>Monthly Revenue</CardTitle>
          <CardValue>—</CardValue>
        </Card>
        <Card>
          <CardTitle>Pending Leave Requests</CardTitle>
          <CardValue>—</CardValue>
        </Card>
      </div>

      <Card>
        <CardTitle>Getting started</CardTitle>
        <p className="mt-2 text-sm text-slate-600">
          This dashboard is a layout shell. Wire the widgets above to the API as each backing
          module (Finance, Academics, HR, Inventory) ships — see the Phase roadmap.
        </p>
      </Card>
    </div>
  );
}
