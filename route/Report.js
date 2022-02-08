const router = require('express').Router();
const multer = require('multer');
const { userIsValid } = require("../api/cognitoCommonAPI");

const filefilter = (req, file, cb) => {
    const mimetype = file.mimetype;
    const ext = path.extname(file.originalname).toLowerCase();
    var amt,amt_regex;
    amt = ['image/png','image/jpeg','image/jpg'];
    amt_regex = /.png|.jpeg|.jpg/;
    if (amt.indexOf(mimetype) > -1 && amt_regex.test(ext)) {
        cb(null, true);
    } else {
        cb(null, false);
    };
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const {email} = req.body;
        let storepath = `./public/tmp/${email}`;
        if (!fs.existsSync(storepath)){
            fs.mkdirSync(storepath);
            cb(null, storepath);
        } else {
            cb(null, storepath);
        };
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, file.fieldname+Date.now()+ext);
    },
});

const upload = multer({storage: storage, fileFilter: filefilter}).fields([{ name: 'thumbnail', maxCount: 1 }]);

const datetimeNow = new Date();
const {todayDate, timeNow} = {
    todayDate:`${datetimeNow.getFullYear()}-${datetimeNow.getMonth()+1>9?datetimeNow.getMonth()+1:'0'+(datetimeNow.getMonth()+1)}-${datetimeNow.getDate()>9?datetimeNow.getDate():'0'+(datetimeNow.getDate()+1)}`,
    timeNow: `${datetimeNow.getHours()}:${datetimeNow.getMinutes()}`
};

router.get("/lost", userIsValid ,(req,res) => {
    const currentpage = 'lost';
    const title = "Report Lost";

    const dataForFrontend = {
        currentpage,
        title,
        todayDate,
        timeNow
    };
    
    res.render("components/lost", dataForFrontend);
});

router.get("/found", userIsValid ,(req,res) => {
    const currentpage = 'found';
    const title = "Claim Item";

    const dataForFrontend = {
        currentpage,
        title,
        todayDate,
        timeNow
    };
    
    res.render("components/found", dataForFrontend);
});

router.post("/lost", userIsValid, upload, async (req,res) => {
    console.log(req.body,req.file);
    return res.redirect("")
});

router.post("/found", userIsValid , (req,res) => {
    res.redirect("found");
});

module.exports = router;