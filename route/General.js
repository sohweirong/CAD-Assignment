const router = require('express').Router();

router.get(["/","/home"],(req,res) => {
    console.log("yo");
    res.send("yo");
});

module.exports = router;