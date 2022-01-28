const router = require('express').Router();

const datetimeNow = new Date();
const {todayDate, timeNow} = {
    todayDate:`${datetimeNow.getFullYear()}-${datetimeNow.getMonth()+1>9?datetimeNow.getMonth()+1:'0'+(datetimeNow.getMonth()+1)}-${datetimeNow.getDate()>9?datetimeNow.getDate():'0'+(datetimeNow.getDate()+1)}`,
    timeNow: `${datetimeNow.getHours()}:${datetimeNow.getMinutes()}`
};

router.get("/lost",(req,res) => {
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

router.get("/found",(req,res) => {
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

router.post("/found", (req,res) => {
    res.redirect("found");
});

module.exports = router;