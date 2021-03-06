let express = require('express');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors')
require('dotenv').config();

// var mongoDB = 'mongodb://root:root@localhost:27017/mumble';
// TODO: to raise awareness
let database = process.env.database
let user = process.env.user
let pass = process.env.pass
console.info(database);
var mongoDB = `mongodb://${user}:${pass}@${database}`;
mongoose.connect(mongoDB, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let port = process.env.PORT || 8888
let app = express()
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'secret' }));


app.use((req, res, next) => {

    if (req.session.auth_token !== null) {

        req.auth = req.session.auth_token;
    }
    next()
}, require('./routes/router'));

var corsOptions = {
    origin: 'http://example.com',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
};

app.use(cors(corsOptions));

console.log(`Listening on port http://localhost:${port}. Go /login to initiate authentication flow.`);
app.listen(port);