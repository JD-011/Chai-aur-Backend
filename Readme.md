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

---
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

=> Always use try-catch or resolve promises while talking with database <br>
=> As hitesh sir says "Database is in another continent", so always use async-await while talking with database <br>

# Assignment-1:
=> explore about exit codes in node.js like one we used here "process.exit(1)" <br>
=> Try to print and understand the connection response we get when we connect to our mongoDB database using "mongoose.connect()" (done) <br>