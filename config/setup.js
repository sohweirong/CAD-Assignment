const credential = {
    region: "us-east-1"
};

if (process.env.NODE_ENV === "dev") {
    credential["accessKeyId"] = process.env.aws_access_key_id
    credential["secretAccessKey"] = process.env.aws_secret_access_key
    credential["sessionToken"] = process.env.aws_session_token
};

exports.credential = credential;