import mongoose from 'mongoose'
import { serverUrl, dbName } from './settings.js'

export async function connectToDb() {
    const conn = await mongoose.connect(serverUrl, { dbName });
    console.log('Successful connection...');
    return conn;
}