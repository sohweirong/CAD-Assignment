const credential = {
    region: "us-east-1",
};

if (process.env.NODE_ENV === "dev") {
    credential["credentials"] = {
        accessKeyId: process.env.aws_access_key_id,
        secretAccessKey: process.env.aws_secret_access_key,
        sessionToken: process.env.aws_session_token
    };
};

module.exports = credential;
