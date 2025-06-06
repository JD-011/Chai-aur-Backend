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

# Creating some preparation for the future use:
=> Here we are setting up some middlewares & also creating custom API response and error handling class <br>
=> this step is very important & crucial whenever we are creating any production grade application, and this step is very common in every production grade codes <br>
=> First of all install these dependencies: `npm i cookie-parser cors` <br>
=> Here we are dealing with some middlewares (the functions that run before your request hits the route handler) like "cookie-parser" & "cors" and also setting up some configuration using "app.use()" <br>
=> Note: we use app.use() whenever we are dealing with any middleware or any configuration settings <br>
=> Then we are creating our own custom classes for API response and error handling, in which we are extending "Error" class of Node.js in our custom error class <br>
=> For your ref [here](https://github.com/JD-011/Chai-aur-Backend/commit/f5b207100dd7fb6e5591a4f5c714412fd0f4c44c) is the last commit made on the github in this section

---

# User & Video models:
=> Here we are creating user & video models with hooks & JWT <br>
=> First of all install these dependencies: `npm i mongoose mongoose-aggregate-paginate-v2 bcrypt jsonwebtoken` <br>
=> All of this dependencies will be used to create user & video models <br>
=> For the structure/layout of this models you can refer the "Model link" given at the beginning of this page <br>
=> we will use "mongoose" for creating our schemas & models <br>
=> "mongoose-aggregate-paginate-v2" wii be used for aggregation queries <br>
=> "bcrypt" is essential for encrypting & decrypting passwords of the users <br>
=> above step is necessary for security of user's password because our databases might leak, so we can't just store user's password as it is in database <br>
=> we also used "jsonwebtoken" (JWT) in our model, right now we are just generating "AccessToken" & "RefreshToken" out of it, we will understand for what it is used for & what it does later on <br>
=> For your ref [here](https://github.com/JD-011/Chai-aur-Backend/commit/b976e07ae6defd905656e61ece47968ae3bd7ea0) is the last commit made on the github in this section

---

# File uploading:
=> Handling files efficiently is the job of the backend developer <br>
=> Here our main task is to handle the file uploading <br>
=> File uploading can be done in multiple ways: <br>
=> we can either use our own server to store our files, but it can increase the load on our server <br>
=> Another way is to store the entire file on our database (here we are using MongoDB, and it gives the option to store entire files/multimedia), but even if our database supports file, it can increase the load on our database heavily and can degrade the performance of our database <br>
=> so what is the solution then, the best approach is to use any third party services (like cloudinary, AWS etc...) <br>
=> Every production grade code uses this and this is very common approach used by almost every organization in today's market <br>
=> So we will also use the third party service named "cloudinary" to store our files <br>
=> For that we have to install these dependencies: `npm i cloudinary multer` <br>
=> As we discussed earlier "cloudinary" will be used to store our files and we will be write this functionality as an utility in our project and we will store the url given by cloudinary once we upload the file into our database <br>
=> "multer" will be usefull to store our file temporary on the server before we upload it into cloudinary, and we are doing this because we can easily recover any files from local storage if anything wrong happens while uploading file and we will delete that file once we finished uploading it on cloudinary <br>
=> For your ref [here](https://github.com/JD-011/Chai-aur-Backend/commit/14670c32991342a0691ae16031244ee68b1ed0bf) is the last commit made on the github in this section

---

# Setting up "routes" & "controllers":
=> Here we are just configuring "routes" & "controllers" <br>
=> We are just doing some initial configuration before writing any logic <br>
=> For your ref [here](https://github.com/JD-011/Chai-aur-Backend/commit/af4a00f953766691fffe2292ac8484faa7b87c6f) is the last commit made on the github in this section

---

# Building logic for registering the user:
=> Here we are building register controller, means we are writing logic for registering the user <br>
=> Whenever we have to write this type of logic codes, first step to take is build an algorithm <br>
=> Algorithm is a step-by-step process of what we are going to do, and in this part we have to take care of every scenario & edge cases that are possible during the execution of our code <br>
=> So here first of all we wrote the algorithm for registering any user <br>
=> The algorithm is written in the comments of the register controller, so you can go threw that if you want <br>
=> Once our algorithm was ready we just simply convert that algorithm into logic code step by step <br>
=> For your ref [here](https://github.com/JD-011/Chai-aur-Backend/commit/68a56add99feec6d1387616024a1c697416b9f41) is the last commit made on the github in this section

---

# Testing & Debugging the register controller:
=> Whenever we built any logic (here controller), the most important thing to do next is testing our logic & debug every issue we find in the way <br>
=> Here we built a register controller that handles any api request for registering any new user <br>
=> And that request will be sent by the frontend side, so the main question is how to test our logic in this case because we are only building backend now not frontend <br>
=> It's not just our issue, the same happens in every production process, because it is not necessary that frontend part will be ready by now for testing purpose and also we can't just wait for that to happen that will be west of time <br>
=> But to solve this issue we have a wonderfull app named "postman", in this app we can directly send any api request (get, post, delete etc...) with any data along with that, so now we don't have to build frontend to test our api request handling by server, we can just write the request url and required data in postman and send it to our server for testing <br>
=> There are many other tools available in the market which do the same thing but "postman" is the most used toll by everyone especially in this type of scenario <br>
=> And not just only that but postman also provide some features where we can create our own collection and in which we can store the all of our api requests in a very structural way and save our work there <br>
=> The best part about postman is that the same collection folder will be shared with frontend developer so they can easily integrate with backend, so it is important tool to learn for every developer as of now <br>
=> So in this section we just test & debug our register controller with the help of postman <br>
=> For your ref [here](https://github.com/JD-011/Chai-aur-Backend/commit/d541c31cfa5a3a8d668e1fb066e1d8d3bca81527) is the last commit made on the github in this section

---

# Building logic for "loginUser", "logoutUser" & "refreshAccessToken" (controllers) and Testing & Debugging the controllers:
=> Here we are building another controllers in "user.controller.js" with the same approach we take while building the register controller <br>
=> Here we also build our own middleware: "auth.middleware.js" which we used right before the logout controller, the main purpose of this middleware was to authenticate/validate the user <br>
=> We build that logic as middleware because we are going to use that same logic in many other controllers also because authenticate the user right before he makes the request to db or for any other sensitive information is very common step for security purpose, and this type of routes is called secure routes <br>
=> Here for authenticate the user we are using the concept of access token which the user have to send along with request to access these types of routes <br>
=> And if you remember then we are also storing the user's refresh token into db <br>
=> So what is this access and refresh tokens & how they are different from each other and how and why we are using it here, let's discuss about that: <br>
=> This tokens (refresh & access) is generated using JWT (jsonwebtoken) <br>
=> JWT token is the encoded tokens in which we can store any data like here we are storing user's credentials, and for generating this type of tokens we have to pass our own JWT-secret and the same secret will be required for decoding the tokens <br>
=> And generally JWT-secrets will be stored at the server side in the environment variable file <br>
=> The main purpose of this tokens is to authenticate/authorize the user who are making any request to the server for security reasons <br>
=> Actually the one token (access) is enough to do this task so why we using the two tokens here, it's because of whenever the access token is expired the user have to login himself again and to remove this problem we introduced the refresh token <br>
=> generally the access token is sort lived and the refresh token is long lived means the expiry time of the refresh token is greater than the expiry time of the access token <br>
=> Both of this token will be generated when user successfully logs in into application, and both of this will be stored in the user-browser's cookies, and the refresh token will be stored into db as well <br>
=> As we discussed earlier the access token will be used for authentication/authorization purpose so the user have to send it along with the request <br>
=> And here when the access token is expired user don't have to login again, he just have to make an request to particular end point of the server along with his refresh token which usually done automatically by the frontend part <br>
=> The server will match this refresh token with the one stored in db and if both are same then server will generate the new access & refresh tokens and send both into user's cookies and store the new refresh token into db as well <br>
=> So in sort the job of the refresh token is to refresh the access token, so until the user have the unexpired refresh token stored in his cookies he do not have to login again <br>
=> For your ref [here](https://github.com/JD-011/Chai-aur-Backend/commit/5466f78557077103d4fd7649c0ecfedf6f259413) is the last commit made on the github in this section

---

# Subscription model:
=> In this section we just added new model into our model's folder: subscription model <br>
=> First we discussed its structure given in the model diagram like what type of data we will be storing in it <br>
=> Then we just created its schema & model using mongoose <br>
=> For your ref [here](https://github.com/JD-011/Chai-aur-Backend/commit/0922b4ba3ea57d459cea47b381232bd99f7bb5c8) is the last commit made on the github in this section

---

# Building logic for user account management endpoints:
=> In this section we created some new routes & controllers for user account management like: changing current password, get information about current user, update account details, update user avatar or cover image <br>
=> All of this routes comes under the category of secured routes as we used "verifyJWT" middleware in all of them <br>
=> We also tested this all routes using postman and debugged every issue <br>
=> For your ref [here](https://github.com/JD-011/Chai-aur-Backend/commit/5fda2bc0088c1b2fe2b0c52160338b072e771ea5) is the last commit made on the github in this section

---

=> https://www.mongodb.com/docs/manual/core/aggregation-pipeline/

# Assignments:
=> Complete all Todos present in the project <br>
=> Try to console every data to see what are we actually getting, and we may learn something new by doing it <br>
=> explore about exit codes in node.js like one we used here "process.exit(1)" <br>
=> Explore what is Bson data & Bson vs Json (MongoDB uses Bson data to store id's) <br>
=> Improve the file naming part in "multer.middleware.js"