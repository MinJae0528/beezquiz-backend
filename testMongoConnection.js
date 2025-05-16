import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = "mongodb+srv://dbUser:yourEncodedPassword@beezquizdb.9rrqndr.mongodb.net/?retryWrites=true&w=majority&appName=beezquizdb";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (e) {
    console.error("MongoDB 연결 실패:", e);
  } finally {
    await client.close();
  }
}

run();
