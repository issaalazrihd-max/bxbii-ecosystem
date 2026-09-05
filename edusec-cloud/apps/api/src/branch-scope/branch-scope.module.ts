import { Global, Module } from "@nestjs/common";
import { BranchScopeService } from "./branch-scope.service";
import { CrossBranchLogService } from "./cross-branch-log.service";

@Global()
@Module({
  providers: [BranchScopeService, CrossBranchLogService],
  exports: [BranchScopeService, CrossBranchLogService],
})
export class BranchScopeModule {}
