import { ObjectId } from "mongodb";
import type { generateBlogCopy } from "./generateBlogCopy";
import { getDatabase } from "./mongodb";
import type { parseCompanies } from "./parseCompanies";

type Companies = ReturnType<typeof parseCompanies>;
type BlogCopy = Awaited<ReturnType<typeof generateBlogCopy>>;

export interface BlogRecord {
	_id: ObjectId;
	slug: string;
	createdAt: Date;
	companies: Companies;
	copy: BlogCopy;
	statistics: {
		companyCount: number;
		totalRaised: number;
		averageRaised: number;
	};
}

export async function saveBlog(companies: Companies, copy: BlogCopy) {
	const database = await getDatabase();
	const id = new ObjectId();

	const titleSlug =
		copy.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "")
			.slice(0, 80)
			.replace(/-+$/g, "") || "company-insights";

	const totalRaised = companies.reduce(
		(sum, company) => sum + company.totalRaised,
		0,
	);

	const blog: BlogRecord = {
		_id: id,
		slug: `${titleSlug}-${id.toHexString()}`,
		createdAt: new Date(),
		companies,
		copy,
		statistics: {
			companyCount: companies.length,
			totalRaised,
			averageRaised: companies.length ? totalRaised / companies.length : 0,
		},
	};

	await database.collection<BlogRecord>("blogs").insertOne(blog);

	return {
		slug: blog.slug,
		url: `/blog/${blog.slug}`,
		companyCount: companies.length,
	};
}
