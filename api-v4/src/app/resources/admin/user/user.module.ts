// ===========================================================================>> Core Library
import { Module } from "@nestjs/common";

// ===========================================================================>> Costom Library
import { FileService } from "src/app/services/file.service";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
@Module({
  providers: [UserService, FileService],
  controllers: [UserController],
  imports: [],
})
export class UserModule {}
