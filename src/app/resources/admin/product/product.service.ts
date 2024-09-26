// ===========================================================================>> Core Library
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

// ============================================================================>> Third Party Library
import { Op } from 'sequelize';

// ===========================================================================>> Costom Library
import { FileService } from 'src/app/services/file.service';
import Product from 'src/models/product/product.model';
import ProductsType from 'src/models/product/type.model';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { List } from './product.stype';

@Injectable()
export class ProductService {

    constructor(private readonly fileService: FileService) { };

    // Method to retrieve the setup data for product types
    async setup(): Promise<{ data: ProductsType[] }> {
        const setup = await ProductsType.findAll({ attributes: ['id', 'name'] });
        return {
            data: setup
        };
    }

    async listing(page_size: number = 10, page: number = 1, key?: string, type_id?: number) {
        const offset = (page - 1) * page_size;
        // Define the WHERE condition based on provided parameters
        const where = {
            [Op.and]: [
                key
                    ? {
                        [Op.or]: [
                            { code: { [Op.iLike]: `%${key}%` } },
                            { name: { [Op.iLike]: `%${key}%` } },
                        ],
                    }
                    : {},
                type_id ? { type_id: Number(type_id) } : {}
            ]
        };

        // Retrieve products with associated product types
        const data = await Product.findAll({
            attributes: ['id', 'code', 'name', 'image', 'unit_price', 'created_at'],
            where: where,
            include: [
                {
                    model: ProductsType,
                    attributes: ['id', 'name']
                }
            ],
            order: [['id', 'DESC']],
            limit: page_size,
            offset,
        });

        const totalCount = await Product.count({
            where: where,
        });

        const totalPages = Math.ceil(totalCount / page_size);

        const dataFormat: List = {
            status: 'success',
            data: data,
            pagination: {
                currentPage: page,
                perPage: page_size,
                totalPages: totalPages,
                totalItems: totalCount,
            },
        };

        return dataFormat;
    }

    // Method to create a new product
    async create(body: CreateProductDto): Promise<{ data: Product, message: string }> {
        // Check if the product code already exists
        const checkExistCode = await Product.findOne({
            where: { code: body.code }
        });
        if (checkExistCode) {
            throw new BadRequestException('This code already exists in the system.');
        }

        // Check if the product name already exists
        const checkExistName = await Product.findOne({
            where: { name: body.name }
        });
        if (checkExistName) {
            throw new BadRequestException('This name already exists in the system.');
        }

        const result = await this.fileService.uploadBase64Image('product', body.image);
        if (result.error) {
            throw new BadRequestException(result.error);
        }
        // Replace base64 string by file URI from FileService
        body.image = result.file.uri;

        // Create the new product
        const product = await Product.create(body);

        return {
            data: product,
            message: 'Product has been created.'
        };
    }

    // Method to update an existing product
    async update(body: UpdateProductDto, id: number): Promise<{ data: Product, message: string }> {
        // Check if the product with the given ID exists
        const checkExist = await Product.findByPk(id);
        if (!checkExist) {
            throw new BadRequestException('No data found for the provided ID.');
        }

        // Check if the updated code already exists for another product
        const checkExistCode = await Product.findOne({
            where: {
                id: { [Op.not]: id },
                code: body.code
            }
        });
        if (checkExistCode) {
            throw new BadRequestException('This code already exists in the system.');
        }

        // Check if the updated name already exists for another product
        const checkExistName = await Product.findOne({
            where: {
                id: { [Op.not]: id },
                name: body.name
            }
        });
        if (checkExistName) {
            throw new BadRequestException('This name already exists in the system.');
        }

        if (body.image) {
            const result = await this.fileService.uploadBase64Image('product', body.image);
            if (result.error) {
                throw new BadRequestException(result.error);
            }
            // Replace base64 string by file URI from FileService
            body.image = result.file.uri;
        } else {
            body.image = undefined;
        }

        // Update the product
        await Product.update(body, {
            where: { id: id }
        });

        // Retrieve and return the updated product
        return {
            data: await Product.findByPk(id),
            message: 'Product has been updated.'
        };
    }

    // Method to delete a product by ID
    async delete(id: number): Promise<{ message: string }> {
        try {
            // Attempt to delete the product
            const rowsAffected = await Product.destroy({
                where: {
                    id: id
                }
            });

            // Check if the product was found and deleted
            if (rowsAffected === 0) {
                throw new NotFoundException('Product not found.');
            }

            return { message: 'This product has been deleted successfully.' };
        } catch (error) {
            // Handle any errors during the delete operation
            throw new BadRequestException(error.message ?? 'Something went wrong! Please try again later.', 'Error Delete');
        }
    }

}
