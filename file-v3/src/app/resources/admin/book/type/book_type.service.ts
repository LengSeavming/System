// ===========================================================================>> Core Library
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

// ===========================================================================>> Third party Library
import { Op, Sequelize } from "sequelize";

// ===========================================================================>> Custom Library
import { FileService } from "@app/services/file.service";
import BookType from "@models/book/book_type.model";
import Book from "@models/book/book.model";
import { CreateBookTypeDto } from "./boo_type.dto";

@Injectable()
export class BookTypeService {
  constructor(private readonly fileService: FileService) {}

  // ==========================================>> get data
  async getData(): Promise<{
    data: {
      id: number;
      name: string;
      created_at: Date;
      n_of_products: number;
    }[];
  }> {
    const data = await BookType.findAll({
      attributes: [
        "id",
        "name",
        "image",
        "created_at",
        [Sequelize.fn("COUNT", Sequelize.col("products.id")), "n_of_products"], // Fixing the COUNT function
      ],
      include: [
        {
          model: Book,
          attributes: [], // We don't need any product attributes, just the count
        },
      ],
      group: ["BookType.id"], // Group by the ProductsType id
      order: [["name", "ASC"]], // Order by name
    });

    // Formatting the result
    const dataFormat = data.map((type) => ({
      id: type.id,
      name: type.name,
      image: type.image,
      created_at: type.created_at,
      n_of_products: type.get("n_of_products") || 0, // Using `get` method to access the alias field
    }));

    // Returning the formatted data
    return {
      data: dataFormat as {
        id: number;
        name: string;
        created_at: Date;
        n_of_products: number;
      }[],
    };
  }

  // ==========================================>> create
  async create(
    body: CreateBookTypeDto
  ): Promise<{ data: BookType; message: string }> {
    const checkExistName = await BookType.findOne({
      where: { name: body.name },
    });
    if (checkExistName) {
      throw new BadRequestException("ឈ្មោះនេះមានក្នុងប្រព័ន្ធ");
    }
    const result = await this.fileService.uploadBase64Image(
      "product",
      body.image
    );
    if (result.error) {
      throw new BadRequestException(result.error);
    }
    // Replace base64 string by file URI from FileService
    body.image = result.file.uri;

    const productType = await BookType.create({
      name: body.name,
      image: "abc",
    });

    const dataFormat = {
      data: productType,
      message: "Product type has been created.",
    } as { data: BookType; message: string };

    return dataFormat;
  }

  // ==========================================>> update
  async update(
    body: CreateBookTypeDto,
    id: number
  ): Promise<{ data: BookType; message: string }> {
    const checkExist = await BookType.findByPk(id);
    if (!checkExist) {
      throw new BadRequestException("គ្មានទិន្នន័យនៅក្នុងប្រព័ន្ធ");
    }
    if (body.image) {
      const result = await this.fileService.uploadBase64Image(
        "product",
        body.image
      );
      if (result.error) {
        throw new BadRequestException(result.error);
      }
      // Replace base64 string by file URI from FileService
      body.image = result.file.uri;
    } else {
      body.image = undefined;
    }
    const checkExistName = await BookType.findOne({
      where: {
        id: { [Op.not]: id },
        name: body.name,
      },
    });
    if (checkExistName) {
      throw new BadRequestException("ឈ្មោះនេះមានក្នុងប្រព័ន្ធ");
    }
    await BookType.update(body, {
      where: { id: id },
    });

    const dataFormat = {
      data: await BookType.findByPk(id, {
        attributes: ["id", "name", "image", "updated_at"],
      }),
      message: "Books type has been created.",
    } as { data: BookType; message: string };
    return dataFormat;
  }

  // ==========================================>> delete
  async delete(id: number): Promise<{ message: string }> {
    try {
      // Check if there are associated products
      const productsCount = await Book.count({
        where: {
          type_id: id,
        },
      });

      if (productsCount > 0) {
        throw new BadRequestException(
          "Cannot delete. Products are associated with this BooksType."
        );
      }

      // No associated products, proceed with deletion
      const rowsAffected = await BookType.destroy({
        where: {
          id: id,
        },
      });

      if (rowsAffected === 0) {
        throw new NotFoundException("Books type not found.");
      }

      return { message: "Data has been deleted successfully." };
    } catch (error) {
      throw new BadRequestException(
        error.message ?? "Something went wrong!. Please try again later.",
        "Error Delete"
      );
    }
  }
}
