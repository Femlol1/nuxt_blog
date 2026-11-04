import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { parseCompanies } from '../server/utils/parseCompanies.ts'

// Quote values independently of Papa Parse so malformed CSV can also be tested.
const cell = (value) => '"' + String(value).replaceAll('"', '""') + '"'
const moneyCSV = (amount) => 'Company,Total Raised\nExample,' + cell(amount)

describe('CSV compatibility', () => {
  it('accepts minimal headers and provides honest missing-data fallbacks', () => {
    assert.deepEqual(parseCompanies('Company,Total Raised\nExample,100')[0], {
      name: 'Example', region: 'Unknown', stage: 'Unknown',
      employees: 'Not provided', totalRaised: 100,
      description: '', website: '', industries: '', rank: 1,
    })
  })

  it('accepts BOM, CRLF, reordered columns, case, spaces and header aliases', () => {
    const csv = '\uFEFF TOTAL_FUNDING , Company-Name , Funding Stage \r\n100, Example , Growth\r\n'
    const [company] = parseCompanies(csv)
    assert.equal(company.name, 'Example')
    assert.equal(company.totalRaised, 100)
    assert.equal(company.stage, 'Growth')
  })

  it('preserves quoted commas, escaped quotes and multiline descriptions', () => {
    const csv = 'Company,Total Raised,Description\n"Acme, Ltd","£1,200.50","Builds ""smart"" tools\nfor clinics"'
    const [company] = parseCompanies(csv)
    assert.equal(company.name, 'Acme, Ltd')
    assert.equal(company.description, 'Builds "smart" tools\nfor clinics')
    assert.equal(company.totalRaised, 1200.5)
  })

  it('ignores blank lines and unrelated extra columns', () => {
    const csv = '\nCompany,Total Raised,Notes\n\nExample,100,extra\n   \n'
    assert.equal(parseCompanies(csv).length, 1)
  })

  it('preserves mixed funding stages and optional industry data', () => {
    const csv = 'Company,Total Raised,Stage,Industry\nEarly,100,Seed,Healthtech\nLater,200,Growth,Cleantech'
    const companies = parseCompanies(csv)
    assert.deepEqual(companies.map(c => c.stage), ['Growth', 'Seed'])
    assert.deepEqual(companies.map(c => c.industries), ['Cleantech', 'Healthtech'])
  })
})

describe('fundraising and ranking', () => {
  for (const [input, expected] of [
    ['0', 0], ['£0.00', 0], ['1000000', 1000000],
    ['£1,000,000', 1000000], ['£1,200.50', 1200.5],
    ['12.3', 12.3], ['0.01', 0.01], [' £ 1,000.05 ', 1000.05],
  ]) {
    it('accepts GBP amount ' + JSON.stringify(input), () => {
      assert.equal(parseCompanies(moneyCSV(input))[0].totalRaised, expected)
    })
  }

  for (const input of [
    '', ' ', '£1,2,3', '££100', '1e6', '0x10',
    '-1', '$100', '€100', 'GBP 100', '1.234', '1,000,',
    '1 000', 'NaN', 'Infinity',
  ]) {
    it('rejects invalid amount ' + JSON.stringify(input), () => {
      assert.throws(() => parseCompanies(moneyCSV(input)), /invalid GBP amount/)
    })
  }

  it('calculates descending ranks instead of trusting supplied ranks', () => {
    const csv = 'Rank,Company,Total Raised\n1,Small,100\n99,Large,300\n1,Middle,200'
    const companies = parseCompanies(csv)
    assert.deepEqual(companies.map(c => [c.name, c.rank]), [
      ['Large', 1], ['Middle', 2], ['Small', 3],
    ])
  })

  it('retains source order for tied amounts and ranks them sequentially', () => {
    const csv = 'Company,Total Raised\nSecond in file,100\nFirst by alphabet,100\nLargest,200'
    assert.deepEqual(parseCompanies(csv).map(c => [c.name, c.rank]), [
      ['Largest', 1], ['Second in file', 2], ['First by alphabet', 3],
    ])
  })

  it('rejects an individual amount exceeding safe integer pence', () => {
    assert.throws(() => parseCompanies(moneyCSV('90071992547409.92')), /amount is too large/)
  })

  it('rejects a combined total exceeding safe integer pence', () => {
    const csv = 'Company,Total Raised\nOne,45035996273704.96\nTwo,45035996273704.96'
    assert.throws(() => parseCompanies(csv), /Combined fundraising total is too large/)
  })
})

