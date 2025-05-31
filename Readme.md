# chai aur backend series

- [Model link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj?origin=share)

- [Video playlist](https://www.youtube.com/watch?v=EH3vGeqeIAo&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW)

---
# Summary of this project

This project is a complex backend project that is built with nodejs, expressjs, mongodb, mongoose, jwt, bcrypt, and many more. This project is a complete backend project that has all the features that a backend project should have.
We are building a complete video hosting website similar to youtube with all the features like login, signup, upload video, like, dislike, comment, reply, subscribe, unsubscribe, and many more.

Project uses all standard practices like JWT, bcrypt, access tokens, refresh Tokens and many more.

---
# Road-map & Guide for our project:

# Initialize the project:

=> Initialize the empty project by: `npm init` <br>
=> Create new repo on github and connect your github repo to this project and push our project to github <br>
=> Add "Readme.md" & ".gitignore" in the root of your project <br>
=> Change the type to "module" in place of "commonjs" in "package.json" <br>
=> Setup the project/file structure for JS backend in "src" by creating necessary files & folders and also don't forget to create environment variables files (".env" & ".env.sample") in the root of our project <br>
=> note: you can push empty folder to github by adding ".gitkeep" file in it <br>
=> Install dev dependency nodemon for auto restarting the node application when file changes in the directory are detected by: ` npm i -D nodemon` <br>
=> Don't forget to add the script `"dev": "nodemon src/index.js"` <br>
=> Install dev dependency prettier by: `npm i -D prettier` <br>
=> Add ".prettierrc" & ".prettierignore" in the root of your project <br>
=> For your ref [here](https://github.com/JD-011/Chai-aur-Backend/commit/2111246011dc574ec8beb4303db29ae118bf7fad) is the last commit made on the github in this section

---

# Database connection (MongoDB):

=> First of all install these dependencies: `npm i mongoose express dotenv` <br>
=> We can use MongoDB in multiple ways, here we are using MongoDB Atlas: A multi-cloud database <br>
=> First create an account on MongoDB Atlas if you don't have any <br>
=> Then set up a new project, in that project create a new cluster and provide necessary information required: username, password etc... <br>
=> Once the cluster is created, recheck the security settings: database access & network access <br>
=> Now copy the connection string given by MongoDB Atlas and paste it in our .env file as "MONGODB_URI", and don't forget to remove last '/' <br>
=> Note that our "MONGODB_URI" should consist the same username & password we provided at the creation of our project at MongoDB Atlas <br>
=> Then write the logic of connecting MongoDB with our backend <br>
=> Here are two things we need to follow whenever we are talking with database: <br>
=> 1) Always use try-catch or resolve promises while talking with database <br>
=> 2) As hitesh sir says "Database is in another continent", so always use async-await while talking with database <br>
=> For your ref [here](https://github.com/JD-011/Chai-aur-Backend/commit/2a0542d38496921986b6fa9fe2730f061fca192e) is the last commit made on the github in this section

---

# Assignment-1:
=> explore about exit codes in node.js like one we used here "process.exit(1)" <br>
=> Try to print and understand the connection response we get when we connect to our mongoDB database using "mongoose.connect()" (done)

---

# Creating some preparation for the future use:
=> Here we are setting up some middlewares & also creating custom API response and error handling class <br>
=> this step is very important & crucial whenever we are creating any production grade application, and this step is very common in every production grade codes <br>
=> First of all install these dependencies: `npm i cookie-parser cors` <br>
=> Here we are dealing with some middlewares (the functions that run before your request hits the route handler) like "cookie-parser" & "cors" and also setting up some configuration using "app.use()" <br>
=> Note: we use app.use() whenever we are dealing with any middleware or any configuration settings <br>
=> Then we are creating our own custom classes for API response and error handling, in which we are extending "Error" class of Node.js in our custom error class <br>
=> For your ref [here](https://github.com/JD-011/Chai-aur-Backend/commit/f5b207100dd7fb6e5591a4f5c714412fd0f4c44c) is the last commit made on the github in this section

---

# 

---

# Assignment-2:
=> Explore what is Bson data & Bson vs Json (MongoDB uses Bson data to store id's)