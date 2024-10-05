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
            image: 'static/pos/products/beverage/prime.png'
        },
        {
            code: 'B002',
            type_id: 1,
            name: 'Sting',
            unit_price: 5000,
            image: 'static/pos/products/beverage/sting.png'
        },
        {
            code: 'B003',
            type_id: 1,
            name: 'Black Energy',
            unit_price: 2000,
            image: 'static/pos/products/beverage/exspress.png'
        },
        {
            code: 'B004',
            type_id: 1,
            name: 'Ize',
            unit_price: 4000,
            image: 'static/pos/products/beverage/ize.png'
        },
        {
            code: 'B005',
            type_id: 1,
            name: 'IZE Cola',
            unit_price: 5000,
            image: 'static/pos/products/beverage/IzeCola.png'
        },
        {
            code: 'B006',
            type_id: 1,
            name: 'Red Bull',
            unit_price: 10000,
            image: 'static/pos/products/beverage/redbullb.png'
        },
        {
            code: 'B007',
            type_id: 1,
            name: 'Red Bull Blue',
            unit_price: 1500,
            image: 'static/pos/products/beverage/redbullblue.png'
        },
        {
            code: 'B008',
            type_id: 1,
            name: 'Red Bull',
            unit_price: 12000,
            image: 'static/pos/products/beverage/red.png'
        },
        {
            code: 'B009',
            type_id: 1,
            name: 'Fanta',
            unit_price: 2000,
            image: 'static/pos/products/beverage/Fanta-Orange-Soft-Drink.jpg'
        },
        {
            code: 'B0010',
            type_id: 1,
            name: 'Sprite',
            unit_price: 3000,
            image: 'static/pos/products/beverage/sprite.png'
        },
        {
            code: 'B0011',
            type_id: 1,
            name: 'PepSi',
            unit_price: 2500,
            image: 'static/pos/products/beverage/pesi.png'
        },
        {
            code: 'B0012',
            type_id: 1,
            name: 'CocaCola',
            unit_price: 2000,
            image: 'static/pos/products/beverage/coca.png'
        },
        {
            code: 'A001',
            type_id: 2,
            name: 'ABC Red',
            unit_price: 5000,
            image: 'static/pos/products/Alcohol/abcred.png'
        },
        {
            code: 'A002',
            type_id: 2,
            name: 'ABA Black',
            unit_price: 5000,
            image: 'static/pos/products/Alcohol/abc.png'
        },
        {
            code: 'A003',
            type_id: 2,
            name: 'Hanuman',
            unit_price: 4000,
            image: 'static/pos/products/Alcohol/hured.png'
        },
        {
            code: 'A004',
            type_id: 2,
            name: 'Hanuman Black',
            unit_price: 8000,
            image: 'static/pos/products/Alcohol/hunumanred.png'
        },
        {
            code: 'A005',
            type_id: 2,
            name: 'Hanuman',
            unit_price: 4000,
            image: 'static/pos/products/Alcohol/haa.png'
        },
        {
            code: 'F&M0010',
            type_id: 3,
            name: 'Pork',
            unit_price: 8000,
            image: 'static/pos/products/Alcohol/meat.png'
        },
    ]
};
