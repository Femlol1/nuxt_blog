import type { BlogRecord } from "../../utils/blogs";
import { getDatabase } from "../../utils/mongodb";

export default defineEventHandler(async () => {
	const database = await getDatabase();

	const blogs = await database
		.collection<BlogRecord>("blogs")
		.find(
			{},
			{
				projection: {
					slug: 1,
					createdAt: 1,
					"copy.title": 1,
					"copy.metaDescription": 1,
					"statistics.companyCount": 1,
				},
			},
		)
		.sort({ createdAt: -1 })
		.limit(20)
		.toArray();

	return blogs.map((blog) => ({
		slug: blog.slug,
		title: blog.copy.title,
		description: blog.copy.metaDescription,
		companyCount: blog.statistics.companyCount,
		createdAt: blog.createdAt.toISOString(),
	}));
});
