import Pet from "@models/pet/pet.model";
import PetType from "@models/pet/pet.type.model";

export class PetSeeder {
  public static async seed() {
    try {
      await PetSeeder.seedProductTypes();
      await PetSeeder.seedProducts();
    } catch (error) {
      console.error("\x1b[31m\nError seeding products:", error);
    }
  }

  private static async seedProductTypes() {
    try {
      await PetType.bulkCreate(productSeederData.types);
      console.log("\x1b[32mProduct types inserted successfully.");
    } catch (error) {
      console.error("Error seeding product types:", error);
      throw error;
    }
  }

  private static async seedProducts() {
    try {
      await Pet.bulkCreate(productSeederData.products);
      console.log("\x1b[32mProducts inserted successfully.");
    } catch (error) {
      console.error("Error seeding products:", error);
      throw error;
    }
  }
}

// Mock data for products and product types
const productSeederData = {
  types: [
    { name: "Bird", image: "static/pos/products/type/glass-tulip.png" },
    { name: "Animal", image: "static/pos/products/type/liquor.png" },
    { name: "Dog", image: "static/pos/products/type/food.png" },
  ],
  products: [
    {
      code: "B001",
      type_id: 1,
      name: "Cat",
      unit_price: 3000,
      image: "static/pos/products/beverage/prime.png",
      creator_id: 1,
    },
    {
      code: "B002",
      type_id: 1,
      name: "Eleptiant",
      unit_price: 5000,
      image: "static/pos/products/beverage/sting.png",
      creator_id: 1,
    },
    {
      code: "B003",
      type_id: 1,
      name: "Black Tiger",
      unit_price: 2000,
      image: "static/pos/products/beverage/exspress.png",
      creator_id: 1,
    },
    {
      code: "B004",
      type_id: 1,
      name: "Black Dragon",
      unit_price: 4000,
      image: "static/pos/products/beverage/ize.png",
      creator_id: 1,
    },
    {
      code: "B005",
      type_id: 1,
      name: "Lion",
      unit_price: 5000,
      image: "static/pos/products/beverage/IzeCola.png",
      creator_id: 1,
    },
    {
      code: "B006",
      type_id: 1,
      name: "Dog",
      unit_price: 10000,
      image: "static/pos/products/beverage/redbullb.png",
      creator_id: 1,
    },
    {
      code: "B007",
      type_id: 1,
      name: "Duck",
      unit_price: 1500,
      image: "static/pos/products/beverage/redbullblue.png",
      creator_id: 1,
    },
    {
      code: "B008",
      type_id: 1,
      name: "Hen",
      unit_price: 12000,
      image: "static/pos/products/beverage/red.png",
      creator_id: 1,
    },
    {
      code: "B009",
      type_id: 1,
      name: "Ant",
      unit_price: 2000,
      image: "static/pos/products/beverage/Fanta-Orange-Soft-Drink.jpg",
      creator_id: 1,
    },
    // {
    //   code: "B0010",
    //   type_id: 1,
    //   name: "Sprite",
    //   unit_price: 3000,
    //   image: "static/pos/products/beverage/sprite.png",
    //   creator_id: 1,
    // },
    // {
    //   code: "B0011",
    //   type_id: 1,
    //   name: "PepSi",
    //   unit_price: 2500,
    //   image: "static/pos/products/beverage/pesi.png",
    //   creator_id: 1,
    // },
    // {
    //   code: "B0012",
    //   type_id: 1,
    //   name: "CocaCola",
    //   unit_price: 2000,
    //   image: "static/pos/products/beverage/coca.png",
    //   creator_id: 1,
    // },
    // {
    //   code: "A001",
    //   type_id: 2,
    //   name: "ABC Red",
    //   unit_price: 5000,
    //   image: "static/pos/products/Alcohol/abcred.png",
    //   creator_id: 1,
    // },
    // {
    //   code: "A002",
    //   type_id: 2,
    //   name: "ABA Black",
    //   unit_price: 5000,
    //   image: "static/pos/products/Alcohol/abc.png",
    //   creator_id: 1,
    // },
    // {
    //   code: "A003",
    //   type_id: 2,
    //   name: "Hanuman",
    //   unit_price: 4000,
    //   image: "static/pos/products/Alcohol/hured.png",
    //   creator_id: 1,
    // },
    // {
    //   code: "A004",
    //   type_id: 2,
    //   name: "Hanuman Black",
    //   unit_price: 8000,
    //   image: "static/pos/products/Alcohol/hunumanred.png",
    //   creator_id: 1,
    // },
    // {
    //   code: "A005",
    //   type_id: 2,
    //   name: "Hanuman",
    //   unit_price: 4000,
    //   image: "static/pos/products/Alcohol/haa.png",
    //   creator_id: 1,
    // },
    // {
    //   code: "F&M0010",
    //   type_id: 3,
    //   name: "Pork",
    //   unit_price: 8000,
    //   image: "static/pos/products/Alcohol/meat.png",
    //   creator_id: 1,
    // },
  ],
};
