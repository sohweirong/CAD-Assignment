const router = require('express').Router();

router.get(["/","/home"],(req,res) => {
    const currentpage = 'home';
    const title = "Home";
    const data = require('./testdata.json');

    const dataForFrontend = {
        currentpage,
        title,
        data
    }
    res.render("components/home", dataForFrontend);
});

module.exports = router;