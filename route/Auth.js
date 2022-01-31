const router = require('express').Router();

router.get("/signin",(req,res) => {
    const currentpage = 'signin';
    const title = "Sign In";

    const dataForFrontend = {
        currentpage,
        title
    }
    res.render("components/signin", dataForFrontend);
});

router.get("/signout",(req,res) => {
    res.redirect("/auth/signin");
});

module.exports = router;