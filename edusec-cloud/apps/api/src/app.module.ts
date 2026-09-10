import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuditModule } from "./audit/audit.module";
import { BranchScopeModule } from "./branch-scope/branch-scope.module";
import { AuthModule } from "./auth/auth.module";
import { BranchesModule } from "./branches/branches.module";
import { StudentsModule } from "./students/students.module";
import { TrainersModule } from "./trainers/trainers.module";
import { ErpModule } from "./erp/erp.module";
import { CmsModule } from "./cms/cms.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { HealthController } from "./common/health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuditModule,
    BranchScopeModule,
    AuthModule,
    BranchesModule,
    StudentsModule,
    TrainersModule,
    ErpModule,
    CmsModule,
    DashboardModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
