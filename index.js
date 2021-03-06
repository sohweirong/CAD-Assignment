// Requried libraries in project
require("dotenv").config();
const express = require('express');
const {engine} = require('express-handlebars');
const expressSession = require('express-session');

var methodOverride = require('method-override');
const bodyParser = require("body-parser")
const cors = require('cors');
const path = require('path');
const DynamoDBStore = require('connect-dynamodb')(expressSession);
const { credential }  = require('./config/setup');

// Routes
const GeneralRoute = require('./route/General');
const AuthRoute = require('./route/Auth');
const ReportRoute = require('./route/Report');

// Helpers
const { isEqual, isContain } = require("./helper/helper");

// Start of App Configs
const app = express();
const port = 3000;
const maxAge = 3600000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

app.engine(
    'hbs',
    engine({
        helpers: {
            isEqual,
            isContain
        },
        defaultLayout: 'main',
        extname: '.hbs',
        layoutsDir: path.join(__dirname, 'views/layouts')
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

const session = {
    cookie: { maxAge },
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: new DynamoDBStore({
        table: 'session',
        AWSConfigJSON: credential,
    }),
};

app.use(expressSession(session));

app.use((req,res,next) => {
    res.locals.user = req.session.user;
    next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', GeneralRoute);
app.use('/auth',AuthRoute);
app.use('/report',ReportRoute);

/* 
app.use("*", (req, res) => {
    res.status(404).render("error/errorPage", {
        status: 404,
        subject: "It's empty here...",
        message: "...where could it be?"
    });
});
*/

app.listen(port, () => {
    console.warn(`Application started at http://localhost:${port}`);
});