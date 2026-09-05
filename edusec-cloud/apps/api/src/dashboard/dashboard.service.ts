import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AccessTokenPayload } from "../auth/auth.service";

/**
 * Executive Dashboard summary (Institute Management System spec, Section 7).
 * Phase 1 scope: tenant-wide counts only — per-branch filters, charts, and
 * date-range filters land once Programs/Courses/Finance exist to aggregate
 * over (Sections 7, 8).
 */
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(user: AccessTokenPayload) {
    const tenantId = user.tenantId;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalStudents,
      activeStudents,
      newStudentsThisMonth,
      studentsByStatus,
      totalEmployees,
      totalTrainers,
      activeTrainers,
      totalBranches,
    ] = await Promise.all([
      this.prisma.student.count({ where: { tenantId } }),
      this.prisma.student.count({ where: { tenantId, status: "ACTIVE" } }),
      this.prisma.student.count({ where: { tenantId, createdAt: { gte: startOfMonth } } }),
      this.prisma.student.groupBy({ by: ["status"], where: { tenantId }, _count: { _all: true } }),
      this.prisma.employee.count({ where: { tenantId, status: "ACTIVE" } }),
      this.prisma.trainer.count({ where: { tenantId } }),
      this.prisma.trainer.count({ where: { tenantId, status: "ACTIVE" } }),
      this.prisma.branch.count({ where: { tenantId } }),
    ]);

    return {
      totalStudents,
      activeStudents,
      newStudentsThisMonth,
      studentsByStatus: Object.fromEntries(studentsByStatus.map((row) => [row.status, row._count._all])),
      totalEmployees,
      totalTrainers,
      activeTrainers,
      totalBranches,
    };
  }
}
