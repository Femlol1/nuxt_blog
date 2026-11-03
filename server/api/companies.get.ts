import Papa from "papaparse";

interface CompanyRow {
	Rank: string;
	Company: string;
	Region: string;
	Stage: string;
	Employees: string;
	"Total Raised": string;
	Description: string;
	Website: string;
	Industries: string;
}

export default defineEventHandler(async () => {
	const csv = await useStorage("assets:server").getItem<string>(
		"fintech_companies_seed.csv",
	);

	if (typeof csv !== "string" || !csv.trim()) {
		throw createError({
			statusCode: 500,
			statusMessage: "Company dataset could not be loaded",
		});
	}

	const result = Papa.parse<CompanyRow>(csv, {
		header: true,
		skipEmptyLines: "greedy",
		transformHeader: (header) => header.trim(),
	});

	if (result.errors.length > 0) {
		throw createError({
			statusCode: 500,
			statusMessage: "Company dataset contains invalid CSV",
		});
	}

	const companies = result.data.map((row) => {
		const rank = Number(row.Rank);
		const amount = row["Total Raised"]?.replace(/[£,\s]/g, "");
		const totalRaised = amount ? Number(amount) : NaN;

		if (
			!row.Company?.trim() ||
			!Number.isInteger(rank) ||
			rank < 1 ||
			!Number.isFinite(totalRaised) ||
			totalRaised < 0
		) {
			throw createError({
				statusCode: 500,
				statusMessage: "Dataset contains an invalid company, rank or amount",
			});
		}

		return {
			rank,
			name: row.Company.trim(),
			region: row.Region,
			stage: row.Stage,
			employees: row.Employees,
			totalRaised,
			description: row.Description,
			website: row.Website,
			industries: row.Industries,
		};
	});

	return companies.sort((a, b) => a.rank - b.rank);
});
