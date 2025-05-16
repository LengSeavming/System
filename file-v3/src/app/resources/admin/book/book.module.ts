// ===========================================================================>> Core Library
import { Module } from "@nestjs/common";

// ===========================================================================>> Costom Library

// Custom Components:
import { FileService } from "src/app/services/file.service";
import { BookController } from "./book.controller";
import { BookService } from "./book.service";

@Module({
  controllers: [BookController],
  providers: [BookService, FileService],
})
export class BookModule {}
