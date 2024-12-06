// ===========================================================================>> Core Library
import { Module } from "@nestjs/common";

// ===========================================================================>> Costom Library

// Custom Components:
import { FileService } from "src/app/services/file.service";

import { PetService } from "./pet.service";
import { PetController } from "./pet.controller";

@Module({
  controllers: [PetController],
  providers: [PetService, FileService],
})
export class PetModule {}
