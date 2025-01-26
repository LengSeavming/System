import Pet from "@models/pet/pet.model";
import PetType from "@models/pet/pet.type.model";

export class PetSeeder {
  public static async seed() {
    try {
      await PetSeeder.seedPetTypes();
      await PetSeeder.seedPet();
    } catch (error) {
      console.error("\x1b[31m\nError seeding pets:", error);
    }
  }

  private static async seedPetTypes() {
    try {
      await PetType.bulkCreate(petSeederData.kinds);
      console.log("\x1b[32mPet types inserted successfully.");
    } catch (error) {
      console.error("Error seeding pet types:", error);
      throw error;
    }
  }

  private static async seedPet() {
    try {
      await Pet.bulkCreate(petSeederData.pets);
      console.log("\x1b[32mPets inserted successfully.");
    } catch (error) {
      console.error("Error seeding pet:", error);
      throw error;
    }
  }
}

// Mock data for products and product types
const petSeederData = {
  kinds: [
    { name: "Dogs", image: "static/pos/products/type/dogs.png" },
    { name: "Cats", image: "static/pos/products/type/cats.png" },
    { name: "Small Animals", image: "static/pos/products/type/animal.png" },
  ],
  pets: [
    {
      code: "V001",
      type_id: 2,
      name: "Cat",
      unit_price: 350000,
      image: "static/pos/products/vegetable/cat.png",
      creator_id: 1,
    },
    {
      code: "V002",
      type_id: 1,
      name: "Dog",
      unit_price: 530000,
      image: "static/pos/products/vegetable/dog.png",
      creator_id: 1,
    },
    {
      code: "V003",
      type_id: 2,
      name: "Snake",
      unit_price: 320000,
      image: "static/pos/products/vegetable/snake.png",
      creator_id: 1,
    },
    {
      code: "V004",
      type_id: 1,
      name: "Pet",
      unit_price: 250000,
      image: "static/pos/products/vegetable/pets.png",
      creator_id: 1,
    },
    {
      code: "V005",
      type_id: 2,
      name: "Frog",
      unit_price: 40000,
      image: "static/pos/products/vegetable/frog-prince.png",
      creator_id: 1,
    },
    {
      code: "V006",
      type_id: 3,
      name: "Parrot",
      unit_price: 500000,
      image: "static/pos/products/vegetable/parrot.png",
      creator_id: 1,
    },
  ],
};
