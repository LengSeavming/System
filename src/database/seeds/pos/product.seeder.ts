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
        { name: 'Snack' },
        { name: 'Food-Meat' },
        { name: 'Beverage' },
        { name: 'Beauty' }
    ],
    products: [
        {
            code: 'B001',
            type_id: 4,
            name: 'Boscia',
            unit_price: 10000,
            image: 'static/pos/products/beauty/boscia.jpg'
        },
        {
            code: 'B002',
            type_id: 4,
            name: 'Deep Cleaning Oil',
            unit_price: 15000,
            image: 'static/pos/products/beauty/deep-cleansing-oil.jpg'
        },
        {
            code: 'B003',
            type_id: 4,
            name: 'LipGloss',
            unit_price: 25000,
            image: 'static/pos/products/beauty/lipgloss.jpg'
        },
        {
            code: 'B004',
            type_id: 4,
            name: 'Dark Pot',
            unit_price: 18000,
            image: 'static/pos/products/beauty/dark-spot.jpg'
        },
        {
            code: 'B005',
            type_id: 4,
            name: 'Mauli',
            unit_price: 23000,
            image: 'static/pos/products/beauty/mauli.jpg'
        },
        {
            code: 'S001',
            type_id: 1,
            name: 'Schoko',
            unit_price: 3000,
            image: 'static/pos/products/snack/milch-schoko.png'
        },
        {
            code: 'S002',
            type_id: 1,
            name: 'Cheez-it',
            unit_price: 5000,
            image: 'static/pos/products/snack/cheezit.png'
        },
        {
            code: 'S003',
            type_id: 1,
            name: 'Chikki',
            unit_price: 2000,
            image: 'static/pos/products/snack/chikki.png'
        },
        {
            code: 'S004',
            type_id: 1,
            name: 'Snickers',
            unit_price: 4000,
            image: 'static/pos/products/snack/snickers.jpg'
        },
        {
            code: 'S005',
            type_id: 1,
            name: 'Protein',
            unit_price: 5000,
            image: 'static/pos/products/snack/protein-snack.jpg'
        },
        {
            code: 'M001',
            type_id: 2,
            name: 'Crab',
            unit_price: 10000,
            image: 'static/pos/products/food-meat/crab.jpg'
        },
        {
            code: 'M002',
            type_id: 2,
            name: 'Jerky Beef',
            unit_price: 15000,
            image: 'static/pos/products/food-meat/jerky-beef.jpg'
        },
        {
            code: 'M003',
            type_id: 2,
            name: 'Clam',
            unit_price: 25000,
            image: 'static/pos/products/food-meat/clam.jpg'
        },
        {
            code: 'M004',
            type_id: 2,
            name: 'Chicken meat',
            unit_price: 15000,
            image: 'static/pos/products/food-meat/chicken-meat.png'
        },
        {
            code: 'M005',
            type_id: 2,
            name: 'Beef',
            unit_price: 23000,
            image: 'static/pos/products/food-meat/beef.png'
        },
        {
            code: 'Be001',
            type_id: 3,
            name: 'G',
            unit_price: 8000,
            image: 'static/pos/products/beverage/g.jpg'
        },
        {
            code: 'Be002',
            type_id: 3,
            name: 'IZE',
            unit_price: 1500,
            image: 'static/pos/products/beverage/ize.png'
        },
        {
            code: 'Be003',
            type_id: 3,
            name: 'Creamsoda',
            unit_price: 12000,
            image: 'static/pos/products/beverage/creamsoda.png'
        },
        {
            code: 'Be004',
            type_id: 3,
            name: 'EGB',
            unit_price: 6000,
            image: 'static/pos/products/beverage/egb.png'
        },
        {
            code: 'Be005',
            type_id: 3,
            name: 'Heineken',
            unit_price: 8000,
            image: 'static/pos/products/beverage/heineken.jpg'
        },
    ]
};
