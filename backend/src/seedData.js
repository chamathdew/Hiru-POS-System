import "dotenv/config";
import { connectDB } from "./config/db.js";
import Store from "./models/Store.js";
import Department from "./models/Department.js";
import Supplier from "./models/Supplier.js";
import Item from "./models/Item.js";
import { makeCode } from "./utils/ids.js";

async function main() {
    await connectDB(process.env.MONGO_URI);
    console.log("Connected to DB...");

    // Seed Stores
    console.log("Seeding Stores...");
    const stores = [];
    for (let i = 1; i <= 20; i++) {
        stores.push({
            code: `STR${String(i).padStart(3, '0')}`,
            name: `Hiru Branch ${i}`,
            location: `Location ${i}, City ${i}`
        });
    }
    await Store.deleteMany({});
    const createdStores = await Store.insertMany(stores);

    // Seed Departments
    console.log("Seeding Departments...");
    const departments = [];
    for (let i = 1; i <= 20; i++) {
        departments.push({
            code: `DEP${String(i).padStart(3, '0')}`,
            name: `Department ${i}`
        });
    }
    await Department.deleteMany({});
    const createdDeps = await Department.insertMany(departments);

    // Seed Suppliers
    console.log("Seeding Suppliers...");
    const suppliers = [];
    for (let i = 1; i <= 20; i++) {
        suppliers.push({
            code: `SUP${String(i).padStart(3, '0')}`,
            name: `Supplier ${i} Pvt Ltd`,
            contact: `07712345${String(i).padStart(2, '0')}`,
            address: `Address ${i}, Industrial Zone`
        });
    }
    await Supplier.deleteMany({});
    const createdSups = await Supplier.insertMany(suppliers);

    // Seed Items
    console.log("Seeding Items...");
    const items = [];
    const categories = ['Electronics', 'Grocery', 'Hardware', 'Textile', 'Pharmacy'];
    const units = ['PCS', 'KG', 'LTR', 'PKT', 'BOX'];
    for (let i = 1; i <= 20; i++) {
        items.push({
            code: `ITM${String(i).padStart(3, '0')}`,
            name: `Product Item ${i}`,
            category: categories[i % categories.length],
            unit: units[i % units.length],
            isActive: true
        });
    }
    await Item.deleteMany({});
    const createdItems = await Item.insertMany(items);

    console.log("✅ Seeding completed successfully!");
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
