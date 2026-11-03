import { parseCompanies } from "../utils/parseCompanies";

export default defineEventHandler(async () => {
	const csv = await useStorage("assets:server").getItem<string>(
		"fintech_companies_seed.csv",
	);

	if (typeof csv !== "string") {
		throw createError({
			statusCode: 500,
			statusMessage: "Company dataset could not be loaded",
		});
	}

	try {
		return parseCompanies(csv);
	} catch (error) {
		console.error("Seed dataset parsing failed:", error);

		throw createError({
			statusCode: 500,
			statusMessage: "Company dataset could not be parsed",
		});
	}
});
