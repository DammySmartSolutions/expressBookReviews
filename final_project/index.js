const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();



app.use(express.json());

app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: false,
  saveUninitialized: false
}));

// protect /customer/auth/*
app.use("/customer/auth/*", (req, res, next) => {
  if (req.session?.auth?.username) return next();
  return res.status(401).json({ message: "Please Login First" });
});

app.use("/customer", customer_routes);   // mounts /customer/login, /customer/auth/...


// app.use(express.json());

// app.use("/customer",session({secret:"fingerprint_customer",resave: false, saveUninitialized: false}))

// app.use("/customer/auth/*", function auth(req,res,next){

//     const token =   req.body?.token || req.query?.token ||   req.session?.token;

//   if (!token)
//    {

//     return res.status(401).json({ message: "Please Login First" });
//   }

//   try
//    {
//     const payload = jwt.verify(token, "access"); 
//     req.user = payload;                         
//     return next();
//   } 
//   catch (err)
//    {
//     return res.status(403).json({ message: "Invalid or expired token" });
//   }


// });
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
