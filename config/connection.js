import {connect } from 'mongoose'
import { serverUrl, dbName } from './settings.js'

export async function connectToDb() {
    await connect(serverUrl, { dbName });
    console.log('Successful connection...');
}