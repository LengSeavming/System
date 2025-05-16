import { Pagination } from "@app/shared/pagination.interface";
import Pet from "@models/pet/pet.model";

export interface List {
  status: string;
  data: Pet[];
  pagination: Pagination;
}
