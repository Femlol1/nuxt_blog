import Papa from "papaparse";

const aliases = new Map([
	["company", "name"],
	["company name", "name"],
	["name", "name"],
	["total raised", "totalRaised"],
	["total fundraising", "totalRaised"],
	["funding raised", "totalRaised"],
	["total funding", "totalRaised"],
	["region", "region"],
	["stage", "stage"],
	["funding stage", "stage"],
	["employees", "employees"],
	["employee count", "employees"],
	["description", "description"],
	["website", "website"],
	["industries", "industries"],
	["industry", "industries"],
	["rank", "sourceRank"],
]);

function normaliseHeader(header: string) {
	const cleaned = header
		.replace(/^\uFEFF/, "")
		.trim()
		.toLowerCase()
		.replace(/[_-]+/g, " ")
		.replace(/\s+/g, " ");

	return aliases.get(cleaned) ?? cleaned;
}

function parseGBPInPence(value: string, record: number) {
	// Accept plain GBP amounts or a single £ prefix.
	// Commas must form valid thousands groups.
	const match = value
		.trim()
		.match(/^£?\s*((?:\d{1,3}(?:,\d{3})+|\d+))(?:\.(\d{1,2}))?$/);

	if (!match) {
		throw new Error(
			`Record ${record}: invalid GBP amount "${value}". ` +
				'Use values such as 1000000 or "£1,000,000.50".',
		);
	}

	const pounds = match[1]!.replace(/,/g, "");
	const pennies = (match[2] ?? "").padEnd(2, "0");
	const amountInPence = Number(`${pounds}${pennies}`);

	if (!Number.isSafeInteger(amountInPence)) {
		throw new Error(`Record ${record}: fundraising amount is too large.`);
	}

	return amountInPence;
}

export function parseCompanies(csv: string) {
	if (!csv.trim()) {
		throw new Error("The CSV file is empty.");
	}

	const result = Papa.parse<string[]>(csv, {
		delimiter: ",",
		skipEmptyLines: "greedy",
	});

	if (result.errors.length > 0) {
		throw new Error(
			"The CSV is malformed. Check its quotation marks and separators.",
		);
	}

	const [rawHeaders, ...rows] = result.data;

	if (!rawHeaders || rows.length === 0) {
		throw new Error("The CSV must contain headers and at least one company.");
	}

	if (rows.length > 1000) {
		throw new Error("Please upload no more than 1,000 companies.");
	}

	const headers = rawHeaders.map(normaliseHeader);

	if (headers.some((header) => !header)) {
		throw new Error("Every column must have a header.");
	}

	if (new Set(headers).size !== headers.length) {
		throw new Error(
			"Duplicate or equivalent column names found. " +
				"Use only one company-name and one fundraising column.",
		);
	}

	const missing = ["name", "totalRaised"].filter(
		(field) => !headers.includes(field),
	);

	if (missing.length > 0) {
		throw new Error(
			"Required columns: Company and Total Raised. " +
				"Common aliases such as Company Name and Total Funding are supported.",
		);
	}

	let totalPence = 0;

	const companies = rows.map((values, index) => {
		const record = index + 1;

		if (values.length !== headers.length) {
			throw new Error(
				`Record ${record}: column count does not match the headers. ` +
					"Quote any values containing commas.",
			);
		}

		if (values.some((value) => value.length > 10000)) {
			throw new Error(`Record ${record}: a field exceeds 10,000 characters.`);
		}

		const row: Record<string, string> = Object.fromEntries(
			headers.map((header, column) => [header, values[column] ?? ""]),
		);

		const text = (field: string) => row[field]?.trim() ?? "";
		const name = text("name");

		if (!name) {
			throw new Error(`Record ${record}: company name is missing.`);
		}

		const raisedPence = parseGBPInPence(text("totalRaised"), record);
		totalPence += raisedPence;

		if (!Number.isSafeInteger(totalPence)) {
			throw new Error("Combined fundraising total is too large.");
		}

		return {
			name,
			region: text("region") || "Unknown",
			stage: text("stage") || "Unknown",
			employees: text("employees") || "Not provided",
			totalRaised: raisedPence / 100,
			description: text("description"),
			website: text("website"),
			industries: text("industries"),
		};
	});

	// Stable sorting preserves CSV order when fundraising amounts tie.
	companies.sort((a, b) => b.totalRaised - a.totalRaised);

	return companies.map((company, index) => ({
		...company,
		rank: index + 1,
	}));
}
