import { Module } from "@nestjs/common";
import { AcademicOperationsController } from "./academic-operations.controller";
import { AcademicOperationsService } from "./academic-operations.service";

@Module({
  controllers: [AcademicOperationsController],
  providers: [AcademicOperationsService],
})
export class AcademicOperationsModule {}
