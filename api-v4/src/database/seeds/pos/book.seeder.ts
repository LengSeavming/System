import Book from "@models/book/book.model";
import BookType from "@models/book/book_type.model";

export class BookSeeder {
  public static seed = async () => {
    try {
      await BookSeeder.seedBookTypes();
      await BookSeeder.seedBook();
    } catch (error) {
      console.error("\x1b[31m\nError seeding data Book:", error);
    }
  };

  private static async seedBookTypes() {
    try {
      await BookType.bulkCreate(BookSeederData.types);
      console.log("\x1b[32mBook_types inserted successfully.");
    } catch (error) {
      console.error("Error seeding book_types types:", error);
      throw error;
    }
  }
  private static async seedBook(): Promise<void> {
    try {
      await Book.bulkCreate(BookSeederData.products);
      console.log("\x1b[32mBooks inserted successfully.");
    } catch (error) {
      console.error("Error seeding Books:", error);
      throw error;
    }
  }
}

// Mock data for products and product types
const BookSeederData = {
  types: [
    { name: "Novel", image: "static/pos/products/type/glass-tulip.png" },
    { name: "Romance", image: "static/pos/products/type/liquor.png" },
    { name: "Fantasy", image: "static/pos/products/type/food.png" },
  ],
  products: [
    {
      code: "B001",
      type_id: 1,
      name: "Rose and Jack",
      unit_price: 3000,
      image: "static/pos/products/beverage/prime.png",
      creator_id: 1,
    },
    {
      code: "B002",
      type_id: 1,
      name: "Follow your heart",
      unit_price: 5000,
      image: "static/pos/products/beverage/sting.png",
      creator_id: 1,
    },
    {
      code: "B003",
      type_id: 1,
      name: "Tiger and rat",
      unit_price: 2000,
      image: "static/pos/products/beverage/exspress.png",
      creator_id: 1,
    },
    {
      code: "B004",
      type_id: 1,
      name: "Dragon Ver",
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
      name: "Red girl",
      unit_price: 12000,
      image: "static/pos/products/beverage/red.png",
      creator_id: 1,
    },
    {
      code: "B009",
      type_id: 1,
      name: "Sveaver sword",
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
