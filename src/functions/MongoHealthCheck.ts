import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { MongoClient } from "mongodb";

const mongoUri = "mongodb://tfex-cosmos-db-38890:WjBXSQdnZxG3BulBecOxdjLT6sEnismGBCS7RfnNmwdSwFJdTylSixL7xBAqja3FDS2jcir8mIfoACDbVPLuTQ%3D%3D@tfex-cosmos-db-38890.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@tfex-cosmos-db-38890@";
const client = new MongoClient(mongoUri);

export async function MongoHealthCheck(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        await client.connect();

        const db = client.db("healthdb"); // Specify your database name
        const collection = db.collection("healthchecks"); // Specify your collection name

        // Insert a health check document
        const result = await collection.insertOne({ timestamp: new Date(), status: "healthy", createdAt: new Date() });

        // If the insert was successful, return 200 OK
        return{ body: `Hello, record inserted with id: ${result.insertedId}` };
    } catch (err) {
        // If there's an error, return 500
        return {
            status: 500,
            body: `Error: ${err}`
        };
    } finally {
        // Ensure the client is closed after the operation
        await client.close();
    }
};

app.http('MongoHealthCheck', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: MongoHealthCheck
});