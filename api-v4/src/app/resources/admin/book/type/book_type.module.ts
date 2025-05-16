// ===========================================================================>> Core Library
import { Module } from "@nestjs/common";

// ===========================================================================>> Custom Library
import { FileService } from "@app/services/file.service";
import { BookTypeController } from "./book_type.controller";
import { BookTypeService } from "./book_type.service";

@Module({
  controllers: [BookTypeController],
  providers: [BookTypeService, FileService],
})
export class BookTypeModule {}
