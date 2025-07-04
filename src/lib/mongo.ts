// // lib/mongo.ts
// import mongoose, { Mongoose } from 'mongoose';

// const MONGODB_URI = process.env.MONGODB_URI as string;

// if (!MONGODB_URI) {
//     throw new Error('Please define the MONGODB_URI environment variable');
// }

// type GlobalWithMongoose = typeof globalThis & {
//     mongoose?: {
//         conn: Mongoose | null
//         promise: Promise<Mongoose> | null
//     }
// }

// const globalWithMongoose = global as GlobalWithMongoose

// // const cached = (global as any).mongoose || { conn: null, promise: null };

// const cached = globalWithMongoose.mongoose || {
//     conn: null,
//     promise: null,
// }

// async function connectDB(): Promise<Mongoose> {
//     if (cached.conn) return cached.conn;

//     if (!cached.promise) {
//         cached.promise = mongoose.connect(MONGODB_URI, {
//             bufferCommands: false,
//         }).then((mongoose) => mongoose);
//     }

//     cached.conn = await cached.promise;
//     globalWithMongoose.mongoose = cached
//     return cached.conn;
// }


// export default connectDB;

// lib/mongo.ts
import mongoose, { Mongoose } from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable')
}

type GlobalWithMongoose = typeof globalThis & {
    mongoose?: {
        conn: Mongoose | null
        promise: Promise<Mongoose> | null
    }
}

const globalWithMongoose = global as GlobalWithMongoose

const cached = globalWithMongoose.mongoose || {
    conn: null,
    promise: null,
}

async function connectDB(): Promise<Mongoose> {
    if (cached.conn) return cached.conn

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        })
    }

    cached.conn = await cached.promise
    globalWithMongoose.mongoose = cached
    return cached.conn
}

export default connectDB
