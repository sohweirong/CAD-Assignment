const router = require('express').Router();
const Cognito = require("../api/cognitoCommonAPI");

router.get("/signin",(req,res) => {
    const currentpage = 'signin';
    const title = "Sign In";

    const dataForFrontend = {
        currentpage,
        title
    };
    res.render("components/signin", dataForFrontend);
});

router.get("/firstsignin", (req,res) => {
    if (req.session.tmp === undefined) {
        return res.redirect("/auth/signin");
    };
    const currentpage = 'signin';
    const title = "First Sign In";

    const dataForFrontend = {
        currentpage,
        title
    };
    
    return res.render("components/changepassword", dataForFrontend);
});

router.get("/signout", async (req,res) => {
    const {AccessToken} = req.session.user;
    const result = await Cognito.commonGlobalSignOut({
        AccessToken
    });
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        };
        return res.redirect("/auth/signin");
    });
});

router.post("/signin", async (req,res) => {
    console.log(req.body);
    const currentpage = 'signin';
    const title = "Sign In";
    const {staffUsername, staffPassword} = req.body;
    const dataForFrontend = {
        currentpage,
        title,
        username: staffUsername
    };
    var result;
    try {
        result = await Cognito.commonInitiateAuth({
            AuthParameters: {
                "USERNAME": staffUsername.trim().toLowerCase(),
                "PASSWORD": staffPassword
            },
        });
    } catch (err) {
        console.log(err);
        res.render("components/signin", dataForFrontend);
    };

    if (result["ChallengeName"] === "NEW_PASSWORD_REQUIRED") {
        req.session.tmp = {
            u: staffUsername.trim().toLowerCase(),
            s: result["Session"],
        };
        return res.redirect('/auth/firstsignin');
    } else if (result["$metadata"].httpStatusCode === 200) {
        req.session.user = result["AuthenticationResult"];
        return res.redirect("/");
    } else {
        res.render("components/signin", dataForFrontend);
    };

});

router.post("/firstsignin", async (req,res) => {
    if (req.session.tmp === undefined) {
        return res.redirect("/auth/signin");
    };
    const {u,s} = req.session.tmp;
    const {name, password, cfmpassword} = req.body;
    const result = await Cognito.commonFirstSignIn({
        "ChallengeResponses": {
            "USERNAME": u,
            "NEW_PASSWORD": password,
            "userAttributes.name": name
        },
        "Session": s
    });
    if (result["$metadata"].httpStatusCode === 200) {
        req.session.destroy((err) => {
            req.session.user = result["AuthenticationResult"];
            req.session.save();
            return res.redirect("/");
        });
    } else {
        return res.redirect("/auth/firstsignin");
    };
});

module.exports = router;