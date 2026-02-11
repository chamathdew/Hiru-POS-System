import mongoose from 'mongoose';

const uris = [
    "mongodb+srv://chamathdofficial_db_user:burnitdown2002@hirupos.yotmnmk.mongodb.net/?appName=hirupos",
    "mongodb+srv://hirupos:burnitdown2002@pos.rfbeq4t.mongodb.net/?appName=pos",
    "mongodb+srv://hirupos:burnitdown2002@pos.rfbeq4t.mongodb.net/hirupos?appName=pos",
    "mongodb+srv://hirupos:burnitdown2002@pos.rfbeq4t.mongodb.net/test?appName=pos",
    "mongodb+srv://hirupos:burnitdown2002@pos.rfbeq4t.mongodb.net/?authSource=admin&appName=pos"
];

async function testConnection(uri) {
    try {
        console.log(`Testing: ${uri}`);
        await mongoose.connect(uri);
        console.log(`✅ SUCCESS: ${uri}`);
        await mongoose.disconnect();
        return true;
    } catch (err) {
        console.log(`❌ FAILED: ${uri}`);
        console.log(`   Error: ${err.message}`);
        return false;
    }
}

async function run() {
    for (const uri of uris) {
        const success = await testConnection(uri);
        if (success) process.exit(0);
    }
    process.exit(1);
}

run();
