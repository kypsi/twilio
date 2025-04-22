import Airtable from 'airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID as string)

export async function getUserByEmail(email: string) {
  const records = await base('users').select({
    filterByFormula: `{email} = "${email}"`,
    maxRecords: 1,
  }).firstPage()

  if (records.length === 0) return null

  const record = records[0]
  return {
    id: record.id,
    email: record.get('email'),
    password: record.get('password'),
    twilioNumber: record.get('twilioNumber'),
    name: record.get('name'),
  }
}
