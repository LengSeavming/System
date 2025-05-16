import { Pagination } from "@app/shared/pagination.interface";
import Book from "@models/book/book.model";

export interface List {
  status: string;
  data: Book[];
  pagination: Pagination;
}
