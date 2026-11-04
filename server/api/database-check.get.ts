import { getDatabase } from "../utils/mongodb";

export default defineEventHandler(async () => {
	if (!import.meta.dev) {
		throw createError({ statusCode: 404 });
	}

	try {
		const database = await getDatabase();

		await database.command({ ping: 1 });

		return {
			connected: true,
			database: database.databaseName,
		};
	} catch (error) {
		// Return useful diagnostics without exposing connection credentials.
		const errorName = error instanceof Error ? error.name : "UnknownError";

		throw createError({
			statusCode: 503,
			statusMessage: "Database connection failed.",
			data: {
				errorType: errorName,
				hint: "Check the connection string, database user and Atlas IP access list.",
			},
		});
	}
});
