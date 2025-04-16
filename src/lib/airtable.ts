import Airtable, { FieldSet, Base } from 'airtable';

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY!,
});

const base: Base = Airtable.base(process.env.AIRTABLE_BASE_ID!);

export const airTableBase = (tableName: string) => {
  return base<Partial<FieldSet>>(tableName);
};
