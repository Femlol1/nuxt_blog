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

const requiredColumns = [
	"Rank",
	"Company",
	"Region",
	"Stage",
	"Employees",
	"Total Raised",
	"Description",
	"Website",
	"Industries",
];

export function parseCompanies(csv: string) {
	if (!csv.trim()) {
		throw new Error("The CSV file is empty.");
	}

	const result = Papa.parse<CompanyRow>(csv, {
		header: true,
		skipEmptyLines: "greedy",
		transformHeader: (header) => header.trim(),
	});

	const headers = result.meta.fields ?? [];
	const missingColumns = requiredColumns.filter(
		(column) => !headers.includes(column),
	);

	if (missingColumns.length > 0) {
		throw new Error(`Missing columns: ${missingColumns.join(", ")}`);
	}

	if (result.errors.length > 0) {
		throw new Error(
			"The CSV is malformed. Check its rows and quotation marks.",
		);
	}

	if (result.data.length === 0) {
		throw new Error("The CSV contains headers but no companies.");
	}

	const seenRanks = new Set<number>();

	const companies = result.data.map((row, index) => {
		const rank = Number(row.Rank);
		const amount = row["Total Raised"]?.replace(/[£,\s]/g, "");
		const totalRaised = amount ? Number(amount) : NaN;

		if (!row.Company?.trim()) {
			throw new Error(`Record ${index + 1}: company name is missing.`);
		}

		if (!Number.isInteger(rank) || rank < 1 || seenRanks.has(rank)) {
			throw new Error(
				`Record ${index + 1}: rank must be a unique positive integer.`,
			);
		}

		if (!Number.isFinite(totalRaised) || totalRaised < 0) {
			throw new Error(`Record ${index + 1}: fundraising amount is invalid.`);
		}

		seenRanks.add(rank);

		return {
			rank,
			name: row.Company.trim(),
			region: row.Region.trim(),
			stage: row.Stage.trim(),
			employees: row.Employees.trim(),
			totalRaised,
			description: row.Description.trim(),
			website: row.Website.trim(),
			industries: row.Industries.trim(),
		};
	});

	return companies.sort((a, b) => a.rank - b.rank);
}