describe('invalid CSV and bounded input', () => {
  for (const csv of ['', '   ', '\n\r\n']) {
    it('rejects empty input ' + JSON.stringify(csv), () => {
      assert.throws(() => parseCompanies(csv), /empty/)
    })
  }

  it('rejects headers without company records', () => {
    assert.throws(() => parseCompanies('Company,Total Raised'), /at least one company/)
  })

  for (const csv of ['Region,Total Raised\nLondon,100', 'Company,Region\nExample,London']) {
    it('requires both essential columns: ' + csv.split('\n')[0], () => {
      assert.throws(() => parseCompanies(csv), /Required columns/)
    })
  }

  it('rejects a blank company name', () => {
    assert.throws(() => parseCompanies('Company,Total Raised\n" ",100'), /company name is missing/)
  })

  it('rejects duplicate equivalent headers instead of silently overwriting data', () => {
    assert.throws(() => parseCompanies('Company,Company Name,Total Raised\nOne,Two,100'), /Duplicate/)
  })

  it('rejects unnamed columns', () => {
    assert.throws(() => parseCompanies('Company,Total Raised,\nOne,100,x'), /Every column/)
  })

  for (const record of ['One,100,extra', 'One']) {
    it('rejects mismatched column counts: ' + record, () => {
      assert.throws(() => parseCompanies('Company,Total Raised\n' + record), /column count/)
    })
  }

  it('rejects an unterminated quoted field', () => {
    assert.throws(() => parseCompanies('Company,Total Raised\n"One,100'), /malformed/)
  })

  it('accepts 1,000 records but rejects 1,001', () => {
    const records = Array.from({ length: 1000 }, (_, i) => 'Company ' + i + ',100')
    const csv = 'Company,Total Raised\n' + records.join('\n')
    assert.equal(parseCompanies(csv).length, 1000)
    assert.throws(() => parseCompanies(csv + '\nExtra,100'), /1,000 companies/)
  })

  it('accepts a 10,000-character field but rejects 10,001', () => {
    const prefix = 'Company,Total Raised,Description\nOne,100,'
    assert.equal(parseCompanies(prefix + 'x'.repeat(10000))[0].description.length, 10000)
    assert.throws(() => parseCompanies(prefix + 'x'.repeat(10001)), /10,000 characters/)
  })
})

describe('supplied fintech dataset regression', () => {
  it('retains all 100 companies, verified totals and fundraising order', () => {
    const csv = readFileSync(
      new URL('../server/assets/fintech_companies_seed.csv', import.meta.url), 'utf8',
    )
    const companies = parseCompanies(csv)
    assert.equal(companies.length, 100)
    assert.equal(companies[0].name, 'Nevis')
    assert.equal(companies[0].totalRaised, 30314247)
    const total = companies.reduce((sum, company) => sum + company.totalRaised, 0)
    assert.equal(total, 622301270)
    assert.equal(total / companies.length, 6223012.7)
    assert.equal(companies.filter(c => c.region === 'London').length, 78)
    assert.ok(companies.every(c => c.stage === 'Seed'))
    assert.deepEqual(companies.map(c => c.rank), Array.from({ length: 100 }, (_, i) => i + 1))
    for (let i = 1; i < companies.length; i++) {
      assert.ok(companies[i - 1].totalRaised >= companies[i].totalRaised)
    }
  })
})
