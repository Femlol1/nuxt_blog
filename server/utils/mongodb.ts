import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | undefined;

export async function getDatabase() {
	const config = useRuntimeConfig();

	if (!config.mongodbUri) {
		throw new Error("MongoDB connection string is not configured.");
	}

	if (!clientPromise) {
		const client = new MongoClient(config.mongodbUri, {
			maxPoolSize: 5,
			serverSelectionTimeoutMS: 10000,
		});

		clientPromise = client.connect().catch(async (error) => {
			clientPromise = undefined;
			await client.close().catch(() => {});
			throw error;
		});
	}

	const client = await clientPromise;

	return client.db(config.mongodbDatabase);
}
