import Product from "@models/product/product.model";
import ProductsType from "@models/product/type.model";

export class ProductSeeder {
    public static async seed() {
        try {
            await ProductSeeder.seedProductTypes();
            await ProductSeeder.seedProducts();
        } catch (error) {
            console.error('\x1b[31m\nError seeding products:', error);
        }
    }

    private static async seedProductTypes() {
        try {
            await ProductsType.bulkCreate(productSeederData.types);
            console.log('\x1b[32mProduct types inserted successfully.');
        } catch (error) {
            console.error('Error seeding product types:', error);
            throw error;
        }
    }

    private static async seedProducts() {
        try {
            await Product.bulkCreate(productSeederData.products);
            console.log('\x1b[32mProducts inserted successfully.');
        } catch (error) {
            console.error('Error seeding products:', error);
            throw error;
        }
    }
}

// Mock data for products and product types
const productSeederData = {
    types: [
        { name: 'Beverage' },
        { name: 'Alcohol' },
        { name: 'Food-Meat' },
    ],
    products: [
        {
            code: 'B001',
            type_id: 1,
            name: 'Logan Paul',
            unit_price: 3000,
            image: 'upload/file/c7c3113d-6df8-407d-9a94-0cbcba51f1fd'
        },
        {
            code: 'B002',
            type_id: 1,
            name: 'Sting',
            unit_price: 5000,
            image: 'upload/file/0aba090d-67a7-494d-9878-c4fc6a813685'
        },
        {
            code: 'B003',
            type_id: 1,
            name: 'Black Energy',
            unit_price: 2000,
            image: 'upload/file/9d11e0a9-a2f6-4e46-ac7d-da6065019abe'
        },
        {
            code: 'B004',
            type_id: 1,
            name: 'Ize',
            unit_price: 4000,
            image: 'upload/file/5d1347f0-6087-4617-bc73-5bb044170de3'
        },
        {
            code: 'B005',
            type_id: 1,
            name: 'IZE Cola',
            unit_price: 5000,
            image: 'upload/file/883c8dad-8dec-4e3d-a25e-6d0b9bcfe51c'
        },
        {
            code: 'B006',
            type_id: 1,
            name: 'Red Bull',
            unit_price: 10000,
            image: 'upload/file/fbd4dc96-d633-41f6-9521-ba260c884cb2'
        },
        {
            code: 'B007',
            type_id: 1,
            name: 'Red Bull Blue',
            unit_price: 1500,
            image: 'upload/file/745adc52-269c-4355-9d1e-9b46f4c93759'
        },
        {
            code: 'B008',
            type_id: 1,
            name: 'Red Bull',
            unit_price: 12000,
            image: 'upload/file/4330bf10-c703-41a9-adb9-65f92a2b4af8'
        },
        {
            code: 'B009',
            type_id: 1,
            name: 'Fanta',
            unit_price: 2000,
            image: 'upload/file/3f11a931-c858-496a-ae11-d6cf03bb49ae'
        },
        {
            code: 'B0010',
            type_id: 1,
            name: 'Sprite',
            unit_price: 3000,
            image: 'upload/file/0e5e25c2-3ece-4841-8062-f415cc1bf575'
        },
        {
            code: 'B0011',
            type_id: 1,
            name: 'PepSi',
            unit_price: 2500,
            image: 'upload/file/4b902af5-2d3b-439e-8e67-2692d00de6be'
        },
        {
            code: 'B0012',
            type_id: 1,
            name: 'CocaCola',
            unit_price: 2000,
            image: 'upload/file/1b68b91f-0ca9-4339-853e-32ae04f64af7'
        },
        {
            code: 'A001',
            type_id: 2,
            name: 'ABC Red',
            unit_price: 5000,
            image: 'upload/file/fb96a9b3-0172-4607-88d8-b0e0239ef726'
        },
        {
            code: 'A002',
            type_id: 2,
            name: 'ABA Black',
            unit_price: 5000,
            image: 'upload/file/712299db-3187-4bba-92c8-db421dd8cc6d'
        },
        {
            code: 'A003',
            type_id: 2,
            name: 'Hanuman',
            unit_price: 4000,
            image: 'upload/file/7852e7fb-af45-40d5-a53b-b2f2df51030f'
        },
        {
            code: 'A004',
            type_id: 2,
            name: 'Hanuman Black',
            unit_price: 8000,
            image: 'upload/file/50822661-c74a-4856-81e4-5205f578d03d'
        },
        {
            code: 'A005',
            type_id: 2,
            name: 'Hanuman',
            unit_price: 4000,
            image: 'upload/file/e4c69776-e0d5-4714-bafa-0acffd578c3b'
        },
        {
            code: 'F&M0010',
            type_id: 3,
            name: 'Pork',
            unit_price: 8000,
            image: 'upload/file/e7c4cc78-7592-40f8-9066-4389c116d8fb'
        },
    ]
};
