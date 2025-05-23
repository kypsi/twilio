// import Airtable from 'airtable'

// const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!)

// export async function getRecentChats(twilioNumber: string) {
//     const messages: any[] = []

//     await base('messages')
//         .select({
//             filterByFormula: `{twilio_number} = '${twilioNumber}'`,
//             sort: [{ field: 'updated_at', direction: 'desc' }],
//             maxRecords: 1000
//         })
//         .eachPage((records, fetchNextPage) => {
//             records.forEach(record => messages.push({ id: record.id, ...record.fields }))
//             fetchNextPage()
//         })

//     // Group by conversationId and take latest message for each
//     const latestPerConversation: { [key: string]: any } = {}

//     for (const msg of messages) {
//         const convId = msg.conversationId
//         if (!latestPerConversation[convId] || new Date(msg.updatedAt) > new Date(latestPerConversation[convId].updatedAt)) {
//             latestPerConversation[convId] = msg
//         }
//     }

//     return Object.values(latestPerConversation)
// }
