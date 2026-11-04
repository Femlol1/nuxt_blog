import { ObjectId } from "mongodb";
import type { BlogRecord } from "../../utils/blogs";
import { getDatabase } from "../../utils/mongodb";

export default defineEventHandler(async (event) => {
	const slug = getRouterParam(event, "slug") ?? "";
	const idText = slug.match(/-([a-f0-9]{24})$/)?.[1];

	if (!idText) {
		throw createError({
			statusCode: 404,
			statusMessage: "Blog not found.",
		});
	}

	const database = await getDatabase();

	const blog = await database.collection<BlogRecord>("blogs").findOne({
		_id: new ObjectId(idText),
		slug,
	});

	if (!blog) {
		throw createError({
			statusCode: 404,
			statusMessage: "Blog not found.",
		});
	}

	return {
		slug: blog.slug,
		createdAt: blog.createdAt.toISOString(),
		companies: blog.companies,
		copy: blog.copy,
		statistics: blog.statistics,
	};
});
