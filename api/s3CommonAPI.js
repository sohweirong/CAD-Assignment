const { 
    S3Client, 
    PutObjectCommand, 
    GetObjectCommand 
} = require("@aws-sdk/client-s3");
const { credential } = require("../config/setup.js");

const client = new S3Client(credential);
const bucketName = "191382s-cad";

const commonPutObject = async (addParams) => {
    const params = {
        Bucket: bucketName,
        ...addParams,
    };
    
    const command = new PutObjectCommand(params);

    try {
        const data = await client.send(command);
        return data;
    } catch (err) {
        return err;
    };
};

const commonGetObject = async (addParams) => {
    const params = {
        Bucket: bucketName,
        ...addParams,
    };
    
    const command = new GetObjectCommand(params);

    try {
        const data = await client.send(command);
        return data;
    } catch (err) {
        return err;
    };
};

exports.commonPutObject = commonPutObject;
exports.commonGetObject = commonGetObject;

exports.s3Client = client;