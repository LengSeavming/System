// ===========================================================================>> Core Library
import { Module } from "@nestjs/common";

// ===========================================================================>> Costom Library

// Custom Components:
import { FileService } from "src/app/services/file.service";
import { PetController } from "./pet.controller";
import { PetService } from "./pet.service";

@Module({
  controllers: [PetController],
  providers: [PetService, FileService],
})
export class PetModule {}
