import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB Host: ${connectionInstance.connections[0]._connectionString} `);
    } catch (err){
        console.log(`MongoDB connection failed: ${err}`);
        process.exit(1);
    }
}

export default connectDB;