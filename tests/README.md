# Parser tests

Run with Node.js 24.12 or later and installed project dependencies:

```bash
npm ci
npm test
```

During development:

```bash
npm run test:watch
```

The suite imports the real TypeScript parser directly using Node's native
type stripping. No Nuxt server, environment variables, Gemini API calls or
MongoDB connection are required. This runner does not perform TypeScript
type checking.

## Coverage

- Minimal and optional columns, header aliases, case, whitespace, BOM and CRLF.
- Quoted commas, escaped quotes, multiline fields and blank lines.
- Mixed funding stages and industry labels.
- Valid GBP formats, decimals and zero.
- Malformed currency, other currency symbols, negatives and unsafe amounts.
- Descending fundraising order, sequential ranks and stable tie handling.
- Missing names/headers, duplicate aliases, malformed CSV and row-width errors.
- Row-count and field-length limits, including accepted boundary values.
- The original fintech fixture: 100 companies, Nevis first, total fundraising
  of £622,301,270, average £6,223,012.70 and 78 companies in London.

The tests assert behaviour and known results rather than snapshots or private
helper implementation. Test records are fictional.

## Limits

These are parser tests, not a complete application test suite. Upload HTTP
responses, AI response validation/failure handling, database persistence,
browser navigation, production SSR and deployment connectivity still require
separate checks. Keep the existing manual production checks.

No production code is modified by this test suite.
