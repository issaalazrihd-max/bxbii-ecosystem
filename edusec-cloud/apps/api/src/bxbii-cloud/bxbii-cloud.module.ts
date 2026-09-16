import { Module } from "@nestjs/common";
import { BxbiiCloudController } from "./bxbii-cloud.controller";
import { BxbiiCloudService } from "./bxbii-cloud.service";

@Module({
  controllers: [BxbiiCloudController],
  providers: [BxbiiCloudService],
  exports: [BxbiiCloudService],
})
export class BxbiiCloudModule {}
