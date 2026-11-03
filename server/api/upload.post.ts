import { createError, defineEventHandler, readMultipartFormData } from "h3";
import { parseCompanies } from "../utils/parseCompanies";

export default defineEventHandler(async (event) => {
	const parts = await readMultipartFormData(event);
	const file = parts?.find((part) => part.name === "file" && part.filename);

	if (!file) {
		throw createError({
			statusCode: 400,
			statusMessage: "Please upload a CSV file.",
		});
	}

	if (!file.filename?.toLowerCase().endsWith(".csv")) {
		throw createError({
			statusCode: 400,
			statusMessage: "The file must have a .csv extension.",
		});
	}

	if (file.data.length > 1024 * 1024) {
		throw createError({
			statusCode: 413,
			statusMessage: "The CSV must be 1 MB or smaller.",
		});
	}

	try {
		const companies = parseCompanies(file.data.toString("utf-8"));

		return {
			companyCount: companies.length,
		};
	} catch (error) {
		throw createError({
			statusCode: 400,
			statusMessage: "CSV validation failed.",
			data: {
				message: error instanceof Error ? error.message : "Invalid CSV.",
			},
		});
	}
});
