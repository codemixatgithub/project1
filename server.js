require('dotenv').config({path: '.env'});
const http = require("http");
var express = require("express");
var bodyParser = require("body-parser");
const cors = require('cors');
const formidable = require("formidable");
const form = formidable({ multiples: true });
var MongoClient = require("mongodb").MongoClient;
const request = require('request');
const config = require('./config')
var app = express();
// app.use(cors());
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    parameterLimit: 9999999,
    extended: true,
  })
);
const router = express.Router();
router.get('/',function(req,res){
    res.status(200).json({
        status:'API is working',
    })
})
  router.post("/login", (req,res)=>{
    form.parse(req, async (err, fields, files) => {
        if (err) {
          console.log(err);
        } else {
            var email = fields.email;
            var password = fields.password;
            var client = new MongoClient(process.env.MongoClient);
            await client.connect();
            var dbo = await client.db(process.env.MongoDatabase);
            var user_details = await dbo.collection('user_details').find({email:email}).toArray();
            if(user_details.length>0){
                var decryptedPassword = config.decrypt(user_details[0].password,user_details[0].privateKey);
                if(password==decryptedPassword){
                    res.status(200).json({
                        status: true,
                        id:user_details[0]._id.toString(),
                        message: 'Authorized Access'
                    })
                }else{
                    res.status(200).json({
                        status: false,
                        message: 'UnAuthorized Access'
                    })
                }
            }else{
                res.status(200).json({
                    status: false,
                    message: 'UnAuthorized Access'
                })
            }
        }
    })
  });
  router.post("/register", (req,res)=>{
    form.parse(req, async (err, fields, files) => {
        if (err) {
          console.log(err);
        } else {
            var name = fields.name;
            var email = fields.email;
            var password = fields.password;
            var phone = fields.phone;
            var referal = fields.referal;
            var expoPushNotificationToken = fields.expoPushNotificationToken;
            var encryptPass = config.encrypt(password);
            var user_details_inserted = {
                name:name,
                email:email,
                password: encryptPass.encryptedData,
                privateKey: encryptPass.iv,
                phone:phone,
                referal:referal,
                expoPushNotificationToken:expoPushNotificationToken
            }
            var client = new MongoClient(process.env.MongoClient);
            await client.connect();
            var dbo = await client.db(process.env.MongoDatabase);
            var user_details = await dbo.collection('user_details').find({$or:[{email:email},{phone:phone}]}).toArray();
            if(user_details.length==0){
            var user_details = await dbo.collection('user_details').insertOne(user_details_inserted);
            if(user_details.acknowledged){
                res.status(200).json({
                    status: true,
                    message: 'User Registered Successfully'
                })
            }
        }else{
            res.status(200).json({
                status: true,
                message: 'User Already Register with same Email and Password'
            })
        }
    }
})
});
router.get('/users',async(req,res)=>{
    var client = new MongoClient(process.env.MongoClient);
    await client.connect();
    var dbo = await client.db(process.env.MongoDatabase);
    var user_details = await dbo.collection('user_details').find({}).toArray();
    res.status(200).json({
        status: true,
        user_details:user_details,
    })
})
app.use("/", router);
const httpServer = http.createServer( app);
httpServer.listen(process.env.ServerAPIPORT, () => {
    console.log("HTTPS Server running on port " + process.env.ServerAPIPORT);
  });