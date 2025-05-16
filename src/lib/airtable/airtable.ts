import Airtable from 'airtable'
// import bcrypt from 'bcryptjs'
import { encrypt } from '../auth'

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
    role: record.get('role')
  }
}

export async function createUser({
  name,
  email,
  password,
  twilioNumber,
  role,
}: {
  name: string
  email: string
  password: string
  twilioNumber: string
  role: string
}) {
  // const hashedPassword = await bcrypt.hash(password, 10)
  const encryptedPassword = encrypt(password)

  const record = await base('users').create({
    name,
    email,
    password: encryptedPassword,
    twilioNumber,
    role,
  })

  return record.getId()
}

export async function getAllUsers() {
  const records = await base('users').select().all();

  return records.map(record => ({
    id: record.id,
    email: record.get('email'),
    name: record.get('name'),
    twilioNumber: record.get('twilioNumber'),
    role: record.get('role'),
  }));
}

export async function updateUser(id: string, data: Partial<{ name: string; email: string; twilioNumber: string; role: string }>) {
  const updatedRecord = await base('users').update(id, data);
  return updatedRecord.id;
}

export async function changeUserPassword(id: string, newPassword: string) {
  const updatedRecord = await base('users').update(id, {
    password: newPassword,
  });
  return updatedRecord.id;
}

export async function deleteUser(id: string) {
  await base('users').destroy(id);
}

export async function getUserPasswordById(id: string) {
  const record = await base('users').find(id)

  return {
    id: record.id,
    password: record.get('password'),
  }
}

export async function getUserById(id: string) {
  try {
    const record = await base('users').find(id)
    if (!record) return null

    return {
      id: record.id,
      name: record.get('name'),
      email: record.get('email'),
      password: record.get('password'),
      twilioNumber: record.get('twilioNumber'),
      role: record.get('role'),
    }
  } catch {
    return null
  }
}

export async function deleteUserById(id: string) {
  try {
    await base('users').destroy(id)
    return true
  } catch (err) {
    console.error('Delete error:', err)
    return false
  }
}