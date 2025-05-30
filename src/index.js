// require('dotenv').config({path: './.env'});
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.log("ERROR: ", err);
      throw err;
    });
    app.listen(process.env.PORT, () => {
      console.log(`Server running at port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed !!! ", err);
  });

/*
import express from 'express';
const app = express();

;( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on("error", (err) => {
            console.log("ERROR: ", err)
            throw err;
        })

        app.listen(process.env.PORT, () => {
            console.log("App is listening on port: " + process.env.PORT);
        })

    }catch(err){
        console.error("ERROR: ", err)
        throw err
    }
})()
*/
