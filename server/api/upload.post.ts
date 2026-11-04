import { createError, defineEventHandler, readMultipartFormData } from "h3";
import { saveBlog } from "../utils/blogs";
import { generateBlogCopy } from "../utils/generateBlogCopy";
import { parseCompanies } from "../utils/parseCompanies";

export default defineEventHandler(async (event) => {
	const parts = await readMultipartFormData(event);
	const industry =
		parts
			?.find((part) => part.name === "industry")
			?.data.toString("utf-8")
			.trim() ?? "";

	if (industry.length > 80) {
		throw createError({
			statusCode: 400,
			statusMessage: "Industry must be 80 characters or fewer.",
		});
	}
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

	let companies: ReturnType<typeof parseCompanies>;

	try {
		companies = parseCompanies(file.data.toString("utf-8"));
	} catch (error) {
		throw createError({
			statusCode: 400,
			statusMessage: "CSV validation failed.",
			data: {
				message: error instanceof Error ? error.message : "Invalid CSV.",
			},
		});
	}

	let copy: Awaited<ReturnType<typeof generateBlogCopy>>;

	try {
		copy = await generateBlogCopy(companies, industry);
	} catch {
		throw createError({
			statusCode: 502,
			statusMessage: "Blog generation failed.",
			data: {
				message:
					"The AI service could not generate the blog. Please try again shortly.",
			},
		});
	}

	try {
		return await saveBlog(companies, copy);
	} catch {
		throw createError({
			statusCode: 503,
			statusMessage: "Blog could not be saved.",
			data: {
				message:
					"Database saving failed. Please check database write permissions and connectivity.",
			},
		});
	}
});
