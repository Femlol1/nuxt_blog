# Company Insights — AI-Powered SEO Blog Generator

A Nuxt application that converts company CSV datasets into
server-rendered blog pages with AI-generated copy, calculated statistics
and ranking tables.

Live demo: https://nuxt-blog-alpha.vercel.app/

## Try the application

1. Open the live demo.
2. View a saved article under “Latest company insights”.
3. Select a company CSV using the format below.
4. Optionally enter an industry to guide the generated copy.
5. Click “Generate blog”.
6. The application generates, saves and opens the new article.

No local installation or API key is required to use the live demo.
Generation depends on Gemini availability and free-tier quotas.

## Technologies

- Nuxt 4, Vue and TypeScript
- Tailwind CSS
- Papa Parse for CSV processing
- Google Gemini API through @google/genai
- Zod for validating generated content
- MongoDB Atlas for persistent storage
- Vercel for hosting

## Architecture

The upload form sends the CSV to a server endpoint. The server validates
and normalises the records, calculates statistics and requests structured
blog copy from Gemini.

The response is validated with Zod before the copy, company records and
statistics are saved in MongoDB. A reusable Nuxt page renders the saved
article at its own URL.

Opening an existing article reads MongoDB without calling Gemini again.

Main files:

- app/components/CsvUpload.vue — upload interface
- app/pages/index.vue — homepage and saved-article links
- app/pages/blog/[slug].vue — reusable article template
- server/api/upload.post.ts — upload and generation workflow
- server/utils/parseCompanies.ts — CSV parsing and validation
- server/utils/generateBlogCopy.ts — AI prompt and response validation
- server/utils/blogs.ts — article storage
- server/utils/mongodb.ts — database connection reuse

## CSV format

Required column names:

Rank, Company, Region, Stage, Employees, Total Raised,
Description, Website, Industries

Requirements:

- UTF-8 CSV, maximum 1 MB.
- Unique positive integer ranks.
- Non-empty company names.
- Non-negative fundraising amounts in GBP.
- Quote values containing commas, such as "£6,000,000".
- Supply ranks in descending fundraising order.

The sample is server/assets/fintech_companies_seed.csv.
Other industries can use the same schema and any supported row count.
Employee ranges remain ranges; no exact employee total is inferred.

Uploads are sent to Gemini for processing and saved as publicly
accessible articles. Use only data suitable for that purpose.

## Local setup

Tested locally with Node.js 24.

```bash
git clone https://github.com/Femlol1/nuxt_blog.git
cd nuxt_blog
npm ci
cp .env.example .env
```

Populate .env with:

- NUXT_GEMINI_API_KEY
- NUXT_GEMINI_MODEL
- NUXT_MONGODB_URI
- NUXT_MONGODB_DATABASE

Create an Atlas database user with access to the configured database
and configure network access for the environment running the app.
Gemini API access and an available model quota are required.

Never commit .env or actual credentials.

Start development:

```bash
npm run dev
```

## Production

```bash
npm run build
npm run preview
```

The preview command loads the local .env file.

For a standalone Node deployment:

```bash
node .output/server/index.mjs
```

Supply environment variables through the host when running the server
directly. The standalone server does not automatically load .env.

On Vercel, import this repository as a Nuxt project and configure the
same environment variables before deploying. Use a server deployment,
not static generation: CSV uploads require server endpoints.

## SEO and accessibility

Articles include generated titles, descriptions, Open Graph metadata,
semantic headings and server-rendered company tables.

Saved articles are linked from the homepage. Tables include captions,
column headers and horizontal scrolling for smaller screens.
The upload form includes labels, progress wording and error messages.

## Validation performed

- Checked the 100-company fintech table.
- Independently verified total fundraising of £622,301,270.
- Tested a three-company fictional healthtech dataset:
  £10,500,000 total and £3,500,000 average fundraising.
- Inspected page source for rendered article and table content.
- Tested saved-page navigation and refresh locally.
- Completed a production build and local production preview.
- Confirmed the generation-preview endpoint returns 404 in production.

These are manual checks, not an automated test suite.

## Limitations and future improvements

- CSVs must follow the expected schema and GBP format.
- AI structure validation does not guarantee factual accuracy.
- Free-tier AI limits and temporary service failures can affect generation.
- Uploads currently create separate articles, including duplicate datasets.
- Only the latest 20 articles are listed on the homepage.
- Currency-format validation, request limits, deduplication,
  pagination and a sitemap need further work.
- At larger scale, generation should run in a background queue
  with job status, monitoring and editorial review.

Fictional demonstration datasets are for testing and must not be
represented as real company research.