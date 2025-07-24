require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const MongoStrore = require("connect-mongo");
const methodOverride = require("method-override");
const passportConfig = require("./config/passport");
const session = require("express-session");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const errorHandler = require("./middlewares/errorHandler");
const commentRoutes = require("./routes/commentRoutes");
const userRoutes = require("./routes/userRoutes");


// port
const PORT = process.env.PORT || 4000;

// CSS
app.use(express.static("public"));


// middlewares : passing form data
app.use(express.urlencoded({extended:true}));

// Session middleware
app.use(
    session({
        secret:"keyboard cat",
        resave: false,
        saveUninitialized: false,
        store: MongoStrore.create({mongoUrl: process.env.MONGODB_URL})
    })
);
// Method override middleware
app.use(methodOverride("_method"));

// Passport
passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());


//EJS 
app.set("view engine","ejs");

// Home route
app.get("/",(req,res)=>{
    res.render("home",{
        user: req.user,
        title: "Home",
        error: ""
    });
});

// routes
app.use("/auth",authRoutes);
app.use("/posts",postRoutes);
app.use("/",commentRoutes);
app.use("/user",userRoutes);



// Error Handler
app.use(errorHandler);

//Start Server
//Connect to db before starting server
mongoose.connect (process.env.MONGODB_URL).then(()=>{
    console.log("Database Connected");
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(()=>{
    console.log("Database Connection Failed.");
});