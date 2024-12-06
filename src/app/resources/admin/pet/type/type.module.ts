// ===========================================================================>> Core Library
import { Module } from "@nestjs/common";

// ===========================================================================>> Custom Library
import { FileService } from "@app/services/file.service";
import { PetTypeController } from "./type.controller";
import { PetTypeService } from "./type.service";

@Module({
  controllers: [PetTypeController],
  providers: [PetTypeService, FileService],
})
export class PetTypeModule {}
