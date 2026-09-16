import { Module } from "@nestjs/common";
import { VheTMController } from "./vhetm.controller";
import { VheTMService } from "./vhetm.service";

@Module({
  controllers: [VheTMController],
  providers: [VheTMService],
  exports: [VheTMService],
})
export class VheTMModule {}
