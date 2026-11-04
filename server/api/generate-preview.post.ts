import { generateBlogCopy } from "../utils/generateBlogCopy";
import { parseCompanies } from "../utils/parseCompanies";

export default defineEventHandler(async () => {
	// Keep this test endpoint unavailable in production.
	if (!import.meta.dev) {
		throw createError({ statusCode: 404 });
	}

	const csv = await useStorage("assets:server").getItem<string>(
		"fintech_companies_seed.csv",
	);

	if (typeof csv !== "string") {
		throw createError({
			statusCode: 500,
			statusMessage: "Seed dataset could not be loaded.",
		});
	}

	try {
		const companies = parseCompanies(csv);
		return await generateBlogCopy(companies, "Fintech");
	} catch (error) {
		const config = useRuntimeConfig();

		const message =
			error instanceof Error ? error.message : "Unknown generation error";

		const safeMessage = config.geminiApiKey
			? message.split(config.geminiApiKey).join("[REDACTED]")
			: message;

		throw createError({
			statusCode: 502,
			statusMessage: "Generation failed",
			data: {
				detail: safeMessage,
			},
		});
	}
});
