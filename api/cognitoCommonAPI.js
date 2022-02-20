const {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    GlobalSignOutCommand,
    RespondToAuthChallengeCommand,
    GetUserCommand
} = require("@aws-sdk/client-cognito-identity-provider");
const { credential } = require("../config/setup.js");

const client = new CognitoIdentityProviderClient(credential);

const userIsValid = (req,res,next) => {
    if (!(req.session.user === null || req.session.user === undefined)) {
        const params = {
            "AccessToken": req.session.user.AccessToken
        };
    
        const command = new GetUserCommand(params);
    
        client.send(command).then(result => {
            next();
        }).catch(err => {
            console.log("err",err);
            return res.status(500).redirect("/auth/signin");
        });
    } else {
        req.session.destroy((err) => {
            req.session.save();
            if (err) console.log(err)
            else {
                return res.status(401).redirect("/auth/signin");
            };
        });
    };
};

const commonInitiateAuth = async (addParams) => {
    const params = {
        ClientId: "6ul5m8c9fmc0qmgp96kfl95pmh",
        AuthFlow: "USER_PASSWORD_AUTH",
        ...addParams,
    };

    const command = new InitiateAuthCommand(params);

    try {
        const data = await client.send(command);
        return data;
    } catch (err) {
        return err;
    };
};

const commonGlobalSignOut = async (addParams) => {
    const params = {
        ...addParams,
    };

    const command = new GlobalSignOutCommand(params);

    try {
        const data = await client.send(command);
        return data;
    } catch (err) {
        return err;
    };
};

const commonFirstSignIn = async (addParams) => {
    const params = {
        ClientId: "6ul5m8c9fmc0qmgp96kfl95pmh",
        ChallengeName: "NEW_PASSWORD_REQUIRED",
        ...addParams
    };

    const command = new RespondToAuthChallengeCommand(params);

    try {
        const data = await client.send(command);
        return data;
    } catch (err) {
        return err;
    };
};

exports.userIsValid = userIsValid;
exports.commonInitiateAuth = commonInitiateAuth;
exports.commonGlobalSignOut = commonGlobalSignOut;
exports.commonFirstSignIn = commonFirstSignIn;
exports.cognitoClient = client;