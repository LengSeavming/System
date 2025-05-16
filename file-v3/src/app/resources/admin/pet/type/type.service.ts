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

import PetType from "@models/pet/pet.type.model";
import { CreatePetTypeDto, UpdatePetTypeDto } from "./type.dto";
import Pet from "@models/pet/pet.model";

@Injectable()
export class PetTypeService {
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
    const data = await PetType.findAll({
      attributes: [
        "id",
        "name",
        "image",
        "created_at",
        [Sequelize.fn("COUNT", Sequelize.col("products.id")), "n_of_products"], // Fixing the COUNT function
      ],
      include: [
        {
          model: Pet,
          attributes: [], // We don't need any product attributes, just the count
        },
      ],
      group: ["PetType.id"], // Group by the ProductsType id
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
    body: CreatePetTypeDto
  ): Promise<{ data: PetType; message: string }> {
    const checkExistName = await PetType.findOne({
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

    const productType = await PetType.create({
      name: body.name,
      image: "abc",
    });

    const dataFormat = {
      data: productType,
      message: "Product type has been created.",
    } as { data: PetType; message: string };

    return dataFormat;
  }

  // ==========================================>> update
  async update(
    body: UpdatePetTypeDto,
    id: number
  ): Promise<{ data: PetType; message: string }> {
    const checkExist = await PetType.findByPk(id);
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
    const checkExistName = await PetType.findOne({
      where: {
        id: { [Op.not]: id },
        name: body.name,
      },
    });
    if (checkExistName) {
      throw new BadRequestException("ឈ្មោះនេះមានក្នុងប្រព័ន្ធ");
    }
    await PetType.update(body, {
      where: { id: id },
    });

    const dataFormat = {
      data: await PetType.findByPk(id, {
        attributes: ["id", "name", "image", "updated_at"],
      }),
      message: "Product type has been created.",
    } as { data: PetType; message: string };
    return dataFormat;
  }

  // ==========================================>> delete
  async delete(id: number): Promise<{ message: string }> {
    try {
      // Check if there are associated products
      const productsCount = await Pet.count({
        where: {
          type_id: id,
        },
      });

      if (productsCount > 0) {
        throw new BadRequestException(
          "Cannot delete. Products are associated with this ProductsType."
        );
      }

      // No associated products, proceed with deletion
      const rowsAffected = await PetType.destroy({
        where: {
          id: id,
        },
      });

      if (rowsAffected === 0) {
        throw new NotFoundException("Products type not found.");
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
